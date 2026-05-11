import type { SupabaseClient } from "@supabase/supabase-js";
import type { CitationPayload, RetrievedChunk } from "@/types/rag";
import { HttpError } from "./errors";
import { makeSnippet } from "./text";

export async function retrieveChunks(
  supabase: SupabaseClient,
  embedding: number[],
  sport: string,
  matchCount = 8,
) {
  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: embedding,
    match_sport: sport,
    match_count: matchCount,
    match_threshold: 0.05,
  });

  if (error) throw new HttpError(500, "Failed to retrieve chunks", error.message);
  return (data ?? []) as RetrievedChunk[];
}

export function toCitationPayload(chunk: RetrievedChunk): CitationPayload {
  return {
    documentId: chunk.document_id,
    pageNumber: chunk.page_number,
    chunkId: chunk.chunk_id,
    snippet: makeSnippet(chunk.content),
    score: Number(chunk.similarity),
  };
}
