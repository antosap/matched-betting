export type QuoteSide = "BACK" | "LAY";

export type ProviderQuote = {
  id: string;
  eventId: string;
  event: string;
  sport?: string;
  startTime?: string;
  market: string;
  selection: string;
  side: QuoteSide;
  odds: number;

  bookmakerId?: string;
  bookmakerName?: string;

  exchangeId?: string;
  exchangeName?: string;

  timestamp: string;
  sourceProviderId: string;
};
