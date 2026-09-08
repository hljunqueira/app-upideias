"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlanConfig } from "@up-analytics/types";

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
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [planName, setPlanName] = useState<string>("Iniciante");

  useEffect(() => {
    let isMounted = true;
    async function checkAccess() {
      try {
        const res = await fetch("/api/user/subscription", { cache: "no-store" });
        if (!res.ok) {
          if (isMounted) {
            setIsAllowed(false);
            setLoading(false);
          }
          return;
        }
        const data = await res.json();
        if (isMounted) {
          const plan = data?.plan;
          const allowed = plan?.allowedFeatures?.[featureKey] ?? false;
          setPlanName(plan?.name || "Iniciante");
          setIsAllowed(Boolean(allowed));
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setIsAllowed(false);
          setLoading(false);
        }
      }
    }

    checkAccess();
    return () => {
      isMounted = false;
    };
  }, [featureKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-xs text-white/40 tracking-wider">
        Verificando permissões do plano...
      </div>
    );
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  // Se o recurso estiver bloqueado: design limpo, sem ícones
  return (
    <div className="bg-[#0B0B0F] border border-white/10 rounded-2xl p-8 sm:p-12 text-center space-y-5 max-w-xl mx-auto my-8 text-upLightGray">
      <div className="space-y-2">
        <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-upPink bg-upPink/10 px-3 py-1 rounded border border-upPink/20">
          Plano {planName}
        </span>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Acesso Restrito: {featureTitle}
        </h2>
        <p className="text-xs text-white/60 leading-relaxed max-w-md mx-auto">
          Esta funcionalidade não está inclusa na sua assinatura atual. Faça upgrade do seu plano para liberar este módulo.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/pricing"
          className="inline-block px-6 py-3 bg-upPink hover:bg-upPink/90 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition"
        >
          Ver Planos e Fazer Upgrade
        </Link>
      </div>
    </div>
  );
}
