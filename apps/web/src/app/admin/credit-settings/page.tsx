"use client";

import React, { useState } from "react";
import {
  Zap,
  Search
} from "lucide-react";

interface CreditRateItem {
  id: string;
  actionName: string;
  category: "Geração de IA" | "Estratégia & Análise" | "API de Métricas / Redes Sociais" | "Imagem & Mídia";
  creditCost: number;
  description: string;
}

const DEFAULT_RATES: CreditRateItem[] = [
  {
    id: "rate_content_gen",
    actionName: "Geração de Ideia / Roteiro de Post",
    category: "Geração de IA",
    creditCost: 5,
    description: "Criação de gancho, roteiro e legenda para feed e Reels."
  },
  {
    id: "rate_ai_strategy",
    actionName: "Diagnóstico Semanal Estratégico",
    category: "Estratégia & Análise",
    creditCost: 10,
    description: "Consolidação de insights e oportunidades baseados em alcance e retenção."
  },
  {
    id: "rate_social_sync",
    actionName: "Sincronização de Métricas Oficiais",
    category: "API de Métricas / Redes Sociais",
    creditCost: 1,
    description: "Atualização de contadores de reputação, seguidores e publicações."
  },
  {
    id: "rate_whatsapp_alert",
    actionName: "Envio de Notificação WhatsApp",
    category: "Estratégia & Análise",
    creditCost: 2,
    description: "Disparo automático de alertas de postagem e resumos no WhatsApp."
  }
];

const STORAGE_KEY_RATES = "up_credit_rates_config";

export default function AdminCreditSettingsPage() {
  const [rates, setRates] = useState<CreditRateItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_RATES);
        if (raw) return JSON.parse(raw);
      } catch (err) {
        console.warn("Erro ao carregar taxas salvas:", err);
      }
    }
    return DEFAULT_RATES;
  });
  const [search, setSearch] = useState("");

  const filteredRates = rates.filter(
    (r) =>
      r.actionName.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateCost = (id: string, newCost: number) => {
    setRates((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, creditCost: newCost } : r));
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-upPink" />
            Tabela de Custos por Operação (Créditos)
          </h1>
          <p className="text-sm text-upGray mt-1">
            Defina o valor em créditos cobrado do usuário para cada tipo de ação de IA e chamada de API.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-upGray absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar operação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-upCard border border-upBorder rounded-xl text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition"
          />
        </div>
      </div>

      {/* KPI Info Card */}
      <div className="bg-upCard/60 border border-upBorder rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-upPink/20 text-upPink border border-upPink/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Regra de Consumo Transparente</h3>
            <p className="text-xs text-upGray mt-0.5">
              Cada requisição debitará automaticamente do saldo de créditos do plano ativo do usuário.
            </p>
          </div>
        </div>

        <div className="text-xs text-upGray font-semibold bg-upDark px-4 py-2 rounded-xl border border-upBorder">
          Custo médio por geração: <span className="text-upPink font-bold">2 a 5 créditos</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-upCard/60 border border-upBorder/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-upLightGray">
            <thead className="bg-upDark/90 border-b border-upBorder/60 text-upGray uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Ação / Funcionalidade</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4 text-center">Custo (Créditos)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-upBorder/40">
              {filteredRates.map((rate) => (
                <tr key={rate.id} className="hover:bg-upCard/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">
                    {rate.actionName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-upDark border border-upBorder text-upPink">
                      {rate.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-upGray max-w-xs truncate">
                    {rate.description}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={rate.creditCost}
                      onChange={(e) => handleUpdateCost(rate.id, parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1.5 bg-upDark border border-upBorder/80 rounded-lg text-center font-bold text-upPink text-xs focus:outline-none focus:border-upPink"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
