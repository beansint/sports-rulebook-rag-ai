import { getSupabaseServer } from "@/lib/supabase/server";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ChatBody } from "./ChatBody";

export default async function ChatPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const sessionUser = user
    ? {
        email: user.email ?? "",
        isAdmin: user.email === process.env.ADMIN_EMAIL,
      }
    : undefined;

  return (
    <div className="min-h-dvh flex flex-col bg-brand-black text-white">
      <Header user={sessionUser} />
      <main className="flex-1">
        <ChatBody />
      </main>
      <Footer />
    </div>
  );
}
