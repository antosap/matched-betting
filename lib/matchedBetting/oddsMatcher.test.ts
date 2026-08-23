import { describe, expect, it } from "vitest";

import { findMatchedOpportunities } from "./oddsMatcher";
import type { ProviderQuote } from "@/lib/providers/types";

describe("findMatchedOpportunities", () => {
  it("matches the same event, market and selection", () => {
    const quotes: ProviderQuote[] = [
      {
        eventId: "event-1",
        event: "Milan - Roma",
        market: "1X2",
        selection: "Milan",
        odds: 2.1,
        bookmakerId: "bookmaker-a",
        timestamp: new Date().toISOString(),
      },
      {
        eventId: "event-1",
        event: "Milan - Roma",
        market: "1X2",
        selection: "Milan",
        odds: 2.04,
        bookmakerId: "bookmaker-a",
        exchangeId: "exchange-demo",
        timestamp: new Date().toISOString(),
      },
    ];

    const opportunities =
      findMatchedOpportunities(quotes);

    expect(opportunities).toHaveLength(1);
    expect(opportunities[0].backOdds).toBe(2.1);
    expect(opportunities[0].layOdds).toBe(2.04);
    expect(opportunities[0].estimatedProfit).toBeGreaterThan(0);
  });

  it("does not match different events", () => {
    const quotes: ProviderQuote[] = [
      {
        eventId: "event-1",
        event: "Milan - Roma",
        market: "1X2",
        selection: "Milan",
        odds: 2.1,
        bookmakerId: "bookmaker-a",
        timestamp: new Date().toISOString(),
      },
      {
        eventId: "event-2",
        event: "Inter - Napoli",
        market: "1X2",
        selection: "Inter",
        odds: 2.04,
        bookmakerId: "bookmaker-a",
        exchangeId: "exchange-demo",
        timestamp: new Date().toISOString(),
      },
    ];

    const opportunities =
      findMatchedOpportunities(quotes);

    expect(opportunities).toHaveLength(0);
  });

  it("sorts opportunities by ROI descending", () => {
    const quotes: ProviderQuote[] = [
      {
        eventId: "event-1",
        event: "Milan - Roma",
        market: "1X2",
        selection: "Milan",
        odds: 2.1,
        bookmakerId: "bookmaker-a",
        timestamp: new Date().toISOString(),
      },
      {
        eventId: "event-1",
        event: "Milan - Roma",
        market: "1X2",
        selection: "Milan",
        odds: 2.04,
        bookmakerId: "bookmaker-a",
        exchangeId: "exchange-demo",
        timestamp: new Date().toISOString(),
      },
      {
        eventId: "event-2",
        event: "Inter - Napoli",
        market: "1X2",
        selection: "Inter",
        odds: 2.5,
        bookmakerId: "bookmaker-a",
        timestamp: new Date().toISOString(),
      },
      {
        eventId: "event-2",
        event: "Inter - Napoli",
        market: "1X2",
        selection: "Inter",
        odds: 2.1,
        bookmakerId: "bookmaker-a",
        exchangeId: "exchange-demo",
        timestamp: new Date().toISOString(),
      },
    ];

    const opportunities =
      findMatchedOpportunities(quotes);

    expect(opportunities.length).toBe(2);
    expect(opportunities[0].roi).toBeGreaterThan(
      opportunities[1].roi
    );
  });
});
