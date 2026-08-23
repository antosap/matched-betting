import type { ProviderQuote } from "./types";

export interface BettingProvider {
  id: string;
  name: string;

  getQuotes(): Promise<ProviderQuote[]>;
}
