import type { ProviderQuote } from "./types";

export interface BettingProvider {
  id: string;
  name: string;
  kind: "AGGREGATOR" | "BOOKMAKER" | "EXCHANGE";
  getQuotes(signal?: AbortSignal): Promise<ProviderQuote[]>;
}
