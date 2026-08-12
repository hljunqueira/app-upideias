// API client — conecta o frontend ao backend FastAPI
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
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
}

export async function apiLogin(email: string, password: string) {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function apiLogout() {
  return apiFetch('/auth/logout', { method: 'POST' });
}

export async function getMe() {
  return apiFetch('/auth/me');
}

export function loginWithGoogle() {
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const redirectUrl = window.location.origin + '/app/dashboard';
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
}

export async function exchangeGoogleSession(sessionId: string) {
  return apiFetch('/auth/session', { method: 'POST', headers: { 'X-Session-ID': sessionId } });
}

export async function updateProfile(data: any) {
  return apiFetch('/profile', { method: 'PUT', body: JSON.stringify(data) });
}

// ------------------- INSTAGRAM -------------------

export async function getInstagramAccounts() {
  return apiFetch('/instagram/accounts');
}

export async function getDashboardMetrics(accountId: string) {
  return apiFetch(`/instagram/accounts/${accountId}/metrics`);
}

export async function getInstagramPosts(accountId: string) {
  return apiFetch(`/instagram/accounts/${accountId}/posts`);
}

export async function mockSyncInstagramMetrics(accountId: string): Promise<boolean> {
  try {
    await apiFetch(`/instagram/accounts/${accountId}/sync`, { method: 'POST' });
    return true;
  } catch {
    return false;
  }
}

// ------------------- IA (GEMINI) -------------------

export async function generateAiInsight(accountId: string) {
  return apiFetch('/ai/insight', { method: 'POST', body: JSON.stringify({ account_id: accountId }) });
}

export async function generateContentIdeas(niche: string, objective: string, tone: string = 'Profissional') {
  return apiFetch('/ai/ideas', { method: 'POST', body: JSON.stringify({ niche, objective, tone, count: 3 }) });
}

export async function generateCaption(theme: string, tone: string) {
  const data = await apiFetch('/ai/caption', { method: 'POST', body: JSON.stringify({ theme, tone }) });
  return data.caption;
}

export async function getAiUsage() {
  return apiFetch('/ai/usage');
}

// ------------------- CONTEÚDO -------------------

export async function getContentIdeas() {
  return apiFetch('/content/ideas');
}

// ------------------- AUTOMAÇÕES (WHATSAPP SIMULADO) -------------------

export async function sendWhatsAppMessage(phone: string, text: string): Promise<boolean> {
  try {
    await apiFetch('/automations/whatsapp/send', { method: 'POST', body: JSON.stringify({ phone, message: text }) });
    return true;
  } catch {
    return false;
  }
}

export async function getWhatsAppMessages() {
  return apiFetch('/automations/messages');
}

// ------------------- PLANOS / BILLING -------------------

export async function getActivePlans() {
  return apiFetch('/plans');
}

export async function getSubscription() {
  return apiFetch('/billing/subscription');
}

// ------------------- HELPERS / FORMATTERS -------------------

export function formatCentsToReais(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
  return mapping[status.toLowerCase()] || status;
}
