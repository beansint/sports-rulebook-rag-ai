"use client";

import clsx from "clsx";
import { ChevronRightIcon } from "lucide-react";
import { SportBadge } from "./SportBadge";

export interface SessionItemData {
  id: string;
  sport: string;
  title: string | null;
  updatedAt: string;
}

/** Time-of-day label (e.g. "6:53 PM"). Non-redundant with the date group
 *  headers, and rendered client-side only so it can't cause hydration drift. */
function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

interface SessionItemProps {
  data: SessionItemData;
  active: boolean;
  onSelect: () => void;
}

export function SessionItem({ data, active, onSelect }: SessionItemProps) {
  const title = data.title?.trim() || "Untitled";
  const time = timeLabel(data.updatedAt);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      title={title}
      className={clsx(
        "group relative flex w-full items-center gap-2.5 rounded-lg py-2 pl-3 pr-2 text-left cursor-pointer transition-colors min-h-[44px]",
        active
          ? "bg-brand-orange/15 text-white"
          : "text-brand-muted hover:bg-white/[0.06] hover:text-white",
      )}
    >
      {/* Active accent bar */}
      <span
        aria-hidden
        className={clsx(
          "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand-orange transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />

      <SportBadge sport={data.sport} className="shrink-0 text-[9px] px-1 py-0" />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium leading-tight">
          {title}
        </span>
        {time && (
          <span className="mt-0.5 block text-[10px] tabular-nums text-brand-dim">
            {time}
          </span>
        )}
      </span>

      <ChevronRightIcon
        size={14}
        aria-hidden
        className={clsx(
          "shrink-0 transition-all duration-150",
          active
            ? "text-brand-orange"
            : "-translate-x-1 text-brand-dim opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
        )}
      />
    </button>
  );
}
