"use client";
import { useState } from "react";
import { BarChart3, Calculator, CircleDollarSign, LayoutDashboard, ListChecks, Settings, Wallet, Search, RefreshCw, ShieldCheck } from "lucide-react";
import MatchedBetCalculator from "@/components/calculator/MatchedBetCalculator";
import OpportunitiesSection from "@/components/opportunities/OpportunitiesSection";
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
export default function Dashboard() {
  const [section, setSection] = useState("Dashboard");

  

  return (
    <main className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-white/10 bg-[#0b0e14] p-5 hidden md:block">
        <div className="text-xl font-bold tracking-tight mb-8">Match<span className="text-emerald-400">Bet</span></div>
        <div className="text-[10px] uppercase tracking-[.2em] text-slate-500 mb-3">Personal</div>
        {[
          ["Dashboard", LayoutDashboard], ["Opportunità", Search], ["Calcolatore", Calculator],
          ["Operazioni", ListChecks], ["Bankroll", Wallet], ["Impostazioni", Settings]
        ].map(([label, Icon]: any) => (
          <button key={label} onClick={() => setSection(label)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 ${section===label?"bg-white/10 text-white":"text-slate-400 hover:bg-white/5 hover:text-white"}`}>
            <Icon size={17}/>{label}
          </button>
        ))}
        <div className="mt-8 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-slate-300">
          <ShieldCheck size={17} className="text-emerald-400 mb-2"/>
          Modalità simulazione<br/>
          <span className="text-slate-500">Nessuna puntata reale viene eseguita.</span>
        </div>
      </aside>

      <section className="flex-1 min-w-0">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-5 md:px-8">
          <div><div className="text-sm text-slate-400">Personal matched betting</div><div className="font-semibold">{section}</div></div>
          <button className="flex items-center gap-2 text-xs text-slate-400 border border-white/10 rounded-lg px-3 py-2"><RefreshCw size={14}/> Simulazione</button>
        </header>

        <div className="p-5 md:p-8 max-w-7xl mx-auto">
          {section === "Dashboard" && <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                ["Bankroll", eur(1000), Wallet],
                ["Profitto", eur(47.32), CircleDollarSign],
                ["ROI medio", "2,84%", BarChart3],
                ["Opportunità", "—", Search]
              ].map(([t,v,I]: any)=><div className="rounded-2xl border border-white/10 bg-white/[.03] p-5" key={t}><I size={18} className="text-slate-400 mb-4"/><div className="text-xs text-slate-500">{t}</div><div className="text-2xl font-semibold mt-1">{v}</div></div>)}
            </div>

            <OpportunitiesSection />
          </>}

          {section === "Calcolatore" && <MatchedBetCalculator />}
          {section !== "Dashboard" && section !== "Calcolatore" && <div className="rounded-2xl border border-white/10 bg-white/[.03] p-8"><h1 className="text-2xl font-semibold mb-2">{section}</h1><p className="text-slate-500">Sezione predisposta nell'MVP. La collegheremo ai dati persistenti e alle API nella fase successiva.</p></div>}
        </div>
      </section>
    </main>
  );
}

function Row({label,value,strong=false}:{label:string,value:string,strong?:boolean}) {
  return <div className={`flex justify-between ${strong?"text-white text-lg":"text-slate-400"}`}><span>{label}</span><span className={strong?"text-emerald-400 font-semibold":"text-white"}>{value}</span></div>
}
