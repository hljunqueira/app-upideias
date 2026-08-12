"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  DollarSign,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Building2
} from "lucide-react";

interface SubscriptionItem {
  id: string;
  subscriptionId: string; // ID da assinatura do gateway de pagamento
  customerName: string;
  customerEmail: string;
  planName: "Start" | "Pro" | "Agência";
  amount: string;
  cycle: "Mensal" | "Anual";
  paymentMethod: "Cartão de Crédito" | "PIX" | "Boleto";
  status: "Ativa" | "Inadimplente" | "Cancelada" | "Pendente";
  nextDueDate: string;
}

import { useEffect } from "react";
import { supabase } from "@up-analytics/lib";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  useEffect(() => {
    async function loadSubscriptions() {
      setLoading(true);
      try {
        const { data } = await supabase.from("subscriptions").select("*");
        if (data && data.length > 0) {
          const mapped: SubscriptionItem[] = data.map((s: any) => ({
            id: s.id,
            subscriptionId: s.id.substring(0, 12),
            customerName: s.customer_name || "Cliente UP",
            customerEmail: s.customer_email || "cliente@upideias.com",
            planName: s.plan_name || "Pro",
            amount: s.amount ? `R$ ${s.amount}` : "R$ 129,00",
            cycle: "Mensal",
            paymentMethod: "Cartão de Crédito",
            status: s.status === "active" ? "Ativa" : "Pendente",
            nextDueDate: s.next_due_date ? new Date(s.next_due_date).toLocaleDateString("pt-BR") : "A definir"
          }));
          setSubscriptions(mapped);
        } else {
          setSubscriptions([]);
        }
      } catch {
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    }
    loadSubscriptions();
  }, []);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    subscriptionId: string;
    customerName: string;
    customerEmail: string;
    planName: "Start" | "Pro" | "Agência";
    amount: string;
    cycle: "Mensal" | "Anual";
    paymentMethod: "Cartão de Crédito" | "PIX" | "Boleto";
    status: "Ativa" | "Inadimplente" | "Cancelada" | "Pendente";
    nextDueDate: string;
  }>({
    subscriptionId: "",
    customerName: "",
    customerEmail: "",
    planName: "Pro",
    amount: "R$ 197,00",
    cycle: "Mensal",
    paymentMethod: "Cartão de Crédito",
    status: "Ativa",
    nextDueDate: "",
  });

  const filteredSubscriptions = subscriptions.filter((s) => {
    const matchesSearch =
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      s.subscriptionId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "todos" || s.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingSub(null);
    setFormData({
      subscriptionId: `sub_pay_${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: "",
      customerEmail: "",
      planName: "Pro",
      amount: "R$ 197,00",
      cycle: "Mensal",
      paymentMethod: "Cartão de Crédito",
      status: "Ativa",
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR"),
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub: SubscriptionItem) => {
    setEditingSub(sub);
    setFormData({
      subscriptionId: sub.subscriptionId,
      customerName: sub.customerName,
      customerEmail: sub.customerEmail,
      planName: sub.planName,
      amount: sub.amount,
      cycle: sub.cycle,
      paymentMethod: sub.paymentMethod,
      status: sub.status,
      nextDueDate: sub.nextDueDate,
    });
    setIsModalOpen(true);
  };

  const handleDeleteSubscription = (id: string) => {
    if (confirm("Deseja cancelar/remover esta assinatura do Gateway de Pagamentos?")) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSyncGateway = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "Ativa", nextDueDate: "15/09/2026" } : s
      )
    );
  };

  const handleSaveSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSub) {
      // Update
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === editingSub.id
            ? { ...s, ...formData }
            : s
        )
      );
    } else {
      // Create
      const newSub: SubscriptionItem = {
        id: String(Date.now()),
        ...formData,
      };
      setSubscriptions((prev) => [newSub, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-upPink" />
            Gestão de Assinaturas & Cobranças
          </h1>
          <p className="text-sm text-upGray mt-1">
            Controle de assinaturas recorrentes integradas com o Gateway de Pagamentos oficial.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-upPink hover:bg-upPinkDark text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(255,83,104,0.3)] hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nova Assinatura
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Assinaturas Ativas</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {subscriptions.filter((s) => s.status === "Ativa").length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Inadimplentes / Atrasadas</p>
            <p className="text-2xl font-black text-rose-400 mt-1">
              {subscriptions.filter((s) => s.status === "Inadimplente").length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">MRR Recorrente Estimado</p>
            <p className="text-2xl font-black text-white mt-1">
              {loading
                ? "..."
                : `R$ ${subscriptions
                    .filter((s) => s.status === "Ativa")
                    .reduce((sum, s) => {
                      const num = parseFloat(s.amount.replace(/[^0-9,.-]/g, "").replace(",", "."));
                      return sum + (isNaN(num) ? 0 : num);
                    }, 0)
                    .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-upPink/10 text-upPink flex items-center justify-center border border-upPink/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-upCard/40 border border-upBorder/60 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-upPink absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, e-mail ou ID Gateway..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-upDark border border-upBorder/80 rounded-xl text-white placeholder-upGray text-xs focus:outline-none focus:border-upPink transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-upGray font-semibold shrink-0">Filtrar Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-upDark border border-upBorder/80 rounded-xl text-xs text-white focus:outline-none focus:border-upPink transition-all"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativa">Ativas</option>
            <option value="inadimplente">Inadimplentes</option>
            <option value="pendente">Pendentes</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-upCard/60 border border-upBorder/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-upLightGray">
            <thead className="bg-upDark/90 border-b border-upBorder/60 text-upGray uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">ID Gateway</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Plano & Valor</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Próximo Vencimento</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-upBorder/40">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-upGray">
                    Nenhuma assinatura encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-upCard/80 transition-colors group">
                    <td className="px-6 py-4 font-mono text-upPink font-semibold">
                      {sub.subscriptionId}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-upPink transition-colors">{sub.customerName}</span>
                        <span className="text-[11px] text-upGray">{sub.customerEmail}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{sub.planName} ({sub.cycle})</span>
                        <span className="text-[11px] text-upPink font-semibold">{sub.amount}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-upDark border border-upBorder/60 text-upLightGray">
                        {sub.paymentMethod}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        sub.status === "Ativa"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : sub.status === "Inadimplente"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : sub.status === "Pendente"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-upBorder/40 text-upGray"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          sub.status === "Ativa" ? "bg-emerald-400 animate-pulse" : sub.status === "Inadimplente" ? "bg-rose-400" : "bg-amber-400"
                        }`} />
                        {sub.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-upGray text-[11px]">
                      {sub.nextDueDate}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSyncGateway(sub.id)}
                          className="p-1.5 rounded-lg bg-upDark hover:bg-emerald-500/20 hover:text-emerald-400 border border-upBorder/60 transition-all"
                          title="Sincronizar com Gateway"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(sub)}
                          className="p-1.5 rounded-lg bg-upDark hover:bg-upPink/20 hover:text-upPink border border-upBorder/60 transition-all"
                          title="Editar Assinatura"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubscription(sub.id)}
                          className="p-1.5 rounded-lg bg-upDark hover:bg-rose-500/20 hover:text-rose-400 border border-upBorder/60 transition-all"
                          title="Cancelar Assinatura"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD Assinatura */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-upBlack/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-upDark border border-upBorder/80 rounded-2xl shadow-[0_0_50px_rgba(255,83,104,0.15)] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-upBorder/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-upPink" />
                {editingSub ? "Editar Assinatura" : "Criar Nova Assinatura no Gateway"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-upGray hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubscription} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-upGray">ID do Gateway (Automático)</label>
                <input
                  type="text"
                  required
                  value={formData.subscriptionId}
                  onChange={(e) => setFormData({ ...formData, subscriptionId: e.target.value })}
                  className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-upPink font-mono text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Nome do Cliente</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="email@cliente.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Plano</label>
                  <select
                    value={formData.planName}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      const price = val === "Start" ? "R$ 97,00" : val === "Pro" ? "R$ 197,00" : "R$ 497,00";
                      setFormData({ ...formData, planName: val, amount: price });
                    }}
                    className="px-3 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  >
                    <option value="Start">Start</option>
                    <option value="Pro">Pro</option>
                    <option value="Agência">Agência</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Ciclo</label>
                  <select
                    value={formData.cycle}
                    onChange={(e) => setFormData({ ...formData, cycle: e.target.value as any })}
                    className="px-3 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  >
                    <option value="Mensal">Mensal</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Valor</label>
                  <input
                    type="text"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="px-3 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Forma de Pagamento</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  >
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Status da Cobrança</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  >
                    <option value="Ativa">Ativa</option>
                    <option value="Inadimplente">Inadimplente</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-upGray">Próximo Vencimento</label>
                <input
                  type="text"
                  required
                  placeholder="DD/MM/AAAA"
                  value={formData.nextDueDate}
                  onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                  className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-upBorder/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-upBorder text-upGray hover:text-white text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-upPink hover:bg-upPinkDark text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(255,83,104,0.3)]"
                >
                  {editingSub ? "Salvar Alterações" : "Emitir no Gateway"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
