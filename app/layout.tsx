import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-anton",
});

const inter = Inter({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sports-rulebook-rag-ai.vercel.app"),
  title: {
    default: "SportRules AI — Instant Answers from Official Sports Rulebooks",
    template: "%s · SportRules AI",
  },
  description:
    "Ask any NBA, NFL, MLB, or FIFA rule in plain English and get an instant, citation-backed answer pulled straight from the official rulebook — every answer cites the exact page.",
  applicationName: "SportRules AI",
  authors: [{ name: "SportRules AI" }],
  creator: "SportRules AI",
  publisher: "SportRules AI",
  category: "sports",
  keywords: [
    "NBA rules",
    "NFL rules",
    "MLB rules",
    "FIFA laws of the game",
    "sports rulebook",
    "rule lookup",
    "officiating",
    "referee assistant",
    "RAG",
    "sports AI",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "SportRules AI",
    title: "SportRules AI — Instant Answers from Official Sports Rulebooks",
    description:
      "Ask any NBA, NFL, MLB, or FIFA rule in plain English and get an instant, citation-backed answer pulled straight from the official rulebook — every answer cites the exact page.",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SportRules AI — Instant Answers from Official Sports Rulebooks",
    description:
      "Ask any NBA, NFL, MLB, or FIFA rule in plain English and get an instant, citation-backed answer pulled straight from the official rulebook — every answer cites the exact page.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <body className="bg-brand-black text-white font-sans selection:bg-brand-orange selection:text-white">
        {children}
      </body>
    </html>
  );
}
