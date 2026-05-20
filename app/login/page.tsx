import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { next } = await searchParams;
    redirect(next ?? "/chat");
  }

  return (
    <div className="min-h-dvh flex">
      {/* ── Left panel (brand) — hidden on mobile ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-brand-gray flex-col justify-between p-12 overflow-hidden">
        {/* Grid pattern overlay */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,107,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Orange glow blob */}
        <div
          aria-hidden
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #ff6b00 0%, transparent 70%)",
          }}
        />

        {/* Top logo */}
        <div className="relative flex items-center gap-3">
          <span className="w-9 h-9 bg-brand-orange rounded-sm flex items-center justify-center font-heading text-xl text-white leading-none shrink-0">
            S
          </span>
          <span className="font-heading text-2xl tracking-wider uppercase text-white">
            SportRules AI
          </span>
        </div>

        {/* Center hero copy */}
        <div className="relative space-y-6">
          <div className="space-y-3">
            <p className="text-brand-orange text-sm font-bold uppercase tracking-widest">
              Official rulebook intelligence
            </p>
            <h2 className="font-heading text-5xl xl:text-6xl uppercase leading-none text-white">
              Every rule.
              <br />
              <span className="text-brand-orange">Instant</span> answer.
            </h2>
            <p className="text-brand-muted text-lg max-w-sm leading-relaxed">
              Natural-language Q&A grounded in official sports rulebooks, with
              exact citations and page references.
            </p>
          </div>

          {/* Stat callouts */}
          <div className="flex gap-6 pt-2">
            {[
              { value: "4+", label: "Sports" },
              { value: "≥0.85", label: "Relevance" },
              { value: "≤7s", label: "p95 Latency" },
            ].map(({ value, label }) => (
              <div key={label} className="border-l-2 border-brand-orange pl-3">
                <div className="text-white font-heading text-2xl">{value}</div>
                <div className="text-brand-muted text-xs uppercase tracking-widest">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p className="relative text-brand-dim text-xs">
          © {new Date().getFullYear()} SportRules AI · Access by invitation only
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-brand-black">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <span className="w-8 h-8 bg-brand-orange rounded-sm flex items-center justify-center font-heading text-xl text-white leading-none">
            S
          </span>
          <span className="font-heading text-xl tracking-wider uppercase text-white">
            SportRules AI
          </span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-brand-muted text-sm">
              Sign in to access the rulebook.
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-brand-dim text-xs">
            Access is by invitation only.{" "}
            <span className="text-brand-muted">
              Contact an admin to request access.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
