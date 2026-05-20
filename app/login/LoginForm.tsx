"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowser();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push(searchParams.get("next") ?? "/chat");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {error && <div className="login-error">{error}</div>}

      <div className="login-field">
        <label htmlFor="email" className="login-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          placeholder="you@example.com"
        />
      </div>

      <div className="login-field">
        <label htmlFor="password" className="login-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          placeholder="••••••••"
        />
      </div>

      <button type="submit" disabled={loading} className="login-btn">
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
