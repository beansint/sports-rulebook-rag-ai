"use client";

import { useState } from "react";

export const SPORTS = ["nba", "nfl", "mlb", "fifa"] as const;
export type Sport = (typeof SPORTS)[number];

export function useSportSelection() {
  const [sport, setSportState] = useState<Sport>(() => {
    if (typeof window === "undefined") return "nba";
    return ((localStorage.getItem("sportrules:sport") as Sport) ?? "nba");
  });

  const setSport = (s: Sport) => {
    setSportState(s);
    localStorage.setItem("sportrules:sport", s);
  };

  return { sport, setSport };
}
