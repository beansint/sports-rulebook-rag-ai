"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";

const TRENDING = ["Illegal Screens", "Timeouts Remaining", "Overtime Protocols"];

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/chat?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div
          className="absolute -inset-1 bg-gradient-to-r from-brand-orange to-orange-400 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"
          aria-hidden
        />
        <div className="relative flex items-center bg-brand-gray border border-white/10 rounded-lg p-2">
          <Field.Root className="flex-1">
            <Field.Label className="sr-only">Ask a rule question</Field.Label>
            <Field.Control
              render={
                <input
                  type="text"
                  placeholder="Ask a rule question: 'Penalty for double dribble in FIBA?'"
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white px-4 py-3 placeholder-brand-dim"
                />
              }
              value={query}
            />
          </Field.Root>
          <Button
            type="submit"
            disabled={!query.trim()}
            className="bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-40 disabled:cursor-not-allowed px-8 py-3 rounded text-sm font-bold uppercase tracking-widest transition-colors text-white cursor-pointer"
          >
            Analyze
          </Button>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-brand-dim uppercase tracking-widest">
        <span className="text-brand-orange">Trending:</span>
        {TRENDING.map((label, i) => (
          <span key={label} className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setQuery(label);
                router.push(`/chat?q=${encodeURIComponent(label)}`);
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {label}
            </button>
            {i < TRENDING.length - 1 && <span aria-hidden>•</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
