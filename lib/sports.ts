import type { Sport } from "@/app/hooks/useSportSelection";

export interface SportMeta {
  /** Short uppercase label, e.g. "NBA". */
  label: string;
  /** Full league name, e.g. "National Basketball Association". */
  league: string;
  /** Human-readable rulebook name shown as the answer source. */
  rulebook: string;
  /** Season / edition the ingested rulebook covers. */
  season: string;
}

/**
 * Canonical, user-facing metadata for each covered sport. Kept in sync with the
 * ingested rulebooks (see data/rulebook-manifest.json). Used for the rulebook
 * caption on the sport selector and the "source" subheader on answers, so the
 * user always knows which official rulebook (and edition) an answer is drawn
 * from — independent of whether citations have loaded yet.
 */
export const SPORT_META: Record<Sport, SportMeta> = {
  nba: {
    label: "NBA",
    league: "National Basketball Association",
    rulebook: "Official NBA Rulebook",
    season: "2025-26",
  },
  nfl: {
    label: "NFL",
    league: "National Football League",
    rulebook: "NFL Official Playing Rules",
    season: "2025",
  },
  mlb: {
    label: "MLB",
    league: "Major League Baseball",
    rulebook: "Official Baseball Rules",
    season: "2026",
  },
  fifa: {
    label: "FIFA",
    league: "FIFA / IFAB",
    rulebook: "IFAB Laws of the Game",
    season: "2025-26",
  },
};
