import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));
    const event = payload?.event || payload?.type;
    const accountId = payload?.accountId || payload?.data?.accountId || payload?.data?._id;

    console.log(`[ZernioWebhook] Received event "${event}" for account "${accountId}"`);

    const adminClient = createAdminClient();

    if (event === 'account.disconnected' && accountId) {
      await adminClient
        .from('social_accounts')
        .update({
          status: 'disconnected',
          updated_at: new Date().toISOString(),
        })
        .eq('external_account_id', accountId);
    }

    if (event === 'post.published' && payload?.data?.postId) {
      await adminClient
        .from('content_calendar')
        .update({
          status: 'published',
          updated_at: new Date().toISOString(),
        })
        .eq('notes', payload?.data?.content);
    }

    // Registra log de webhook
    try {
      await adminClient.from('webhook_event_logs').insert({
        provider: 'zernio',
        event_type: event || 'unknown',
        payload,
        processed_at: new Date().toISOString(),
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[ZernioWebhook] Error processing event:', err?.message || err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
