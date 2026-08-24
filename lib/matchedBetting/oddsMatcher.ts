import type { ProviderQuote } from "@/lib/providers/types";

export type MatchedOpportunity = {
  id: string;
  eventId: string;
  event: string;
  sport?: string;
  startTime?: string;
  market: string;
  selection: string;
  bookmakerQuote: ProviderQuote;
  exchangeQuote: ProviderQuote;
  bookmakerId: string;
  bookmakerName: string;
  exchangeId: string;
  exchangeName: string;
  backOdds: number;
  layOdds: number;
  backStake: number;
  layStake: number;
  liability: number;
  estimatedProfit: number;
  roi: number;
  sourceTimestamp: string;
};

type MatcherConfig = {
  exchangeCommissionPct: number;
  backStake: number;
  minimumRoiPct: number;
};

const DEFAULT_CONFIG: MatcherConfig = {
  exchangeCommissionPct: 2,
  backStake: 100,
  minimumRoiPct: 0,
};

function sameMarket(back: ProviderQuote, lay: ProviderQuote) {
  return (
    back.eventKey === lay.eventKey &&
    back.market === lay.market &&
    back.selectionKey === lay.selectionKey
  );
}

export function findMatchedOpportunities(
  quotes: ProviderQuote[],
  config: Partial<MatcherConfig> = {}
): MatchedOpportunity[] {
  const settings = { ...DEFAULT_CONFIG, ...config };

  const backs = quotes.filter(
    (quote) => quote.side === "BACK" && Boolean(quote.bookmakerId)
  );
  const lays = quotes.filter(
    (quote) => quote.side === "LAY" && Boolean(quote.exchangeId)
  );

  const opportunities: MatchedOpportunity[] = [];

  for (const back of backs) {
    for (const lay of lays) {
      if (!sameMarket(back, lay)) continue;
      if (back.odds <= lay.odds) continue;

      const layStake = (settings.backStake * back.odds) / lay.odds;
      const liability = layStake * (lay.odds - 1);
      const layProfitBeforeCommission = layStake - settings.backStake;
      const commission =
        layProfitBeforeCommission * (settings.exchangeCommissionPct / 100);
      const backWinProfit =
        settings.backStake * (back.odds - 1) - liability;
      const layWinProfit = layProfitBeforeCommission - commission;
      const estimatedProfit = Math.min(backWinProfit, layWinProfit);
      const roi = (estimatedProfit / settings.backStake) * 100;

      if (roi < settings.minimumRoiPct) continue;

      opportunities.push({
        id: [back.id, lay.id].join(":"),
        eventId: back.eventId,
        event: back.event,
        sport: back.sport,
        startTime: back.startTime,
        market: back.market,
        selection: back.selection,
        bookmakerQuote: back,
        exchangeQuote: lay,
        bookmakerId: back.bookmakerId!,
        bookmakerName: back.bookmakerName || back.bookmakerId!,
        exchangeId: lay.exchangeId!,
        exchangeName: lay.exchangeName || lay.exchangeId!,
        backOdds: back.odds,
        layOdds: lay.odds,
        backStake: settings.backStake,
        layStake,
        liability,
        estimatedProfit,
        roi,
        sourceTimestamp:
          [back.timestamp, lay.timestamp].sort().at(-1) || back.timestamp,
      });
    }
  }

  return opportunities.sort((a, b) => b.roi - a.roi);
}
