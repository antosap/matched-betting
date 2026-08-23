import type { ProviderQuote } from "@/lib/providers/types";
import type { Opportunity } from "@/lib/types/opportunity";

export function calculateOpportunity(
  back: ProviderQuote,
  lay: ProviderQuote,
  commissionPct: number,
  backStake = 100
): Opportunity | null {
  if (back.odds <= 1 || lay.odds <= 1) {
    return null;
  }

  if (
    back.eventId !== lay.eventId ||
    back.market !== lay.market ||
    back.selection !== lay.selection
  ) {
    return null;
  }

  if (!lay.exchangeId) {
    return null;
  }

  const layStake = (backStake * back.odds) / lay.odds;
  const liability = layStake * (lay.odds - 1);

  const grossProfit =
    backStake * (back.odds - 1) - liability;

  const exchangeProfit = layStake - backStake;
  const commission = exchangeProfit * (commissionPct / 100);

  const netProfit = Math.min(
    grossProfit,
    exchangeProfit - commission
  );

  const roi = (netProfit / backStake) * 100;

  if (netProfit <= 0) {
    return null;
  }

  return {
    id: `${back.eventId}-${back.bookmakerId}-${lay.exchangeId}`,
    event: back.event,
    market: back.market,
    bookmakerId: back.bookmakerId,
    exchangeId: lay.exchangeId,
    backOdds: back.odds,
    layOdds: lay.odds,
    roi,
    estimatedProfit: netProfit,
    available: true,
    updatedAt: new Date().toISOString(),
  };
}
