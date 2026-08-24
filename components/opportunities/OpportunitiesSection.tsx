"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { saveOperation } from "@/lib/storage/operations";
import type { Operation } from "@/lib/types/operation";
import type { MatchedOpportunity } from "@/lib/matchedBetting/oddsMatcher";

type ApiResponse = {
  mode: "live";
  providerId: string;
  providerName: string;
  retrievedAt: string;
  quoteCount: number;
  opportunities: MatchedOpportunity[];
};

const eur = (value: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);

export default function OpportunitiesSection() {
  const [minRoi, setMinRoi] = useState(0);
  const [stake, setStake] = useState(100);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/opportunities?stake=${encodeURIComponent(
          String(stake)
        )}&minRoi=${encodeURIComponent(String(minRoi))}`,
        { cache: "no-store" }
      );

      const payload = await response.json();

      if (!response.ok) {
        if (payload?.code === "QUOTE_PROVIDER_NOT_CONFIGURED") {
          throw new Error(
            "API quote non configurata. Imposta MATCHBET_QUOTES_API_URL su Vercel."
          );
        }

        throw new Error(
          payload?.error || "Provider quote non disponibile."
        );
      }

      setData(payload as ApiResponse);
    } catch (err) {
      setData(null);
      setError(
        err instanceof Error
          ? err.message
          : "Errore durante il caricamento delle quote."
      );
    } finally {
      setLoading(false);
    }
  }, [stake, minRoi]);

  useEffect(() => {
    void load();
  }, [load]);

  function registerOperation(
    opportunity: MatchedOpportunity
  ) {
    const operation: Operation = {
      id: `${opportunity.id}-${Date.now()}`,
      createdAt: new Date().toISOString(),

      event: opportunity.event,
      market: opportunity.market,

      bookmakerId: opportunity.bookmakerId,
      bookmakerName: opportunity.bookmakerName,

      exchangeId: opportunity.exchangeId,
      exchangeName: opportunity.exchangeName,

      backStake: opportunity.backStake,
      backOdds: opportunity.backOdds,

      layStake: opportunity.layStake,
      layOdds: opportunity.layOdds,
      liability: opportunity.liability,

      estimatedProfit: opportunity.estimatedProfit,
      roi: opportunity.roi,

      status: "OPEN",
    };

    saveOperation(operation);
  }

  const opportunities = data?.opportunities ?? [];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.03] overflow-hidden">
      <div className="p-5 border-b border-white/10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-semibold">
              Opportunità live
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Quote provenienti esclusivamente dal provider configurato.
            </p>
          </div>

          <button
            onClick={() => void load()}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Aggiorna
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 max-w-md mt-5">
          <label className="text-xs text-slate-400">
            Stake Back (€)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={stake}
              onChange={(event) =>
                setStake(Number(event.target.value))
              }
              className="mt-1 w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </label>

          <label className="text-xs text-slate-400">
            ROI minimo (%)
            <input
              type="number"
              step="0.1"
              value={minRoi}
              onChange={(event) =>
                setMinRoi(Number(event.target.value))
              }
              className="mt-1 w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </label>
        </div>

        {data && (
          <div className="text-xs text-slate-600 mt-4">
            {data.providerName} · {data.quoteCount} quote ·{" "}
            {new Date(data.retrievedAt).toLocaleTimeString("it-IT")}
          </div>
        )}
      </div>

      {error ? (
        <div className="p-10 text-center">
          <p className="text-sm text-amber-300">
            {error}
          </p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="p-10 text-center">
          <Search
            className="mx-auto mb-3 text-slate-600"
            size={24}
          />
          <p className="text-sm text-slate-400">
            {loading
              ? "Caricamento quote…"
              : "Nessuna opportunità disponibile"}
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Il sistema non genera dati simulati.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500">
              <tr className="border-b border-white/10">
                <th className="text-left p-4">Evento</th>
                <th className="text-left p-4">Bookmaker</th>
                <th className="text-left p-4">Exchange</th>
                <th className="text-right p-4">Back</th>
                <th className="text-right p-4">Lay</th>
                <th className="text-right p-4">Liability</th>
                <th className="text-right p-4">Profitto</th>
                <th className="text-right p-4">ROI</th>
                <th className="text-center p-4">Azione</th>
              </tr>
            </thead>

            <tbody>
              {opportunities.map((opportunity) => (
                <tr
                  key={opportunity.id}
                  className="border-b border-white/5"
                >
                  <td className="p-4">
                    <div className="font-medium">
                      {opportunity.event}
                    </div>
                    <div className="text-xs text-slate-500">
                      {opportunity.market} ·{" "}
                      {opportunity.selection}
                    </div>
                  </td>

                  <td className="p-4">
                    {opportunity.bookmakerName}
                  </td>

                  <td className="p-4">
                    {opportunity.exchangeName}
                  </td>

                  <td className="p-4 text-right">
                    {opportunity.backOdds.toFixed(2)}
                  </td>

                  <td className="p-4 text-right">
                    {opportunity.layOdds.toFixed(2)}
                  </td>

                  <td className="p-4 text-right">
                    {eur(opportunity.liability)}
                  </td>

                  <td className="p-4 text-right text-emerald-400">
                    {eur(opportunity.estimatedProfit)}
                  </td>

                  <td className="p-4 text-right">
                    {opportunity.roi.toFixed(2)}%
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() =>
                        registerOperation(opportunity)
                      }
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15"
                    >
                      Registra
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
