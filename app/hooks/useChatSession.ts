"use client";

import { useState } from "react";

function initSession(): string {
  const id = crypto.randomUUID();
  localStorage.setItem("sportrules:session", id);
  return id;
}

export function useChatSession() {
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window === "undefined") return crypto.randomUUID();
    return localStorage.getItem("sportrules:session") ?? initSession();
  });

  const newSession = () => {
    const id = initSession();
    setSessionId(id);
    return id;
  };

  return { sessionId, newSession };
}
