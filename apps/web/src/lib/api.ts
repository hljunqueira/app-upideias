import { createClient } from '@/lib/supabase/client';

// API client — conecta o frontend ao Supabase Auth e backend
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let detail = 'Erro na requisição';
    try {
      const data = await res.json();
      detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    } catch {
      /* ignore json parse error */
    }
    const err: any = new Error(detail);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// ------------------- AUTH -------------------

export async function apiRegister(name: string, email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, name },
    },
  });
  if (error) throw error;
  return data;
}

export async function apiLogin(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function apiLogout() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getMe() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error('Não autenticado');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    name: profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário UP',
    role: profile?.role || 'user',
    user_metadata: user.user_metadata,
  };
}

export async function loginWithGoogle() {
  const supabase = createClient();
  const redirectTo = `${window.location.origin}/auth/callback?next=/app/dashboard`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });
  if (error) throw error;
  return data;
}

export async function exchangeGoogleSession(sessionId: string) {
  // Função legado preservada para compatibilidade temporária
  return getMe();
}

export async function updateProfile(data: any) {
  return apiFetch('/profile', { method: 'PUT', body: JSON.stringify(data) });
}

// ------------------- INSTAGRAM / SOCIAL -------------------

export async function getInstagramAccounts() {
  return apiFetch('/instagram/accounts');
}

export async function getInstagramMetrics(accountId: string, periodDays = 30) {
  return apiFetch(`/instagram/metrics?account_id=${accountId}&days=${periodDays}`);
}

export async function getInstagramMedia(accountId: string) {
  return apiFetch(`/instagram/media?account_id=${accountId}`);
}

export async function syncInstagram(accountId: string) {
  return apiFetch('/instagram/sync', { method: 'POST', body: JSON.stringify({ account_id: accountId }) });
}

// ------------------- UP CREATOR -------------------

export async function getCourses() {
  return apiFetch('/creator/courses');
}

export async function getCourse(id: string) {
  return apiFetch(`/creator/courses/${id}`);
}

export async function getLessons(courseId: string) {
  return apiFetch(`/creator/courses/${courseId}/lessons`);
}

export async function markLessonComplete(lessonId: string) {
  return apiFetch('/creator/progress', { method: 'POST', body: JSON.stringify({ lesson_id: lessonId }) });
}

export async function updateWatchTime(lessonId: string, watchedSeconds: number) {
  return apiFetch('/creator/progress/watch-time', { method: 'PUT', body: JSON.stringify({ lesson_id: lessonId, watched_seconds: watchedSeconds }) });
}

// ------------------- CONTENT GENERATOR -------------------

export async function generateContent(prompt: string, platform: string, style: string) {
  return apiFetch('/ai/generate-content', { method: 'POST', body: JSON.stringify({ prompt, platform, style }) });
}

export async function generateStrategy(niche: string, goals: string[]) {
  return apiFetch('/ai/strategy', { method: 'POST', body: JSON.stringify({ niche, goals }) });
}

// ------------------- BILLING -------------------

export async function getPlans() {
  return apiFetch('/billing/plans');
}

export async function createCheckoutSession(planId: string, billingCycle: 'monthly' | 'annual') {
  return apiFetch('/billing/checkout', { method: 'POST', body: JSON.stringify({ plan_id: planId, billing_cycle: billingCycle }) });
}

export async function getSubscription() {
  return apiFetch('/billing/subscription');
}
