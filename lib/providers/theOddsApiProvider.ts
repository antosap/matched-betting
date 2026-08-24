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

function decimalPrice(price: number): number | null {
  // The Odds API is requested with oddsFormat=decimal.
  if (!Number.isFinite(price) || price <= 1) return null;
  return price;
}

export function normalizeTheOddsApiResponse(
  events: OddsApiEvent[]
): ProviderQuote[] {
  const quotes: ProviderQuote[] = [];

  for (const event of events) {
    for (const bookmaker of event.bookmakers ?? []) {
      for (const market of bookmaker.markets ?? []) {
        const side =
          market.key === "h2h_lay" ||
          market.key === "outrights_lay"
            ? "LAY"
            : market.key === "h2h" ||
              market.key === "outrights"
            ? "BACK"
            : null;

        if (!side) continue;

        for (const outcome of market.outcomes ?? []) {
          const odds = decimalPrice(outcome.price);
          if (odds === null) continue;

          quotes.push({
            id: [
              event.id,
              bookmaker.key,
              market.key,
              outcome.name,
            ].join(":"),
            eventId: event.id,
            event: `${event.home_team} - ${event.away_team}`,
            sport: event.sport_title || event.sport_key,
            startTime: event.commence_time,
            market:
              market.key === "h2h" ||
              market.key === "h2h_lay"
                ? "1X2"
                : market.key,
            selection: outcome.name,
            side,
            odds,

            ...(side === "BACK"
              ? {
                  bookmakerId: bookmaker.key,
                  bookmakerName: bookmaker.title,
                }
              : {
                  exchangeId: bookmaker.key,
                  exchangeName: bookmaker.title,
                }),

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
    name: "The Odds API",
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
        `https://api.the-odds-api.com/v4/sports/${encodeURIComponent(
          sport
        )}/odds`
      );

      url.searchParams.set("apiKey", apiKey);
      url.searchParams.set("regions", regions);
      url.searchParams.set("markets", markets);
      url.searchParams.set("oddsFormat", "decimal");
      url.searchParams.set("dateFormat", "iso");

      if (process.env.MATCHBET_ODDS_API_BOOKMAKERS) {
        url.searchParams.set(
          "bookmakers",
          process.env.MATCHBET_ODDS_API_BOOKMAKERS
        );
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
          `the-odds-api: HTTP ${response.status}${
            body ? ` ${body.slice(0, 300)}` : ""
          }`
        );
      }

      const payload = (await response.json()) as unknown;

      if (!Array.isArray(payload)) {
        throw new Error("the-odds-api: invalid response");
      }

      return normalizeTheOddsApiResponse(
        payload as OddsApiEvent[]
      );
    },
  };
}
