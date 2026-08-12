"use client";

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

const INITIAL_ADMIN_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_admin_1",
    scope: "admin",
    title: "Nova Assinatura Recebida",
    description: "Cliente Henrique assinou o Plano Pro (R$ 129,00/mês).",
    time: "Há 10 min",
    unread: true,
    type: "success",
    link: "/admin/subscriptions"
  },
  {
    id: "notif_admin_2",
    scope: "admin",
    title: "Alerta de Token Social",
    description: "A conexão da conta @criador_up precisa de renovação na API em 3 dias.",
    time: "Há 45 min",
    unread: true,
    type: "warning",
    link: "/admin/accounts"
  },
  {
    id: "notif_admin_3",
    scope: "admin",
    title: "Sincronização em Lote Concluída",
    description: "Métricas e estatísticas atualizadas para 12 contas ativas.",
    time: "Há 2 horas",
    unread: false,
    type: "info",
    link: "/admin/sync-logs"
  }
];

const INITIAL_USER_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_user_1",
    scope: "user",
    title: "Crescimento de Engajamento! 📈",
    description: "Seus Reels da última semana geraram +18.5% mais interações.",
    time: "Há 15 min",
    unread: true,
    type: "success",
    link: "/app/dashboard"
  },
  {
    id: "notif_user_2",
    scope: "user",
    title: "Novo Curso no UP Creator 🎓",
    description: "A aula 'Estrutura de Hooks Virais' já está disponível na sua trilha.",
    time: "Há 1 hora",
    unread: true,
    type: "info",
    link: "/app/up-creator"
  },
  {
    id: "notif_user_3",
    scope: "user",
    title: "Conexão Social Ativa",
    description: "Sua conta do Instagram está sincronizada e transmitindo métricas.",
    time: "Há 3 horas",
    unread: false,
    type: "info",
    link: "/app/settings"
  }
];

const STORAGE_KEY_ADMIN_NOTIFS = "up_admin_notifications";
const STORAGE_KEY_USER_NOTIFS = "up_user_notifications";

export function getNotifications(scope: "admin" | "user"): NotificationItem[] {
  if (typeof window === "undefined") {
    return scope === "admin" ? INITIAL_ADMIN_NOTIFICATIONS : INITIAL_USER_NOTIFICATIONS;
  }
  const key = scope === "admin" ? STORAGE_KEY_ADMIN_NOTIFS : STORAGE_KEY_USER_NOTIFS;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = scope === "admin" ? INITIAL_ADMIN_NOTIFICATIONS : INITIAL_USER_NOTIFICATIONS;
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : (scope === "admin" ? INITIAL_ADMIN_NOTIFICATIONS : INITIAL_USER_NOTIFICATIONS);
  } catch {
    return scope === "admin" ? INITIAL_ADMIN_NOTIFICATIONS : INITIAL_USER_NOTIFICATIONS;
  }
}

export function saveNotifications(scope: "admin" | "user", items: NotificationItem[]): NotificationItem[] {
  if (typeof window !== "undefined") {
    const key = scope === "admin" ? STORAGE_KEY_ADMIN_NOTIFS : STORAGE_KEY_USER_NOTIFS;
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("up_notifications_updated", { detail: { scope } }));
  }
  return items;
}

export function markAllNotificationsAsRead(scope: "admin" | "user"): NotificationItem[] {
  const current = getNotifications(scope);
  const updated = current.map(item => ({ ...item, unread: false }));
  return saveNotifications(scope, updated);
}

export function addNotification(notification: Omit<NotificationItem, "id" | "time" | "unread">): NotificationItem[] {
  const current = getNotifications(notification.scope);
  const newItem: NotificationItem = {
    ...notification,
    id: `notif_${Date.now()}`,
    time: "Agora mesmo",
    unread: true
  };
  const updated = [newItem, ...current];
  return saveNotifications(notification.scope, updated);
}
