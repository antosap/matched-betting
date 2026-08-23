export type CalculationInput = {
  backOdds: number;
  layOdds: number;
  backStake: number;
  commissionPct: number;
};

export type CalculationResult = {
  layStake: number;
  liability: number;
  backProfitIfWin: number;
  layProfitIfWin: number;
  netProfit: number;
  roiPct: number;
};

export function calculateMatchedBet(input: CalculationInput): CalculationResult {
  const { backOdds, layOdds, backStake, commissionPct } = input;
  if (backOdds <= 1 || layOdds <= 1 || backStake <= 0) {
    throw new Error("Invalid odds or stake");
  }
  const commission = commissionPct / 100;
  const layStake = (backStake * backOdds) / (layOdds + 0); // standard equal-profit starting point
  const liability = layStake * (layOdds - 1);

  const backProfit = backStake * (backOdds - 1);
  const layProfit = layStake * (1 - commission);
  const netProfit = backProfit - liability;
  const adjustedNet = netProfit - Math.max(0, layProfit - backStake * (backOdds - 1)) * commission;
  const roiPct = (adjustedNet / backStake) * 100;

  return {
    layStake,
    liability,
    backProfitIfWin: backProfit - liability,
    layProfitIfWin: layProfit - backStake,
    netProfit: adjustedNet,
    roiPct
  };
}
