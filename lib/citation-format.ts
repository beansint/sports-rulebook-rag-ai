// Helpers for turning raw rulebook chunk text into human-readable citation
// labels. Rulebook passages routinely reference their own rule/section (e.g.
// "Rule 8, Section III(b)"); surfacing that on a citation card is far more
// useful to a reader than a bare page number.

// Matches "Rule 8", "Rule No. 10", optionally trailing ", Section III" and an
// optional "(b)" subsection. Case-insensitive.
const RULE_REF_RE =
  /\bRule\s+(?:No\.?\s*)?\d+(?:\s*,?\s*Section\s+[IVXLCDM]+(?:\s*\([a-z0-9]+\))?)?/i;

// Fallback: a standalone "Section III" / "Section 3(a)" reference.
const SECTION_REF_RE = /\bSection\s+(?:[IVXLCDM]+|\d+)(?:\s*\([a-z0-9]+\))?/i;

/**
 * Extract the first rule/section reference from a snippet of rulebook text.
 * Returns a tidied label (collapsed whitespace) or `null` if none is found.
 */
export function extractRuleRef(text: string): string | null {
  if (!text) return null;
  const match = text.match(RULE_REF_RE) ?? text.match(SECTION_REF_RE);
  if (!match) return null;
  return match[0].replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ").trim();
}
