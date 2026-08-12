"use client";

import { supabase } from "@up-analytics/lib";

export interface NotificationItem {
  id: string;
  scope: "admin" | "user";
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type?: "info" | "warning" | "success" | "alert";
  link?: string;
}

const STORAGE_KEY_ADMIN_NOTIFS = "up_admin_notifications_cache";
const STORAGE_KEY_USER_NOTIFS = "up_user_notifications_cache";

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Recente";
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
  } catch {
    return "Recente";
  }
}

/**
 * Busca notificacoes reais do banco de dados PostgreSQL / Supabase
 */
export async function fetchNotificationsFromDatabase(scope: "admin" | "user"): Promise<NotificationItem[]> {
  const items: NotificationItem[] = [];

  try {
    // 1. Buscar notificacoes diretas da tabela 'notifications'
    const { data: dbNotifs } = await supabase
      .from("notifications")
      .select("*")
      .eq("scope", scope)
      .order("created_at", { ascending: false })
      .limit(10);

    if (dbNotifs && dbNotifs.length > 0) {
      dbNotifs.forEach((n: any) => {
        items.push({
          id: n.id,
          scope: n.scope,
          title: n.title,
          description: n.description,
          time: formatRelativeTime(n.created_at),
          unread: n.unread ?? true,
          type: n.type || "info",
          link: n.link
        });
      });
    }

    // 2. Para escopo Admin: Gerar notificacoes em tempo real a partir de tabelas do banco
    if (scope === "admin") {
      // Novas Assinaturas do banco
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("id, plan_name, amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (subs && subs.length > 0) {
        subs.forEach((s: any) => {
          items.push({
            id: `sub_${s.id}`,
            scope: "admin",
            title: `Assinatura ${s.status === "active" ? "Ativa" : "Pendente"}`,
            description: `Plano ${s.plan_name || "Desconhecido"} (R$ ${s.amount || 0}) registrado.`,
            time: formatRelativeTime(s.created_at),
            unread: true,
            type: "success",
            link: "/admin/subscriptions"
          });
        });
      }

      // Logs de Sincronizacao do banco
      const { data: syncs } = await supabase
        .from("sync_logs")
        .select("id, status, message, finished_at, created_at")
        .order("finished_at", { ascending: false })
        .limit(3);

      if (syncs && syncs.length > 0) {
        syncs.forEach((sync: any) => {
          items.push({
            id: `sync_${sync.id}`,
            scope: "admin",
            title: sync.status === "success" ? "Sincronização Concluída" : "Falha na Sincronização",
            description: sync.message || "Processamento de métricas executado.",
            time: formatRelativeTime(sync.finished_at || sync.created_at),
            unread: sync.status !== "success",
            type: sync.status === "success" ? "info" : "warning",
            link: "/admin/sync-logs"
          });
        });
      }
    }

    // 3. Para escopo User: Gerar notificacoes dinamicas do banco
    if (scope === "user") {
      const { data: accounts } = await supabase
        .from("instagram_accounts")
        .select("id, username, status, connected_at")
        .eq("status", "connected");

      if (accounts && accounts.length > 0) {
        accounts.forEach((acc: any) => {
          items.push({
            id: `acc_${acc.id}`,
            scope: "user",
            title: "Conexão Social Ativa 🟢",
            description: `Conta @${acc.username || "Instagram"} sincronizada com sucesso.`,
            time: formatRelativeTime(acc.connected_at),
            unread: false,
            type: "success",
            link: "/app/settings"
          });
        });
      }
    }
  } catch (error) {
    console.error("Erro ao carregar notificações reais do Supabase:", error);
  }

  // Cache em localStorage para fallback instantaneo
  if (typeof window !== "undefined") {
    const key = scope === "admin" ? STORAGE_KEY_ADMIN_NOTIFS : STORAGE_KEY_USER_NOTIFS;
    localStorage.setItem(key, JSON.stringify(items));
  }

  return items;
}

/**
 * Retorna notificacoes salvas em cache ou executa busca assincrona
 */
export function getNotifications(scope: "admin" | "user"): NotificationItem[] {
  if (typeof window === "undefined") return [];
  const key = scope === "admin" ? STORAGE_KEY_ADMIN_NOTIFS : STORAGE_KEY_USER_NOTIFS;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Marca notificacoes como lidas no banco real e no cache
 */
export async function markAllNotificationsAsRead(scope: "admin" | "user"): Promise<NotificationItem[]> {
  try {
    await supabase
      .from("notifications")
      .update({ unread: false })
      .eq("scope", scope);
  } catch (err) {
    console.error("Erro ao marcar notificações como lidas no Supabase:", err);
  }

  const current = getNotifications(scope);
  const updated = current.map((item) => ({ ...item, unread: false }));

  if (typeof window !== "undefined") {
    const key = scope === "admin" ? STORAGE_KEY_ADMIN_NOTIFS : STORAGE_KEY_USER_NOTIFS;
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("up_notifications_updated", { detail: { scope } }));
  }

  return updated;
}

/**
 * Adiciona notificacao real no banco Supabase
 */
export async function addNotification(
  notification: Omit<NotificationItem, "id" | "time" | "unread">
): Promise<void> {
  try {
    await supabase.from("notifications").insert({
      scope: notification.scope,
      title: notification.title,
      description: notification.description,
      type: notification.type || "info",
      link: notification.link,
      unread: true
    });
  } catch (err) {
    console.error("Erro ao inserir notificação no Supabase:", err);
  }

  // Recarrega do banco e dispara evento
  await fetchNotificationsFromDatabase(notification.scope);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("up_notifications_updated", { detail: { scope: notification.scope } }));
  }
}
