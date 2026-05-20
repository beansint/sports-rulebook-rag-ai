import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSupabaseServer } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET() {
  try {
    const serverClient = await getSupabaseServer();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: sessions, error } = await supabase
      .from("chat_sessions")
      .select("id, sport, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({
      sessions: (sessions ?? []).map((s) => ({
        id: s.id,
        sport: s.sport,
        title: s.title,
        updatedAt: s.updated_at,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
