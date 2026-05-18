export function DashboardPreview() {
  return (
    <section
      id="dashboard"
      aria-labelledby="dashboard-heading"
      className="py-24 bg-brand-black overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center">
          <h2
            id="dashboard-heading"
            className="font-heading text-4xl md:text-6xl mb-4 tracking-tight text-white"
          >
            THE DASHBOARD OF TRUTH
          </h2>
          <p className="text-brand-muted max-w-xl mx-auto">
            Instant verification against official rulebooks with source-cited
            precision.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto bg-brand-gray border border-white/10 rounded-xl overflow-hidden shadow-2xl glow-orange">
          {/* Window controls */}
          <div className="bg-brand-light-gray px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/50" aria-hidden />
            <span className="w-3 h-3 rounded-full bg-yellow-500/50" aria-hidden />
            <span className="w-3 h-3 rounded-full bg-green-500/50" aria-hidden />
            <span className="ml-4 text-[10px] uppercase tracking-widest text-brand-dim">
              Live Rule Analysis Session · v1.0.0
            </span>
          </div>

          <div className="flex flex-col md:flex-row h-[600px]">
            {/* Left: chat sample */}
            <div className="w-full md:w-1/3 border-r border-white/5 flex flex-col p-6 space-y-6">
              <div className="flex flex-col gap-4">
                <div className="bg-white/5 p-4 rounded-lg self-start max-w-[90%]">
                  <p className="text-xs text-brand-orange font-bold uppercase mb-1 tracking-widest">
                    User
                  </p>
                  <p className="text-sm text-white">
                    Explain the landing zone foul rule for 3-point shooters.
                  </p>
                </div>
                <div className="bg-brand-orange/10 border border-brand-orange/20 p-4 rounded-lg self-start max-w-[90%]">
                  <p className="text-xs text-brand-orange font-bold uppercase mb-1 tracking-widest">
                    SportRules AI
                  </p>
                  <p className="text-sm leading-relaxed text-gray-100">
                    According to Article 33.6, a defender must allow the
                    shooter space to land. Rule 12.B.2 specifies this as a
                    Flagrant Type 1 if contact is unnecessary…
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-6 border-t border-white/5">
                <div className="bg-white/5 rounded p-3 text-xs text-brand-muted italic">
                  &ldquo;Checking Section 12, Subsection B: Fouls and Penalties…&rdquo;
                </div>
              </div>
            </div>

            {/* Right: PDF preview */}
            <div className="hidden md:flex flex-1 bg-brand-black p-8 flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-12 bg-red-900/20 border border-red-500/30 flex items-center justify-center text-red-500 font-bold text-xs rounded">
                    PDF
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase text-white tracking-wider">
                      Official_NBA_Rulebook_2024.pdf
                    </p>
                    <p className="text-[10px] text-brand-dim uppercase tracking-widest">
                      Page 54 of 128 · Verified
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-brand-orange/20 text-brand-orange rounded-full text-[10px] font-bold tracking-widest">
                  MATCH FOUND
                </span>
              </div>

              <div className="flex-1 bg-brand-light-gray rounded-lg p-10 relative overflow-hidden">
                <div className="space-y-4 opacity-40">
                  <div className="h-4 bg-white/10 w-3/4 rounded" />
                  <div className="h-4 bg-white/10 w-full rounded" />
                  <div className="h-4 bg-brand-orange/40 w-full rounded border border-brand-orange/50" />
                  <div className="h-4 bg-brand-orange/40 w-5/6 rounded border border-brand-orange/50" />
                  <div className="h-4 bg-white/10 w-full rounded" />
                  <div className="h-4 bg-white/10 w-2/3 rounded" />
                  <div className="h-4 bg-white/10 w-full rounded" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-brand-orange/10 border border-brand-orange p-6 max-w-md backdrop-blur-sm">
                    <p className="text-brand-orange font-heading text-xl mb-2 tracking-wider">
                      ARTICLE 33.6: CYLINDER
                    </p>
                    <p className="text-xs leading-relaxed text-gray-200">
                      The shooter&apos;s cylinder includes the space above the
                      floor occupied by the player and the space where the
                      player will land… [See Figure 14.a]
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
