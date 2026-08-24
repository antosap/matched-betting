"use client";

import { useState } from "react";
import {
  BarChart3,
  Calculator,
  CircleDollarSign,
  LayoutDashboard,
  ListChecks,
  Settings,
  Wallet,
  Search,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import MatchedBetCalculator from "@/components/calculator/MatchedBetCalculator";
import OpportunitiesSection from "@/components/opportunities/OpportunitiesSection";
import BankrollSection from "@/components/bankroll/BankrollSection";
import OperationsSection from "@/components/operations/OperationsSection";

export default function Dashboard() {
  const [section, setSection] =
    useState("Dashboard");

  return (
    <main className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-white/10 bg-[#0b0e14] p-5 hidden md:block">
        <div className="text-xl font-bold tracking-tight mb-8">
          Match<span className="text-emerald-400">Bet</span>
        </div>

        <div className="text-[10px] uppercase tracking-[.2em] text-slate-500 mb-3">
          Personal
        </div>

        {[
          ["Dashboard", LayoutDashboard],
          ["Opportunità", Search],
          ["Calcolatore", Calculator],
          ["Operazioni", ListChecks],
          ["Bankroll", Wallet],
          ["Impostazioni", Settings],
        ].map(([label, Icon]: any) => (
          <button
            key={label}
            onClick={() => setSection(label)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 ${
              section === label
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}

        <div className="mt-8 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-slate-300">
          <ShieldCheck
            size={17}
            className="text-emerald-400 mb-2"
          />
          Modalità analisi
          <br />
          <span className="text-slate-500">
            Nessuna puntata viene eseguita automaticamente.
          </span>
        </div>
      </aside>

      <section className="flex-1 min-w-0">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-5 md:px-8">
          <div>
            <div className="text-sm text-slate-400">
              Personal matched betting
            </div>
            <div className="font-semibold">
              {section}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw size={14} />
            API-ready
          </div>
        </header>

        <div className="p-5 md:p-8 max-w-7xl mx-auto">
          {section === "Dashboard" && (
            <DashboardHome
              onOpen={setSection}
            />
          )}

          {section === "Opportunità" && (
            <OpportunitiesSection />
          )}

          {section === "Calcolatore" && (
            <MatchedBetCalculator />
          )}

          {section === "Operazioni" && (
            <OperationsSection />
          )}

          {section === "Bankroll" && (
            <BankrollSection />
          )}

          {section === "Impostazioni" && (
            <SettingsSection />
          )}
        </div>
      </section>
    </main>
  );
}

function DashboardHome({
  onOpen,
}: {
  onOpen: (section: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Scanner e motore di matched betting pronti per
          un provider quote reale.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DashboardCard
          title="Bankroll"
          value="Locale"
          icon={Wallet}
        />
        <DashboardCard
          title="Profitto"
          value="Locale"
          icon={CircleDollarSign}
        />
        <DashboardCard
          title="ROI"
          value="Calcolato"
          icon={BarChart3}
        />
        <DashboardCard
          title="Quote"
          value="API"
          icon={Search}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
        <h2 className="font-semibold">
          Scanner quote
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          Nessuna quota, partita o bookmaker viene
          simulato. Quando configuri il provider API,
          lo scanner confronterà Back e Lay e calcolerà
          automaticamente le opportunità.
        </p>

        <button
          onClick={() => onOpen("Opportunità")}
          className="mt-5 rounded-lg bg-emerald-400/10 text-emerald-300 px-4 py-2 text-sm"
        >
          Apri scanner
        </button>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
      <Icon
        size={18}
        className="text-slate-400 mb-4"
      />
      <div className="text-xs text-slate-500">
        {title}
      </div>
      <div className="text-2xl font-semibold mt-1">
        {value}
      </div>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">
          Impostazioni
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configurazione del provider quote.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
        <h2 className="font-semibold">
          Variabili ambiente Vercel
        </h2>

        <div className="mt-4 space-y-3 text-sm">
          <Setting
            name="MATCHBET_QUOTES_API_URL"
            description="Endpoint server-side che restituisce le quote."
          />
          <Setting
            name="MATCHBET_QUOTES_API_KEY"
            description="Chiave API, se richiesta dal provider."
          />
          <Setting
            name="MATCHBET_QUOTES_API_AUTH_HEADER"
            description="Header autenticazione. Default: Authorization."
          />
          <Setting
            name="MATCHBET_QUOTES_PROVIDER_ID"
            description="Identificativo interno del provider."
          />
          <Setting
            name="MATCHBET_QUOTES_PROVIDER_NAME"
            description="Nome visualizzato nell'interfaccia."
          />
        </div>
      </div>

      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm text-slate-400">
        Il browser non riceve la API key. La chiamata
        al provider viene eseguita dal server Next.js.
      </div>
    </div>
  );
}

function Setting({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div>
      <code className="text-xs text-emerald-300">
        {name}
      </code>
      <p className="text-xs text-slate-600 mt-1">
        {description}
      </p>
    </div>
  );
}
