"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getDemoOpportunities } from "@/lib/providers/opportunityProvider";
import {
  getBookmakerName,
  getExchangeName,
} from "@/lib/data/bettingProviders";

function eur(n: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export default function OpportunitiesSection() {
  const [minRoi, setMinRoi] = useState(2);
  const [opportunities, setOpportunities] = useState<
    Awaited<ReturnType<typeof getDemoOpportunities>>
  >([]);

  useEffect(() => {
    getDemoOpportunities().then(setOpportunities);
  }, []);

  const filtered = opportunities.filter(
    (opportunity) => opportunity.roi >= minRoi
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.03] overflow-hidden">
      <div className="p-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
        <div>
          <h2 className="font-semibold">Opportunità</h2>
          <p className="text-xs text-slate-500 mt-1">
            Opportunità disponibili
          </p>
        </div>

        <label className="text-xs text-slate-400 flex items-center gap-2">
          ROI min
          <input
            type="number"
            step="0.1"
            value={minRoi}
            onChange={(e) => setMinRoi(Number(e.target.value))}
            className="w-20 bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-white"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Search className="mx-auto mb-3 text-slate-600" size={24} />
            <p className="text-sm text-slate-400">
              Nessuna opportunità disponibile
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500">
              <tr className="border-b border-white/10">
                <th className="text-left p-4">Evento</th>
                <th className="text-left p-4">Mercato</th>
                <th className="text-left p-4">Provider</th>
                <th className="text-right p-4">Back</th>
                <th className="text-right p-4">Lay</th>
                <th className="text-right p-4">ROI</th>
                <th className="text-right p-4">Profitto</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-white/5 hover:bg-white/[.02]"
                >
                  <td className="p-4 font-medium">{o.event}</td>
                  <td className="p-4 text-slate-400">{o.market}</td>

                  <td className="p-4 text-slate-400">
                    <div>{getBookmakerName(o.bookmakerId)}</div>
                    <div className="text-xs text-slate-500">
                      {getExchangeName(o.exchangeId)}
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    {o.backOdds.toFixed(2)}
                  </td>

                  <td className="p-4 text-right">
                    {o.layOdds.toFixed(2)}
                  </td>

                  <td className="p-4 text-right text-emerald-400">
                    {o.roi.toFixed(2)}%
                  </td>

                  <td className="p-4 text-right">
                    {eur(o.estimatedProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
