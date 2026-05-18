const FOOTER_LINKS = {
  Product: ["API Reference", "Integrations", "Mobile App", "Changelog"],
  Resources: ["Rulebook Archive", "Whitepapers", "Case Studies", "Community"],
  Company: ["About", "Careers", "Contact", "Privacy"],
};

export function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 py-20" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <span
              className="w-8 h-8 bg-brand-orange rounded-sm flex items-center justify-center font-heading text-xl text-white leading-none"
              aria-hidden
            >
              S
            </span>
            <span className="font-heading text-2xl tracking-wider uppercase text-white">
              SportRules AI
            </span>
          </div>
          <p className="text-brand-dim max-w-xs text-sm leading-relaxed mb-8">
            Defining the future of athletic integrity through advanced machine
            intelligence and deep domain expertise.
          </p>
          <div className="flex gap-4">
            {["𝕏", "In", "Ig"].map((label) => (
              <a
                key={label}
                href="#"
                aria-label={`Follow on ${label}`}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/80 hover:border-brand-orange hover:text-brand-orange transition-all"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {Object.entries(FOOTER_LINKS).map(([heading, items]) => (
          <div key={heading}>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-white">
              {heading}
            </h4>
            <ul className="space-y-4 text-sm text-brand-muted">
              {items.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] uppercase tracking-widest text-brand-dim">
          © 2026 SportRules AI · Official NBA Rulebook · v1 · 2024–25 Season
        </p>
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden />
            Systems Operational
          </span>
          <p className="text-[10px] uppercase tracking-widest text-brand-dim">
            Built for the high-performance athlete.
          </p>
        </div>
      </div>
    </footer>
  );
}
