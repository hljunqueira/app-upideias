import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { zernioClient } from '@up-analytics/lib';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const targetAccountId = body?.accountId || body?.connectionId;
    const syncAll = Boolean(body?.all);

    const adminClient = createAdminClient();

    // 1. Verifica privilégios de admin caso seja syncAll
    let isAdmin = false;
    if (syncAll) {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      isAdmin = profile?.role === 'admin' || user.email?.trim().toLowerCase() === 'admin@upideias.com';
      if (!isAdmin) {
        return NextResponse.json({ error: 'Apenas administradores podem sincronizar todas as contas.' }, { status: 403 });
      }
    }

    // 2. Busca contas a sincronizar
    let query = adminClient
      .from('social_accounts')
      .select('id, user_id, username, external_account_id, platform, status')
      .eq('status', 'connected');

    if (!syncAll) {
      if (targetAccountId) {
        query = query.or(`id.eq.${targetAccountId},external_account_id.eq.${targetAccountId}`);
      } else {
        query = query.eq('user_id', user.id);
      }
    }

    const { data: accounts, error: queryError } = await query;
    if (queryError) throw queryError;

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ success: true, message: 'Nenhuma conta ativa para sincronizar.', synced: 0 });
    }

    const results: Array<{ id: string; username: string; status: string; error?: string }> = [];

    for (const acc of accounts) {
      const accStartTime = Date.now();
      const extId = acc.external_account_id || acc.id;

      try {
        // A. Busca detalhes cadastrais e métricas vivas
        const zernioAcc = await zernioClient.getAccount(extId);
        if (zernioAcc) {
          await adminClient
            .from('social_accounts')
            .update({
              username: (zernioAcc.username || acc.username).replace(/^@/, ''),
              name: zernioAcc.displayName,
              profile_picture_url: zernioAcc.profilePictureUrl,
              bio: zernioAcc.bio,
              followers_count: zernioAcc.followersCount,
              following_count: zernioAcc.followingCount,
              media_count: zernioAcc.mediaCount,
              updated_at: new Date().toISOString(),
            })
            .eq('id', acc.id);
        }

        // B. Sincroniza métricas temporais (insights)
        const insights = await zernioClient.getInstagramInsights(extId, { period: '30D' });
        if (insights?.dailyMetrics && insights.dailyMetrics.length > 0) {
          const metricsPayload = insights.dailyMetrics.map((m) => ({
            account_id: acc.id,
            platform: 'instagram',
            metric_date: m.date,
            reach: m.reach || 0,
            views: m.views || 0,
            followers_count: m.followers || (zernioAcc?.followersCount ?? 0),
            engagement_rate: m.interactions ? Math.round((m.interactions / Math.max(1, m.reach || 1)) * 100) / 100 : 0,
            created_at: new Date().toISOString(),
          }));

          await adminClient.from('social_account_metrics').upsert(metricsPayload, {
            onConflict: 'account_id,metric_date',
          });
        }

        // C. Sincroniza últimas postagens
        const posts = await zernioClient.getAccountPosts(extId, 25);
        if (posts && posts.length > 0) {
          const postsPayload = posts.map((p) => ({
            account_id: acc.id,
            content_type: p.mediaType || 'IMAGE',
            caption: p.caption || '',
            media_url: p.mediaUrl || '',
            permalink: p.permalink || 'https://instagram.com',
            published_at: p.publishedAt || new Date().toISOString(),
            like_count: p.likeCount || 0,
            comments_count: p.commentsCount || 0,
            status: 'published',
            updated_at: new Date().toISOString(),
          }));

          await adminClient.from('social_content').upsert(postsPayload, {
            onConflict: 'account_id,published_at',
          });
        }

        // D. Grava log de sucesso
        const durationSec = `${((Date.now() - accStartTime) / 1000).toFixed(1)}s`;
        await adminClient.from('sync_logs').insert({
          instagram_account_id: acc.id,
          account_handle: acc.username ? `@${acc.username.replace(/^@/, '')}` : undefined,
          sync_type: 'Métricas do Instagram',
          status: 'success',
          execution_time: durationSec,
          message: 'Sincronização oficial concluída com sucesso',
          finished_at: new Date().toISOString(),
        });

        results.push({ id: acc.id, username: acc.username, status: 'success' });
      } catch (accErr: any) {
        console.error(`[ZernioSyncRoute] Erro na conta ${acc.username}:`, accErr);
        await adminClient.from('sync_logs').insert({
          instagram_account_id: acc.id,
          account_handle: acc.username ? `@${acc.username.replace(/^@/, '')}` : undefined,
          sync_type: 'Métricas do Instagram',
          status: 'error',
          message: accErr?.message || 'Erro ao sincronizar com Instagram',
          finished_at: new Date().toISOString(),
        });
        results.push({ id: acc.id, username: acc.username, status: 'error', error: accErr?.message });
      }
    }

    const totalDuration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;

    return NextResponse.json({
      success: true,
      totalDuration,
      syncedCount: results.filter((r) => r.status === 'success').length,
      failedCount: results.filter((r) => r.status === 'error').length,
      results,
    });
  } catch (err: any) {
    console.error('[ZernioSyncRoute] Erro global:', err);
    return NextResponse.json({ error: err?.message || 'Falha ao sincronizar contas' }, { status: 500 });
  }
}
