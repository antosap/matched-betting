import { calculateOpportunity } from "@/lib/matchedBetting/opportunityCalculator";
import { demoProvider } from "./demoProvider";
import { matchedBettingConfig } from "@/lib/config/matchedBetting";
export async function getDemoOpportunities() {
  const quotes = await demoProvider.getQuotes();

  const opportunities = [];

  for (let i = 0; i < quotes.length; i++) {
    for (let j = 0; j < quotes.length; j++) {
      if (i === j) continue;

      const back = quotes[i];
      const lay = quotes[j];

      if (!lay.exchangeId) continue;
      if (back.exchangeId) continue;

      const opportunity = calculateOpportunity(   back,   lay,   matchedBettingConfig.defaultExchangeCommissionPct,   matchedBettingConfig.defaultBackStake );

      if (opportunity) {
        opportunities.push(opportunity);
      }
    }
  }

  return opportunities;
}
