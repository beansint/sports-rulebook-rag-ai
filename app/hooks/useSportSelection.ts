"use client";

import { useCallback, useEffect, useState } from "react";

export const SPORTS = ["nba", "nfl", "mlb", "fifa"] as const;
export type Sport = (typeof SPORTS)[number];

export function useSportSelection() {
  // Default "nba" on server; useEffect hydrates from localStorage
  const [sport, setSportState] = useState<Sport>("nba");

  useEffect(() => {
    const stored = localStorage.getItem("sportrules:sport") as Sport | null;
    if (stored && (SPORTS as readonly string[]).includes(stored)) {
      setSportState(stored);
    }
  }, []);

  const setSport = useCallback((s: Sport) => {
    setSportState(s);
    localStorage.setItem("sportrules:sport", s);
  }, []);

  return { sport, setSport };
}
