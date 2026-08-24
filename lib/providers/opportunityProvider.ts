import { findMatchedOpportunities } from "@/lib/matchedBetting/oddsMatcher";
import { buildQuoteDiagnostics } from "@/lib/matchedBetting/diagnostics";
import { matchedBettingConfig } from "@/lib/config/matchedBetting";
import { getLiveQuotes } from "./quoteService";

export async function getLiveOpportunities(
  backStake = matchedBettingConfig.defaultBackStake,
  minimumRoiPct = matchedBettingConfig.minimumRoiPct
) {
  const { providerId, providerName, quotes } = await getLiveQuotes();

  const opportunities = findMatchedOpportunities(quotes, {
    exchangeCommissionPct: matchedBettingConfig.defaultExchangeCommissionPct,
    backStake,
    minimumRoiPct,
  });

  return {
    mode: "live" as const,
    providerId,
    providerName,
    retrievedAt: new Date().toISOString(),
    quoteCount: quotes.length,
    diagnostics: buildQuoteDiagnostics(quotes, opportunities.length),
    opportunities,
  };
}
