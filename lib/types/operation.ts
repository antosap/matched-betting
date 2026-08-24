export type OperationStatus =
  | "OPEN"
  | "WON"
  | "LOST"
  | "CLOSED";

export type Operation = {
  id: string;
  createdAt: string;

  event: string;
  market: string;

  bookmakerId: string;
  bookmakerName: string;

  exchangeId: string;
  exchangeName: string;

  backStake: number;
  backOdds: number;

  layStake: number;
  layOdds: number;
  liability: number;

  estimatedProfit: number;
  roi: number;

  status: OperationStatus;
};
