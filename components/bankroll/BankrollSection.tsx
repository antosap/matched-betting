"use client";

import { useEffect, useMemo, useState } from "react";

import type { Operation } from "@/lib/types/operation";
import { getOperations } from "@/lib/storage/operations";
import {
  getInitialBankroll,
  saveInitialBankroll,
} from "@/lib/storage/bankroll";

function eur(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default function BankrollSection() {
  const [initial, setInitial] = useState(0);
  const [input, setInput] = useState("");
  const [operations, setOperations] = useState<Operation[]>([]);

  useEffect(() => {
    const value = getInitialBankroll();

    setInitial(value);
    setInput(value ? String(value) : "");
    setOperations(getOperations());
  }, []);

  const stats = useMemo(() => {
    const realized = operations
      .filter((o) => o.status === "WON" || o.status === "CLOSED")
      .reduce((sum, o) => sum + o.estimatedProfit, 0);

    const openPotential = operations
      .filter((o) => o.status === "OPEN")
      .reduce((sum, o) => sum + o.estimatedProfit, 0);

    const bankroll = initial + realized;

    const roi =
      initial > 0
        ? (realized / initial) * 100
        : 0;

    return {
      realized,
      openPotential,
      bankroll,
      roi,
    };
  }, [initial, operations]);

  function handleSave() {
    const value = Number(input);

    if (!Number.isFinite(value) || value < 0) {
      return;
    }

    saveInitialBankroll(value);
    setInitial(value);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
        <h2 className="font-semibold">
          Configurazione Bankroll
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Imposta il capitale iniziale utilizzato per il matched betting.
        </p>

        <div className="flex gap-2 mt-5 max-w-sm">
          <input
            type="number"
            min="0"
            step="0.01"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="1000"
            className="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
          />

          <button
            onClick={handleSave}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15"
          >
            Salva
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
          <div className="text-xs text-slate-500">
            Bankroll attuale
          </div>
          <div className="text-2xl font-semibold mt-1">
            {eur(stats.bankroll)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
          <div className="text-xs text-slate-500">
            Profitto realizzato
          </div>
          <div className="text-2xl font-semibold mt-1 text-emerald-400">
            {eur(stats.realized)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
          <div className="text-xs text-slate-500">
            Profitto potenziale
          </div>
          <div className="text-2xl font-semibold mt-1">
            {eur(stats.openPotential)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
          <div className="text-xs text-slate-500">
            ROI complessivo
          </div>
          <div className="text-2xl font-semibold mt-1">
            {stats.roi.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
        <h2 className="font-semibold">
          Riepilogo
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-sm">
          <div>
            <div className="text-xs text-slate-500">
              Capitale iniziale
            </div>
            <div className="mt-1">
              {eur(initial)}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">
              Operazioni
            </div>
            <div className="mt-1">
              {operations.length}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">
              Aperte
            </div>
            <div className="mt-1">
              {operations.filter((o) => o.status === "OPEN").length}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">
              Profitto potenziale
            </div>
            <div className="mt-1">
              {eur(stats.openPotential)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
