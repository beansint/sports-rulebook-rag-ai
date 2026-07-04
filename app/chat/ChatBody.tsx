"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChatInterface } from "../components/ChatInterface";
import { ModelSelector } from "../components/ModelSelector";
import { SportSelector } from "../components/SportSelector";
import { ChatHistorySidebar } from "../components/ChatHistorySidebar";
import { useChatSession } from "../hooks/useChatSession";
import { useModelSelection } from "../hooks/useModelSelection";
import { useSportSelection } from "../hooks/useSportSelection";

function ChatBodyInner() {
  const params = useSearchParams();
  const initialQuestion = params.get("q") ?? undefined;
  const { sport, setSport } = useSportSelection();
  const { sessionId, newSession } = useChatSession();
  const { models, selectedModelId, setModelId } = useModelSelection();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [restoredMessages, setRestoredMessages] = useState<null | { sessionId: string }>(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const autoSelectedRef = useRef(false);

  const handleSelectSession = (id: string) => {
    autoSelectedRef.current = true;
    setRestoredMessages({ sessionId: id });
    setSidebarOpen(false);
    setSidebarRefreshKey((k) => k + 1);
  };

  const handleNewSession = () => {
    autoSelectedRef.current = true;
    newSession();
    setRestoredMessages(null);
    setSidebarRefreshKey((k) => k + 1);
  };

  // On first load, open the most recent chat automatically — unless the user
  // arrived with a question to ask (?q=) or has already picked/started a chat.
  const handleSessionsLoaded = useCallback(
    (sessions: { id: string }[]) => {
      if (autoSelectedRef.current) return;
      autoSelectedRef.current = true;
      if (initialQuestion) return;
      if (sessions.length > 0) {
        setRestoredMessages({ sessionId: sessions[0].id });
      }
    },
    [initialQuestion],
  );

  return (
    <div className="max-w-6xl mx-auto px-4 pt-28 pb-20">
      <div className="flex gap-4">
        {/* Sidebar */}
        <ChatHistorySidebar
          sessionId={restoredMessages?.sessionId ?? sessionId}
          refreshKey={sidebarRefreshKey}
          onNewSession={handleNewSession}
          onSelectSession={handleSelectSession}
          onSessionsLoaded={handleSessionsLoaded}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />

        {/* Main column */}
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex flex-col gap-2">
            <SportSelector sport={sport} onSelect={setSport} />
            <ModelSelector
              models={models}
              selectedModelId={selectedModelId}
              onSelect={setModelId}
            />
          </div>
          <ChatInterface
            sport={sport}
            modelId={selectedModelId}
            sessionId={restoredMessages?.sessionId ?? sessionId}
            restoreSessionId={restoredMessages?.sessionId}
            onNewSession={handleNewSession}
            onMessageSent={() => setSidebarRefreshKey((k) => k + 1)}
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
