"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { Progress } from "@base-ui/react/progress";
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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: CitationPayload[];
  queryId?: string;
  feedback?: 1 | 2 | null;
}

interface ChatInterfaceProps {
  sport?: string;
  /** When this changes, the input is pre-filled and the textarea is focused */
  pendingQuestion?: string;
}

export function ChatInterface({
  sport = "nba",
  pendingQuestion,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pendingQuestion) {
      setInput(pendingQuestion);
      textareaRef.current?.focus();
    }
  }, [pendingQuestion]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
        body: JSON.stringify({ question, sport }),
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

  const handleFeedback = async (
    msgId: string,
    queryId: string,
    rating: 1 | 2,
  ) => {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto space-y-6 px-4 py-4 min-h-[320px] max-h-[520px]"
        aria-live="polite"
        aria-label="Conversation"
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-[color:var(--color-field)] flex items-center justify-center mb-3">
              <span
                className="text-2xl font-black font-[family-name:var(--font-barlow-condensed)] text-[color:var(--color-accent)] leading-none"
                aria-hidden
              >
                SR
              </span>
            </div>
            <p className="text-[color:var(--color-ink-muted)] text-sm">
              Ask a question about NBA rules above
            </p>
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
            {/* Bubble */}
            <div
              className={clsx("rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed", {
                "bg-[color:var(--color-accent)] text-white rounded-br-sm": msg.role === "user",
                "bg-[color:var(--color-field)] text-[color:var(--color-ink)] rounded-bl-sm": msg.role === "assistant",
              })}
            >
              {msg.content}
            </div>

            {/* Citations */}
            {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
              <div className="w-full max-w-[85%] space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-ink-muted)] px-1">
                  Sources
                </p>
                {msg.citations.map((cit, i) => (
                  <CitationCard key={cit.chunkId} citation={cit} index={i} />
                ))}
              </div>
            )}

            {/* Feedback buttons */}
            {msg.role === "assistant" && msg.queryId && (
              <div
                className="flex gap-1 items-center"
                aria-label="Rate this answer"
              >
                <span className="text-[10px] text-[color:var(--color-ink-muted)] mr-1">
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
                      ? "text-[color:var(--color-accent)] bg-[color:var(--color-field)]"
                      : "text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)] hover:bg-[color:var(--color-field)]",
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
                      ? "text-[color:var(--color-accent)] bg-[color:var(--color-field)]"
                      : "text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)] hover:bg-[color:var(--color-field)]",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                  )}
                >
                  <ThumbsDownIcon size={13} aria-hidden />
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex flex-col gap-2 items-start">
            <div className="bg-[color:var(--color-field)] rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]">
              <Progress.Root
                value={null}
                aria-label="Loading answer…"
                className="w-32 h-1 bg-[color:var(--color-bg-dark)] rounded-full overflow-hidden"
              >
                <Progress.Track className="w-full h-full">
                  <Progress.Indicator className="h-full w-1/2 bg-[color:var(--color-accent)] rounded-full animate-[indeterminate_1.4s_ease-in-out_infinite]" />
                </Progress.Track>
              </Progress.Root>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
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
              className="flex-none flex items-center gap-1 text-xs font-medium hover:underline cursor-pointer"
            >
              <RotateCcwIcon size={12} aria-hidden />
              Retry
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Divider */}
      <div className="h-px bg-[color:var(--color-bg-dark)] mx-4" />

      {/* Input area */}
      <div className="px-4 py-3">
        <Field.Root className="flex gap-2 items-end">
          <Field.Label className="sr-only">Ask a question about NBA rules</Field.Label>
          <Field.Control
            render={
              <textarea
                ref={textareaRef}
                rows={2}
                placeholder="e.g. What is a flagrant foul?"
                onKeyDown={handleKeyDown}
                onChange={(e) => setInput(e.target.value)}
                className={clsx(
                  "flex-1 resize-none rounded-xl border px-3 py-2.5 text-sm leading-relaxed",
                  "bg-[color:var(--color-field)] text-[color:var(--color-ink)]",
                  "border-[color:var(--color-bg-dark)] placeholder-[color:var(--color-ink-muted)]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]",
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
              "flex-none flex items-center justify-center w-10 h-10 rounded-xl transition-colors cursor-pointer",
              "bg-[color:var(--color-accent)] text-white",
              "hover:bg-[color:var(--color-accent-hover)]",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2",
            )}
          >
            <SendHorizonalIcon size={16} aria-hidden />
          </Button>
        </Field.Root>
        <p className="mt-1.5 text-[11px] text-[color:var(--color-ink-muted)]">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
