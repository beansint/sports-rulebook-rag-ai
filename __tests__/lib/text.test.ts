import { describe, it, expect } from "vitest";
import { normalizeWhitespace, estimateTokens, makeSnippet } from "@/lib/text";

describe("normalizeWhitespace", () => {
  it("collapses multiple spaces", () => {
    expect(normalizeWhitespace("hello   world")).toBe("hello world");
  });
  it("trims leading and trailing whitespace", () => {
    expect(normalizeWhitespace("  hello  ")).toBe("hello");
  });
  it("collapses newlines to a single space", () => {
    expect(normalizeWhitespace("hello\n\nworld")).toBe("hello world");
  });
  it("returns empty string unchanged", () => {
    expect(normalizeWhitespace("")).toBe("");
  });
});

describe("estimateTokens", () => {
  it("returns 0 for empty string", () => {
    expect(estimateTokens("")).toBe(0);
  });
  it("returns ceil(length/4)", () => {
    expect(estimateTokens("abcd")).toBe(1);
    expect(estimateTokens("abcde")).toBe(2);
  });
  it("handles long strings", () => {
    const s = "a".repeat(400);
    expect(estimateTokens(s)).toBe(100);
  });
});

describe("makeSnippet", () => {
  it("returns short text unchanged", () => {
    expect(makeSnippet("short text")).toBe("short text");
  });
  it("truncates long text and ends with ellipsis", () => {
    const long = "a".repeat(500);
    const result = makeSnippet(long);
    expect(result.endsWith("...")).toBe(true);
    // slice is (maxLength-1) chars + "..." = maxLength+2 total
    expect(result.length).toBeLessThanOrEqual(422);
  });
  it("respects custom maxLength", () => {
    const result = makeSnippet("a".repeat(100), 50);
    expect(result.length).toBeLessThanOrEqual(52);
    expect(result.endsWith("...")).toBe(true);
  });
  it("normalizes whitespace before truncating", () => {
    const result = makeSnippet("hello   world");
    expect(result).toBe("hello world");
  });
});
