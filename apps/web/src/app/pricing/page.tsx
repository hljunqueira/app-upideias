"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlanConfig, getStoredPlans } from "@/lib/plansStore";

export default function Pricing() {
  const [plansList, setPlansList] = useState<PlanConfig[]>([]);

  useEffect(() => {
    setPlansList(getStoredPlans());
    const handleUpdate = () => setPlansList(getStoredPlans());
    window.addEventListener("up_plans_updated", handleUpdate);
    return () => window.removeEventListener("up_plans_updated", handleUpdate);
  }, []);

  return (
    <div className="bg-upBlack min-h-screen text-upLightGray py-20 px-6 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full flex-grow">
        <div className="text-center mb-16">
          <Link href="/" className="text-2xl font-extrabold text-upWhite">
            UP <span className="text-upPink">Analytics</span>
          </Link>
          <p className="text-xs text-upGray mt-1">by UpIdeias</p>
          <h1 className="text-3xl md:text-5xl font-bold text-upWhite mt-8">Nossos Planos</h1>
          <p className="text-sm text-upGray mt-2 max-w-lg mx-auto">
            Escolha a assinatura perfeita para você, sua marca ou sua agência de Social Media.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plansList.map((plan) => {
            const priceDisplay = typeof plan.priceMonthly === "number" ? `R$ ${plan.priceMonthly}` : plan.priceMonthly;
            const periodDisplay = plan.isCustomPrice ? "" : "/mês";
            const features = plan.featuresList && plan.featuresList.length > 0
              ? plan.featuresList
              : [
                  "Métricas essenciais",
                  "Acesso ao UP Creator",
                  "Suporte especializado"
                ];

            return (
              <div
                key={plan.id}
                className={`p-8 rounded-2xl bg-upCard border relative flex flex-col justify-between ${
                  plan.featured ? "border-upPink shadow-xl shadow-upPink/10" : "border-upBorder"
                }`}
              >
                {plan.featured && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-upPink text-[10px] uppercase font-bold text-upWhite tracking-wider">
                    Mais Popular
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-upWhite">{plan.name}</h3>
                  <p className="text-sm text-upGray mt-2">{plan.description || "Solução ideal para sua operação."}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-upWhite">{priceDisplay}</span>
                    <span className="text-sm text-upGray">{periodDisplay}</span>
                  </div>

                  <ul className="mt-8 flex flex-col gap-4">
                    {features.map((feature) => (
                      <li key={feature} className="text-sm text-upGray flex items-center gap-3">
                        <span className="text-upPink">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/register?plan=${plan.id}`}
                  className={`mt-10 w-full py-3.5 text-center rounded-xl font-bold text-sm transition-all ${
                    plan.featured
                      ? "bg-upPink hover:bg-upPinkDark text-upWhite hover:shadow-lg hover:shadow-upPink/20"
                      : "bg-upDark hover:bg-upBlack text-upWhite border border-upBorder"
                  }`}
                >
                  Começar Agora
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center mt-20 text-xs text-upGray">
        <Link href="/" className="hover:underline">Voltar para a Home</Link>
      </div>
    </div>
  );
}
