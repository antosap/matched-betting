export type ProviderQuote = {
  eventId: string;
  event: string;
  market: string;
  selection: string;
  odds: number;
  bookmakerId: string;
  exchangeId?: string;
  timestamp: string;
};
