import { calculateOpportunity } from "@/lib/matchedBetting/opportunityCalculator";
import { getDemoQuotes } from "./demoProvider";

export function getDemoOpportunities() {
  const quotes = getDemoQuotes();

  const opportunities = [];

  for (let i = 0; i < quotes.length; i++) {
    for (let j = 0; j < quotes.length; j++) {
      if (i === j) continue;

      const back = quotes[i];
      const lay = quotes[j];

      if (!lay.exchangeId) continue;
      if (back.exchangeId) continue;

      const opportunity = calculateOpportunity(back, lay, 2);

      if (opportunity) {
        opportunities.push(opportunity);
      }
    }
  }

  return opportunities;
}
