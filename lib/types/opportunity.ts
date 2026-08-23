export type Opportunity = {
  id: string;
  event: string;
  market: string;

  bookmakerId: string;
  exchangeId: string;

  backOdds: number;
  layOdds: number;

  roi: number;
  estimatedProfit: number;

  available: boolean;
  updatedAt: string;
};
