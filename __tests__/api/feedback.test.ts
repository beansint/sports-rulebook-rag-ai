import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetUser, mockUpsert } = vi.hoisted(() => {
  const mockGetUser = vi.fn();
  const mockUpsert = vi.fn();
  return { mockGetUser, mockUpsert };
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
  getSupabaseAdmin: vi.fn().mockReturnValue({
    from: vi.fn().mockImplementation((table: string) => {
      if (table === "queries") {
        // ownership check: select().eq().eq().maybeSingle() — owned by default
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: "550e8400-e29b-41d4-a716-446655440000" },
                }),
              }),
            }),
          }),
        };
      }
      // feedback table
      return { upsert: mockUpsert };
    }),
  }),
}));

import { POST } from "@/app/api/feedback/route";

beforeEach(() => {
  vi.clearAllMocks();
  mockUpsert.mockResolvedValue({ error: null });
});

describe("POST /api/feedback", () => {
  it("returns 401 when no user session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queryId: "550e8400-e29b-41d4-a716-446655440000", rating: 1 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid schema (non-UUID queryId)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const req = new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queryId: "not-a-uuid", rating: 1 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 on happy path", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const req = new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queryId: "550e8400-e29b-41d4-a716-446655440000",
        rating: 1,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });
});
