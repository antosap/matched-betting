import type { ProviderQuote } from "@/lib/providers/types";

export type MatchedOpportunity = {
  eventId: string;
  event: string;
  market: string;
  selection: string;

  bookmakerQuote: ProviderQuote;
  exchangeQuote: ProviderQuote;

  backOdds: number;
  layOdds: number;

  backStake: number;
  layStake: number;
  liability: number;

  estimatedProfit: number;
  roi: number;
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

function sameMarket(
  bookmaker: ProviderQuote,
  exchange: ProviderQuote
) {
  return (
    bookmaker.eventId === exchange.eventId &&
    bookmaker.market === exchange.market &&
    bookmaker.selection === exchange.selection
  );
}

export function findMatchedOpportunities(
  quotes: ProviderQuote[],
  config: Partial<MatcherConfig> = {}
): MatchedOpportunity[] {
  const settings = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const opportunities: MatchedOpportunity[] = [];

  const bookmakerQuotes = quotes.filter(
    (quote) => !quote.exchangeId
  );

  const exchangeQuotes = quotes.filter(
    (quote) => Boolean(quote.exchangeId)
  );

  for (const bookmaker of bookmakerQuotes) {
    for (const exchange of exchangeQuotes) {
      if (!sameMarket(bookmaker, exchange)) {
        continue;
      }

      if (bookmaker.odds <= 1 || exchange.odds <= 1) {
        continue;
      }

      if (bookmaker.odds <= exchange.odds) {
        continue;
      }

      const backStake = settings.backStake;

      const layStake =
        (backStake * bookmaker.odds) /
        exchange.odds;

      const liability =
        layStake * (exchange.odds - 1);

      const commission =
        (layStake - backStake) *
        (settings.exchangeCommissionPct / 100);

      const estimatedProfit =
        backStake *
        (bookmaker.odds - 1) -
        liability -
        commission;

      const roi =
        (estimatedProfit / backStake) * 100;

      if (roi < settings.minimumRoiPct) {
        continue;
      }

      opportunities.push({
        eventId: bookmaker.eventId,
        event: bookmaker.event,
        market: bookmaker.market,
        selection: bookmaker.selection,

        bookmakerQuote: bookmaker,
        exchangeQuote: exchange,

        backOdds: bookmaker.odds,
        layOdds: exchange.odds,

        backStake,
        layStake,
        liability,

        estimatedProfit,
        roi,
      });
    }
  }

  return opportunities.sort(
    (a, b) => b.roi - a.roi
  );
}
