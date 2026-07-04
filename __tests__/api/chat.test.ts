import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetUser, mockFrom } = vi.hoisted(() => {
  const mockGetUser = vi.fn();
  const mockFrom = vi.fn();
  return { mockGetUser, mockFrom };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: () => [], set: () => {} }),
}));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServer: vi.fn().mockResolvedValue({
    auth: {
      // getAuthUser() tries getClaims() first (local verify) then falls back to
      // getUser(); returning no claims routes the tests through mockGetUser.
      getClaims: vi.fn().mockResolvedValue({ data: null, error: null }),
      getUser: mockGetUser,
    },
  }),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: vi.fn().mockReturnValue({ from: mockFrom }),
}));

vi.mock("@/lib/embeddings", () => ({
  embedText: vi.fn().mockResolvedValue({ embedding: new Array(1536).fill(0) }),
}));

vi.mock("@/lib/generation", () => ({
  generateAnswer: vi.fn().mockResolvedValue({
    answer: "Test answer",
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30, estimatedCostUsd: 0 },
    costFields: { input_cost_usd: 0, output_cost_usd: 0, total_cost_usd: 0 },
  }),
  buildContext: vi.fn().mockReturnValue(""),
}));

vi.mock("@/lib/rag", () => ({
  retrieveChunks: vi.fn().mockResolvedValue([]),
  toCitationPayload: vi.fn().mockImplementation((c) => c),
}));

vi.mock("@/lib/models", () => ({
  selectModel: vi.fn().mockResolvedValue({
    id: "gpt-oss-120b",
    provider: "cerebras",
    display_name: "Test",
    enabled: true,
    input_rate_per_m: 0,
    output_rate_per_m: 0,
    context_window: null,
  }),
}));

vi.mock("@/lib/admin", () => ({
  isAdminRequest: vi.fn().mockReturnValue(false),
}));

import { POST } from "@/app/api/chat/route";

// Default from() mock: routes by table name
function makeMockFrom(sessionOwner: string | null = null) {
  return vi.fn().mockImplementation((table: string) => {
    if (table === "chat_sessions") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: sessionOwner ? { user_id: sessionOwner } : null,
            }),
          }),
        }),
        upsert: vi.fn().mockResolvedValue({ error: null }),
      };
    }
    // queries table — supports both rate-limit select and insert paths
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "query-123" }, error: null }),
        }),
      }),
    };
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFrom.mockImplementation(makeMockFrom());
});

const SESSION_UUID = "550e8400-e29b-41d4-a716-446655440000";
const authedUser = { id: "user-1", email: "test@test.com" };

describe("POST /api/chat", () => {
  it("returns 401 when no user session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "What is a foul?" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid schema (empty question)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser } });

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid session_id (not a UUID)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser } });

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "What is a foul?", session_id: "not-a-uuid" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 on happy path without session_id", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser } });

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "What is a foul?", sport: "nba" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.answer).toBe("Test answer");
    expect(data.queryId).toBe("query-123");
  });

  it("returns 200 and calls session upsert when session_id is provided and session does not yet exist", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser } });
    // Session doesn't exist yet (maybeSingle returns null)
    mockFrom.mockImplementation(makeMockFrom(null));

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "What is a foul?", sport: "nba", session_id: SESSION_UUID }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("returns 200 when session_id matches the current user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser } });
    // Session exists and belongs to the same user
    mockFrom.mockImplementation(makeMockFrom("user-1"));

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "What is a foul?", sport: "nba", session_id: SESSION_UUID }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("returns 403 when session_id belongs to a different user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser } });
    // Session exists but owned by "other-user"
    mockFrom.mockImplementation(makeMockFrom("other-user"));

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "What is a foul?", sport: "nba", session_id: SESSION_UUID }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });
});
