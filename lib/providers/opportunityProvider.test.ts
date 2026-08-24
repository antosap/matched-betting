import { describe, expect, it, vi } from "vitest";
import { getLiveOpportunities } from "./opportunityProvider";

vi.mock("./quoteService", () => ({
  getLiveQuotes: vi.fn(async () => ({
    providerId: "test-provider",
    providerName: "Test Provider",
    quotes: [
      {
        id: "back-1", eventId: "event-1", event: "Test Event",
        market: "1X2", selection: "Home", side: "BACK", odds: 2.1,
        bookmakerId: "book-1", bookmakerName: "Test Bookmaker",
        timestamp: "2026-08-24T12:00:00Z", sourceProviderId: "test-provider"
      },
      {
        id: "lay-1", eventId: "event-1", event: "Test Event",
        market: "1X2", selection: "Home", side: "LAY", odds: 2.04,
        exchangeId: "exchange-1", exchangeName: "Test Exchange",
        timestamp: "2026-08-24T12:00:00Z", sourceProviderId: "test-provider"
      }
    ]
  }))
}));

describe("getLiveOpportunities", () => {
  it("builds opportunities from provider quotes", async () => {
    const result = await getLiveOpportunities(100, 0);
    expect(result.mode).toBe("live");
    expect(result.providerId).toBe("test-provider");
    expect(result.quoteCount).toBe(2);
    expect(result.opportunities).toHaveLength(1);
  });
});
