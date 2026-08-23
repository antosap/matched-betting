import { NextResponse } from "next/server";

const opportunities = [
  { id: "OP-001", event: "Milan – Roma", market: "1X2", bookmaker: "Bookmaker A", exchange: "Betfair", back: 2.10, lay: 2.04, roi: 2.06, profit: 2.06, liquidity: 840 },
  { id: "OP-002", event: "Napoli – Inter", market: "1X2", bookmaker: "Bookmaker B", exchange: "Betfair", back: 2.35, lay: 2.27, roi: 2.91, profit: 2.91, liquidity: 620 },
  { id: "OP-003", event: "Juventus – Lazio", market: "Over 2.5", bookmaker: "Bookmaker C", exchange: "Betfair", back: 1.95, lay: 1.91, roi: 1.74, profit: 1.74, liquidity: 430 },
  { id: "OP-004", event: "Atalanta – Torino", market: "Under 3.5", bookmaker: "Bookmaker A", exchange: "Betfair", back: 1.72, lay: 1.67, roi: 2.38, profit: 2.38, liquidity: 510 }
];

export async function GET() {
  return NextResponse.json({ opportunities, mode: "simulation" });
}