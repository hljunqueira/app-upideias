import { Plan, PlanLimits, PlanFeature } from '@up-analytics/types';

// Mock DB store for Configurable Plans
let plansDb: Plan[] = [
  {
    id: 'b30349b1-5911-4700-8438-e67c9c049ee6',
    slug: 'iniciante',
    name: 'Iniciante',
    description: 'Ideal para criadores e marcas iniciando no Instagram.',
    monthly_price_cents: 2900,
    annual_price_cents: 29000,
    trial_days: 7,
    is_featured: false,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2d8a56b2-6014-4112-9c12-70b55502c3bb',
    slug: 'pro',
    name: 'Pro',
    description: 'O plano completo para crescer com análise estratégica de IA e relatórios.',
    monthly_price_cents: 7900,
    annual_price_cents: 79000,
    trial_days: 7,
    is_featured: true,
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6e287ff1-789a-41ab-85b4-c38d47be442d',
    slug: 'agencia',
    name: 'Agência',
    description: 'Para agências e gestores que atendem múltiplos clientes e precisam de aprovação.',
    monthly_price_cents: 19900,
    annual_price_cents: 199000,
    trial_days: 7,
    is_featured: false,
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export async function getActivePlans(): Promise<Plan[]> {
  return plansDb.filter(p => p.is_active);
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  return plansDb.find(p => p.slug === slug) || null;
}

export async function getCurrentPlan(): Promise<Plan> {
  // Simulating active Pro plan for the creator
  return plansDb[1];
}

export async function getPlanFeatures(planId: string): Promise<PlanFeature[]> {
  // Simulated features based on the Pro or agency selections
  return [
    { id: '1', plan_id: planId, feature_key: 'dashboard_full', feature_name: 'Dashboard Completo', feature_description: '', is_enabled: true, limit_value: null, config: null, created_at: '', updated_at: '' },
    { id: '2', plan_id: planId, feature_key: 'instagram_metrics', feature_name: 'Métricas de Perfil', feature_description: '', is_enabled: true, limit_value: null, config: null, created_at: '', updated_at: '' },
    { id: '3', plan_id: planId, feature_key: 'post_metrics', feature_name: 'Métricas de Posts', feature_description: '', is_enabled: true, limit_value: null, config: null, created_at: '', updated_at: '' },
    { id: '4', plan_id: planId, feature_key: 'ai_insights', feature_name: 'Diagnósticos de IA', feature_description: '', is_enabled: true, limit_value: null, config: null, created_at: '', updated_at: '' },
    { id: '5', plan_id: planId, feature_key: 'content_generator', feature_name: 'Gerador IA', feature_description: '', is_enabled: true, limit_value: null, config: null, created_at: '', updated_at: '' },
    { id: '6', plan_id: planId, feature_key: 'content_calendar', feature_name: 'Calendário Editorial', feature_description: '', is_enabled: true, limit_value: null, config: null, created_at: '', updated_at: '' },
    { id: '7', plan_id: planId, feature_key: 'whatsapp_weekly_report', feature_name: 'WhatsApp Relatório', feature_description: '', is_enabled: true, limit_value: null, config: null, created_at: '', updated_at: '' },
    { id: '8', plan_id: planId, feature_key: 'up_creator_intermediate', feature_name: 'UP Creator Pro', feature_description: '', is_enabled: true, limit_value: null, config: null, created_at: '', updated_at: '' },
  ];
}

export async function hasFeature(featureKey: string): Promise<boolean> {
  const currentPlan = await getCurrentPlan();
  const features = await getPlanFeatures(currentPlan.id);
  return features.some(f => f.feature_key === featureKey && f.is_enabled);
}

export async function getFeatureLimit(featureKey: string): Promise<number | null> {
  const currentPlan = await getCurrentPlan();
  const features = await getPlanFeatures(currentPlan.id);
  const feat = features.find(f => f.feature_key === featureKey);
  return feat ? feat.limit_value : null;
}

export async function checkPlanLimit(limitKey: keyof PlanLimits): Promise<boolean> {
  // Simulating limit checking - true indicates within limits
  return true;
}

export async function canConnectInstagramAccount(): Promise<boolean> {
  return checkPlanLimit('max_instagram_accounts');
}

export async function canUseAi(): Promise<boolean> {
  return hasFeature('ai_insights') || hasFeature('content_generator');
}

export async function canAccessUpCreatorLesson(lessonFeatureKey: string): Promise<boolean> {
  return hasFeature(lessonFeatureKey);
}

export async function canUseWhatsappAutomation(): Promise<boolean> {
  return hasFeature('whatsapp_weekly_report') || hasFeature('whatsapp_alerts');
}

export async function canAccessClientArea(): Promise<boolean> {
  return hasFeature('client_area');
}

export async function canUseApprovals(): Promise<boolean> {
  return hasFeature('approvals_workflow');
}

let aiRequestsCount = 12;

export async function incrementAiUsage(): Promise<void> {
  aiRequestsCount += 1;
}

export async function getMonthlyAiUsage(): Promise<number> {
  return aiRequestsCount;
}

// Admin management operations
export async function createPlan(plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<Plan> {
  const newPlan: Plan = {
    ...plan,
    id: Math.random().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  plansDb.push(newPlan);
  return newPlan;
}

export async function updatePlan(id: string, data: Partial<Plan>): Promise<Plan> {
  plansDb = plansDb.map(p => p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p);
  return plansDb.find(p => p.id === id)!;
}

export async function deactivatePlan(id: string): Promise<void> {
  plansDb = plansDb.map(p => p.id === id ? { ...p, is_active: false, updated_at: new Date().toISOString() } : p);
}

export async function updatePlanFeatures(planId: string, features: Partial<PlanFeature>[]): Promise<void> {
  // Simulates features updates
}

export async function updatePlanLimits(planId: string, limits: Partial<PlanLimits>): Promise<void> {
  // Simulates limits updates
}
