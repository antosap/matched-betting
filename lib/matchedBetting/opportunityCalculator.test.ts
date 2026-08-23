import { describe, expect, it } from "vitest";
import { calculateOpportunity } from "./opportunityCalculator";
import type { ProviderQuote } from "@/lib/providers/types";

const back: ProviderQuote = {
  eventId: "event-1",
  event: "Milan – Roma",
  market: "1X2",
  selection: "Milan",
  odds: 2.1,
  bookmakerId: "bookmaker-a",
  timestamp: "2026-08-23T12:00:00Z",
};

const lay: ProviderQuote = {
  eventId: "event-1",
  event: "Milan – Roma",
  market: "1X2",
  selection: "Milan",
  odds: 2.04,
  bookmakerId: "bookmaker-a",
  exchangeId: "exchange-demo",
  timestamp: "2026-08-23T12:00:00Z",
};

describe("calculateOpportunity", () => {
  it("creates a profitable opportunity", () => {
    const result = calculateOpportunity(back, lay, 2);

    expect(result).not.toBeNull();
    expect(result?.roi).toBeGreaterThan(0);
    expect(result?.estimatedProfit).toBeGreaterThan(0);
  });

  it("rejects different events", () => {
    const result = calculateOpportunity(
      back,
      { ...lay, eventId: "event-2" },
      2
    );

    expect(result).toBeNull();
  });

  it("rejects invalid odds", () => {
    const result = calculateOpportunity(
      { ...back, odds: 1 },
      lay,
      2
    );

    expect(result).toBeNull();
  });
});
