import Link from "next/link";

export function CTASection() {
  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="py-32 bg-brand-black relative overflow-hidden"
    >
      <div
        className="absolute -right-20 top-1/2 -translate-y-1/2 font-heading text-[12rem] md:text-[20rem] opacity-5 select-none leading-none text-white pointer-events-none"
        aria-hidden
      >
        RULES
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2
          id="cta-heading"
          className="font-heading text-5xl md:text-7xl mb-8 tracking-tight text-white"
        >
          READY TO CALL <br /> THE GAME?
        </h2>
        <p className="text-xl text-brand-muted mb-12">
          Join 10,000+ professionals using SportRules AI to eliminate ambiguity
          and elevate competition.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/chat"
            className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orange-hover text-white px-10 py-5 font-bold uppercase tracking-widest transition-all text-lg"
          >
            Get Started Now
          </Link>
          <a
            href="mailto:demo@sportrules.ai"
            className="w-full sm:w-auto border border-white/20 hover:bg-white hover:text-brand-black text-white px-10 py-5 font-bold uppercase tracking-widest transition-all text-lg"
          >
            Request Demo
          </a>
        </div>
      </div>
    </section>
  );
}
