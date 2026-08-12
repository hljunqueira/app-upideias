"use client";

import { PlanConfig } from "@up-analytics/types";
export type { PlanConfig };

export const INITIAL_PLANS: PlanConfig[] = [
  {
    id: "iniciante",
    name: "Iniciante",
    priceMonthly: 49,
    priceAnnual: 490,
    description: "Para criadores e pequenos negócios começando com estratégia.",
    featured: false,
    aiCreditsMonthly: 50,
    clientSlotsLimit: 0,
    featuresList: [
      "1 conta de Instagram · 1 usuário",
      "Gerador de conteúdos e roteiros estratégicos",
      "Métricas essenciais + 30 dias de histórico",
      "UP Creator: acesso à trilha Fundamentos",
      "Suporte por e-mail"
    ],
    allowedFeatures: {
      dashboard: true,
      posts: true,
      contentGenerator: true,
      aiStrategy: false,
      contentCalendar: false,
      approvals: false,
      library: false,
      whatsappAutomations: false,
      upCreator: true,
      clientArea: false
    }
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 129,
    priceAnnual: 1290,
    description: "Para quem vive de conteúdo e quer escalar de verdade.",
    featured: true,
    aiCreditsMonthly: 500,
    clientSlotsLimit: 0,
    featuresList: [
      "3 contas de Instagram · 3 usuários",
      "Gerador ilimitado + Diagnóstico estratégico",
      "Métricas avançadas + 90 dias de histórico",
      "Calendário editorial completo",
      "Relatórios semanais no WhatsApp",
      "UP Creator completo + certificados",
      "Suporte prioritário"
    ],
    allowedFeatures: {
      dashboard: true,
      posts: true,
      contentGenerator: true,
      aiStrategy: true,
      contentCalendar: true,
      approvals: true,
      library: true,
      whatsappAutomations: true,
      upCreator: true,
      clientArea: false
    }
  },
  {
    id: "agencia",
    name: "Agência",
    priceMonthly: 299,
    priceAnnual: 2990,
    description: "Para agências e gestores com múltiplos clientes.",
    featured: false,
    aiCreditsMonthly: 2000,
    clientSlotsLimit: 5,
    featuresList: [
      "10 contas de Instagram · 10 usuários",
      "Gerações de conteúdo ilimitadas",
      "Até 5 marcas com Área do Cliente exclusiva",
      "Fluxo de aprovação de conteúdo",
      "Relatórios PDF + alertas diários WhatsApp",
      "UP Creator completo para a equipe",
      "Onboarding guiado + suporte VIP"
    ],
    allowedFeatures: {
      dashboard: true,
      posts: true,
      contentGenerator: true,
      aiStrategy: true,
      contentCalendar: true,
      approvals: true,
      library: true,
      whatsappAutomations: true,
      upCreator: true,
      clientArea: true
    }
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: "Sob consulta",
    isCustomPrice: true,
    description: "Para grandes marcas e operações em alta escala.",
    featured: false,
    aiCreditsMonthly: -1,
    clientSlotsLimit: -1,
    featuresList: [
      "Contas de Instagram e usuários ILIMITADOS",
      "Créditos de IA totalmente ILIMITADOS",
      "Marcas e clientes ILIMITADOS",
      "Infraestrutura dedicada & SLA garantido",
      "Gerente de conta exclusivo 24/7",
      "Treinamentos ao vivo para a equipe",
      "Desenvolvimento de recursos sob medida"
    ],
    allowedFeatures: {
      dashboard: true,
      posts: true,
      contentGenerator: true,
      aiStrategy: true,
      contentCalendar: true,
      approvals: true,
      library: true,
      whatsappAutomations: true,
      upCreator: true,
      clientArea: true
    }
  }
];

const STORAGE_KEY_PLANS = "up_plans_config";
const STORAGE_KEY_ACTIVE_PLAN = "up_user_active_plan";
const STORAGE_KEY_CREDITS = "up_user_credits";

export function getStoredPlans(): PlanConfig[] {
  if (typeof window === "undefined") return INITIAL_PLANS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLANS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(INITIAL_PLANS));
      return INITIAL_PLANS;
    }
    const parsed: PlanConfig[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_PLANS;
    }
    return parsed;
  } catch {
    return INITIAL_PLANS;
  }
}

export function savePlansConfig(plans: PlanConfig[]): PlanConfig[] {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
    window.dispatchEvent(new CustomEvent("up_plans_updated"));
  }
  return plans;
}

export function getActiveUserPlan(): string {
  if (typeof window === "undefined") return "Pro";
  return localStorage.getItem(STORAGE_KEY_ACTIVE_PLAN) || "Pro";
}

export function setActiveUserPlan(planName: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_ACTIVE_PLAN, planName);
    window.dispatchEvent(new CustomEvent("up_plans_updated"));
  }
}

export function getUserCredits(): number {
  if (typeof window === "undefined") return 450;
  const raw = localStorage.getItem(STORAGE_KEY_CREDITS);
  if (raw !== null) return parseInt(raw, 10);
  return 450;
}

export function consumeCredits(amount: number = 10): number {
  const current = getUserCredits();
  const next = Math.max(0, current - amount);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CREDITS, next.toString());
    window.dispatchEvent(new CustomEvent("up_plans_updated"));
  }
  return next;
}
