import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import manifest from "@/data/rulebook-manifest.json";
import { getIngestStatuses } from "./actions";
import { IngestBoard } from "./IngestBoard";
import type { ManifestEntry } from "./actions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function AdminIngestPage() {
  const serverClient = await getSupabaseServer();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }

  const statuses = await getIngestStatuses();

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <h1 className="admin-title">Rulebook Ingest</h1>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link href="/admin/users" className="admin-back">Users</Link>
          <Link href="/chat" className="admin-back">← Chat</Link>
        </div>
      </div>

      <div className="admin-section">
        <p className="admin-section-title">
          {manifest.length} rulebooks — click Ingest to download, embed, and index each PDF
        </p>
        <IngestBoard entries={manifest as ManifestEntry[]} statuses={statuses} />
      </div>

      <div className="admin-section">
        <p className="admin-section-title">How it works</p>
        <ol className="ingest-steps">
          <li>PDF is fetched from the official league source URL</li>
          <li>Uploaded to Supabase Storage for archival</li>
          <li>Text extracted page by page, split into ~900-token chunks</li>
          <li>Each chunk embedded via Mistral <code>mistral-embed</code> (1024-dim)</li>
          <li>Chunks indexed in pgvector — chat is live immediately after</li>
        </ol>
      </div>
    </div>
  );
}
