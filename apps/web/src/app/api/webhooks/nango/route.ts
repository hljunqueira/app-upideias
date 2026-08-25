import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { nangoClient } from '@up-analytics/lib';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const event = payload?.event || payload?.type;
    const connectionId = payload?.connectionId || payload?.connection_id || payload?.data?.connectionId;
    const providerConfigKey = payload?.providerConfigKey || payload?.integrationId || 'instagram';

    console.log(`[NangoWebhook] Received event "${event}" for connection ${connectionId}`);

    if (!connectionId) {
      return NextResponse.json({ received: true, ignored: true, reason: 'missing connectionId' });
    }

    const adminClient = createAdminClient();

    // Eventos de sincronização ou nova conexão
    if (event === 'sync_success' || event === 'connection_created' || event === 'sync:success') {
      try {
        const profile = await nangoClient.getInstagramProfile(connectionId);
        if (profile?.username) {
          await adminClient
            .from('social_accounts')
            .update({
              username: profile.username,
              name: profile.name || profile.username,
              profile_picture_url: profile.profile_picture_url,
              followers_count: profile.followers_count || 0,
              media_count: profile.media_count || 0,
              status: 'connected',
              updated_at: new Date().toISOString(),
            })
            .eq('external_account_id', connectionId);
        }
      } catch (syncErr) {
        console.error('[NangoWebhook] Error executing background sync:', syncErr);
      }
    }

    if (event === 'connection_deleted' || event === 'connection:deleted') {
      await adminClient
        .from('social_accounts')
        .update({
          status: 'disconnected',
          disconnected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('external_account_id', connectionId);
    }

    return NextResponse.json({ received: true, success: true });
  } catch (err: any) {
    console.error('[NangoWebhook] Error processing webhook:', err);
    return NextResponse.json({ error: err?.message || 'Webhook error' }, { status: 500 });
  }
}
