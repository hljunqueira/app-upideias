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

    // 1. Evento de conta conectada
    if ((event === 'account.connected' || event === 'account.created') && accountId) {
      try {
        const { zernioClient } = await import('@up-analytics/lib');
        const accountData = await zernioClient.getAccount(accountId);

        if (accountData) {
          const username = (accountData.username || 'instagram_user').replace(/^@/, '');
          
          // Localiza o usuário no Supabase
          const { data: matchedProfile } = await adminClient
            .from('profiles')
            .select('id')
            .or(`instagram_handle.ilike.%${username}%,email.ilike.%${username}%`)
            .maybeSingle();

          let targetUserId = matchedProfile?.id;
          if (!targetUserId) {
            const { data: recentProfile } = await adminClient
              .from('profiles')
              .select('id')
              .order('updated_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            targetUserId = recentProfile?.id;
          }

          if (targetUserId) {
            const accountPayload = {
              user_id: targetUserId,
              platform: 'instagram',
              external_account_id: accountId,
              username,
              name: accountData.displayName || username,
              profile_picture_url: accountData.profilePictureUrl || '',
              bio: accountData.bio || '',
              followers_count: accountData.followersCount || 0,
              following_count: accountData.followingCount || 0,
              media_count: accountData.mediaCount || 0,
              status: 'connected',
              connected_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            const { data: existing } = await adminClient
              .from('social_accounts')
              .select('id')
              .eq('user_id', targetUserId)
              .eq('platform', 'instagram')
              .maybeSingle();

            if (existing?.id) {
              await adminClient.from('social_accounts').update(accountPayload).eq('id', existing.id);
            } else {
              await adminClient.from('social_accounts').insert(accountPayload);
            }

            await adminClient
              .from('profiles')
              .update({ instagram_handle: `@${username}` })
              .eq('id', targetUserId);
          }
        }
      } catch (connErr) {
        console.warn('[ZernioWebhook] Erro ao processar account.connected:', connErr);
      }
    }

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
      const eventId =
        payload?.id ||
        payload?.eventId ||
        payload?._id ||
        `zernio_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      await adminClient.from('webhook_event_logs').insert({
        provider: 'zernio',
        provider_event_id: String(eventId),
        event_type: event || 'unknown',
        payload,
        processed_at: new Date().toISOString(),
      });
    } catch (logErr) {
      console.warn('[ZernioWebhook] Erro ao gravar webhook_event_logs:', logErr);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[ZernioWebhook] Error processing event:', err?.message || err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
