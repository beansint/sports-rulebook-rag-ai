"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { PlusIcon, MenuIcon, XIcon } from "lucide-react";
import { SportBadge } from "./SportBadge";

interface Session {
  id: string;
  sport: string;
  title: string | null;
  updatedAt: string;
}

interface ChatHistorySidebarProps {
  sessionId: string;
  /** Increment to trigger a history re-fetch (e.g. after new session starts or session selected) */
  refreshKey: number;
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  open: boolean;
  onToggle: () => void;
}

function groupSessions(sessions: Session[]) {
  const groups: { label: string; items: Session[] }[] = [];
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const map = new Map<string, Session[]>();
  for (const s of sessions) {
    const d = new Date(s.updatedAt);
    const key =
      d.toDateString() === todayStr
        ? "Today"
        : d.toDateString() === yesterdayStr
          ? "Yesterday"
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }

  for (const [label, items] of map) {
    groups.push({ label, items });
  }
  return groups;
}

export function ChatHistorySidebar({
  sessionId,
  refreshKey,
  onNewSession,
  onSelectSession,
  open,
  onToggle,
}: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chat/history")
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const groups = groupSessions(sessions);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={onToggle}
        aria-label={open ? "Close history" : "Open history"}
        className="lg:hidden fixed top-20 left-4 z-30 p-2 rounded-lg bg-brand-light-gray border border-white/10 text-brand-muted hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        {open ? <XIcon size={16} /> : <MenuIcon size={16} />}
      </button>

      {/* Sidebar panel */}
      <aside
        className={clsx(
          "flex flex-col w-64 shrink-0 bg-brand-light-gray border border-white/10 rounded-xl overflow-hidden transition-all duration-200",
          "lg:flex",
          open ? "flex" : "hidden",
        )}
      >
        {/* New chat */}
        <div className="p-3 border-b border-white/10">
          <button
            onClick={onNewSession}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-orange text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-orange-hover transition-colors min-h-[44px]"
          >
            <PlusIcon size={14} aria-hidden />
            New Chat
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {loading ? (
            <div className="space-y-2 px-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-lg bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-[11px] text-brand-muted text-center py-6 px-3">
              No previous chats yet.
            </p>
          ) : (
            groups.map(({ label, items }) => (
              <div key={label} className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted px-2 py-1">
                  {label}
                </p>
                {items.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSession(s.id)}
                    className={clsx(
                      "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs transition-colors min-h-[44px]",
                      s.id === sessionId
                        ? "bg-brand-orange/15 text-white"
                        : "text-brand-muted hover:text-white hover:bg-white/5",
                    )}
                  >
                    <SportBadge sport={s.sport} className="shrink-0 text-[9px] px-1 py-0" />
                    <span className="truncate flex-1">
                      {s.title ?? "Untitled"}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
