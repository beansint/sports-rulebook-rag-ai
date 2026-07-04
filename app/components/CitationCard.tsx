"use client";

import { BookOpenIcon, ChevronDownIcon } from "lucide-react";
import clsx from "clsx";
import type { CitationPayload } from "@/types/rag";
import { extractRuleRef } from "@/lib/citation-format";

interface CitationCardProps {
  citation: CitationPayload;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  /** DOM id so inline [n] chips can scroll this card into view. */
  domId?: string;
}

export function CitationCard({
  citation,
  index,
  expanded,
  onToggle,
  domId,
}: CitationCardProps) {
  const relevance = Math.round(citation.score * 100);
  const ruleRef = extractRuleRef(citation.snippet);
  const meta = [citation.title, citation.season].filter(Boolean).join(" · ");

  // Meter tone tiers by match strength — kept subtle; the % is always shown as
  // text so color is never the only signal.
  const meterTone =
    relevance >= 80
      ? "bg-brand-orange"
      : relevance >= 65
        ? "bg-brand-orange/60"
        : "bg-brand-orange/35";

  return (
    <button
      id={domId}
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={`Source ${index + 1}, page ${citation.pageNumber}${
        ruleRef ? `, ${ruleRef}` : ""
      }, ${relevance}% match. ${expanded ? "Collapse" : "Expand"} excerpt.`}
      className={clsx(
        "group flex w-full scroll-mt-28 flex-col gap-1.5 rounded-lg border px-2.5 py-2 text-left transition-colors cursor-pointer",
        expanded
          ? "border-brand-orange/50 bg-brand-orange/[0.06]"
          : "border-white/10 bg-white/[0.03] hover:border-brand-orange/40 hover:bg-white/[0.05]",
      )}
    >
      {/* Single-row header */}
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="flex h-4 w-4 flex-none items-center justify-center rounded bg-brand-orange text-[10px] font-bold leading-none text-white tabular-nums"
        >
          {index + 1}
        </span>
        <BookOpenIcon size={11} className="flex-none text-brand-orange/80" aria-hidden />
        <span className="flex-none text-[12px] font-semibold tabular-nums text-white">
          Page {citation.pageNumber}
        </span>
        {ruleRef && (
          <span className="min-w-0 truncate text-[11px] text-brand-muted">
            · {ruleRef}
          </span>
        )}
        <span className="ml-auto flex-none text-[11px] font-bold tabular-nums text-brand-muted">
          {relevance}%
        </span>
        <ChevronDownIcon
          size={13}
          aria-hidden
          className={clsx(
            "flex-none text-brand-dim transition-transform group-hover:text-brand-muted",
            expanded && "rotate-180 text-brand-orange",
          )}
        />
      </div>

      {/* Slim relevance meter */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={clsx("h-full rounded-full", meterTone)}
          style={{ width: `${Math.max(relevance, 4)}%` }}
        />
      </div>

      {/* Excerpt — only when expanded, keeps the collapsed card compact */}
      {expanded && (
        <div className="mt-0.5 space-y-1.5">
          <p className="text-[12.5px] leading-relaxed text-gray-300">
            {citation.snippet}
          </p>
          {meta && <p className="text-[10.5px] text-brand-dim">{meta}</p>}
        </div>
      )}
    </button>
  );
}
