import type { Metadata } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ChatBody } from "./ChatBody";

export const metadata: Metadata = {
  title: "Chat",
  robots: { index: false, follow: false },
};

export default function ChatPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-brand-black text-white">
      <Header />
      <main className="flex-1">
        <ChatBody />
      </main>
      <Footer />
    </div>
  );
}
