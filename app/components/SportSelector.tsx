"use client";

import clsx from "clsx";
import { BookMarkedIcon } from "lucide-react";
import { SPORTS, type Sport } from "@/app/hooks/useSportSelection";
import { SPORT_META } from "@/lib/sports";

interface SportSelectorProps {
  sport: Sport;
  onSelect: (s: Sport) => void;
}

export function SportSelector({ sport, onSelect }: SportSelectorProps) {
  const active = SPORT_META[sport];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted whitespace-nowrap">
          Rulebook
        </span>
        <div
          className="flex flex-1 gap-1 rounded-lg bg-brand-light-gray p-1"
          role="tablist"
          aria-label="Select sport rulebook"
          data-testid="sport-selector"
        >
          {SPORTS.map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={s === sport}
              onClick={() => onSelect(s)}
              title={`${SPORT_META[s].league} — ${SPORT_META[s].rulebook}`}
              className={clsx(
                "min-h-[36px] flex-1 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer",
                s === sport
                  ? "bg-brand-orange text-white"
                  : "text-brand-muted hover:text-white hover:bg-white/5",
              )}
            >
              {SPORT_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Which rulebook the questions will be answered from */}
      <p className="flex items-center gap-1.5 pl-0.5 text-[11px] text-brand-dim">
        <BookMarkedIcon size={11} className="flex-none text-brand-orange/70" aria-hidden />
        <span>
          Answers come from the{" "}
          <span className="font-medium text-brand-muted">
            {active.rulebook} · {active.season}
          </span>
        </span>
      </p>
    </div>
  );
}
