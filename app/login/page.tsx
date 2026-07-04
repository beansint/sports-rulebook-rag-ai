import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const user = await getAuthUser();

  if (user) {
    const { next } = await searchParams;
    redirect(next ?? "/chat");
  }

  return (
    <div className="relative min-h-dvh flex overflow-hidden bg-brand-black">

      {/* ── Background texture layers ── */}
      {/* Orange grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,107,0,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.12) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* Glow blob — top right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,107,0,0.18) 0%, transparent 65%)" }}
      />
      {/* Glow blob — bottom left */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,107,0,0.10) 0%, transparent 65%)" }}
      />

      {/* ── Back to home — always visible ── */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-brand-muted hover:text-white transition-colors duration-150 text-sm font-medium group"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform duration-150" aria-hidden>
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to home
      </Link>

      {/* ── Left panel (brand) — lg+ only ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-14 border-r border-white/5">
        {/* Glassy panel tint */}
        <div className="absolute inset-0 bg-brand-gray/40 backdrop-blur-sm" aria-hidden />

        <div className="relative" />

        {/* Center copy */}
        <div className="relative space-y-7">
          <div className="space-y-4">
            <p className="text-brand-orange text-xs font-bold uppercase tracking-[0.2em]">
              Official rulebook intelligence
            </p>
            <h2 className="font-heading text-5xl xl:text-6xl uppercase leading-none text-white">
              Every rule.
              <br />
              <span className="text-brand-orange">Instant</span> answer.
            </h2>
            <p className="text-brand-muted text-base max-w-xs leading-relaxed">
              Natural-language Q&amp;A grounded in official sports rulebooks — every answer cites the exact page.
            </p>
          </div>

          {/* Stat callouts */}
          <div className="flex gap-8 pt-1">
            {[
              { value: "4+", label: "Sports" },
              { value: "≥0.85", label: "Relevance" },
              { value: "≤7s", label: "p95 Latency" },
            ].map(({ value, label }) => (
              <div key={label} className="border-l-2 border-brand-orange pl-3">
                <div className="text-white font-heading text-2xl">{value}</div>
                <div className="text-brand-muted text-xs uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom logo */}
        <div className="relative flex items-center gap-2.5">
          <span className="w-8 h-8 bg-brand-orange rounded-sm flex items-center justify-center font-heading text-lg text-white leading-none shrink-0">
            S
          </span>
          <span className="font-heading text-xl tracking-wider uppercase text-white">
            SportRules AI
          </span>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-20">
        {/* Glassy form card */}
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-8 py-10 shadow-2xl">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <span className="w-7 h-7 bg-brand-orange rounded-sm flex items-center justify-center font-heading text-base text-white leading-none">
              S
            </span>
            <span className="font-heading text-lg tracking-wider uppercase text-white">
              SportRules AI
            </span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-brand-muted text-sm">Sign in to access the rulebook.</p>
          </div>

          <LoginForm />

          <p className="mt-7 text-center text-brand-dim text-xs leading-relaxed">
            Access is by invitation only.{" "}
            <span className="text-brand-muted">Contact an admin to request access.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
