"use server";

import { revalidatePath } from "next/cache";
import { chunkPages } from "@/lib/chunking";
import { embedTexts } from "@/lib/embeddings";
import { HttpError } from "@/lib/errors";
import { extractPdfPages } from "@/lib/pdf";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSupabaseServer } from "@/lib/supabase/server";

const ALLOWED_PDF_ORIGINS = [
  "https://ak-static.cms.nba.com",
  "https://operations.nfl.com",
  "https://mktg.mlbstatic.com",
  "https://img.mlbstatic.com",
  "https://downloads.theifab.com",
];

export type ManifestEntry = {
  sport: string;
  season: string;
  title: string;
  sourceUrl: string;
  storagePath: string;
  pages: number;
};

export type RunStatus = {
  status: "pending" | "running" | "succeeded" | "failed";
  chunksCreated: number | null;
  pagesProcessed: number | null;
  completedAt: string | null;
  errorMessage: string | null;
};

export type IngestResult = {
  ok: boolean;
  pagesProcessed?: number;
  chunksCreated?: number;
  error?: string;
};

export async function getIngestStatuses(): Promise<Record<string, RunStatus>> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("ingestion_runs")
    .select("sport, season, status, chunks_created, pages_processed, completed_at, error_message")
    .order("started_at", { ascending: false })
    .limit(50);

  const result: Record<string, RunStatus> = {};
  for (const row of data ?? []) {
    const key = `${row.sport}::${row.season}`;
    if (!result[key]) {
      result[key] = {
        status: row.status,
        chunksCreated: row.chunks_created,
        pagesProcessed: row.pages_processed,
        completedAt: row.completed_at,
        errorMessage: row.error_message,
      };
    }
  }
  return result;
}

export async function triggerIngest(entry: ManifestEntry): Promise<IngestResult> {
  const serverClient = await getSupabaseServer();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { ok: false, error: "Unauthorized" };
  }

  const origin = new URL(entry.sourceUrl).origin;
  if (!ALLOWED_PDF_ORIGINS.includes(origin)) {
    return { ok: false, error: `Source URL origin '${origin}' is not in the allowed list` };
  }

  const supabase = getSupabaseAdmin();
  let ingestionRunId: string | undefined;

  try {
    const { data: run, error: runError } = await supabase
      .from("ingestion_runs")
      .insert({ sport: entry.sport, season: entry.season, title: entry.title, file_path: entry.storagePath, status: "running" })
      .select("id")
      .single();
    if (runError) throw new HttpError(500, "Failed to create ingestion run", runError.message);
    ingestionRunId = run.id;

    const pdfRes = await fetch(entry.sourceUrl, {
      headers: { "User-Agent": "SportRulesAI-Ingest/1.0" },
    });
    if (!pdfRes.ok) throw new HttpError(400, `Failed to fetch PDF from source (${pdfRes.status})`);
    const buffer = Buffer.from(await pdfRes.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("rulebooks")
      .upload(entry.storagePath, buffer, { contentType: "application/pdf", upsert: true });
    if (uploadError) throw new HttpError(500, "Failed to upload PDF to storage", uploadError.message);

    const pages = await extractPdfPages(buffer);
    if (pages.length === 0) throw new HttpError(400, "No extractable text found in PDF");

    const chunks = chunkPages(pages);
    if (chunks.length === 0) throw new HttpError(400, "No chunks created from PDF");

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .upsert(
        {
          sport: entry.sport,
          season: entry.season,
          title: entry.title,
          source_url: entry.sourceUrl,
          file_path: entry.storagePath,
          pages: pages.length,
          status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "sport,season,file_path" },
      )
      .select("id")
      .single();
    if (documentError) throw new HttpError(500, "Failed to upsert document", documentError.message);

    await supabase.from("chunks").delete().eq("document_id", document.id);

    const { embeddings } = await embedTexts(chunks.map((c) => c.text));

    for (let i = 0; i < chunks.length; i += 100) {
      const batch = chunks.slice(i, i + 100).map((chunk, j) => ({
        document_id: document.id,
        page_number: chunk.pageNumber,
        chunk_index: chunk.chunkIndex,
        text: chunk.text,
        token_count: chunk.tokenCount,
        embedding: embeddings[i + j],
      }));
      const { error: insertError } = await supabase.from("chunks").insert(batch);
      if (insertError) throw new HttpError(500, "Failed to insert chunks", insertError.message);
    }

    await supabase
      .from("ingestion_runs")
      .update({
        document_id: document.id,
        status: "succeeded",
        pages_processed: pages.length,
        chunks_created: chunks.length,
        completed_at: new Date().toISOString(),
      })
      .eq("id", ingestionRunId);

    revalidatePath("/admin/ingest");
    return { ok: true, pagesProcessed: pages.length, chunksCreated: chunks.length };
  } catch (error) {
    if (ingestionRunId) {
      await supabase
        .from("ingestion_runs")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
          completed_at: new Date().toISOString(),
        })
        .eq("id", ingestionRunId);
    }
    revalidatePath("/admin/ingest");
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
