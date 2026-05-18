import { LogoNBA } from "./logos/LogoNBA";
import { LogoFIBA } from "./logos/LogoFIBA";
import { LogoNCAA } from "./logos/LogoNCAA";
import { LogoWNBA } from "./logos/LogoWNBA";
import { LogoEuroLeague } from "./logos/LogoEuroLeague";

export function TrustStrip() {
  return (
    <section
      aria-label="Integrated leagues"
      className="py-12 bg-brand-black border-y border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-brand-dim mb-8">
          Integrated with Global Leagues
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale contrast-125 text-white">
          <LogoNBA className="h-8" />
          <LogoFIBA className="h-10" />
          <LogoNCAA className="h-8" />
          <LogoWNBA className="h-8" />
          <LogoEuroLeague className="h-8" />
        </div>
      </div>
    </section>
  );
}
