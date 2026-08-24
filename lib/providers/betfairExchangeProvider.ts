import type { BettingProvider } from "./provider";
import type { ProviderQuote } from "./types";

type BetfairMarketCatalogue = {
  marketId: string;
  marketName?: string;
  event?: { id?: string; name?: string };
  marketStartTime?: string;
  runners?: Array<{ selectionId: number; runnerName: string }>;
};

type BetfairMarketBook = {
  marketId: string;
  runners?: Array<{
    selectionId: number;
    ex?: {
      availableToLay?: Array<{ price: number; size: number }>;
    };
  }>;
};

function canonical(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bvs?\.?\b/g, " ")
    .replace(/\bv\b/g, " ")
    .replace(/\bversus\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function splitEventName(name: string): [string, string] | null {
  const normalized = name
    .replace(/\s+vs\.?\s+/i, " - ")
    .replace(/\s+v\.?\s+/i, " - ");

  const parts = normalized.split(" - ");
  if (parts.length !== 2) return null;
  return [parts[0].trim(), parts[1].trim()];
}

function buildEventKey(name: string): string | null {
  const teams = splitEventName(name);
  if (!teams) return null;
  return teams.map(canonical).join("|");
}

function buildSelectionKey(runnerName: string, eventName: string): string {
  const value = canonical(runnerName);
  const teams = splitEventName(eventName);

  if (value === "draw" || value === "the draw" || value === "x") return "draw";

  if (teams) {
    if (value === canonical(teams[0])) return "home";
    if (value === canonical(teams[1])) return "away";
  }

  return value;
}

function buildHeaders(appKey: string, sessionToken: string) {
  return {
    "X-Application": appKey,
    "X-Authentication": sessionToken,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function betfairRequest<T>(
  endpoint: string,
  body: unknown,
  appKey: string,
  sessionToken: string,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(
    `https://api.betfair.com/exchange/betting/rest/v1.0/${endpoint}/`,
    {
      method: "POST",
      headers: buildHeaders(appKey, sessionToken),
      body: JSON.stringify(body),
      cache: "no-store",
      signal,
    }
  );

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(
      `betfair: HTTP ${response.status}${bodyText ? ` ${bodyText.slice(0, 300)}` : ""}`
    );
  }

  return (await response.json()) as T;
}

/**
 * Real Betfair Exchange adapter.
 * Supplies ONLY LAY quotes.
 */
export function createBetfairExchangeProvider(): BettingProvider {
  return {
    id: "betfair-exchange",
    name: "Betfair Exchange · LAY",
    kind: "EXCHANGE",

    async getQuotes(signal) {
      const appKey = process.env.MATCHBET_BETFAIR_APP_KEY;
      const sessionToken = process.env.MATCHBET_BETFAIR_SESSION_TOKEN;

      if (!appKey) throw new Error("MATCHBET_BETFAIR_APP_KEY_NOT_CONFIGURED");
      if (!sessionToken) {
        throw new Error("MATCHBET_BETFAIR_SESSION_TOKEN_NOT_CONFIGURED");
      }

      const eventTypeId = process.env.MATCHBET_BETFAIR_EVENT_TYPE_ID || "1";
      const marketTypeCode =
        process.env.MATCHBET_BETFAIR_MARKET_TYPE_CODE || "MATCH_ODDS";
      const hoursAhead = Number(process.env.MATCHBET_BETFAIR_HOURS_AHEAD || "48");

      const now = new Date();
      const to = new Date(
        now.getTime() + Math.max(hoursAhead, 1) * 60 * 60 * 1000
      );

      const catalogues = await betfairRequest<BetfairMarketCatalogue[]>(
        "listMarketCatalogue",
        {
          filter: {
            eventTypeIds: [eventTypeId],
            marketTypeCodes: [marketTypeCode],
            marketStartTime: { from: now.toISOString(), to: to.toISOString() },
          },
          marketProjection: ["EVENT", "RUNNER_DESCRIPTION", "MARKET_START_TIME"],
          sort: "FIRST_TO_START",
          maxResults: "100",
        },
        appKey,
        sessionToken,
        signal
      );

      const validMarkets = (catalogues || [])
        .map((market) => {
          const eventName = market.event?.name || "";
          const eventKey = buildEventKey(eventName);
          if (!eventKey || !market.marketId) return null;
          return { market, eventName, eventKey };
        })
        .filter(
          (
            value
          ): value is {
            market: BetfairMarketCatalogue;
            eventName: string;
            eventKey: string;
          } => Boolean(value)
        );

      if (validMarkets.length === 0) return [];

      const books = await betfairRequest<BetfairMarketBook[]>(
        "listMarketBook",
        {
          marketIds: validMarkets.map(({ market }) => market.marketId),
          priceProjection: { priceData: ["EX_BEST_OFFERS"] },
        },
        appKey,
        sessionToken,
        signal
      );

      const booksByMarket = new Map((books || []).map((book) => [book.marketId, book]));
      const quotes: ProviderQuote[] = [];

      for (const { market, eventName, eventKey } of validMarkets) {
        const book = booksByMarket.get(market.marketId);
        if (!book) continue;

        for (const runner of market.runners || []) {
          const bookRunner = book.runners?.find(
            (value) => value.selectionId === runner.selectionId
          );
          const bestLay = bookRunner?.ex?.availableToLay?.[0];

          if (
            !bestLay ||
            !Number.isFinite(bestLay.price) ||
            bestLay.price <= 1 ||
            !Number.isFinite(bestLay.size) ||
            bestLay.size <= 0
          ) {
            continue;
          }

          quotes.push({
            id: [market.marketId, runner.selectionId, "LAY"].join(":"),
            eventId: market.event?.id || market.marketId,
            eventKey,
            event: eventName,
            sport: "Football",
            startTime: market.marketStartTime,
            market: "1X2",
            selection: runner.runnerName,
            selectionKey: buildSelectionKey(runner.runnerName, eventName),
            side: "LAY",
            odds: bestLay.price,
            exchangeId: "betfair-exchange",
            exchangeName: "Betfair Exchange",
            timestamp: new Date().toISOString(),
            sourceProviderId: "betfair-exchange",
          });
        }
      }

      return quotes;
    },
  };
}
