"use client";

import { useState, useEffect } from "react";
import { Lock, Crown, ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";
import { 
  PlanConfig, 
  getActiveUserPlan, 
  getStoredPlans, 
  setActiveUserPlan 
} from "@/lib/plansStore";

interface PlanGateProps {
  featureKey: keyof PlanConfig["allowedFeatures"];
  featureTitle: string;
  children: React.ReactNode;
}

export function PlanGate({
  featureKey,
  featureTitle,
  children
}: PlanGateProps) {
  const [activePlan, setActivePlan] = useState<"Iniciante" | "Pro" | "Agência" | "Enterprise">("Pro");
  const [plans, setPlans] = useState<PlanConfig[]>([]);

  const loadData = () => {
    setActivePlan(getActiveUserPlan());
    setPlans(getStoredPlans());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("up_plans_updated", handleUpdate);
    return () => window.removeEventListener("up_plans_updated", handleUpdate);
  }, []);

  const currentPlanConfig = plans.find((p) => p.name === activePlan);
  const isAllowed = currentPlanConfig?.allowedFeatures[featureKey] ?? true;

  if (isAllowed) {
    return <>{children}</>;
  }

  // Se o recurso estiver bloqueado para o plano ativo
  return (
    <div className="bg-[#0b0b10] border border-upBorder/60 rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden max-w-4xl mx-auto my-6 animate-fadeIn text-upLightGray">
      
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-upPink/10 blur-[100px] pointer-events-none" />

      {/* Header Icon */}
      <div className="w-16 h-16 rounded-3xl bg-upPink/15 text-upPink border border-upPink/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,83,104,0.2)]">
        <Lock className="w-8 h-8" />
      </div>

      {/* Text Info */}
      <div className="max-w-md mx-auto space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-upPink bg-upPink/10 px-3 py-1 rounded-md border border-upPink/20">
          Recurso Bloqueado no Plano {activePlan}
        </span>
        <h2 className="text-2xl font-extrabold text-white">
          Acesse o recurso {featureTitle}
        </h2>
        <p className="text-xs text-upGray leading-relaxed">
          Esta funcionalidade exige um plano superior com mais poder de automação e recursos avançados para o seu negócio.
        </p>
      </div>

      {/* Plan Switcher de Teste Live */}
      <div className="p-4 bg-upDark/60 border border-upBorder/50 rounded-2xl max-w-md mx-auto space-y-3">
        <p className="text-[11px] font-bold text-white uppercase tracking-wider">
          Simular Outro Plano para Testar esta Tela:
        </p>
        <div className="flex items-center justify-center gap-2">
          {(["Iniciante", "Pro", "Agência", "Enterprise"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setActiveUserPlan(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activePlan === p
                  ? "bg-upPink text-white shadow-md"
                  : "bg-upDark text-upGray hover:text-white border border-upBorder/40"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <button
          onClick={() => setActiveUserPlan("Pro")}
          className="px-8 py-3.5 bg-upPink hover:bg-upPink/90 text-white rounded-2xl text-xs font-extrabold shadow-[0_0_25px_rgba(255,83,104,0.4)] transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          <Crown className="w-4 h-4" />
          <span>Fazer Upgrade para o Plano Pro</span>
        </button>
      </div>
    </div>
  );
}
