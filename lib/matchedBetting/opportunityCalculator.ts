import type { ProviderQuote } from "@/lib/providers/types";
import type { Opportunity } from "@/lib/types/opportunity";

export function calculateOpportunity(
  back: ProviderQuote,
  lay: ProviderQuote,
  commissionPct: number
): Opportunity | null {
  if (back.odds <= 1 || lay.odds <= 1) {
    return null;
  }

  if (back.eventId !== lay.eventId) {
    return null;
  }

  const layStake =
    (back.odds / lay.odds) * 100;

  const liability =
    layStake * (lay.odds - 1);

  const commission =
    (layStake - 100) * (commissionPct / 100);

  const profit =
    100 - liability - commission;

  const roi =
    (profit / 100) * 100;

  if (profit <= 0) {
    return null;
  }

  return {
    id: `${back.eventId}-${back.bookmakerId}-${lay.exchangeId ?? "exchange"}`,
    event: back.event,
    market: back.market,
    bookmakerId: back.bookmakerId,
    exchangeId: lay.exchangeId ?? "exchange-demo",
    backOdds: back.odds,
    layOdds: lay.odds,
    roi,
    estimatedProfit: profit,
    available: true,
    updatedAt: new Date().toISOString(),
  };
}
