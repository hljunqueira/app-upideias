"use client";

import React, { useState } from "react";
import {
  Zap,
  Search,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface CreditRateItem {
  id: string;
  actionName: string;
  category: "Geração de IA" | "Estratégia & Análise" | "API Social (Phyllo/Meta)" | "Imagem & Mídia";
  creditCost: number;
  description: string;
}

const INITIAL_RATES: CreditRateItem[] = [
  { id: "rate_1", actionName: "Geração de Legenda / Post Simples", category: "Geração de IA", creditCost: 2, description: "Criação de texto com hashtagas otimizadas via Groq/Gemini" },
  { id: "rate_2", actionName: "Geração de Carrossel Completo (5-10 slides)", category: "Geração de IA", creditCost: 5, description: "Roteiro e texto de múltiplos slides para o carrossel" },
  { id: "rate_3", actionName: "Diagnóstico Semanal de Perfil", category: "Estratégia & Análise", creditCost: 10, description: "Análise estratégica com IA sobre público e engajamento" },
  { id: "rate_4", actionName: "Consulta de Métricas / Sync de Perfil", category: "API Social (Phyllo/Meta)", creditCost: 1, description: "Busca de alcance, impresões e contagem de seguidores" },
  { id: "rate_5", actionName: "Geração de Arte de Capa / Imagem por IA", category: "Imagem & Mídia", creditCost: 4, description: "Criação visual para posts ou Reels" },
];

export default function AdminCreditSettingsPage() {
  const [rates, setRates] = useState<CreditRateItem[]>(INITIAL_RATES);
  const [search, setSearch] = useState("");

  const filteredRates = rates.filter(
    (r) =>
      r.actionName.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateCost = (id: string, newCost: number) => {
    setRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, creditCost: newCost } : r))
    );
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
