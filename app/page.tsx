import { BookOpenIcon, QuoteIcon, SearchIcon } from "lucide-react";
import { SportBadge } from "./components/SportBadge";
import { HeroChat } from "./components/HeroChat";

const FEATURES = [
  {
    icon: SearchIcon,
    title: "Plain-Language Search",
    description:
      "Type any rule question the way you'd ask a referee. No boolean operators, no legalese.",
  },
  {
    icon: BookOpenIcon,
    title: "Grounded in the Rulebook",
    description:
      "Every answer is generated from official NBA rulebook text — never hallucinated or paraphrased from memory.",
  },
  {
    icon: QuoteIcon,
    title: "Exact Citations",
    description:
      "Each answer includes the page number and the exact excerpt from the rulebook that backs it up.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    label: "Ask",
    description: "Type any NBA rule question in plain English.",
  },
  {
    step: "02",
    label: "Retrieve",
    description: "AI searches the official rulebook using semantic similarity.",
  },
  {
    step: "03",
    label: "Cite",
    description: "Get a grounded answer with exact page references.",
  },
];

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col bg-[color:var(--color-panel)]">
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b border-[color:var(--color-bg-dark)] bg-[color:var(--color-panel)]/90 backdrop-blur-md"
        role="banner"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className="text-xl font-black font-[family-name:var(--font-barlow-condensed)] text-[color:var(--color-ink)] tracking-tight"
              aria-label="SportRules AI"
            >
              SportRules <span className="text-[color:var(--color-accent)]">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <SportBadge sport="nba" />
            <span className="hidden sm:inline text-xs text-[color:var(--color-ink-muted)]">
              2024–25 Rulebook
            </span>
          </div>
        </div>
      </header>

      <main>
        {/* ─── Hero ───────────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-heading"
          className="relative overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(186,78,25,0.12), transparent 40%), " +
              "linear-gradient(160deg, #f7f0dc 0%, var(--color-bg) 55%, #d7c5a2 100%)",
          }}
        >
          {/* Decorative grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, var(--color-ink) 0 1px, transparent 1px 64px), " +
                "repeating-linear-gradient(0deg, var(--color-ink) 0 1px, transparent 1px 64px)",
            }}
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
            {/* Eyebrow */}
            <p className="inline-flex items-center gap-2 mb-6">
              <SportBadge sport="nba" />
              <span className="text-xs font-semibold tracking-widest uppercase text-[color:var(--color-ink-muted)] font-[family-name:var(--font-barlow-condensed)]">
                Official Rules · Instant Answers
              </span>
            </p>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="font-[family-name:var(--font-barlow-condensed)] font-black text-[color:var(--color-ink)] leading-[0.92] tracking-tight mb-6"
              style={{ fontSize: "clamp(3.5rem, 10vw, 7rem)" }}
            >
              Ask the
              <br />
              <span className="text-[color:var(--color-accent)]">Rulebook.</span>
            </h1>

            {/* Subtext */}
            <p className="mx-auto mb-10 text-[color:var(--color-ink-muted)] leading-relaxed max-w-xl"
               style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)" }}>
              Natural-language Q&A grounded in the official NBA rulebook.
              Every answer includes the exact rule text and page reference.
            </p>

            {/* Hero chat + pills */}
            <HeroChat sport="nba" />
          </div>
        </section>

        {/* ─── How It Works ────────────────────────────────────────── */}
        <section
          aria-labelledby="how-heading"
          className="py-20 bg-[color:var(--color-bg)]"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2
              id="how-heading"
              className="text-center font-[family-name:var(--font-barlow-condensed)] font-bold text-3xl text-[color:var(--color-ink)] mb-12 tracking-tight"
            >
              How it works
            </h2>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map(({ step, label, description }) => (
                <li key={step} className="flex flex-col items-center text-center gap-3">
                  <span
                    className="font-[family-name:var(--font-barlow-condensed)] font-black text-5xl text-[color:var(--color-accent)] leading-none"
                    aria-hidden
                  >
                    {step}
                  </span>
                  <h3 className="font-[family-name:var(--font-barlow-condensed)] font-bold text-lg text-[color:var(--color-ink)] tracking-tight">
                    {label}
                  </h3>
                  <p className="text-sm text-[color:var(--color-ink-muted)] leading-relaxed max-w-xs">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── Features ────────────────────────────────────────────── */}
        <section
          aria-labelledby="features-heading"
          className="py-20 bg-[color:var(--color-panel)]"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2
              id="features-heading"
              className="text-center font-[family-name:var(--font-barlow-condensed)] font-bold text-3xl text-[color:var(--color-ink)] mb-12 tracking-tight"
            >
              Built for accuracy
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex flex-col gap-4 p-6 rounded-2xl border border-[color:var(--color-bg-dark)] bg-[color:var(--color-field)]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[color:var(--color-accent)]/10 flex items-center justify-center">
                    <Icon
                      size={20}
                      className="text-[color:var(--color-accent)]"
                      aria-hidden
                    />
                  </div>
                  <h3 className="font-[family-name:var(--font-barlow-condensed)] font-bold text-lg text-[color:var(--color-ink)] tracking-tight">
                    {title}
                  </h3>
                  <p className="text-sm text-[color:var(--color-ink-muted)] leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer
        className="mt-auto border-t border-[color:var(--color-bg-dark)] bg-[color:var(--color-bg)] py-8"
        role="contentinfo"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[color:var(--color-ink-muted)]">
          <span>
            <strong className="font-semibold text-[color:var(--color-ink)]">SportRules AI</strong>
            {" · "}Official NBA Rulebook{" · "}v1{" · "}2024–25 Season
          </span>
          <span>Answers grounded in official rulebook text only.</span>
        </div>
      </footer>
    </div>
  );
}
