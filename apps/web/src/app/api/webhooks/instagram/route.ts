import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'up_analytics_webhook_token_2026';

/**
 * Endpoint de verificação do Webhook da Meta (GET)
 * A Meta envia hub.mode, hub.verify_token e hub.challenge
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[MetaWebhook] Verificação de webhook do Instagram bem-sucedida!');
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  console.warn('[MetaWebhook] Falha na verificação de token:', { mode, token });
  return new NextResponse('Token de verificação inválido', { status: 403 });
}

/**
 * Recebimento de eventos em tempo real do Instagram (POST)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    console.log('[MetaWebhook] Evento do Instagram recebido:', JSON.stringify(body));

    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    console.error('[MetaWebhook] Erro no processamento do evento:', err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
