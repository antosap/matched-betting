import type { ProviderQuote } from "@/lib/providers/types";
import type { Opportunity } from "@/lib/types/opportunity";

export function calculateOpportunity(
  back: ProviderQuote,
  lay: ProviderQuote,
  commissionPct: number,
  backStake = 100
): Opportunity | null {
  if (
    back.side !== "BACK" ||
    lay.side !== "LAY" ||
    !back.bookmakerId ||
    !lay.exchangeId ||
    back.odds <= 1 ||
    lay.odds <= 1 ||
    backStake <= 0 ||
    commissionPct < 0 ||
    commissionPct >= 100 ||
    back.eventId !== lay.eventId ||
    back.market !== lay.market ||
    back.selection !== lay.selection ||
    back.odds <= lay.odds
  ) return null;

  const layStake=(backStake*back.odds)/lay.odds;
  const liability=layStake*(lay.odds-1);
  const backWinProfit=backStake*(back.odds-1)-liability;
  const layProfitBeforeCommission=layStake-backStake;
  const commission=layProfitBeforeCommission*(commissionPct/100);
  const layWinProfit=layProfitBeforeCommission-commission;
  const netProfit=Math.min(backWinProfit,layWinProfit);

  if(netProfit<=0) return null;

  return {
    id:`${back.id}:${lay.id}`,event:back.event,market:back.market,
    bookmakerId:back.bookmakerId,exchangeId:lay.exchangeId,
    backOdds:back.odds,layOdds:lay.odds,
    roi:(netProfit/backStake)*100,estimatedProfit:netProfit,
    available:true,updatedAt:new Date().toISOString()
  };
}
