import Link from "next/link";
import { signOut } from "@/app/login/actions";

const NAV_LINKS = [
  { href: "/#dashboard", label: "Platform" },
  { href: "/#features", label: "Resources" },
  { href: "/#features", label: "Leagues" },
  { href: "/#cta", label: "Pricing" },
];

type HeaderUser = {
  email: string;
  isAdmin: boolean;
};

export function Header({ user }: { user?: HeaderUser }) {
  return (
    <header className="fixed top-0 w-full z-50 bg-brand-black/80 backdrop-blur-md border-b border-white/10">
      <nav
        className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black rounded-sm"
        >
          <span
            className="w-8 h-8 bg-brand-orange rounded-sm flex items-center justify-center font-heading text-xl text-white leading-none"
            aria-hidden
          >
            S
          </span>
          <span className="font-heading text-2xl tracking-wider uppercase text-white group-hover:text-brand-orange transition-colors">
            SportRules AI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-white/80 hover:text-brand-orange transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            {user.isAdmin && (
              <Link
                href="/admin/users"
                className="hidden sm:block text-xs font-bold uppercase tracking-widest text-brand-orange hover:text-brand-orange/70 transition-colors"
              >
                Admin
              </Link>
            )}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-white/10 bg-white/5"
              title={user.email}
            >
              <span
                className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center text-xs font-bold text-white shrink-0"
                aria-hidden
              >
                {user.email[0].toUpperCase()}
              </span>
              <span className="hidden sm:block text-xs text-white/60 max-w-40 truncate">
                {user.email}
              </span>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors cursor-pointer min-h-[44px] px-1"
              >
                Sign&nbsp;out
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/chat"
            className="bg-white text-brand-black px-6 py-2 font-bold text-sm uppercase tracking-widest hover:bg-brand-orange hover:text-white transition-all rounded-sm"
          >
            Try It Free
          </Link>
        )}
      </nav>
    </header>
  );
}
