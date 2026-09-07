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

import { supabase } from "@up-analytics/lib";

export async function fetchPlansFromDb(): Promise<PlanConfig[]> {
  try {
    const { data, error } = await supabase
      .from("plans")
      .select("*, plan_limits(*)")
      .eq("is_active", true)
      .order("monthly_price_cents", { ascending: true });

    if (!error && data && data.length > 0) {
      const mapped: PlanConfig[] = data.map((p: any) => {
        const limits = Array.isArray(p.plan_limits) ? p.plan_limits[0] : p.plan_limits;
        const initialMatch = INITIAL_PLANS.find(
          (ip) => ip.id.toLowerCase() === (p.slug || "").toLowerCase()
        );

        return {
          id: p.slug || p.id,
          name: p.name,
          priceMonthly: p.monthly_price_cents ? p.monthly_price_cents / 100 : (initialMatch?.priceMonthly || 0),
          priceAnnual: p.annual_price_cents ? p.annual_price_cents / 100 : (initialMatch?.priceAnnual || 0),
          isCustomPrice: p.monthly_price_cents === 0,
          description: p.description || initialMatch?.description || "",
          featured: p.is_featured ?? initialMatch?.featured ?? false,
          aiCreditsMonthly: limits?.max_ai_requests_month ?? initialMatch?.aiCreditsMonthly ?? 100,
          clientSlotsLimit: limits?.max_clients ?? initialMatch?.clientSlotsLimit ?? 0,
          featuresList: initialMatch?.featuresList || [
            "Acesso à plataforma UP Analytics",
            "Métricas essenciais",
            "Suporte técnico"
          ],
          allowedFeatures: initialMatch?.allowedFeatures || {
            dashboard: true,
            posts: true,
            contentGenerator: true,
            aiStrategy: true,
            contentCalendar: true,
            approvals: true,
            library: true,
            whatsappAutomations: true,
            upCreator: true,
            clientArea: (limits?.max_clients ?? 0) > 0
          }
        };
      });

      savePlansConfig(mapped);
      return mapped;
    }

    // Se a tabela plans estiver vazia no banco, semear com os planos estruturados
    if (!error && (!data || data.length === 0)) {
      for (const p of INITIAL_PLANS) {
        await savePlanToDb(p);
      }
    }

    return getStoredPlans();
  } catch (err) {
    console.error("Erro ao buscar planos do banco:", err);
    return getStoredPlans();
  }
}

export async function savePlanToDb(plan: PlanConfig): Promise<PlanConfig[]> {
  try {
    const slug = plan.id.toLowerCase().replace(/\s+/g, "_");
    const { data: existing } = await supabase
      .from("plans")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    const planPayload = {
      slug,
      name: plan.name,
      description: plan.description,
      monthly_price_cents: typeof plan.priceMonthly === "number" ? Math.round(plan.priceMonthly * 100) : 0,
      annual_price_cents: typeof plan.priceAnnual === "number" ? Math.round(plan.priceAnnual * 100) : 0,
      is_featured: plan.featured,
      is_active: true
    };

    let planDbId = existing?.id;

    if (existing) {
      await supabase.from("plans").update(planPayload).eq("id", existing.id);
    } else {
      const { data: inserted } = await supabase
        .from("plans")
        .insert(planPayload)
        .select("id")
        .single();
      if (inserted) planDbId = inserted.id;
    }

    if (planDbId) {
      await supabase.from("plan_limits").upsert({
        plan_id: planDbId,
        max_clients: plan.clientSlotsLimit,
        max_ai_requests_month: plan.aiCreditsMonthly
      });
    }
  } catch (e) {
    console.error("Erro ao salvar plano no Supabase:", e);
  }

  const current = getStoredPlans();
  const idx = current.findIndex(p => p.id === plan.id);
  const updated = idx >= 0 ? current.map((p, i) => i === idx ? plan : p) : [...current, plan];
  return savePlansConfig(updated);
}

export async function deletePlanFromDb(planId: string): Promise<PlanConfig[]> {
  try {
    const slug = planId.toLowerCase().replace(/\s+/g, "_");
    await supabase.from("plans").delete().eq("slug", slug);
  } catch (e) {
    console.error("Erro ao deletar plano no Supabase:", e);
  }
  const current = getStoredPlans();
  const updated = current.filter(p => p.id !== planId);
  return savePlansConfig(updated);
}


