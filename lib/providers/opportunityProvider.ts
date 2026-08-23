import { calculateOpportunity } from "@/lib/matchedBetting/opportunityCalculator";
import { getDemoQuotes } from "./demoProvider";

export function getDemoOpportunities() {
  const quotes = getDemoQuotes();

  if (quotes.length < 2) {
    return [];
  }

  const [back, lay] = quotes;

  const opportunity = calculateOpportunity(back, lay, 2);

  return opportunity ? [opportunity] : [];
}
