"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import {
  SendHorizonalIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  RotateCcwIcon,
  AlertCircleIcon,
} from "lucide-react";
import clsx from "clsx";
import type { CitationPayload } from "@/types/rag";
import { CitationCard } from "./CitationCard";
import { SuggestionChips } from "./SuggestionChips";
import { TypingIndicator } from "./TypingIndicator";
import type { Sport } from "@/app/hooks/useSportSelection";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: CitationPayload[];
  queryId?: string;
  feedback?: 1 | 2 | null;
}

interface ChatInterfaceProps {
  sport: Sport;
  modelId: string | null;
  sessionId: string;
  onNewSession: () => void;
  initialQuestion?: string;
}

const SPORT_LABELS: Record<Sport, string> = {
  nba: "NBA",
  nfl: "NFL",
  mlb: "MLB",
  fifa: "FIFA",
};

export function ChatInterface({
  sport,
  modelId,
  sessionId,
  onNewSession,
  initialQuestion,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCitations, setExpandedCitations] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoSubmittedRef = useRef(false);
  const prevSportRef = useRef<Sport>(sport);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Clear messages when sport changes
  useEffect(() => {
    if (prevSportRef.current !== sport) {
      prevSportRef.current = sport;
      setMessages([]);
      setError(null);
      setExpandedCitations(new Set());
      onNewSession();
    }
  }, [sport, onNewSession]);

  const handleSubmit = async (questionOverride?: string) => {
    const question = (questionOverride ?? input).trim();
    if (!question || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    setTimeout(scrollToBottom, 50);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, sport, session_id: sessionId, ...(modelId && { modelId }) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }

      const data = await res.json();

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
        citations: data.citations ?? [],
        queryId: data.queryId,
        feedback: null,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  // Auto-submit initial question (e.g. /chat?q=...)
  useEffect(() => {
    if (initialQuestion && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      handleSubmit(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  const handleFeedback = async (msgId: string, queryId: string, rating: 1 | 2) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedback: rating } : m)),
    );
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryId, rating }),
      });
    } catch {
      // feedback failure is non-blocking
    }
  };

  const toggleCitation = (key: string) => {
    setExpandedCitations((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const sportLabel = SPORT_LABELS[sport];

  return (
    <div className="flex flex-col h-full bg-brand-gray border border-white/10 rounded-xl overflow-hidden">
      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto space-y-6 px-5 py-5 min-h-[420px] max-h-[640px]"
        aria-live="polite"
        aria-label="Conversation"
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <div className="w-12 h-12 rounded-sm bg-brand-orange flex items-center justify-center mb-4">
              <span className="text-xl font-heading text-white leading-none" aria-hidden>
                S
              </span>
            </div>
            <p className="text-brand-muted text-sm">
              Ask a question about {sportLabel} rules below
            </p>
            <SuggestionChips sport={sport} onSelect={handleSubmit} />
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx("flex flex-col gap-2", {
              "items-end": msg.role === "user",
              "items-start": msg.role === "assistant",
            })}
          >
            <p
              className={clsx(
                "text-[10px] font-bold uppercase tracking-widest px-1",
                {
                  "text-brand-orange": msg.role === "assistant",
                  "text-brand-muted": msg.role === "user",
                },
              )}
            >
              {msg.role === "assistant" ? "SportRules AI" : "You"}
            </p>

            <div
              className={clsx("rounded-lg px-4 py-3 max-w-[90%] text-sm leading-relaxed", {
                "bg-brand-orange text-white": msg.role === "user",
                "bg-brand-orange/10 border border-brand-orange/20 text-gray-100": msg.role === "assistant",
              })}
            >
              {msg.content}
            </div>

            {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
              <div className="w-full max-w-[90%] space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted px-1">
                  Sources
                </p>
                {msg.citations.map((cit, i) => {
                  const key = `${msg.id}-${i}`;
                  return (
                    <CitationCard
                      key={cit.chunkId}
                      citation={cit}
                      index={i}
                      expanded={expandedCitations.has(key)}
                      onToggle={() => toggleCitation(key)}
                    />
                  );
                })}
              </div>
            )}

            {msg.role === "assistant" && msg.queryId && (
              <div className="flex gap-1 items-center" aria-label="Rate this answer">
                <span className="text-[10px] uppercase tracking-widest text-brand-muted mr-1">
                  Helpful?
                </span>
                <Button
                  aria-label="Thumbs up"
                  aria-pressed={msg.feedback === 1}
                  onClick={() => handleFeedback(msg.id, msg.queryId!, 1)}
                  disabled={msg.feedback !== null && msg.feedback !== undefined}
                  className={clsx(
                    "p-1.5 rounded-md transition-colors cursor-pointer",
                    msg.feedback === 1
                      ? "text-brand-orange bg-brand-orange/10"
                      : "text-brand-muted hover:text-white hover:bg-white/5",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                  )}
                >
                  <ThumbsUpIcon size={13} aria-hidden />
                </Button>
                <Button
                  aria-label="Thumbs down"
                  aria-pressed={msg.feedback === 2}
                  onClick={() => handleFeedback(msg.id, msg.queryId!, 2)}
                  disabled={msg.feedback !== null && msg.feedback !== undefined}
                  className={clsx(
                    "p-1.5 rounded-md transition-colors cursor-pointer",
                    msg.feedback === 2
                      ? "text-brand-orange bg-brand-orange/10"
                      : "text-brand-muted hover:text-white hover:bg-white/5",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                  )}
                >
                  <ThumbsDownIcon size={13} aria-hidden />
                </Button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col gap-2 items-start">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-orange px-1">
              SportRules AI
            </p>
            <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-lg max-w-[90%]">
              <TypingIndicator />
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
          >
            <AlertCircleIcon size={16} className="flex-none mt-0.5" aria-hidden />
            <span className="flex-1">{error}</span>
            <Button
              onClick={() => {
                setError(null);
                const lastUser = [...messages].reverse().find((m) => m.role === "user");
                if (lastUser) handleSubmit(lastUser.content);
              }}
              aria-label="Retry"
              className="flex-none flex items-center gap-1 text-xs font-bold uppercase tracking-widest hover:text-red-200 cursor-pointer"
            >
              <RotateCcwIcon size={12} aria-hidden />
              Retry
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="h-px bg-white/10" />

      {/* Input area */}
      <div className="px-5 py-4 bg-brand-black/40">
        <Field.Root className="flex gap-2 items-end">
          <Field.Label className="sr-only">
            Ask a {sportLabel} rule question
          </Field.Label>
          <Field.Control
            render={
              <textarea
                ref={textareaRef}
                rows={2}
                placeholder={`Ask a ${sportLabel} rule question…`}
                onKeyDown={handleKeyDown}
                onChange={(e) => setInput(e.target.value)}
                aria-label={`Ask a ${sportLabel} rule question`}
                className={clsx(
                  "flex-1 resize-none rounded-lg border px-3 py-2.5 text-sm leading-relaxed",
                  "bg-brand-light-gray text-white placeholder-brand-dim",
                  "border-white/10",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:border-brand-orange",
                  "disabled:opacity-50 transition-colors",
                )}
                disabled={isLoading}
              />
            }
            value={input}
          />
          <Button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isLoading}
            aria-label="Send question"
            className={clsx(
              "flex-none flex items-center justify-center w-11 h-11 rounded-lg transition-colors cursor-pointer",
              "bg-brand-orange text-white",
              "hover:bg-brand-orange-hover",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black",
            )}
          >
            <SendHorizonalIcon size={16} aria-hidden />
          </Button>
        </Field.Root>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-brand-dim">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
