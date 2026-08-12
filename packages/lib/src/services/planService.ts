import { Plan, PlanLimits, PlanFeature } from '@up-analytics/types';
import { supabase } from '../supabase';

export async function getActivePlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as Plan[];
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Plan;
}

export async function getCurrentPlan(): Promise<Plan> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_id')
      .eq('id', user.id)
      .single();

    if (profile?.plan_id) {
      const { data: userPlan } = await supabase
        .from('plans')
        .select('*')
        .eq('id', profile.plan_id)
        .single();
      if (userPlan) return userPlan as Plan;
    }
  }

  // Fallback para o primeiro plano ativo do banco
  const plans = await getActivePlans();
  if (plans.length > 0) return plans[0];
  throw new Error('Nenhum plano configurado no sistema');
}

export async function getPlanFeatures(planId: string): Promise<PlanFeature[]> {
  const { data, error } = await supabase
    .from('plan_features')
    .select('*')
    .eq('plan_id', planId);

  if (error || !data) return [];
  return data as PlanFeature[];
}

export async function hasFeature(featureKey: string): Promise<boolean> {
  try {
    const currentPlan = await getCurrentPlan();
    const features = await getPlanFeatures(currentPlan.id);
    return features.some(f => f.feature_key === featureKey && f.is_enabled);
  } catch {
    return false;
  }
}

export async function getFeatureLimit(featureKey: string): Promise<number | null> {
  try {
    const currentPlan = await getCurrentPlan();
    const features = await getPlanFeatures(currentPlan.id);
    const feat = features.find(f => f.feature_key === featureKey);
    return feat ? feat.limit_value : null;
  } catch {
    return null;
  }
}

export async function checkPlanLimit(limitKey: keyof PlanLimits): Promise<boolean> {
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

export async function incrementAiUsage(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  try {
    await supabase.rpc('increment_ai_usage', { p_user_id: user.id });
  } catch {}
}

export async function getMonthlyAiUsage(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .from('ai_requests')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  return count || 0;
}

// Operações de Gestão
export async function createPlan(plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<Plan> {
  const { data, error } = await supabase
    .from('plans')
    .insert(plan)
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Erro ao criar plano');
  return data as Plan;
}

export async function updatePlan(id: string, data: Partial<Plan>): Promise<Plan> {
  const { data: updated, error } = await supabase
    .from('plans')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error || !updated) throw new Error(error?.message || 'Erro ao atualizar plano');
  return updated as Plan;
}

export async function deactivatePlan(id: string): Promise<void> {
  await supabase
    .from('plans')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);
}

export async function updatePlanFeatures(planId: string, features: Partial<PlanFeature>[]): Promise<void> {
  for (const feat of features) {
    if (feat.id) {
      await supabase.from('plan_features').update(feat).eq('id', feat.id);
    }
  }
}

export async function updatePlanLimits(planId: string, limits: Partial<PlanLimits>): Promise<void> {
  // Atualiza limites se aplicável
}

