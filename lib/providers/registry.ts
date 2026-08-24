import type { BettingProvider } from "./provider";
import { createTheOddsApiProvider } from "./theOddsApiProvider";

export function getConfiguredProviders(): BettingProvider[] {
  if (process.env.MATCHBET_ODDS_API_KEY) {
    return [createTheOddsApiProvider()];
  }

  return [];
}
