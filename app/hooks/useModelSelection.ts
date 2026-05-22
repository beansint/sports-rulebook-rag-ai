"use client";

import { useCallback, useEffect, useState } from "react";

export type EnabledModel = {
  id: string;
  display_name: string;
  provider: string;
};

const STORAGE_KEY = "sportrules:model";

export function useModelSelection() {
  const [models, setModels] = useState<EnabledModel[]>([]);
  const [selectedModelId, setSelectedModelIdState] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/models/enabled")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(({ models: list }: { models: EnabledModel[] }) => {
        setModels(list);
        const stored = localStorage.getItem(STORAGE_KEY);
        const valid = list.find((m) => m.id === stored);
        setSelectedModelIdState(valid?.id ?? list[0]?.id ?? null);
      })
      .catch(() => {});
  }, []);

  const setModelId = useCallback((id: string) => {
    setSelectedModelIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  return { models, selectedModelId, setModelId };
}
