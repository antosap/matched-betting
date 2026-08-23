"use client";

import { useMemo, useState } from "react";
import { calculateMatchedBet } from "@/lib/matchedBetting";
import CalculatorForm from "./CalculatorForm";
import CalculatorResult from "./CalculatorResult";

export default function MatchedBetCalculator() {
  const [backOdds, setBackOdds] = useState(2.1);
  const [layOdds, setLayOdds] = useState(2.04);
  const [stake, setStake] = useState(100);
  const [commission, setCommission] = useState(2);

  const result = useMemo(() => {
    try {
      return calculateMatchedBet({
        backOdds,
        layOdds,
        backStake: stake,
        commissionPct: commission,
      });
    } catch {
      return null;
    }
  }, [backOdds, layOdds, stake, commission]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-2">
        Calcolatore Back / Lay
      </h1>

      <p className="text-sm text-slate-500 mb-6">
        Motore locale di simulazione.
      </p>

      <div className="grid lg:grid-cols-2 gap-4">
        <CalculatorForm
          backOdds={backOdds}
          layOdds={layOdds}
          stake={stake}
          commission={commission}
          onBackOddsChange={setBackOdds}
          onLayOddsChange={setLayOdds}
          onStakeChange={setStake}
          onCommissionChange={setCommission}
        />

        <CalculatorResult result={result} />
      </div>
    </div>
  );
}
