"use client";

type Props = {
  backOdds: number;
  layOdds: number;
  stake: number;
  commission: number;
  onBackOddsChange: (value: number) => void;
  onLayOddsChange: (value: number) => void;
  onStakeChange: (value: number) => void;
  onCommissionChange: (value: number) => void;
};

export default function CalculatorForm({
  backOdds,
  layOdds,
  stake,
  commission,
  onBackOddsChange,
  onLayOddsChange,
  onStakeChange,
  onCommissionChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5 space-y-4">
      <Field label="Quota Back" value={backOdds} onChange={onBackOddsChange} />
      <Field label="Quota Lay" value={layOdds} onChange={onLayOddsChange} />
      <Field label="Stake Back (€)" value={stake} onChange={onStakeChange} />
      <Field label="Commissione (%)" value={commission} onChange={onCommissionChange} />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm text-slate-400">
      {label}
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-white outline-none focus:border-emerald-400/50"
      />
    </label>
  );
}
