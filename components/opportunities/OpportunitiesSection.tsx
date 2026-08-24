"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { saveOperation } from "@/lib/storage/operations";
import type { Operation } from "@/lib/types/operation";
import type { MatchedOpportunity } from "@/lib/matchedBetting/oddsMatcher";
import type { QuoteDiagnostics } from "@/lib/matchedBetting/diagnostics";

type ApiResponse = {
  mode: "live";
  providerId: string;
  providerName: string;
  retrievedAt: string;
  quoteCount: number;
  diagnostics: QuoteDiagnostics;
  opportunities: MatchedOpportunity[];
};

const eur = (value: number) => new Intl.NumberFormat("it-IT", {
  style: "currency", currency: "EUR"
}).format(value);

function DiagnosticItem({label,value}:{label:string;value:string|number}) {
  return <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
    <div className="text-[11px] text-slate-500">{label}</div>
    <div className="text-sm font-medium text-slate-200 mt-1">{value}</div>
  </div>;
}

export default function OpportunitiesSection() {
  const [minRoi,setMinRoi]=useState(0);
  const [stake,setStake]=useState(100);
  const [data,setData]=useState<ApiResponse|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);

  const load=useCallback(async()=>{
    setLoading(true); setError(null);
    try {
      const response=await fetch(`/api/opportunities?stake=${encodeURIComponent(String(stake))}&minRoi=${encodeURIComponent(String(minRoi))}`,{cache:"no-store"});
      const payload=await response.json();
      if(!response.ok) throw new Error(payload?.error||"Provider quote non disponibile.");
      setData(payload as ApiResponse);
    } catch(err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Errore durante il caricamento delle quote.");
    } finally { setLoading(false); }
  },[stake,minRoi]);

  useEffect(()=>{void load()},[load]);

  function registerOperation(o:MatchedOpportunity) {
    const operation:Operation={
      id:`${o.id}-${Date.now()}`,createdAt:new Date().toISOString(),
      event:o.event,market:o.market,
      bookmakerId:o.bookmakerId,bookmakerName:o.bookmakerName,
      exchangeId:o.exchangeId,exchangeName:o.exchangeName,
      backStake:o.backStake,backOdds:o.backOdds,
      layStake:o.layStake,layOdds:o.layOdds,liability:o.liability,
      estimatedProfit:o.estimatedProfit,roi:o.roi,status:"OPEN"
    };
    saveOperation(operation);
  }

  const opportunities=data?.opportunities??[];
  const d=data?.diagnostics;

  return <div className="rounded-2xl border border-white/10 bg-white/[.03] overflow-hidden">
    <div className="p-5 border-b border-white/10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="font-semibold">Opportunità live</h2><p className="text-xs text-slate-500 mt-1">Quote provenienti esclusivamente dal provider configurato.</p></div>
        <button onClick={()=>void load()} disabled={loading} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs disabled:opacity-50">
          <RefreshCw size={14} className={loading?"animate-spin":""}/>Aggiorna
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 max-w-md mt-5">
        <label className="text-xs text-slate-400">Stake Back (€)<input type="number" min="0.01" step="0.01" value={stake} onChange={e=>setStake(Number(e.target.value))} className="mt-1 w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white"/></label>
        <label className="text-xs text-slate-400">ROI minimo (%)<input type="number" step="0.1" value={minRoi} onChange={e=>setMinRoi(Number(e.target.value))} className="mt-1 w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white"/></label>
      </div>
      {data&&<div className="text-xs text-slate-600 mt-4">{data.providerName} · {data.quoteCount} quote · {new Date(data.retrievedAt).toLocaleTimeString("it-IT")}</div>}
    </div>

    {d&&<details className="border-b border-white/10 group">
      <summary className="cursor-pointer list-none px-5 py-4 text-xs text-slate-400 flex justify-between">
        <span>Diagnostica feed e matching</span><span className="text-slate-600">↓</span>
      </summary>
      <div className="px-5 pb-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <DiagnosticItem label="Quote totali" value={d.totalQuotes}/>
          <DiagnosticItem label="BACK" value={d.backQuotes}/>
          <DiagnosticItem label="LAY" value={d.layQuotes}/>
          <DiagnosticItem label="Eventi" value={d.uniqueEvents}/>
          <DiagnosticItem label="Eventi BACK + LAY" value={d.eventsWithBackAndLay}/>
          <DiagnosticItem label="Coppie compatibili" value={d.compatiblePairs}/>
          <DiagnosticItem label="BACK > LAY" value={d.pairsWithBackBetterThanLay}/>
          <DiagnosticItem label="Opportunità" value={d.opportunitiesAfterRoiFilter}/>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><div className="text-xs text-slate-500 mb-2">Provider BACK</div>
            {d.backProviders.length===0?<div className="text-xs text-slate-600">Nessuno</div>:
            <div className="space-y-1">{d.backProviders.map(p=><div key={p.id} className="flex justify-between text-xs text-slate-400"><span>{p.name}</span><span>{p.count}</span></div>)}</div>}
          </div>
          <div><div className="text-xs text-slate-500 mb-2">Provider LAY</div>
            {d.layProviders.length===0?<div className="text-xs text-slate-600">Nessuno</div>:
            <div className="space-y-1">{d.layProviders.map(p=><div key={p.id} className="flex justify-between text-xs text-slate-400"><span>{p.name}</span><span>{p.count}</span></div>)}</div>}
          </div>
        </div>
      </div>
    </details>}

    {error?<div className="p-10 text-center"><p className="text-sm text-amber-300">{error}</p></div>:
    opportunities.length===0?<div className="p-10 text-center"><Search className="mx-auto mb-3 text-slate-600" size={24}/><p className="text-sm text-slate-400">{loading?"Caricamento quote…":"Nessuna opportunità disponibile"}</p><p className="text-xs text-slate-600 mt-2">Il sistema non genera dati simulati.</p></div>:
    <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-xs text-slate-500"><tr className="border-b border-white/10">
      <th className="text-left p-4">Evento</th><th className="text-left p-4">Bookmaker</th><th className="text-left p-4">Exchange</th><th className="text-right p-4">Back</th><th className="text-right p-4">Lay</th><th className="text-right p-4">Liability</th><th className="text-right p-4">Profitto</th><th className="text-right p-4">ROI</th><th className="text-center p-4">Azione</th>
    </tr></thead><tbody>{opportunities.map(o=><tr key={o.id} className="border-b border-white/5">
      <td className="p-4"><div className="font-medium">{o.event}</div><div className="text-xs text-slate-500">{o.market} · {o.selection}</div></td>
      <td className="p-4">{o.bookmakerName}</td><td className="p-4">{o.exchangeName}</td>
      <td className="p-4 text-right">{o.backOdds.toFixed(2)}</td><td className="p-4 text-right">{o.layOdds.toFixed(2)}</td>
      <td className="p-4 text-right">{eur(o.liability)}</td><td className="p-4 text-right text-emerald-400">{eur(o.estimatedProfit)}</td>
      <td className="p-4 text-right">{o.roi.toFixed(2)}%</td><td className="p-4 text-center"><button onClick={()=>registerOperation(o)} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15">Registra</button></td>
    </tr>)}</tbody></table></div>}
  </div>;
}
