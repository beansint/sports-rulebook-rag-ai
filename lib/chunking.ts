import type { ExtractedPage } from "./pdf";
import { estimateTokens, normalizeWhitespace } from "./text";

export type TextChunk = {
  pageNumber: number;
  chunkIndex: number;
  text: string;
  tokenCount: number;
};

type ChunkOptions = {
  maxTokens?: number;
  overlapTokens?: number;
};

function findWindowEnd(text: string, start: number, maxChars: number) {
  const hardEnd = Math.min(text.length, start + maxChars);
  if (hardEnd >= text.length) return text.length;

  const slice = text.slice(start, hardEnd);
  const lastBreak = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("; "), slice.lastIndexOf("\n"));
  if (lastBreak > maxChars * 0.55) return start + lastBreak + 1;

  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > maxChars * 0.55) return start + lastSpace;

  return hardEnd;
}

export function chunkPages(pages: ExtractedPage[], options: ChunkOptions = {}): TextChunk[] {
  const maxTokens = options.maxTokens ?? 900;
  const overlapTokens = options.overlapTokens ?? 120;
  const maxChars = maxTokens * 4;
  const overlapChars = overlapTokens * 4;
  const chunks: TextChunk[] = [];

  for (const page of pages) {
    const text = normalizeWhitespace(page.text);
    if (!text) continue;

    let start = 0;
    while (start < text.length) {
      const end = findWindowEnd(text, start, maxChars);
      const chunkText = normalizeWhitespace(text.slice(start, end));

      if (chunkText) {
        chunks.push({
          pageNumber: page.pageNumber,
          chunkIndex: chunks.length,
          text: chunkText,
          tokenCount: estimateTokens(chunkText),
        });
      }

      if (end >= text.length) break;
      start = Math.max(end - overlapChars, start + 1);
    }
  }

  return chunks;
}
