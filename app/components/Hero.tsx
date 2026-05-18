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
        <h1
          id="hero-heading"
          className="font-heading text-7xl md:text-9xl leading-none mb-6 tracking-tighter text-white"
        >
          PRECISION IN <br />
          <span className="text-brand-orange">EVERY PLAY.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-12 font-light">
          The world&apos;s most advanced AI for sports regulations. Real-time
          RAG-powered analysis for coaches, referees, and athletes.
        </p>

        <HeroSearch />
      </div>

      {/* Scroll-down indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <ChevronDownIcon className="w-6 h-6 text-white" aria-hidden />
      </div>
    </section>
  );
}
