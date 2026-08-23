import type { CalculationResult } from "@/lib/matchedBetting";

export default function CalculatorResult({
  result,
}: {
  result: CalculationResult | null;
}) {
  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
      <div className="text-xs uppercase tracking-widest text-emerald-400 mb-5">
        Risultato
      </div>

      {!result ? (
        <p className="text-sm text-slate-500">
          Inserisci valori validi per calcolare l'operazione.
        </p>
      ) : (
        <div className="space-y-3 text-sm">
          <Row label="Lay stake" value={eur(result.layStake)} />
          <Row label="Liability" value={eur(result.liability)} />
          <Row label="Scenario Back" value={eur(result.backWinProfit)} />
          <Row label="Scenario Lay" value={eur(result.backLoseProfit)} />

          <div className="border-t border-white/10 pt-4 mt-4">
            <Row
              label="Profitto garantito"
              value={eur(result.guaranteedProfit)}
              strong
            />
            <Row
              label="ROI"
              value={`${result.roiPct.toFixed(2)}%`}
              strong
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${
        strong ? "text-white text-lg" : "text-slate-400"
      }`}
    >
      <span>{label}</span>
      <span className={strong ? "text-emerald-400 font-semibold" : "text-white"}>
        {value}
      </span>
    </div>
  );
}

function eur(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
