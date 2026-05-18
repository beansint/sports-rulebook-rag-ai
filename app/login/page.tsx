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
    <div className="login-shell">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-icon">S</span>
          <span className="login-logo-text">SportRules AI</span>
        </div>
        <h1 className="login-heading">Sign in</h1>
        <p className="login-subtext">Access is by invitation only.</p>
        <LoginForm />
      </div>
    </div>
  );
}
