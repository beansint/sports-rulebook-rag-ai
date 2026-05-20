"use client";

import clsx from "clsx";
import { SPORTS, type Sport } from "@/app/hooks/useSportSelection";

const SPORT_LABELS: Record<Sport, string> = {
  nba: "NBA",
  nfl: "NFL",
  mlb: "MLB",
  fifa: "FIFA",
};

interface SportSelectorProps {
  sport: Sport;
  onSelect: (s: Sport) => void;
}

export function SportSelector({ sport, onSelect }: SportSelectorProps) {
  return (
    <div
      className="flex gap-1 p-1 rounded-lg bg-brand-light-gray"
      role="tablist"
      aria-label="Select sport"
      data-testid="sport-selector"
    >
      {SPORTS.map((s) => (
        <button
          key={s}
          role="tab"
          aria-selected={s === sport}
          onClick={() => onSelect(s)}
          className={clsx(
            "flex-1 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors min-h-[36px]",
            s === sport
              ? "bg-brand-orange text-white"
              : "text-brand-muted hover:text-white",
          )}
        >
          {SPORT_LABELS[s]}
        </button>
      ))}
    </div>
  );
}
