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
    auth: { getUser: mockGetUser },
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

beforeEach(() => {
  vi.clearAllMocks();
  mockFrom.mockReturnValue({
    upsert: vi.fn().mockResolvedValue({ error: null }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: "query-123" }, error: null }),
      }),
    }),
  });
});

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
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1", email: "test@test.com" } } });

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with answer on happy path", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1", email: "test@test.com" } } });

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
});
