import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { chunkPages } from "@/lib/chunking";
import { embedTexts } from "@/lib/embeddings";
import { getRequiredEnv } from "@/lib/env";
import { errorResponse, HttpError } from "@/lib/errors";
import { extractPdfPages } from "@/lib/pdf";
import { getSupabaseAdmin } from "@/lib/supabase";
import { parseSupabaseStorageUrl } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 60;

const ingestSchema = z.object({
  sport: z.string().min(2).max(32).transform((value) => value.toLowerCase()),
  season: z.string().min(1).max(32),
  title: z.string().min(1).max(240),
  fileUrl: z.string().url(),
  sourceUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  let ingestionRunId: string | undefined;
  let supabase: ReturnType<typeof getSupabaseAdmin> | undefined;

  try {
    requireAdmin(request);
    supabase = getSupabaseAdmin();
    const input = ingestSchema.parse(await request.json());
    const parsedStorageUrl = parseSupabaseStorageUrl(input.fileUrl, getRequiredEnv("SUPABASE_URL"));

    const { data: run, error: runError } = await supabase
      .from("ingestion_runs")
      .insert({
        sport: input.sport,
        season: input.season,
        title: input.title,
        file_path: parsedStorageUrl.path,
        status: "running",
      })
      .select("id")
      .single();

    if (runError) throw new HttpError(500, "Failed to create ingestion run", runError.message);
    ingestionRunId = run.id;

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from(parsedStorageUrl.bucket)
      .download(parsedStorageUrl.path);

    if (downloadError || !fileBlob) {
      throw new HttpError(400, "Failed to download PDF from Supabase storage", downloadError?.message);
    }

    const buffer = Buffer.from(await fileBlob.arrayBuffer());
    const pages = await extractPdfPages(buffer);
    if (pages.length === 0) {
      throw new HttpError(400, "No extractable text found in PDF");
    }

    const chunks = chunkPages(pages);
    if (chunks.length === 0) {
      throw new HttpError(400, "No chunks created from PDF text");
    }

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .upsert(
        {
          sport: input.sport,
          season: input.season,
          title: input.title,
          source_url: input.sourceUrl ?? null,
          file_path: parsedStorageUrl.path,
          pages: pages.length,
          status: "active",
          metadata: { fileUrl: input.fileUrl },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "sport,season,file_path" },
      )
      .select("id")
      .single();

    if (documentError) throw new HttpError(500, "Failed to upsert document", documentError.message);

    const { error: deleteError } = await supabase.from("chunks").delete().eq("document_id", document.id);
    if (deleteError) throw new HttpError(500, "Failed to replace existing chunks", deleteError.message);

    const { embeddings } = await embedTexts(chunks.map((chunk) => chunk.text));
    if (embeddings.length !== chunks.length) {
      throw new HttpError(500, "Embedding count did not match chunk count");
    }

    const rows = chunks.map((chunk, index) => ({
      document_id: document.id,
      page_number: chunk.pageNumber,
      chunk_index: chunk.chunkIndex,
      text: chunk.text,
      token_count: chunk.tokenCount,
      embedding: embeddings[index],
    }));

    for (let i = 0; i < rows.length; i += 100) {
      const { error: insertError } = await supabase.from("chunks").insert(rows.slice(i, i + 100));
      if (insertError) throw new HttpError(500, "Failed to insert chunks", insertError.message);
    }

    const { error: completeError } = await supabase
      .from("ingestion_runs")
      .update({
        document_id: document.id,
        status: "succeeded",
        pages_processed: pages.length,
        chunks_created: chunks.length,
        completed_at: new Date().toISOString(),
      })
      .eq("id", ingestionRunId);

    if (completeError) throw new HttpError(500, "Failed to complete ingestion run", completeError.message);

    return NextResponse.json({
      documentId: document.id,
      pagesProcessed: pages.length,
      chunksCreated: chunks.length,
    });
  } catch (error) {
    if (ingestionRunId && supabase) {
      await supabase
        .from("ingestion_runs")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown ingestion error",
          completed_at: new Date().toISOString(),
        })
        .eq("id", ingestionRunId);
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid ingest request", details: error.flatten() }, { status: 400 });
    }

    return errorResponse(error);
  }
}
