import { NotificationPreferences, WhatsAppMessage, AutomationEvent } from '@up-analytics/types';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_SENDER_ID = process.env.WHATSAPP_SENDER_ID;

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  return {
    id: 'pref-123',
    user_id: userId,
    weekly_report: true,
    daily_tips: false,
    performance_alerts: true,
    billing_alerts: true,
    token_alerts: true,
    post_reminders: true,
    preferred_time: '09:00:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function updateNotificationPreferences(userId: string, data: Partial<NotificationPreferences>): Promise<void> {
  // Simulates preferences updates
}

export async function createAutomationEvent(event: Omit<AutomationEvent, 'id' | 'created_at' | 'processed_at'>): Promise<AutomationEvent> {
  return {
    ...event,
    id: Math.random().toString(),
    processed_at: null,
    created_at: new Date().toISOString()
  };
}

export async function processAutomationEvent(eventId: string): Promise<void> {
  // Simulates background event handler processing (e.g. n8n trigger)
}

export async function createWhatsAppMessageLog(log: Omit<WhatsAppMessage, 'id' | 'created_at'>): Promise<WhatsAppMessage> {
  return {
    ...log,
    id: Math.random().toString(),
    created_at: new Date().toISOString()
  };
}

export async function sendWhatsAppMessage(phone: string, text: string): Promise<boolean> {
  if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY) {
    console.log(`[WhatsApp Local Simulator] Enviando para ${phone}: ${text}`);
    return true;
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/message/sendText/${WHATSAPP_SENDER_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': WHATSAPP_API_KEY
      },
      body: JSON.stringify({
        number: phone,
        options: { delay: 1200, linkPreview: true },
        textMessage: { text: text }
      })
    });
    return response.ok;
  } catch (error) {
    console.error("Erro ao enviar WhatsApp pela Evolution API:", error);
    return false;
  }
}

export async function sendWeeklyReport(phone: string, username: string): Promise<boolean> {
  const message = `📊 *UP Analytics - Relatório Semanal de @${username}*\n\nSeu perfil cresceu *+2,6%* em seguidores nesta semana!\nAlcance Total: *48.9k* 👁️\n\n_Dica estratégica de IA:_ O formato Reels curto obteve 45% mais compartilhamentos. Foque neste formato hoje.\n\nAssinatura: by UpIdeias`;
  return sendWhatsAppMessage(phone, message);
}

export async function sendReachDropAlert(phone: string, dropPercentage: number): Promise<boolean> {
  const message = `⚠️ *UP Analytics - Alerta de Performance*\n\nDetectamos uma queda de *${dropPercentage}%* no alcance orgânico do seu Instagram nas últimas 48 horas.\n\n💡 _Ação recomendada:_ Acesse a plataforma e gere um script Reels de atração com nossa IA.`;
  return sendWhatsAppMessage(phone, message);
}

export async function sendDailyContentTip(phone: string): Promise<boolean> {
  const message = `💡 *UP Analytics - Dica do Dia*\n\nTendência em alta: Trilhas sonoras instrumentais de synthwave estão gerando 18% mais retenção em vídeos curtos de negócios. Experimente usar no seu próximo Reels!`;
  return sendWhatsAppMessage(phone, message);
}

export async function sendTokenExpiredAlert(phone: string): Promise<boolean> {
  const message = `🔑 *UP Analytics - Alerta Urgente*\n\nSua conexão com o Instagram expirou. Por favor, acesse a plataforma e reconecte sua conta para não perder a sincronização diária de dados.`;
  return sendWhatsAppMessage(phone, message);
}

export async function sendBillingAlert(phone: string): Promise<boolean> {
  const message = `💳 *UP Analytics - Faturamento*\n\nSua assinatura do plano Pro renova em 3 dias. Verifique seu cartão cadastrado para evitar a suspensão dos serviços inteligentes.`;
  return sendWhatsAppMessage(phone, message);
}

export async function sendPostReminder(phone: string, postTitle: string): Promise<boolean> {
  const message = `⏰ *UP Analytics - Lembrete de Postagem*\n\nVocê tem um post planejado para agora: *"${postTitle}"*.\n\nAcesse o calendário para ver a legenda e o material visual pronto!`;
  return sendWhatsAppMessage(phone, message);
}
