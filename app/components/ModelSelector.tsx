"use client";

import clsx from "clsx";
import type { EnabledModel } from "@/app/hooks/useModelSelection";

interface ModelSelectorProps {
  models: EnabledModel[];
  selectedModelId: string | null;
  onSelect: (id: string) => void;
}

export function ModelSelector({ models, selectedModelId, onSelect }: ModelSelectorProps) {
  if (models.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted whitespace-nowrap">
        Model
      </span>
      <select
        value={selectedModelId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        aria-label="Select AI model"
        className={clsx(
          "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium",
          "bg-brand-light-gray text-white border border-white/10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:border-brand-orange",
          "cursor-pointer transition-colors",
        )}
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.display_name}
          </option>
        ))}
      </select>
    </div>
  );
}
