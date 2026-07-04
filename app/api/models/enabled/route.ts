import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/errors";
import { listEnabledModels } from "@/lib/models";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const models = await listEnabledModels(supabase);
    return NextResponse.json({ models });
  } catch (error) {
    return errorResponse(error);
  }
}
