import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MatchBet Personal",
  description: "Personal matched betting analysis dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="it"><body>{children}</body></html>;
}