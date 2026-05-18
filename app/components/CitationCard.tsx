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
    <div className="flex gap-3 p-3 rounded-lg border border-[color:var(--color-bg-dark)] bg-[color:var(--color-panel)]">
      {/* Page badge */}
      <div className="flex-none flex flex-col items-center gap-1 pt-0.5">
        <BookOpenIcon
          size={14}
          className="text-[color:var(--color-accent)]"
          aria-hidden
        />
        <span className="text-[10px] font-semibold text-[color:var(--color-ink-muted)] leading-none">
          p.{citation.pageNumber}
        </span>
      </div>

      {/* Snippet */}
      <p className="flex-1 text-sm text-[color:var(--color-ink)] leading-snug m-0">
        {snippet}
      </p>

      {/* Relevance score */}
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger
            aria-label={`Relevance score: ${relevance}%`}
            className="flex-none self-start cursor-default"
          >
            <span className="text-[11px] font-semibold tabular-nums text-[color:var(--color-ink-muted)] bg-[color:var(--color-field)] px-1.5 py-0.5 rounded">
              {relevance}%
            </span>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={4}>
              <Tooltip.Popup className="px-2 py-1 text-xs text-white bg-[color:var(--color-ink)] rounded shadow-lg">
                Citation {index + 1} · {relevance}% relevance · page {citation.pageNumber}
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
}
