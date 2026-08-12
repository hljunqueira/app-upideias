"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Zap,
  Building,
  Check,
  X,
  DollarSign,
  Lock,
  Sparkles,
  Sliders
} from "lucide-react";
import { PlanConfig, getStoredPlans, savePlansConfig } from "@/lib/plansStore";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);
  const [newBenefitText, setNewBenefitText] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadPlans = () => {
    setPlans(getStoredPlans());
  };

  useEffect(() => {
    loadPlans();
    const handleUpdate = () => loadPlans();
    window.addEventListener("up_plans_updated", handleUpdate);
    return () => window.removeEventListener("up_plans_updated", handleUpdate);
  }, []);

  const handleToggleFeature = (planId: string, featureKey: keyof PlanConfig["allowedFeatures"]) => {
    const updated = plans.map((plan) => {
      if (plan.id === planId) {
        return {
          ...plan,
          allowedFeatures: {
            ...plan.allowedFeatures,
            [featureKey]: !plan.allowedFeatures[featureKey]
          }
        };
      }
      return plan;
    });
    savePlansConfig(updated);
  };

  const handleAddBenefit = () => {
    if (!editingPlan || !newBenefitText.trim()) return;
    const currentList = editingPlan.featuresList || [];
    setEditingPlan({
      ...editingPlan,
      featuresList: [...currentList, newBenefitText.trim()]
    });
    setNewBenefitText("");
  };

  const handleRemoveBenefit = (indexToRemove: number) => {
    if (!editingPlan || !editingPlan.featuresList) return;
    setEditingPlan({
      ...editingPlan,
      featuresList: editingPlan.featuresList.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleUpdateBenefitItem = (indexToUpdate: number, newText: string) => {
    if (!editingPlan || !editingPlan.featuresList) return;
    const updatedList = [...editingPlan.featuresList];
    updatedList[indexToUpdate] = newText;
    setEditingPlan({
      ...editingPlan,
      featuresList: updatedList
    });
  };

  const handleSavePlanModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const updated = plans.map((p) => (p.id === editingPlan.id ? editingPlan : p));
    savePlansConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setEditingPlan(null);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn text-upLightGray">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
            <Shield className="w-8 h-8 text-upPink" />
            Configurador de Planos & Benefícios
          </h1>
          <p className="text-sm text-upGray mt-1">
            Defina preços, cotas de créditos IA, lista de benefícios e vincule quais páginas e recursos cada plano pode acessar.
          </p>
        </div>
      </div>

      {/* Grid dos Planos com Toggles Dinâmicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-[#0e0e14] border rounded-3xl p-6 flex flex-col justify-between gap-6 shadow-xl relative transition-all ${
              plan.featured || plan.name === "Pro"
                ? "border-upPink/60 shadow-[0_0_30px_rgba(255,83,104,0.15)]"
                : "border-upBorder/60"
            }`}
          >
            {(plan.featured || plan.name === "Pro") && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-upPink text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                Mais Vendido
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                <p className="text-2xl font-black text-upPink mt-1">
                  {typeof plan.priceMonthly === "number" ? `R$ ${plan.priceMonthly}` : plan.priceMonthly}
                  {!plan.isCustomPrice && <span className="text-xs text-upGray font-medium"> /mês</span>}
                </p>
              </div>

              {/* Badges de Créditos & Clientes */}
              <div className="space-y-2 pt-2 border-t border-upBorder/40">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-upGray font-medium">Créditos IA:</span>
                  <span className="font-extrabold text-amber-400">
                    {plan.aiCreditsMonthly === -1 ? "♾️ Ilimitados" : `${plan.aiCreditsMonthly} /mês`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-upGray font-medium">Slots de Clientes:</span>
                  <span className="font-extrabold text-white">
                    {plan.clientSlotsLimit === -1 ? "♾️ Ilimitados" : plan.clientSlotsLimit === 0 ? "🔒 Nenhum" : `${plan.clientSlotsLimit} Marcas`}
                  </span>
                </div>
              </div>

              {/* Toggles de Páginas Liberadas */}
              <div className="space-y-2.5 pt-3 border-t border-upBorder/40">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-upPink block">
                  Permissões de Telas
                </span>

                {[
                  { key: "aiStrategy", label: "Estratégias IA" },
                  { key: "contentCalendar", label: "Calendário Editorial" },
                  { key: "approvals", label: "Aprovações Pendentes" },
                  { key: "library", label: "Biblioteca de Assets" },
                  { key: "whatsappAutomations", label: "WhatsApp Notificações" },
                  { key: "clientArea", label: "Gestão de Clientes" }
                ].map((item) => {
                  const isEnabled = plan.allowedFeatures[item.key as keyof PlanConfig["allowedFeatures"]];
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleFeature(plan.id, item.key as any)}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-upDark/50 border border-upBorder/30 cursor-pointer hover:border-upPink/40 transition select-none"
                    >
                      <span className="text-upLightGray font-medium">{item.label}</span>
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                          isEnabled ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                        }`}
                      >
                        {isEnabled ? "✓" : "✕"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Editar Plano */}
            <button
              onClick={() => setEditingPlan(plan)}
              className="w-full py-2.5 bg-upDark hover:bg-upPink/20 text-upWhite hover:text-upPink border border-upBorder/80 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar Valores, Benefícios & Créditos</span>
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Edição de Créditos, Benefícios e Valores */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0b0f] border border-upBorder/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative text-upLightGray max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60 shrink-0">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-upPink" />
                <h3 className="text-sm font-bold text-white">Editar Plano: {editingPlan.name}</h3>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="p-1.5 text-upGray hover:text-white bg-white/5 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlanModal} className="p-6 space-y-4 overflow-y-auto flex-grow">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                    Preço Mensal (R$)
                  </label>
                  <input
                    type="text"
                    value={editingPlan.priceMonthly}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = parseFloat(val);
                      setEditingPlan({
                        ...editingPlan,
                        priceMonthly: isNaN(num) ? val : num
                      });
                    }}
                    className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                    Destaque (Mais Vendido)
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingPlan({ ...editingPlan, featured: !editingPlan.featured })}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold border transition ${
                      editingPlan.featured
                        ? "bg-upPink/20 border-upPink text-upPink"
                        : "bg-upDark border-upBorder/80 text-upGray"
                    }`}
                  >
                    {editingPlan.featured ? "⭐ Em Destaque" : "Normal"}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Créditos IA por Mês (-1 para Ilimitado)
                </label>
                <input
                  type="number"
                  value={editingPlan.aiCreditsMonthly}
                  onChange={(e) => setEditingPlan({ ...editingPlan, aiCreditsMonthly: parseInt(e.target.value, 10) })}
                  className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Limite de Slots de Clientes (-1 para Ilimitado, 0 para bloquear)
                </label>
                <input
                  type="number"
                  value={editingPlan.clientSlotsLimit}
                  onChange={(e) => setEditingPlan({ ...editingPlan, clientSlotsLimit: parseInt(e.target.value, 10) })}
                  className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition font-mono"
                />
              </div>

              {/* Editor Dinâmico de Benefícios Textuais */}
              <div className="pt-3 border-t border-upBorder/40 space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-upPink block">
                  Benefícios Textuais (Exibidos na Landing Page & Checkout)
                </label>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(editingPlan.featuresList || []).map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleUpdateBenefitItem(idx, e.target.value)}
                        className="flex-grow bg-upDark border border-upBorder/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(idx)}
                        className="p-1.5 text-upGray hover:text-rose-400 bg-rose-500/10 rounded-lg border border-rose-500/20 transition shrink-0"
                        title="Remover Benefício"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Adicionar novo benefício (ex: 3 contas de Instagram)..."
                    value={newBenefitText}
                    onChange={(e) => setNewBenefitText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBenefit();
                      }
                    }}
                    className="flex-grow bg-upDark border border-upBorder/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="px-3.5 py-2 bg-upPink hover:bg-upPink/90 text-white rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-upBorder/40">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2.5 bg-upDark border border-upBorder/60 text-upGray hover:text-white rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-upPink hover:bg-upPink/90 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
