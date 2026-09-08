"use client";

import { PlanConfig } from "@up-analytics/types";
import { supabase } from "@up-analytics/lib";
export type { PlanConfig };

// Cache em memória para os planos reais carregados do banco de dados PostgreSQL
let cachedPlansInMemory: PlanConfig[] = [];

export function getStoredPlans(): PlanConfig[] {
  return cachedPlansInMemory;
}

export function savePlansConfig(plans: PlanConfig[]): PlanConfig[] {
  cachedPlansInMemory = plans;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("up_plans_updated"));
  }
  return plans;
}

export function getActiveUserPlan(): string {
  return "Iniciante";
}

// Mapeia registros reais das tabelas plans + plan_limits do PostgreSQL para PlanConfig
function mapDatabasePlan(p: any): PlanConfig {
  const limits = Array.isArray(p.plan_limits) ? p.plan_limits[0] : p.plan_limits;
  const slug = (p.slug || p.id || "").toLowerCase();

  const isEnterprise = slug === "enterprise" || p.monthly_price_cents === 0;
  const isPro = slug === "pro";
  const isPremium = slug === "premium";
  const isIniciante = slug === "iniciante";

  const accounts = limits?.max_instagram_accounts ?? (isIniciante ? 1 : isPremium ? 2 : isPro ? 5 : -1);
  const history = limits?.history_days ?? (isIniciante ? 30 : isPremium ? 60 : isPro ? 90 : -1);
  const clientSlots = limits?.max_clients ?? (isEnterprise ? -1 : isPro ? 1 : 0);

  // Benefícios oficiais limpos e estritos
  let featuresList: string[] = [];
  if (isIniciante) {
    featuresList = [
      "1 Conta de Instagram (1 usuário)",
      "Dashboard de Métricas em Tempo Real",
      "30 Dias de Histórico de performance",
      "Melhores Horários e Perfil de Audiência",
      "Exportação de Relatórios Oficiais (PDF e CSV)",
      "Suporte por e-mail"
    ];
  } else if (isPremium) {
    featuresList = [
      "2 Contas de Instagram (2 usuários)",
      "Dashboard de Métricas Avançado",
      "60 Dias de Histórico de performance",
      "Calendário Editorial & Planejamento de Posts",
      "Exportação de Relatórios Oficiais (PDF e CSV)",
      "Suporte prioritário por e-mail"
    ];
  } else if (isPro) {
    featuresList = [
      "5 Contas de Instagram (5 usuários)",
      "90 Dias de Histórico de performance",
      "Fluxo de Aprovação de Conteúdo com clientes",
      "Exportação de Relatórios Oficiais (PDF e CSV)",
      "Suporte prioritário acelerado"
    ];
  } else if (isEnterprise) {
    featuresList = [
      "Contas e Usuários Ilimitados",
      "Área do Cliente Exclusiva (multi-marcas)",
      "Histórico Completo Sem Limites",
      "Exportação de Relatórios Oficiais (PDF e CSV)",
      "Gerente de conta e SLA corporativo"
    ];
  } else {
    featuresList = [
      `${accounts === -1 ? "Contas ilimitadas" : `${accounts} Conta(s) de Instagram`}`,
      `${history === -1 ? "Histórico ilimitado" : `${history} Dias de Histórico`}`,
      "Dashboard de Métricas Oficial",
      "Exportação de Relatórios Oficiais (PDF e CSV)",
      "Suporte especializado"
    ];
  }

  return {
    id: p.slug || p.id,
    name: p.name,
    priceMonthly: p.monthly_price_cents ? p.monthly_price_cents / 100 : 0,
    priceAnnual: p.annual_price_cents ? p.annual_price_cents / 100 : 0,
    isCustomPrice: isEnterprise,
    description: p.description || "",
    featured: p.is_featured ?? isPro,
    clientSlotsLimit: clientSlots,
    instagramAccountsLimit: accounts,
    historyDaysLimit: history,
    featuresList,
    allowedFeatures: {
      dashboard: true,
      posts: true,
      contentGenerator: false,
      aiStrategy: false,
      contentCalendar: isPremium || isPro || isEnterprise,
      approvals: isPro || isEnterprise,
      library: isPremium || isPro || isEnterprise,
      upCreator: true,
      clientArea: isEnterprise || clientSlots > 0,
      exportReports: true
    }
  };
}

// Busca planos diretamente do PostgreSQL via API protegida ou fallback direto de leitura
export async function fetchPlansFromDb(): Promise<PlanConfig[]> {
  try {
    // 1. Tentar via API interna (que opera com adminClient e auto-sync garantido)
    const res = await fetch("/api/admin/plans", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.plans && Array.isArray(json.plans) && json.plans.length > 0) {
        const mapped = json.plans.map(mapDatabasePlan);
        savePlansConfig(mapped);
        return mapped;
      }
    }
  } catch {
    /* fallback para consulta direta via Supabase client */
  }

  try {
    const { data, error } = await supabase
      .from("plans")
      .select("*, plan_limits(*)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      const mapped = data.map(mapDatabasePlan);
      savePlansConfig(mapped);
      return mapped;
    }
  } catch (err) {
    console.error("Erro ao buscar planos do PostgreSQL:", err);
  }

  return cachedPlansInMemory;
}

// Salva um plano diretamente no PostgreSQL chamando a API do servidor
export async function savePlanToDb(plan: PlanConfig): Promise<PlanConfig[]> {
  try {
    const res = await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.plans && Array.isArray(json.plans)) {
        const mapped = json.plans.map(mapDatabasePlan);
        return savePlansConfig(mapped);
      }
    }
  } catch (err) {
    console.error("Erro ao salvar plano no PostgreSQL via API:", err);
  }

  // Recarrega os planos frescos do banco para sincronizar a UI
  return fetchPlansFromDb();
}

// Remove um plano do PostgreSQL chamando a API do servidor
export async function deletePlanFromDb(planId: string): Promise<PlanConfig[]> {
  try {
    const res = await fetch(`/api/admin/plans?slug=${encodeURIComponent(planId)}`, {
      method: "DELETE"
    });

    if (res.ok) {
      const json = await res.json();
      if (json.plans && Array.isArray(json.plans)) {
        const mapped = json.plans.map(mapDatabasePlan);
        return savePlansConfig(mapped);
      }
    }
  } catch (err) {
    console.error("Erro ao excluir plano no PostgreSQL via API:", err);
  }

  return fetchPlansFromDb();
}
