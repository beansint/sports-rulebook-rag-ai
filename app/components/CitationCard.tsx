import { Tooltip } from "@base-ui/react/tooltip";
import { BookOpenIcon } from "lucide-react";
import type { CitationPayload } from "@/types/rag";

interface CitationCardProps {
  citation: CitationPayload;
  index: number;
}

export function CitationCard({ citation, index }: CitationCardProps) {
  const relevance = Math.round(citation.score * 100);
  const snippet =
    citation.snippet.length > 140
      ? citation.snippet.slice(0, 137) + "…"
      : citation.snippet;

  return (
    <div className="flex gap-3 p-3 rounded-lg border border-white/10 bg-brand-light-gray">
      {/* Page badge */}
      <div className="flex-none flex flex-col items-center gap-1 pt-0.5">
        <BookOpenIcon
          size={14}
          className="text-brand-orange"
          aria-hidden
        />
        <span className="text-[10px] font-bold text-brand-muted leading-none tracking-widest uppercase">
          p.{citation.pageNumber}
        </span>
      </div>

      {/* Snippet */}
      <p className="flex-1 text-sm text-gray-200 leading-snug m-0">
        {snippet}
      </p>

      {/* Relevance score */}
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger
            aria-label={`Relevance score: ${relevance}%`}
            className="flex-none self-start cursor-default"
          >
            <span className="text-[11px] font-bold tabular-nums text-brand-orange bg-brand-orange/10 border border-brand-orange/20 px-1.5 py-0.5 rounded">
              {relevance}%
            </span>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={4}>
              <Tooltip.Popup className="px-2 py-1 text-xs text-white bg-brand-black border border-white/10 rounded shadow-lg">
                Citation {index + 1} · {relevance}% relevance · page {citation.pageNumber}
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
}
