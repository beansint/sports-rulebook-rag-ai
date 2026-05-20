"use client";

import type { Sport } from "@/app/hooks/useSportSelection";

const SUGGESTIONS: Record<Sport, string[]> = {
  nba: [
    "What is the penalty for a flagrant foul?",
    "How many timeouts per half?",
    "When is a charge called?",
    "What is a clear-path foul?",
  ],
  nfl: [
    "What is pass interference?",
    "How does a two-point conversion work?",
    "What is roughing the passer?",
    "When is a catch complete?",
  ],
  mlb: [
    "What is the infield fly rule?",
    "How is a balk called?",
    "What is a dropped third strike?",
    "What counts as an earned run?",
  ],
  fifa: [
    "What is the offside rule?",
    "When is a handball called?",
    "What is a professional foul?",
    "How does extra time work?",
  ],
};

interface SuggestionChipsProps {
  sport: Sport;
  onSelect: (q: string) => void;
}

export function SuggestionChips({ sport, onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {SUGGESTIONS[sport].map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="px-3 py-1.5 rounded-full border border-white/10 bg-brand-light-gray text-xs text-brand-muted hover:text-white hover:border-brand-orange/40 hover:bg-brand-orange/5 transition-colors min-h-[36px]"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
