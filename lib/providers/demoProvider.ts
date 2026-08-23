import type { ProviderQuote } from "./types";

export function getDemoQuotes(): ProviderQuote[] {
  return [
    {
      eventId: "demo-001",
      event: "Milan – Roma",
      market: "1X2",
      selection: "Milan",
      odds: 2.1,
      bookmakerId: "bookmaker-a",
      timestamp: new Date().toISOString(),
    },
  ];
}
