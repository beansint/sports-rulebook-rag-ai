"use client";

import { useState } from "react";
import { Button } from "@base-ui/react/button";
import { ChatInterface } from "./ChatInterface";

const SAMPLE_QUESTIONS = [
  "What is a flagrant foul?",
  "How many seconds for a shot clock violation?",
  "Can a player call timeout during a free throw?",
];

interface HeroChatProps {
  sport?: string;
}

export function HeroChat({ sport = "nba" }: HeroChatProps) {
  const [pendingQuestion, setPendingQuestion] = useState<string>("");

  const handlePillClick = (question: string) => {
    setPendingQuestion("");
    // Small delay ensures the effect fires even if the same question is clicked twice
    requestAnimationFrame(() => setPendingQuestion(question));
  };

  return (
    <section aria-label="Ask a question" className="w-full">
      {/* Sample question pills */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {SAMPLE_QUESTIONS.map((q) => (
          <Button
            key={q}
            onClick={() => handlePillClick(q)}
            className="px-4 py-2 rounded-full border border-[color:var(--color-bg-dark)] bg-[color:var(--color-panel)] text-sm text-[color:var(--color-ink)] hover:bg-[color:var(--color-field)] hover:border-[color:var(--color-accent)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2"
          >
            {q}
          </Button>
        ))}
      </div>

      {/* Chat panel */}
      <div className="w-full max-w-2xl mx-auto rounded-2xl border border-[color:var(--color-bg-dark)] bg-[color:var(--color-panel)] shadow-xl shadow-[rgba(24,32,24,0.08)] overflow-hidden">
        <ChatInterface sport={sport} pendingQuestion={pendingQuestion} />
      </div>
    </section>
  );
}
