"use client";

export interface PlanConfig {
  id: string;
  name: "Iniciante" | "Pro" | "Agência" | "Enterprise";
  priceMonthly: number;
  aiCreditsMonthly: number;
  clientSlotsLimit: number; // 0, 5, -1 (ilimitado)
  allowedFeatures: {
    dashboard: boolean;
    posts: boolean;
    contentGenerator: boolean;
    aiStrategy: boolean;
    contentCalendar: boolean;
    approvals: boolean;
    library: boolean;
    whatsappAutomations: boolean;
    upCreator: boolean;
    clientArea: boolean;
  };
}

export const INITIAL_PLANS: PlanConfig[] = [
  {
    id: "iniciante",
    name: "Iniciante",
    priceMonthly: 49,
    aiCreditsMonthly: 50,
    clientSlotsLimit: 0,
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
    aiCreditsMonthly: 500,
    clientSlotsLimit: 0,
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
    aiCreditsMonthly: 2000,
    clientSlotsLimit: 5,
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
    priceMonthly: 699,
    aiCreditsMonthly: -1, // Ilimitado
    clientSlotsLimit: -1, // Ilimitado
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
    return JSON.parse(raw);
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

export function getActiveUserPlan(): "Iniciante" | "Pro" | "Agência" | "Enterprise" {
  if (typeof window === "undefined") return "Pro";
  return (localStorage.getItem(STORAGE_KEY_ACTIVE_PLAN) as any) || "Pro";
}

export function setActiveUserPlan(planName: "Iniciante" | "Pro" | "Agência" | "Enterprise") {
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
