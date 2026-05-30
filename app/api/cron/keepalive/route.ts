import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/errors";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data, error: insertError } = await supabase
      .from("keepalive")
      .insert({ pinged_at: new Date().toISOString() })
      .select("id")
      .single();

    if (insertError) throw insertError;

    const { error: deleteError } = await supabase
      .from("keepalive")
      .delete()
      .eq("id", data.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ ok: true, pingId: data.id });
  } catch (error) {
    return errorResponse(error);
  }
}
