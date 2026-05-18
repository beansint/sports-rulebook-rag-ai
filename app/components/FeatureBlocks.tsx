const FEATURES = [
  {
    step: "01",
    title: ["GROUNDED", "ANSWERS"],
    body: "No hallucinations. Every response is cross-referenced with live regulatory databases and historical case files.",
    bg: "bg-brand-gray",
  },
  {
    step: "02",
    title: ["TECHNICAL", "MASTERY"],
    body: "Powered by proprietary LLMs trained on 50+ years of sports data, rule updates, and officiating memos.",
    bg: "bg-brand-light-gray border-x border-white/5",
  },
  {
    step: "03",
    title: ["GAME", "SPIRIT"],
    body: "We don't just know the rules; we understand the flow of the game. Designed for high-stakes, real-time decision making.",
    bg: "bg-brand-gray",
  },
];

export function FeatureBlocks() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="py-24 bg-brand-black"
    >
      <h2 id="features-heading" className="sr-only">
        Features
      </h2>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {FEATURES.map(({ step, title, body, bg }) => (
            <div
              key={step}
              className={`group relative ${bg} p-12 aspect-square flex flex-col justify-between hover:bg-brand-orange transition-all duration-500 cursor-default`}
            >
              <div className="z-10">
                <span
                  className="text-outline font-heading text-6xl group-hover:text-white/30 transition-colors"
                  aria-hidden
                >
                  {step}
                </span>
                <h3 className="font-heading text-4xl mt-4 tracking-tight text-white group-hover:text-brand-black transition-colors">
                  {title[0]} <br /> {title[1]}
                </h3>
              </div>
              <div className="z-10">
                <p className="text-brand-muted group-hover:text-brand-black/80 font-medium transition-colors">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
