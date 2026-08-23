import { findMatchedOpportunities } from "@/lib/matchedBetting/oddsMatcher";
import { matchedBettingConfig } from "@/lib/config/matchedBetting";
import { demoProvider } from "./demoProvider";

export async function getDemoOpportunities() {
  const quotes = await demoProvider.getQuotes();

  return findMatchedOpportunities(quotes, {
    exchangeCommissionPct:
      matchedBettingConfig.defaultExchangeCommissionPct,

    backStake:
      matchedBettingConfig.defaultBackStake,

    minimumRoiPct: 0,
  });
}
