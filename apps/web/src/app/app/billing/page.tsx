"use client";

import { CreditCard, ArrowUpRight, CheckCircle, Clock } from "lucide-react";

export default function BillingPage() {
  const currentPlan = {
    name: "Pro",
    price: "R$ 79",
    period: "mês",
    nextBilling: "2026-08-04",
    status: "active"
  };

  const invoices = [
    { id: "inv-001", date: "2026-07-04", amount: "R$ 79,00", status: "pago" },
    { id: "inv-002", date: "2026-06-04", amount: "R$ 79,00", status: "pago" }
  ];

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-upPink" />
          Faturamento & Assinatura
        </h1>
        <p className="text-sm text-upGray mt-1">Gerencie seu plano atual, histórico de cobranças e faturas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Plan Summary Card */}
        <div className="md:col-span-1 bg-upCard border border-upBorder rounded-2xl p-6 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-upPink bg-upPink/10 px-2.5 py-1 rounded-md w-fit">
              Plano Atual
            </span>
            <div>
              <h2 className="text-xl font-bold text-upWhite">{currentPlan.name}</h2>
              <div className="mt-2 flex items-baseline gap-0.5">
                <span className="text-2xl font-extrabold text-upWhite">{currentPlan.price}</span>
                <span className="text-xs text-upGray">/{currentPlan.period}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-green-400 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Assinatura ativa via Cartão
            </div>
          </div>

          <div className="border-t border-upBorder/40 pt-4 flex flex-col gap-1 text-xs text-upGray">
            <span>Próxima cobrança em:</span>
            <span className="font-bold text-upWhite">
              {new Date(currentPlan.nextBilling).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>

        {/* Invoice History */}
        <div className="md:col-span-2 bg-upCard border border-upBorder rounded-2xl p-6">
          <h3 className="text-sm font-bold text-upWhite uppercase tracking-wider mb-6">Histórico de Cobrança</h3>

          <div className="flex flex-col gap-4">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex justify-between items-center bg-upDark/50 p-4 rounded-xl border border-upBorder/40">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-upWhite">Fatura #{inv.id}</span>
                  <span className="text-[10px] text-upGray">
                    Pago em {new Date(inv.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-upWhite">{inv.amount}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 font-bold text-[10px] uppercase">
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
