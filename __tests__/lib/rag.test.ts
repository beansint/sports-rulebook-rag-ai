import { describe, it, expect } from "vitest";
import { toCitationPayload } from "@/lib/rag";
import type { RetrievedChunk } from "@/types/rag";

function makeChunk(overrides: Partial<RetrievedChunk> = {}): RetrievedChunk {
  return {
    chunk_id: "chunk-1",
    document_id: "doc-1",
    sport: "nba",
    season: "2024-25",
    title: "NBA Rulebook",
    page_number: 5,
    chunk_index: 0,
    content: "The ball is in play.",
    similarity: 0.85,
    file_path: "raw/sport/NBA/2024/rulebook.pdf",
    ...overrides,
  };
}

describe("toCitationPayload", () => {
  it("maps chunk fields to citation payload", () => {
    const result = toCitationPayload(makeChunk());
    expect(result.documentId).toBe("doc-1");
    expect(result.chunkId).toBe("chunk-1");
    expect(result.pageNumber).toBe(5);
    expect(result.score).toBe(0.85);
  });

  it("normalizes whitespace in snippet", () => {
    const result = toCitationPayload(makeChunk({ content: "hello   world" }));
    expect(result.snippet).toBe("hello world");
  });

  it("coerces similarity string to number", () => {
    const result = toCitationPayload(makeChunk({ similarity: "0.9" as unknown as number }));
    expect(result.score).toBe(0.9);
  });
});
