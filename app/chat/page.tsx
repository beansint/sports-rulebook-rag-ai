"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ChatInterface } from "../components/ChatInterface";
import { SportBadge } from "../components/SportBadge";

function ChatBody() {
  const params = useSearchParams();
  const initialQuestion = params.get("q") ?? undefined;

  return (
    <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <SportBadge sport="nba" />
          <span className="text-xs uppercase tracking-widest text-brand-muted">
            2024–25 Rulebook
          </span>
        </div>
        <h1 className="font-heading text-5xl md:text-6xl tracking-tight text-white mb-3">
          ASK THE RULEBOOK
        </h1>
        <p className="text-brand-muted max-w-xl">
          Natural-language Q&amp;A grounded in the official NBA rulebook. Every
          answer includes the exact rule text and page reference.
        </p>
      </div>

      <ChatInterface sport="nba" initialQuestion={initialQuestion} />
    </div>
  );
}

export default function ChatPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-brand-black text-white">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 text-brand-muted">
              Loading…
            </div>
          }
        >
          <ChatBody />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
