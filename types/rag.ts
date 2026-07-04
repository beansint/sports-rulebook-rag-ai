export type ModelConfig = {
  id: string;
  provider: string;
  display_name: string;
  enabled: boolean;
  input_rate_per_m: number | string;
  output_rate_per_m: number | string;
  context_window: number | null;
};

export type RetrievedChunk = {
  chunk_id: string;
  document_id: string;
  sport: string;
  season: string;
  title: string;
  page_number: number;
  chunk_index: number;
  content: string;
  similarity: number;
  file_path: string;
};

export type CitationPayload = {
  documentId: string;
  pageNumber: number;
  chunkId: string;
  snippet: string;
  score: number;
  /** Rulebook document title, e.g. "Official NBA Rulebook". Optional for
   *  backward compatibility with citations persisted before this field. */
  title?: string;
  /** Rulebook season/edition, e.g. "2023-24". Optional for the same reason. */
  season?: string;
};

export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
};
