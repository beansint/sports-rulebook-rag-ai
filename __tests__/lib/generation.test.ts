import { describe, it, expect } from "vitest";
import { buildContext } from "@/lib/generation";
import type { RetrievedChunk } from "@/types/rag";

function makeChunk(overrides: Partial<RetrievedChunk> = {}): RetrievedChunk {
  return {
    chunk_id: "c1",
    document_id: "d1",
    sport: "nba",
    season: "2024-25",
    title: "NBA Official Rulebook",
    page_number: 12,
    chunk_index: 0,
    content: "Rule text here.",
    similarity: 0.9,
    file_path: "raw/sport/NBA/2024/rulebook.pdf",
    ...overrides,
  };
}

describe("buildContext", () => {
  it("returns empty string for empty array", () => {
    expect(buildContext([])).toBe("");
  });

  it("includes source title and page number", () => {
    const result = buildContext([makeChunk()]);
    expect(result).toContain("NBA Official Rulebook");
    expect(result).toContain("12");
  });

  it("includes season", () => {
    const result = buildContext([makeChunk({ season: "2024-25" })]);
    expect(result).toContain("2024-25");
  });

  it("separates multiple chunks with a divider", () => {
    const result = buildContext([makeChunk(), makeChunk({ chunk_id: "c2" })]);
    expect(result).toContain("---");
  });
});
