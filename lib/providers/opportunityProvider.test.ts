import { describe, expect, it } from "vitest";
import { getDemoOpportunities } from "./opportunityProvider";

describe("getDemoOpportunities", () => {
  it("generates opportunities from provider quotes", () => {
    const opportunities = getDemoOpportunities();

    expect(opportunities.length).toBeGreaterThan(0);
    expect(opportunities[0].backOdds).toBeGreaterThan(1);
    expect(opportunities[0].layOdds).toBeGreaterThan(1);
    expect(opportunities[0].roi).toBeGreaterThan(0);
  });

  it("uses the configured exchange commission", () => {
    const opportunities = getDemoOpportunities();

    expect(opportunities[0].exchangeId).toBe("exchange-demo");
    expect(opportunities[0].estimatedProfit).toBeGreaterThan(0);
  });
});
