import { describe, it, expect } from "vitest";
import { chunkPages } from "@/lib/chunking";
import type { ExtractedPage } from "@/lib/pdf";

describe("chunkPages", () => {
  it("returns empty array for empty input", () => {
    expect(chunkPages([])).toEqual([]);
  });

  it("skips whitespace-only pages", () => {
    const pages: ExtractedPage[] = [{ pageNumber: 1, text: "   \n  " }];
    expect(chunkPages(pages)).toEqual([]);
  });

  it("produces a single chunk for short text", () => {
    const pages: ExtractedPage[] = [{ pageNumber: 1, text: "Short text." }];
    const chunks = chunkPages(pages);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].text).toBe("Short text.");
    expect(chunks[0].pageNumber).toBe(1);
  });

  it("produces multiple chunks for long text", () => {
    const longText = "word ".repeat(2000);
    const pages: ExtractedPage[] = [{ pageNumber: 2, text: longText }];
    const chunks = chunkPages(pages, { maxTokens: 100 });
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("assigns sequential chunkIndex values", () => {
    const longText = "word ".repeat(2000);
    const pages: ExtractedPage[] = [{ pageNumber: 1, text: longText }];
    const chunks = chunkPages(pages, { maxTokens: 100 });
    chunks.forEach((chunk, i) => {
      expect(chunk.chunkIndex).toBe(i);
    });
  });

  it("respects custom maxTokens", () => {
    const text = "a".repeat(400);
    const pages: ExtractedPage[] = [{ pageNumber: 1, text }];
    const chunks = chunkPages(pages, { maxTokens: 50 });
    for (const chunk of chunks) {
      expect(chunk.tokenCount).toBeLessThanOrEqual(55);
    }
  });
});
