"use client";

import { useState } from "react";
import {
  BookOpenIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  Loader2Icon,
} from "lucide-react";
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
  /** Set false to hide the "open source PDF" action (e.g. static demos). */
  showPdfLink?: boolean;
}

export function CitationCard({
  citation,
  index,
  expanded,
  onToggle,
  domId,
  showPdfLink = true,
}: CitationCardProps) {
  const relevance = Math.round(citation.score * 100);
  const ruleRef = extractRuleRef(citation.snippet);
  const meta = [citation.title, citation.season].filter(Boolean).join(" · ");

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Meter tone tiers by match strength — kept subtle; the % is always shown as
  // text so color is never the only signal.
  const meterTone =
    relevance >= 80
      ? "bg-brand-orange"
      : relevance >= 65
        ? "bg-brand-orange/60"
        : "bg-brand-orange/35";

  async function openSourcePdf() {
    if (pdfLoading) return;
    setPdfError(null);
    setPdfLoading(true);
    // Open the tab synchronously in the click gesture so popup blockers allow
    // it, then navigate it once the signed URL resolves. Do NOT pass "noopener"
    // to window.open — that makes it return null, so we couldn't drive the tab;
    // sever the opener reference manually instead.
    const win = window.open("about:blank", "_blank");
    if (win) win.opener = null;
    try {
      const res = await fetch(`/api/documents/${citation.documentId}/pdf-url`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const { url } = (await res.json()) as { url?: string };
      if (!url) throw new Error("no url");
      const target = `${url}#page=${citation.pageNumber}`;
      if (win) win.location.href = target;
      else window.open(target, "_blank");
    } catch {
      win?.close();
      setPdfError("Couldn't open the source PDF. Try again.");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div
      id={domId}
      className={clsx(
        "group scroll-mt-28 overflow-hidden rounded-lg border transition-colors",
        expanded
          ? "border-brand-orange/50 bg-brand-orange/[0.06]"
          : "border-white/10 bg-white/[0.03] hover:border-brand-orange/40 hover:bg-white/[0.05]",
      )}
    >
      {/* Toggle (header + meter) */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={`Source ${index + 1}, page ${citation.pageNumber}${
          ruleRef ? `, ${ruleRef}` : ""
        }, ${relevance}% match. ${expanded ? "Collapse" : "Expand"} excerpt.`}
        className="flex w-full flex-col gap-1.5 px-2.5 py-2 text-left cursor-pointer"
      >
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

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className={clsx("h-full rounded-full", meterTone)}
            style={{ width: `${Math.max(relevance, 4)}%` }}
          />
        </div>
      </button>

      {/* Excerpt + source link — only when expanded */}
      {expanded && (
        <div className="space-y-2 px-2.5 pb-2.5 pt-0.5">
          <p className="text-[12.5px] leading-relaxed text-gray-300">
            {citation.snippet}
          </p>
          {meta && <p className="text-[10.5px] text-brand-dim">{meta}</p>}

          {showPdfLink && (
            <div>
              <button
                type="button"
                onClick={openSourcePdf}
                disabled={pdfLoading}
                className="inline-flex items-center gap-1.5 rounded-md border border-brand-orange/30 bg-brand-orange/10 px-2.5 py-1.5 text-[11px] font-semibold text-brand-orange transition-colors hover:bg-brand-orange/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {pdfLoading ? (
                  <Loader2Icon size={12} className="animate-spin" aria-hidden />
                ) : (
                  <ExternalLinkIcon size={12} aria-hidden />
                )}
                {pdfLoading
                  ? "Opening…"
                  : `Open page ${citation.pageNumber} in the rulebook PDF`}
              </button>
              {pdfError && (
                <p role="alert" className="mt-1 text-[10.5px] text-red-400">
                  {pdfError}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
