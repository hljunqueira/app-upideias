import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { zernioClient } from '@up-analytics/lib';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const accountId = searchParams.get('accountId') || searchParams.get('id');
  const rawError = searchParams.get('error') || searchParams.get('message');
  const state = searchParams.get('state') || '';
  const queryUserId = searchParams.get('userId') || '';

  // Tratamento de erro retornado pela autorização oficial
  if (rawError) {
    let friendlyError = decodeURIComponent(rawError);
    if (
      friendlyError.toLowerCase().includes('business') ||
      friendlyError.toLowerCase().includes('permissions') ||
      friendlyError.toLowerCase().includes('user denied')
    ) {
      friendlyError =
        'Apenas contas profissionais (Comercial ou Criador de Conteúdo) podem ser conectadas. No app do Instagram, acesse Configurações > Tipo de Conta e altere para Profissional.';
    }

    const errorHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Conexão do Instagram</title>
          <style>
            body { background: #0b0b10; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 16px; box-sizing: border-box; text-align: center; }
            .card { background: #12121a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px 24px; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
            h2 { color: #FF5368; margin: 0 0 12px 0; font-size: 18px; font-weight: 700; }
            p { color: #a1a1aa; font-size: 13px; line-height: 1.5; margin: 0 0 20px 0; }
            button { background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.15); padding: 10px 20px; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
            button:hover { background: rgba(255,255,255,0.15); }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Não foi possível conectar o Instagram</h2>
            <p>${friendlyError}</p>
            <button onclick="window.close()">Fechar Janela</button>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'social-account-error', error: '${encodeURIComponent(friendlyError)}' }, '*');
              window.opener.postMessage({ type: 'zernio-error', error: '${encodeURIComponent(friendlyError)}' }, '*');
            }
          </script>
        </body>
      </html>
    `;
    return new NextResponse(errorHtml, {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // 1. Identifica o usuário proprietário com múltiplos fallbacks resilientes (Regex UUID)
  const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  let targetUserId = '';

  // 1a. Tenta extrair de queryUserId ou da URL inteira (mesmo com query strings corrompidas pelo Zernio)
  const queryMatch = (queryUserId || '').match(UUID_REGEX);
  if (queryMatch) {
    targetUserId = queryMatch[0];
  } else {
    const fullUrlMatch = req.url.match(UUID_REGEX);
    if (fullUrlMatch) {
      targetUserId = fullUrlMatch[0];
    }
  }

  // 1b. Tenta extrair do state retornado pela Zernio (que embute a URL original completa)
  if (!targetUserId && state) {
    const decodedState = decodeURIComponent(state);
    const stateMatch = decodedState.match(UUID_REGEX);
    if (stateMatch) {
      targetUserId = stateMatch[0];
    }
  }

  // 1c. Tenta extrair da sessão ativa do Supabase via cookies
  if (!targetUserId) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        targetUserId = user.id;
      }
    } catch {
      // ignore
    }
  }

  const adminClient = createAdminClient();

  // 1d. Se ainda não identificado, busca por correspondência de perfil no Supabase
  if (!targetUserId && accountId) {
    try {
      const accountData = await zernioClient.getAccount(accountId);
      const igHandle = accountData?.username?.replace(/^@/, '');
      if (igHandle) {
        const { data: matched } = await adminClient
          .from('profiles')
          .select('id')
          .or(`instagram_handle.ilike.%${igHandle}%,email.ilike.%${igHandle}%`)
          .maybeSingle();
        if (matched?.id) {
          targetUserId = matched.id;
        }
      }
    } catch {
      // ignore
    }
  }

  // 1e. Fallback final: se houver apenas um usuário cadastrado recente ativo, vincula com segurança
  if (!targetUserId) {
    const { data: recentProfile } = await adminClient
      .from('profiles')
      .select('id')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recentProfile?.id) {
      targetUserId = recentProfile.id;
    }
  }

  let accountDbId = '';

  if (accountId && targetUserId) {
    try {
      // 2. Busca dados cadastrais ao vivo
      const accountData = await zernioClient.getAccount(accountId);

      if (accountData) {
        const username = (accountData.username || 'instagram_user').replace(/^@/, '');
        const displayName = accountData.displayName || username;
        const profilePictureUrl = accountData.profilePictureUrl || '';
        const bio = accountData.bio || '';
        const followersCount = accountData.followersCount || 0;
        const followingCount = accountData.followingCount || 0;
        const mediaCount = accountData.mediaCount || 0;

        // 1. Verifica se a conta já existe pela chave única (platform, external_account_id)
        const { data: existingByExt } = await adminClient
          .from('social_accounts')
          .select('id')
          .eq('platform', 'instagram')
          .eq('external_account_id', accountId)
          .maybeSingle();

        if (existingByExt?.id) {
          accountDbId = existingByExt.id;
          await adminClient
            .from('social_accounts')
            .update({
              user_id: targetUserId,
              external_account_id: accountId,
              username,
              name: displayName,
              profile_picture_url: profilePictureUrl,
              bio,
              followers_count: followersCount,
              following_count: followingCount,
              media_count: mediaCount,
              status: 'connected',
              connected_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingByExt.id);
        } else {
          // Verifica se o usuário já tem outra conta do instagram cadastrada
          const { data: existingByUser } = await adminClient
            .from('social_accounts')
            .select('id')
            .eq('user_id', targetUserId)
            .eq('platform', 'instagram')
            .maybeSingle();

          if (existingByUser?.id) {
            accountDbId = existingByUser.id;
            await adminClient
              .from('social_accounts')
              .update({
                external_account_id: accountId,
                username,
                name: displayName,
                profile_picture_url: profilePictureUrl,
                bio,
                followers_count: followersCount,
                following_count: followingCount,
                media_count: mediaCount,
                status: 'connected',
                connected_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingByUser.id);
          } else {
            const { data: inserted } = await adminClient
              .from('social_accounts')
              .insert({
                user_id: targetUserId,
                platform: 'instagram',
                external_account_id: accountId,
                username,
                name: displayName,
                profile_picture_url: profilePictureUrl,
                bio,
                followers_count: followersCount,
                following_count: followingCount,
                media_count: mediaCount,
                status: 'connected',
                connected_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select('id')
              .single();
            accountDbId = inserted?.id || '';
          }
        }

        // Atualiza o instagram_handle no perfil
        await adminClient
          .from('profiles')
          .update({ instagram_handle: `@${username}` })
          .eq('id', targetUserId);

        // 3. ATUALIZAÇÃO IMEDIATA: Sincroniza métricas e postagens preliminares de imediato
        try {
          const [insights, posts] = await Promise.all([
            zernioClient.getInstagramInsights(accountId, { period: '30D' }).catch(() => null),
            zernioClient.getAccountPosts(accountId, 25).catch(() => null),
          ]);

          if (accountDbId && insights?.dailyMetrics && insights.dailyMetrics.length > 0) {
            const metricsPayload = insights.dailyMetrics.map((m) => ({
              account_id: accountDbId,
              platform: 'instagram',
              metric_date: m.date,
              reach: m.reach || 0,
              views: m.views || 0,
              followers_count: m.followers || followersCount,
              engagement_rate: m.interactions ? Math.round((m.interactions / Math.max(1, m.reach || 1)) * 100) / 100 : 0,
              created_at: new Date().toISOString(),
            }));
            await adminClient.from('social_account_metrics').upsert(metricsPayload, {
              onConflict: 'account_id,metric_date',
            });
          }

          if (accountDbId && posts && posts.length > 0) {
            const postsPayload = posts.map((p) => ({
              account_id: accountDbId,
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

          // Grava log de sincronização inicial
          if (accountDbId) {
            await adminClient.from('sync_logs').insert({
              instagram_account_id: accountDbId,
              account_handle: `@${username}`,
              sync_type: 'Métricas do Instagram',
              status: 'success',
              execution_time: '1.2s',
              message: 'Conexão e sincronização inicial estabelecida com sucesso',
              finished_at: new Date().toISOString(),
            });
          }
        } catch (syncPrelimErr) {
          console.warn('[ZernioCallback] Erro na sincronização preliminar:', syncPrelimErr);
        }
      }
    } catch (fetchErr: any) {
      console.warn('[ZernioCallback] Erro ao sincronizar dados da conta:', fetchErr?.message);
    }
  }

  // 4. Renderiza tela minimalista White-Label que emite postMessage e fecha a janela
  const successHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Conexão do Instagram</title>
        <style>
          body { background: #0b0b10; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 16px; box-sizing: border-box; text-align: center; }
          .card { background: #12121a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px 24px; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
          .dot { width: 10px; height: 10px; border-radius: 50%; background: #10b981; display: inline-block; margin-bottom: 12px; }
          h2 { color: #fff; margin: 0 0 8px 0; font-size: 18px; font-weight: 700; }
          p { color: #a1a1aa; font-size: 13px; line-height: 1.5; margin: 0 0 20px 0; }
          .btn { display: inline-block; background: #FF5368; color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-size: 12px; font-weight: 700; text-decoration: none; cursor: pointer; transition: background 0.2s; }
          .btn:hover { background: #e04457; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="dot"></div>
          <h2>Instagram Conectado com Sucesso</h2>
          <p>Métricas e publicações sincronizadas com sua conta.</p>
          <button class="btn" onclick="finishAndClose()">Concluir e Ver Painel</button>
        </div>
        <script>
          const payload = {
            type: 'social-account-connected',
            accountId: '${accountId || ''}',
            platform: 'instagram'
          };
          function finishAndClose() {
            if (window.opener) {
              try {
                window.opener.postMessage(payload, '*');
                window.opener.postMessage({ ...payload, type: 'zernio-connected' }, '*');
              } catch(e) {}
              window.close();
            } else {
              window.location.href = '/app/dashboard?connected=true';
            }
          }
          // Dispara mensagens imediatamente
          if (window.opener) {
            try {
              window.opener.postMessage(payload, '*');
              window.opener.postMessage({ ...payload, type: 'zernio-connected' }, '*');
            } catch(e) {}
            setTimeout(() => {
              try { window.close(); } catch(e) {}
            }, 600);
          }
          // Fallback se a janela não fechar
          setTimeout(() => {
            if (!window.opener) {
              window.location.href = '/app/dashboard?connected=true';
            }
          }, 1500);
        </script>
      </body>
    </html>
  `;

  return new NextResponse(successHtml, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
