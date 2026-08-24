import type { ProviderQuote } from "@/lib/providers/types";

export type QuoteDiagnostics = {
  totalQuotes: number;
  backQuotes: number;
  layQuotes: number;
  uniqueEvents: number;
  backProviders: { id: string; name: string; count: number }[];
  layProviders: { id: string; name: string; count: number }[];
  eventsWithBackAndLay: number;
  compatiblePairs: number;
  pairsWithBackBetterThanLay: number;
  opportunitiesAfterRoiFilter: number;
};

function countProviders(quotes: ProviderQuote[], side: "BACK" | "LAY") {
  const counts = new Map<string, { name: string; count: number }>();

  for (const q of quotes.filter((quote) => quote.side === side)) {
    const id = side === "BACK" ? q.bookmakerId : q.exchangeId;
    if (!id) continue;

    const old = counts.get(id);
    counts.set(id, {
      name: side === "BACK" ? q.bookmakerName || id : q.exchangeName || id,
      count: (old?.count ?? 0) + 1,
    });
  }

  return Array.from(counts.entries())
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => b.count - a.count);
}

function sameMarket(a: ProviderQuote, b: ProviderQuote) {
  return (
    a.eventKey === b.eventKey &&
    a.market === b.market &&
    a.selectionKey === b.selectionKey
  );
}

export function buildQuoteDiagnostics(
  quotes: ProviderQuote[],
  opportunitiesAfterRoiFilter: number
): QuoteDiagnostics {
  const backs = quotes.filter(
    (q) => q.side === "BACK" && Boolean(q.bookmakerId)
  );
  const lays = quotes.filter(
    (q) => q.side === "LAY" && Boolean(q.exchangeId)
  );

  const events = new Set(quotes.map((q) => q.eventKey));
  const both = new Set<string>();
  let compatiblePairs = 0;
  let pairsWithBackBetterThanLay = 0;

  for (const back of backs) {
    for (const lay of lays) {
      if (!sameMarket(back, lay)) continue;
      compatiblePairs++;
      both.add(back.eventKey);
      if (back.odds > lay.odds) pairsWithBackBetterThanLay++;
    }
  }

  return {
    totalQuotes: quotes.length,
    backQuotes: backs.length,
    layQuotes: lays.length,
    uniqueEvents: events.size,
    backProviders: countProviders(quotes, "BACK"),
    layProviders: countProviders(quotes, "LAY"),
    eventsWithBackAndLay: both.size,
    compatiblePairs,
    pairsWithBackBetterThanLay,
    opportunitiesAfterRoiFilter,
  };
}
