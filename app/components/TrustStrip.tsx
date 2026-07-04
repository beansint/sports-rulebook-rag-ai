import clsx from "clsx";
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
        <div className="group flex flex-wrap justify-center items-center gap-12 md:gap-24 text-white">
          {[LogoNBA, LogoFIBA, LogoNCAA, LogoWNBA, LogoEuroLeague].map((Logo, i) => (
            <Logo
              key={i}
              className={clsx(
                i === 1 ? "h-10" : "h-8",
                "opacity-45 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0 group-hover:opacity-60 hover:!opacity-100",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
