"use client";

import { useCallback, useEffect, useState } from "react";

export type EnabledModel = {
  id: string;
  display_name: string;
  provider: string;
};

const STORAGE_KEY = "sportrules:model";
const CACHE_KEY = "sportrules:models:v1";

function pickSelected(list: EnabledModel[]): string | null {
  const stored =
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  return list.find((m) => m.id === stored)?.id ?? list[0]?.id ?? null;
}

export function useModelSelection() {
  const [models, setModels] = useState<EnabledModel[]>([]);
  const [selectedModelId, setSelectedModelIdState] = useState<string | null>(null);

  useEffect(() => {
    // Instant paint from the session cache (the enabled model list rarely changes).
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const list = JSON.parse(cached) as EnabledModel[];
        if (Array.isArray(list) && list.length > 0) {
          setModels(list);
          setSelectedModelIdState((prev) => prev ?? pickSelected(list));
        }
      }
    } catch {
      // ignore malformed cache
    }

    // Revalidate in the background.
    fetch("/api/models/enabled")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(({ models: list }: { models: EnabledModel[] }) => {
        setModels(list);
        setSelectedModelIdState((prev) => prev ?? pickSelected(list));
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
        } catch {
          // ignore quota errors
        }
      })
      .catch(() => {});
  }, []);

  const setModelId = useCallback((id: string) => {
    setSelectedModelIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  return { models, selectedModelId, setModelId };
}
