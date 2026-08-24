import type { BettingProvider } from "./provider";
import type { ProviderQuote } from "./types";

type OddsApiOutcome = {
  name: string;
  price: number;
};

type OddsApiMarket = {
  key: string;
  last_update: string;
  outcomes: OddsApiOutcome[];
};

type OddsApiBookmaker = {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
};

type OddsApiEvent = {
  id: string;
  sport_key: string;
  sport_title?: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
};

function canonical(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bvs?\.?\b/g, " ")
    .replace(/\bversus\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function eventKey(event: OddsApiEvent): string {
  return [
    canonical(event.home_team),
    canonical(event.away_team),
  ].join("|");
}

function selectionKey(outcome: string, event: OddsApiEvent): string {
  const value = canonical(outcome);
  const home = canonical(event.home_team);
  const away = canonical(event.away_team);

  if (value === "draw" || value === "the draw" || value === "x") {
    return "draw";
  }
  if (value === home) return "home";
  if (value === away) return "away";

  return value;
}

function decimalPrice(price: number): number | null {
  if (!Number.isFinite(price) || price <= 1) return null;
  return price;
}

/**
 * The Odds API is a bookmaker aggregator for this application.
 * It is intentionally used ONLY for BACK prices.
 *
 * Do not infer LAY prices from bookmaker/aggregator data. Exchange LAY
 * quotes are supplied by the dedicated Betfair Exchange adapter.
 */
export function normalizeTheOddsApiResponse(events: OddsApiEvent[]): ProviderQuote[] {
  const quotes: ProviderQuote[] = [];

  for (const event of events) {
    for (const bookmaker of event.bookmakers ?? []) {
      for (const market of bookmaker.markets ?? []) {
        if (market.key !== "h2h") continue;

        for (const outcome of market.outcomes ?? []) {
          const odds = decimalPrice(outcome.price);
          if (odds === null) continue;

          quotes.push({
            id: [event.id, bookmaker.key, market.key, outcome.name].join(":"),
            eventId: event.id,
            eventKey: eventKey(event),
            event: `${event.home_team} - ${event.away_team}`,
            sport: event.sport_title || event.sport_key,
            startTime: event.commence_time,
            market: "1X2",
            selection: outcome.name,
            selectionKey: selectionKey(outcome.name, event),
            side: "BACK",
            odds,
            bookmakerId: bookmaker.key,
            bookmakerName: bookmaker.title,
            timestamp:
              market.last_update ||
              bookmaker.last_update ||
              new Date().toISOString(),
            sourceProviderId: "the-odds-api",
          });
        }
      }
    }
  }

  return quotes;
}

export function createTheOddsApiProvider(): BettingProvider {
  return {
    id: "the-odds-api",
    name: "The Odds API · bookmaker BACK",
    kind: "AGGREGATOR",

    async getQuotes(signal) {
      const apiKey = process.env.MATCHBET_ODDS_API_KEY;
      const sport = process.env.MATCHBET_ODDS_API_SPORT || "soccer_italy_serie_a";
      const regions = process.env.MATCHBET_ODDS_API_REGIONS || "eu";
      const markets = process.env.MATCHBET_ODDS_API_MARKETS || "h2h";

      if (!apiKey) {
        throw new Error("MATCHBET_ODDS_API_KEY_NOT_CONFIGURED");
      }

      const url = new URL(
        `https://api.the-odds-api.com/v4/sports/${encodeURIComponent(sport)}/odds`
      );

      url.searchParams.set("apiKey", apiKey);
      url.searchParams.set("regions", regions);
      url.searchParams.set("markets", markets);
      url.searchParams.set("oddsFormat", "decimal");
      url.searchParams.set("dateFormat", "iso");

      if (process.env.MATCHBET_ODDS_API_BOOKMAKERS) {
        url.searchParams.set("bookmakers", process.env.MATCHBET_ODDS_API_BOOKMAKERS);
      }

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(
          `the-odds-api: HTTP ${response.status}${body ? ` ${body.slice(0, 300)}` : ""}`
        );
      }

      const payload = (await response.json()) as unknown;
      if (!Array.isArray(payload)) {
        throw new Error("the-odds-api: invalid response");
      }

      return normalizeTheOddsApiResponse(payload as OddsApiEvent[]);
    },
  };
}
