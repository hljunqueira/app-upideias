export * from './services/authService';
export * from './services/planService';
export * from './services/instagramService';
export * from './services/aiService';
export * from './services/automationService';
export * from './services/contentService';
export * from './services/upCreatorService';
export * from './supabase';

export function formatCentsToReais(cents: number): string {
  const value = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(timeString: string): string {
  return timeString.substring(0, 5);
}

export function getStatusLabel(status: string): string {
  const mapping: Record<string, string> = {
    draft: 'Rascunho',
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Reprovado',
    changes_requested: 'Alterações Solicitadas',
    published: 'Publicado',
    active: 'Ativo',
    inactive: 'Inativo',
    canceled: 'Cancelado',
    sent: 'Enviado',
    failed: 'Falhou',
  };
  return mapping[status?.toLowerCase() || ''] || status;
}

import { supabase } from './supabase';

// Aliases para compatibilidade de build da web
export async function apiRegister(name: string, email: string, pass: string) {
  const { data, error } = await supabase.auth.signUp({ email, password: pass, options: { data: { full_name: name, name } } });
  if (error) throw error;
  return data;
}

export async function apiLogin(email: string, pass: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if (error) throw error;
  return data;
}

export async function apiLogout() {
  await supabase.auth.signOut();
}

export async function getMe() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return {
    id: user.id,
    email: user.email,
    name: profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário UP',
    role: profile?.role || 'user',
  };
}

export function loginWithGoogle(redirectToPath: string = '/app/dashboard') {
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectToPath)}` : undefined;
  return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, queryParams: { prompt: 'select_account' } } });
}

export async function exchangeGoogleSession(id: string) {
  return getMe();
}
