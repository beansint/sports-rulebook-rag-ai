"use client";

import { useCallback, useEffect, useState } from "react";

function initSession(): string {
  const id = crypto.randomUUID();
  localStorage.setItem("sportrules:session", id);
  return id;
}

export function useChatSession() {
  // null on first SSR pass → avoids hydration mismatch from localStorage read
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("sportrules:session");
    setSessionId(stored ?? initSession());
  }, []);

  const newSession = useCallback(() => {
    const id = initSession();
    setSessionId(id);
    return id;
  }, []);

  return { sessionId: sessionId ?? "", newSession };
}
