import Image from "next/image";
import { ChevronDownIcon } from "lucide-react";
import { HeroSearch } from "./HeroSearch";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden"
    >
      {/* Background image layer with gradient fallback */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(255,107,0,0.10), transparent 50%), linear-gradient(180deg, #0e0e0e 0%, #050505 100%)",
        }}
      >
        <Image
          src="/hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 hero-gradient" aria-hidden />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl px-6 text-center">
        {/* Eyebrow credibility pill */}
        <div
          className="animate-fade-up mb-7 inline-flex items-center gap-2.5 rounded-full border border-brand-orange/25 bg-brand-orange/[0.08] py-1.5 pl-2.5 pr-4 backdrop-blur-sm"
          style={{ animationDelay: "0ms" }}
        >
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-orange" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-orange/90">
            RAG-powered rulebook intelligence
          </span>
          <span className="hidden text-[11px] font-medium tracking-wide text-brand-muted sm:inline">
            NBA · NFL · MLB · FIFA
          </span>
        </div>

        <h1
          id="hero-heading"
          className="animate-fade-up font-heading text-7xl md:text-9xl leading-none mb-6 tracking-tighter text-white"
          style={{ animationDelay: "80ms" }}
        >
          PRECISION IN <br />
          <span className="text-brand-orange text-glow-orange">EVERY PLAY.</span>
        </h1>
        <p
          className="animate-fade-up max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-10 font-light"
          style={{ animationDelay: "160ms" }}
        >
          Ask any rule in plain English — get an instant answer with the exact
          page cited, straight from the official rulebook. No more flipping
          through 128 pages mid-game.
        </p>

        <div className="animate-fade-up" style={{ animationDelay: "240ms" }}>
          <HeroSearch />
        </div>

        {/* Credibility metrics */}
        <dl
          className="animate-fade-up mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-14"
          style={{ animationDelay: "320ms" }}
        >
          {[
            { value: "4", label: "Leagues covered" },
            { value: "95%+", label: "Citation accuracy" },
            { value: "<7s", label: "Median answer" },
            { value: "100%", label: "Source-grounded" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <dt className="font-heading text-3xl leading-none text-white md:text-4xl">
                {value}
              </dt>
              <dd className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-brand-dim">
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Scroll-down indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <ChevronDownIcon className="w-6 h-6 text-white" aria-hidden />
      </div>
    </section>
  );
}
