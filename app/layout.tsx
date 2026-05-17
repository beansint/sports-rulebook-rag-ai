import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SportRules AI",
  description: "RAG-backed sports rulebook assistant backend MVP",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
