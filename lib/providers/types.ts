export type QuoteSide = "BACK" | "LAY";

export type ProviderQuote = {
  id: string;
  eventId: string;
  /** Stable cross-provider key used to match bookmaker and exchange quotes. */
  eventKey: string;
  event: string;
  sport?: string;
  startTime?: string;
  market: string;
  selection: string;
  /** Stable normalized selection key (e.g. home/draw/away team name). */
  selectionKey: string;
  side: QuoteSide;
  odds: number;

  bookmakerId?: string;
  bookmakerName?: string;

  exchangeId?: string;
  exchangeName?: string;

  timestamp: string;
  sourceProviderId: string;
};
