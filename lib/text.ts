export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function estimateTokens(value: string) {
  if (!value) return 0;
  return Math.ceil(value.length / 4);
}

export function makeSnippet(value: string, maxLength = 420) {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}...`;
}
