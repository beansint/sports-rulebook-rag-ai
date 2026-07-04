"use client";

import { useState } from "react";
import { SparklesIcon, LayersIcon, BookMarkedIcon } from "lucide-react";
import type { CitationPayload } from "@/types/rag";
import { AnswerRenderer } from "./AnswerRenderer";
import { CitationCard } from "./CitationCard";
import { SportBadge } from "./SportBadge";
import { SPORT_META } from "@/lib/sports";

// Sample answer + citations mirroring a real /chat response, rendered through
// the SAME components the product uses — so this preview stays accurate to the
// live experience instead of drifting into a hand-made mockup.
const DEMO_CITATIONS: CitationPayload[] = [
  {
    documentId: "d",
    chunkId: "c1",
    pageNumber: 30,
    score: 0.82,
    title: "Official NBA Rulebook",
    season: "2023-24",
    snippet:
      "Rule 8, Section III(b): On a throw-in which goes out-of-bounds and is not touched by a player in the game, the ball is returned to the original throw-in spot and the same player attempts the throw-in.",
  },
  {
    documentId: "d",
    chunkId: "c2",
    pageNumber: 35,
    score: 0.78,
    title: "Official NBA Rulebook",
    season: "2023-24",
    snippet:
      "Rule 8, Section III(c): The ball must be thrown directly inbounds. A ball that goes out-of-bounds without being touched by an in-bounds player is a violation.",
  },
  {
    documentId: "d",
    chunkId: "c3",
    pageNumber: 26,
    score: 0.71,
    title: "Official NBA Rulebook",
    season: "2023-24",
    snippet:
      "Section IV: Possession stays with the team entitled to the throw-in when the ball is returned to the original spot following a violation.",
  },
  {
    documentId: "d",
    chunkId: "c4",
    pageNumber: 40,
    score: 0.64,
    title: "Official NBA Rulebook",
    season: "2023-24",
    snippet:
      "The five-second count begins when the ball is placed at the disposal of the player making the throw-in.",
  },
];

const DEMO_ANSWER = `A throw-in **must be inbounded to a player who is in-bounds** — passing it to an out-of-bounds teammate is a violation, and you lose the throw-in.

- On a throw-in that goes out-of-bounds untouched, the ball returns to the original throw-in spot [1].
- The ball must be thrown **directly inbounds**; leaving the court untouched is a violation [2].
- Possession **stays with your team** — it does not go to the opponent [3].`;

export function DashboardPreview() {
  const [expanded, setExpanded] = useState<number | null>(0);

  const handleCite = (n: number) => {
    const idx = n - 1;
    if (idx < 0 || idx >= DEMO_CITATIONS.length) return;
    setExpanded(idx);
    requestAnimationFrame(() =>
      document
        .getElementById(`demo-src-${idx}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  };

  return (
    <section
      id="dashboard"
      aria-labelledby="dashboard-heading"
      className="py-24 bg-brand-black overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center">
          <h2
            id="dashboard-heading"
            className="font-heading text-4xl md:text-6xl mb-4 tracking-tight text-white"
          >
            THE DASHBOARD OF TRUTH
          </h2>
          <p className="text-brand-muted max-w-xl mx-auto">
            Every answer is written from the official rulebook and shows the
            exact pages it&apos;s built on — nothing invented.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto bg-brand-gray border border-white/10 rounded-xl overflow-hidden shadow-2xl glow-orange">
          {/* Window controls */}
          <div className="bg-brand-light-gray px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/50" aria-hidden />
            <span className="w-3 h-3 rounded-full bg-yellow-500/50" aria-hidden />
            <span className="w-3 h-3 rounded-full bg-green-500/50" aria-hidden />
            <span className="ml-4 text-[10px] uppercase tracking-widest text-brand-dim">
              Live Rule Analysis · NBA Rulebook
            </span>
          </div>

          {/* Real answer + citations, exactly as they render in /chat */}
          <div className="bg-brand-black/40 px-5 py-7 sm:px-8 sm:py-9">
            <div className="mx-auto max-w-3xl space-y-5">
              {/* User question */}
              <div className="flex flex-col items-end gap-1.5">
                <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                  You
                </p>
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand-orange px-4 py-2.5 text-[15px] leading-relaxed text-white">
                  If I throw the ball to a teammate who&apos;s out of bounds, is
                  it our ball or theirs?
                </div>
              </div>

              {/* Assistant answer */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  <span
                    aria-hidden
                    className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-brand-orange"
                  >
                    <SparklesIcon size={13} className="text-white" />
                  </span>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-brand-orange">
                    SportRules AI
                  </p>
                  <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] py-0.5 pl-1 pr-2.5">
                    <SportBadge sport="nba" className="text-[9px] px-1 py-0" />
                    <BookMarkedIcon size={11} className="text-brand-dim" aria-hidden />
                    <span className="text-[11px] text-brand-muted">
                      {SPORT_META.nba.rulebook}
                      <span className="text-brand-dim"> · {SPORT_META.nba.season}</span>
                    </span>
                  </span>
                </div>

                <div className="pl-8">
                  <AnswerRenderer
                    content={DEMO_ANSWER}
                    citations={DEMO_CITATIONS}
                    onCite={handleCite}
                  />
                </div>

                <div className="pl-8">
                  <div className="mb-2 flex items-center gap-2">
                    <LayersIcon size={13} className="text-brand-muted" aria-hidden />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">
                      Sources
                    </p>
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/10 px-1 text-[10px] font-bold tabular-nums text-brand-muted">
                      {DEMO_CITATIONS.length}
                    </span>
                    <span className="ml-auto text-[11px] text-brand-dim">
                      Top match{" "}
                      <span className="font-bold tabular-nums text-brand-muted">
                        {Math.round((DEMO_CITATIONS[0]?.score ?? 0) * 100)}%
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2">
                    {DEMO_CITATIONS.map((cit, i) => (
                      <CitationCard
                        key={cit.chunkId}
                        domId={`demo-src-${i}`}
                        citation={cit}
                        index={i}
                        expanded={expanded === i}
                        showPdfLink={false}
                        onToggle={() =>
                          setExpanded((prev) => (prev === i ? null : i))
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
