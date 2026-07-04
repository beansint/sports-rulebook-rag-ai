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
  const snippet =
    citation.snippet.length > 320
      ? citation.snippet.slice(0, 317) + "…"
      : citation.snippet;

  // Meter fill tone tiers by match strength — still on-brand, avoids the
  // "everything is orange" flatness while never using color as the only signal
  // (the percentage is always shown as text).
  const meterTone =
    relevance >= 80
      ? "bg-brand-orange"
      : relevance >= 65
        ? "bg-brand-orange/70"
        : "bg-brand-orange/40";

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
        "group flex w-full scroll-mt-28 flex-col gap-2 rounded-xl border p-3 text-left transition-colors cursor-pointer",
        expanded
          ? "border-brand-orange/50 bg-brand-orange/[0.07]"
          : "border-white/10 bg-white/[0.03] hover:border-brand-orange/40 hover:bg-white/[0.05]",
      )}
    >
      {/* Header: numbered badge + page / rule ref + chevron */}
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className="mt-px flex h-5 w-5 flex-none items-center justify-center rounded-md bg-brand-orange text-[11px] font-bold leading-none text-white tabular-nums"
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
            <BookOpenIcon size={12} className="flex-none text-brand-orange" aria-hidden />
            <span className="tabular-nums">Page {citation.pageNumber}</span>
            {ruleRef && (
              <>
                <span className="text-brand-dim" aria-hidden>
                  ·
                </span>
                <span className="truncate font-medium text-brand-muted">{ruleRef}</span>
              </>
            )}
          </div>
          {(citation.title || citation.season) && (
            <p className="mt-0.5 truncate text-[11px] text-brand-dim">
              {[citation.title, citation.season].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <ChevronDownIcon
          size={15}
          aria-hidden
          className={clsx(
            "mt-0.5 flex-none text-brand-dim transition-transform group-hover:text-brand-muted",
            expanded && "rotate-180 text-brand-orange",
          )}
        />
      </div>

      {/* Relevance meter */}
      <div className="flex items-center gap-2">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
          role="img"
          aria-label={`${relevance}% relevance`}
        >
          <div
            className={clsx("h-full rounded-full", meterTone)}
            style={{ width: `${Math.max(relevance, 4)}%` }}
          />
        </div>
        <span className="text-[11px] font-bold tabular-nums text-brand-muted">
          {relevance}%
        </span>
      </div>

      {/* Snippet — clamped when collapsed, full when expanded */}
      <p
        className={clsx(
          "text-[12.5px] leading-relaxed text-gray-300",
          !expanded && "line-clamp-2",
        )}
      >
        {expanded ? snippet : citation.snippet}
      </p>
    </button>
  );
}
