import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, HttpError } from "@/lib/errors";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

const feedbackSchema = z.object({
  queryId: z.string().uuid(),
  rating: z.union([z.literal(1), z.literal(2)]),
  comment: z.string().max(2000).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const serverClient = await getSupabaseServer();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const input = feedbackSchema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    // Ownership check — service role bypasses RLS so we enforce it explicitly
    const { data: ownedQuery } = await supabase
      .from("queries")
      .select("id")
      .eq("id", input.queryId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!ownedQuery) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await supabase.from("feedback").upsert(
      {
        query_id: input.queryId,
        rating: input.rating,
        comment: input.comment ?? null,
      },
      { onConflict: "query_id" },
    );

    if (error) throw new HttpError(500, "Failed to store feedback", error.message);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid feedback request", details: error.flatten() }, { status: 400 });
    }

    return errorResponse(error);
  }
}
