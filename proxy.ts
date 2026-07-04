import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Fast path: verify the access-token JWT locally via getClaims (this project
  // uses asymmetric ES256 signing keys), avoiding an Auth-server round-trip on
  // every /chat and /admin navigation.
  const { data: claimsData } = await supabase.auth.getClaims();
  let authed = Boolean(claimsData?.claims?.sub);
  let email =
    typeof claimsData?.claims?.email === "string"
      ? claimsData.claims.email
      : undefined;

  // Fallback: no verifiable local claims (missing/expired token) — validate
  // against the Auth server. This pass also refreshes the session and rewrites
  // the auth cookies onto supabaseResponse via the setAll handler above.
  if (!authed) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    authed = Boolean(user);
    email = user?.email ?? email;
  }

  if (!authed) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    email !== process.env.ADMIN_EMAIL
  ) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/chat/:path*", "/admin/:path*"],
};
