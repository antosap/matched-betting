"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import type { Operation } from "@/lib/types/operation";
import {
  deleteOperation,
  getOperations,
} from "@/lib/storage/operations";

const eur = (value: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);

function statusLabel(status: Operation["status"]) {
  switch (status) {
    case "OPEN":
      return "Aperta";
    case "WON":
      return "Vinta";
    case "LOST":
      return "Persa";
    case "CLOSED":
      return "Chiusa";
  }
}

export default function OperationsSection() {
  const [operations, setOperations] =
    useState<Operation[]>([]);

  useEffect(() => {
    setOperations(getOperations());
  }, []);

  function handleDelete(id: string) {
    deleteOperation(id);
    setOperations(getOperations());
  }

  const totalProfit = operations.reduce(
    (sum, operation) =>
      sum + operation.estimatedProfit,
    0
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card
          label="Operazioni"
          value={String(operations.length)}
        />
        <Card
          label="Operazioni aperte"
          value={String(
            operations.filter(
              (operation) =>
                operation.status === "OPEN"
            ).length
          )}
        />
        <Card
          label="Profitto stimato"
          value={eur(totalProfit)}
          highlight
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[.03] overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="font-semibold">
            Operazioni
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registro locale delle operazioni.
          </p>
        </div>

        {operations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-400">
              Nessuna operazione registrata
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500">
                <tr className="border-b border-white/10">
                  <th className="text-left p-4">Evento</th>
                  <th className="text-left p-4">Provider</th>
                  <th className="text-right p-4">Back</th>
                  <th className="text-right p-4">Lay</th>
                  <th className="text-right p-4">Liability</th>
                  <th className="text-right p-4">Profitto</th>
                  <th className="text-right p-4">ROI</th>
                  <th className="text-center p-4">Stato</th>
                  <th className="p-4" />
                </tr>
              </thead>

              <tbody>
                {operations.map((operation) => (
                  <tr
                    key={operation.id}
                    className="border-b border-white/5"
                  >
                    <td className="p-4">
                      <div className="font-medium">
                        {operation.event}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {operation.market}
                      </div>
                    </td>

                    <td className="p-4 text-slate-400">
                      <div>
                        {operation.bookmakerName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {operation.exchangeName}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      {eur(operation.backStake)}
                      <div className="text-xs text-slate-500">
                        @ {operation.backOdds.toFixed(2)}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      {eur(operation.layStake)}
                      <div className="text-xs text-slate-500">
                        @ {operation.layOdds.toFixed(2)}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      {eur(operation.liability)}
                    </td>

                    <td className="p-4 text-right text-emerald-400">
                      {eur(operation.estimatedProfit)}
                    </td>

                    <td className="p-4 text-right">
                      {operation.roi.toFixed(2)}%
                    </td>

                    <td className="p-4 text-center">
                      <span className="inline-flex rounded-full bg-white/5 px-2.5 py-1 text-xs">
                        {statusLabel(operation.status)}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() =>
                          handleDelete(operation.id)
                        }
                        className="text-slate-500 hover:text-red-400"
                        title="Elimina"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
      <div className="text-xs text-slate-500">
        {label}
      </div>
      <div
        className={`text-2xl font-semibold mt-1 ${
          highlight ? "text-emerald-400" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
