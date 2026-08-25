import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { nangoClient } from '@up-analytics/lib';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // 1. Busca conexões ativas no Nango
    let connections: any[] = [];
    try {
      const connRes = await fetch(`${nangoClient['host']}/connections`, {
        headers: nangoClient['getAuthHeader'](),
      });
      if (connRes.ok) {
        const connJson = await connRes.json();
        connections = connJson.connections || [];
      }
    } catch (e) {
      console.warn('[LiveData] Error fetching connections:', e);
    }

    const fbConn = connections.find((c: any) => c.provider_config_key === 'facebook') || connections[0];
    if (!fbConn) {
      return NextResponse.json({ account: null, posts: [], metrics: [] });
    }

    const connectionId = fbConn.connection_id;

    // 2. Busca perfil e conta Instagram Business vinculada
    const profile = await nangoClient.getInstagramProfile(connectionId, 'facebook');
    const igId = profile.externalAccountId;

    let bio = '';
    let followsCount = 0;
    let fullProfile: any = profile;

    if (igId && igId !== connectionId) {
      try {
        const fullRes = await fetch(`${nangoClient['host']}/proxy/v22.0/${igId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website`, {
          headers: {
            ...nangoClient['getAuthHeader'](),
            'Provider-Config-Key': 'facebook',
            'Connection-Id': connectionId,
          },
        });
        if (fullRes.ok) {
          const fullJson = await fullRes.json();
          bio = fullJson.biography || '';
          followsCount = fullJson.follows_count || 0;
          fullProfile = {
            ...profile,
            bio,
            following_count: followsCount,
            followers_count: fullJson.followers_count || profile.followers_count,
            media_count: fullJson.media_count || profile.media_count,
            profile_picture_url: fullJson.profile_picture_url || profile.profile_picture_url,
          };
        }
      } catch (e) {
        console.warn('[LiveData] Error fetching full profile:', e);
      }
    }

    // 3. Busca publicações reais
    const posts = await nangoClient.getInstagramMedia(connectionId, igId, 15, 'facebook');

    // 4. Busca métricas e insights
    const metrics = await nangoClient.getInstagramMetrics(connectionId, igId, 'facebook');

    // 5. Persiste/atualiza no banco de dados
    try {
      const { data: savedAccount } = await adminClient
        .from('social_accounts')
        .upsert({
          user_id: user.id,
          platform: 'instagram',
          external_account_id: igId || connectionId,
          username: fullProfile.username || 'hlj.dev',
          name: fullProfile.name || 'Henrique | Desenvolvedor',
          profile_picture_url: fullProfile.profile_picture_url,
          bio: fullProfile.bio || bio,
          followers_count: fullProfile.followers_count || 0,
          following_count: followsCount,
          media_count: fullProfile.media_count || posts.length,
          status: 'connected',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'platform,external_account_id' })
        .select()
        .single();

      if (savedAccount && posts.length > 0) {
        const postsToUpsert = posts.map((p) => ({
          account_id: savedAccount.id,
          external_content_id: p.externalContentId || `post_${Date.now()}`,
          platform: 'instagram',
          media_type: p.media_type || 'IMAGE',
          media_product_type: p.media_product_type || 'FEED',
          caption: p.caption,
          media_url: p.media_url,
          thumbnail_url: p.thumbnail_url,
          permalink: p.permalink,
          published_at: p.published_at,
          like_count: p.like_count || 0,
          comments_count: p.comments_count || 0,
          updated_at: new Date().toISOString(),
        }));

        await adminClient.from('social_content').upsert(postsToUpsert, {
          onConflict: 'account_id,external_content_id',
        });
      }
    } catch (dbErr) {
      console.warn('[LiveData] DB upsert notice:', dbErr);
    }

    return NextResponse.json({
      account: fullProfile,
      posts,
      metrics,
    });
  } catch (err: any) {
    console.error('[LiveData] Error:', err);
    return NextResponse.json({ error: err?.message || 'Erro ao carregar dados' }, { status: 500 });
  }
}
