import { getSupabaseServer } from "@/lib/supabase/server";

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

/**
 * Verified user identity for the current request.
 *
 * Prefers `getClaims()`, which validates the access-token JWT **locally** via
 * the Web Crypto API (this project uses asymmetric ES256 signing keys) — no
 * round-trip to the Auth server, unlike `getUser()`. Falls back to `getUser()`
 * only when there are no local claims (missing/expired token), which also
 * revalidates against the Auth server.
 *
 * Use this instead of `supabase.auth.getUser()` in route handlers and Server
 * Components to avoid a per-request network round-trip on every auth check.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await getSupabaseServer();

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (claims?.sub) {
    return {
      id: claims.sub,
      email: typeof claims.email === "string" ? claims.email : undefined,
      role: typeof claims.role === "string" ? claims.role : undefined,
    };
  }

  // No verifiable local claims — validate (and refresh, where cookies are
  // writable) against the Auth server as a fallback.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role };
}
