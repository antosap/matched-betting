import type { BettingProvider } from "./provider";
import { createTheOddsApiProvider } from "./theOddsApiProvider";
import { createBetfairExchangeProvider } from "./betfairExchangeProvider";

export function getConfiguredProviders(): BettingProvider[] {
  const providers: BettingProvider[] = [];

  if (process.env.MATCHBET_ODDS_API_KEY) {
    providers.push(createTheOddsApiProvider());
  }

  if (
    process.env.MATCHBET_BETFAIR_APP_KEY &&
    process.env.MATCHBET_BETFAIR_SESSION_TOKEN
  ) {
    providers.push(createBetfairExchangeProvider());
  }

  return providers;
}
