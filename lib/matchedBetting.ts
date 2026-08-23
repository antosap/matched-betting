export type CalculationInput = {
  backOdds: number;
  layOdds: number;
  backStake: number;
  commissionPct: number;
};

export type CalculationResult = {
  layStake: number;
  liability: number;
  backWinProfit: number;
  backLoseProfit: number;
  guaranteedProfit: number;
  roiPct: number;
};

/**
 * Standard matched bet.
 *
 * Commissione applicata al profitto della Lay.
 *
 * Lay Stake:
 *   (Back Stake × Back Odds) / (Lay Odds − Commission)
 */
export function calculateMatchedBet(
  input: CalculationInput
): CalculationResult {
  const {
    backOdds,
    layOdds,
    backStake,
    commissionPct,
  } = input;

  validateInputs(
    backOdds,
    layOdds,
    backStake,
    commissionPct
  );

  const commission = commissionPct / 100;

  const layStake =
    (backStake * backOdds) /
    (layOdds - commission);

  const liability =
    layStake * (layOdds - 1);

  const backWinProfit =
    backStake * (backOdds - 1) -
    liability;

  const backLoseProfit =
    layStake * (1 - commission) -
    backStake;

  const guaranteedProfit =
    Math.min(
      backWinProfit,
      backLoseProfit
    );

  const roiPct =
    (guaranteedProfit / backStake) * 100;

  return {
    layStake,
    liability,
    backWinProfit,
    backLoseProfit,
    guaranteedProfit,
    roiPct,
  };
}

export type FreeBetInput = {
  freeBetStake: number;
  backOdds: number;
  layOdds: number;
  commissionPct: number;
  stakeReturned: boolean;
};

export type FreeBetResult = {
  layStake: number;
  liability: number;
  backWinProfit: number;
  backLoseProfit: number;
  guaranteedProfit: number;
  conversionPct: number;
};

/**
 * Free bet conversion.
 *
 * stakeReturned = false → SNR
 * stakeReturned = true  → SR
 */
export function calculateFreeBet(
  input: FreeBetInput
): FreeBetResult {
  const {
    freeBetStake,
    backOdds,
    layOdds,
    commissionPct,
    stakeReturned,
  } = input;

  if (
    !Number.isFinite(freeBetStake) ||
    !Number.isFinite(backOdds) ||
    !Number.isFinite(layOdds) ||
    !Number.isFinite(commissionPct)
  ) {
    throw new Error(
      "All inputs must be finite numbers"
    );
  }

  if (
    freeBetStake <= 0 ||
    backOdds <= 1 ||
    layOdds <= 1 ||
    commissionPct < 0 ||
    commissionPct >= 100
  ) {
    throw new Error(
      "Invalid free-bet inputs"
    );
  }

  const commission = commissionPct / 100;

  if (layOdds <= commission) {
    throw new Error(
      "Lay odds must be greater than commission"
    );
  }

  const backReturn = stakeReturned
    ? freeBetStake * backOdds
    : freeBetStake * (backOdds - 1);

  const layStake =
    backReturn /
    (layOdds - commission);

  const liability =
    layStake * (layOdds - 1);

  const backWinProfit =
    backReturn - liability;

  const backLoseProfit =
    layStake * (1 - commission);

  const guaranteedProfit =
    Math.min(
      backWinProfit,
      backLoseProfit
    );

  const conversionPct =
    (guaranteedProfit / freeBetStake) * 100;

  return {
    layStake,
    liability,
    backWinProfit,
    backLoseProfit,
    guaranteedProfit,
    conversionPct,
  };
}

function validateInputs(
  backOdds: number,
  layOdds: number,
  backStake: number,
  commissionPct: number
) {
  if (
    !Number.isFinite(backOdds) ||
    !Number.isFinite(layOdds) ||
    !Number.isFinite(backStake) ||
    !Number.isFinite(commissionPct)
  ) {
    throw new Error(
      "All inputs must be finite numbers"
    );
  }

  if (
    backOdds <= 1 ||
    layOdds <= 1 ||
    backStake <= 0 ||
    commissionPct < 0 ||
    commissionPct >= 100
  ) {
    throw new Error(
      "Invalid odds, stake or commission"
    );
  }

  if (layOdds <= commissionPct / 100) {
    throw new Error(
      "Lay odds must be greater than commission"
    );
  }
}
