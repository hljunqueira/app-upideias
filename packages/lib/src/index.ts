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

// Aliases para compatibilidade de build da web
export async function apiRegister(name: string, email: string, pass: string) { return { id: "1", name, email }; }
export async function apiLogin(email: string, pass: string) { return { id: "1", email, role: "user" }; }
export async function apiLogout() {}
export async function getMe() { return { id: "1", name: "Usuário UP", email: "user@upideias.com", role: "user" }; }
export function loginWithGoogle() {}
export async function exchangeGoogleSession(id: string) { return { id: "1", name: "Usuário UP", email: "user@upideias.com", role: "user" }; }
