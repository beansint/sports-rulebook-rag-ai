import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Short-lived: long enough to open the PDF, short enough that a leaked link
// to the private rulebooks bucket expires quickly.
const SIGNED_URL_TTL_SECONDS = 60 * 10;

/**
 * GET /api/documents/[documentId]/pdf-url
 * Returns a short-lived signed URL to the source rulebook PDF in the private
 * `rulebooks` Storage bucket. Auth-gated; the client appends `#page=N` to open
 * the browser PDF viewer at the cited page.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await params;
    if (!UUID_RE.test(documentId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();
    const { data: document, error } = await supabase
      .from("documents")
      .select("file_path, status")
      .eq("id", documentId)
      .single();

    if (error || !document?.file_path) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: signed, error: signError } = await supabase.storage
      .from("rulebooks")
      .createSignedUrl(document.file_path, SIGNED_URL_TTL_SECONDS);

    if (signError || !signed?.signedUrl) {
      return NextResponse.json(
        { error: "Could not generate document link" },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: signed.signedUrl });
  } catch (error) {
    return errorResponse(error);
  }
}
