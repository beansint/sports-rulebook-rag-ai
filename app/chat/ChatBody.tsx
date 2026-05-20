"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChatInterface } from "../components/ChatInterface";
import { SportSelector } from "../components/SportSelector";
import { ChatHistorySidebar } from "../components/ChatHistorySidebar";
import { useSportSelection } from "../hooks/useSportSelection";
import { useChatSession } from "../hooks/useChatSession";

function ChatBodyInner() {
  const params = useSearchParams();
  const initialQuestion = params.get("q") ?? undefined;
  const { sport, setSport } = useSportSelection();
  const { sessionId, newSession } = useChatSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [restoredMessages, setRestoredMessages] = useState<null | { sessionId: string }>(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  const handleSelectSession = (id: string) => {
    setRestoredMessages({ sessionId: id });
    setSidebarOpen(false);
    setSidebarRefreshKey((k) => k + 1);
  };

  const handleNewSession = () => {
    newSession();
    setRestoredMessages(null);
    setSidebarRefreshKey((k) => k + 1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-28 pb-20">
      <div className="flex gap-4">
        {/* Sidebar */}
        <ChatHistorySidebar
          sessionId={restoredMessages?.sessionId ?? sessionId}
          refreshKey={sidebarRefreshKey}
          onNewSession={handleNewSession}
          onSelectSession={handleSelectSession}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />

        {/* Main column */}
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <SportSelector sport={sport} onSelect={setSport} />
          </div>
          <ChatInterface
            sport={sport}
            sessionId={restoredMessages?.sessionId ?? sessionId}
            onNewSession={handleNewSession}
            initialQuestion={initialQuestion}
          />
        </div>
      </div>
    </div>
  );
}

export function ChatBody() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 pt-28 pb-20 text-brand-muted">
          Loading…
        </div>
      }
    >
      <ChatBodyInner />
    </Suspense>
  );
}
