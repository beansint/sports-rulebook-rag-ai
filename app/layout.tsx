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
  title: "SportRules AI — Precision In Every Play",
  description:
    "The world's most advanced AI for sports regulations. Ask any NBA rule in plain English and get grounded answers with exact citations from the official rulebook.",
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
