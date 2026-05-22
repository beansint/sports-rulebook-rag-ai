"use client";

import { BookOpenIcon } from "lucide-react";
import clsx from "clsx";
import type { CitationPayload } from "@/types/rag";

interface CitationCardProps {
  citation: CitationPayload;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}

export function CitationCard({ citation, index, expanded, onToggle }: CitationCardProps) {
  const relevance = Math.round(citation.score * 100);
  const snippet = citation.snippet.length > 300
    ? citation.snippet.slice(0, 297) + "…"
    : citation.snippet;

  return (
    <div className="contents">
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={`Citation ${index + 1}: page ${citation.pageNumber}, ${relevance}% relevance`}
        title={`p.${citation.pageNumber} · ${relevance}% relevance`}
        className={clsx(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer",
          "border leading-none whitespace-nowrap",
          expanded
            ? "bg-brand-orange/20 border-brand-orange/50 text-brand-orange"
            : "bg-white/5 border-white/10 text-brand-muted hover:border-brand-orange/40 hover:text-white hover:bg-brand-orange/10",
        )}
      >
        <BookOpenIcon size={10} aria-hidden />
        <span>p.{citation.pageNumber}</span>
        <span className={clsx(
          "ml-0.5 tabular-nums",
          expanded ? "text-brand-orange" : "text-brand-dim",
        )}>
          {relevance}%
        </span>
      </button>

      {expanded && (
        <div
          className="w-full mt-1.5 mb-0.5 p-3 rounded-lg bg-brand-orange/5 border border-brand-orange/20 text-xs text-gray-300 leading-relaxed"
          role="region"
          aria-label={`Citation ${index + 1} excerpt`}
        >
          <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-orange">
            <BookOpenIcon size={10} aria-hidden />
            <span>Page {citation.pageNumber} · {relevance}% match</span>
          </div>
          <p className="m-0">{snippet}</p>
        </div>
      )}
    </div>
  );
}
