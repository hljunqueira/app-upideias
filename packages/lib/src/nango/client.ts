import {
  SocialAccount,
  SocialAccountMetrics,
  SocialContent,
} from '@up-analytics/types';

export class NangoClient {
  private secretKey: string;
  private host: string;

  constructor(secretKey?: string, host?: string) {
    this.secretKey = secretKey || process.env.NANGO_SECRET_KEY || 'a1db923f-e1c4-439f-a422-6aa793e082e1';
    this.host = host || process.env.NANGO_BASE_URL || 'https://api.nango.dev';
  }

  private getAuthHeader() {
    const key = this.secretKey || process.env.NANGO_SECRET_KEY || 'a1db923f-e1c4-439f-a422-6aa793e082e1';
    return {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Cria uma sessão segura de conexão para o Nango Connect UI
   */
  async createConnectSession(userId: string, userEmail?: string, _userName?: string, platform?: string) {
    try {
      const allowedIntegrations = platform ? [platform] : ['facebook', 'instagram'];
      const res = await fetch(`${this.host}/connect/sessions`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          tags: {
            end_user_id: userId,
            end_user_email: userEmail || `${userId}@upideias.com`,
          },
          allowed_integrations: allowedIntegrations,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error('[NangoClient] createConnectSession error:', json);
        throw new Error(json?.error?.message || json?.message || 'Falha ao criar sessão no Nango');
      }

      return {
        token: json?.data?.token || json?.token,
        connectLink: json?.data?.connect_link || json?.connect_link,
        expiresAt: json?.data?.expires_at,
      };
    } catch (err: any) {
      console.error('[NangoClient] createConnectSession exception:', err);
      throw err;
    }
  }

  /**
   * Busca detalhes da conta do Instagram / Facebook via Nango Proxy ou Connection
   */
  async getInstagramProfile(connectionId: string, providerKey: string = 'facebook'): Promise<Partial<SocialAccount>> {
    try {
      // 1. Se for Facebook, tenta buscar as páginas e o Instagram Business vinculado
      if (providerKey === 'facebook') {
        // A. Busca páginas e conta de Instagram vinculada
        const pagesRes = await fetch(`${this.host}/proxy/v22.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url,followers_count,media_count}`, {
          method: 'GET',
          headers: {
            ...this.getAuthHeader(),
            'Provider-Config-Key': 'facebook',
            'Connection-Id': connectionId,
          },
        });

        if (pagesRes.ok) {
          const pagesData = await pagesRes.json();
          const pageWithIg = (pagesData.data || []).find((p: any) => p.instagram_business_account);
          if (pageWithIg?.instagram_business_account) {
            const igId = pageWithIg.instagram_business_account.id;
            try {
              const igDetailsRes = await fetch(`${this.host}/proxy/v22.0/${igId}?fields=id,username,name,profile_picture_url,followers_count,media_count`, {
                headers: {
                  ...this.getAuthHeader(),
                  'Provider-Config-Key': 'facebook',
                  'Connection-Id': connectionId,
                },
              });
              if (igDetailsRes.ok) {
                const igDetails = await igDetailsRes.json();
                return {
                  externalAccountId: igDetails.id || igId,
                  username: igDetails.username || 'instagram_user',
                  name: igDetails.name || pageWithIg.name || null,
                  profile_picture_url: igDetails.profile_picture_url || null,
                  followers_count: igDetails.followers_count || 0,
                  media_count: igDetails.media_count || 0,
                  platform: 'instagram',
                };
              }
            } catch (igErr) {
              console.warn('[NangoClient] igDetails notice:', igErr);
            }

            const ig = pageWithIg.instagram_business_account;
            return {
              externalAccountId: ig.id,
              username: ig.username || 'instagram_user',
              name: ig.name || pageWithIg.name || null,
              profile_picture_url: ig.profile_picture_url || null,
              followers_count: ig.followers_count || 0,
              media_count: ig.media_count || 0,
              platform: 'instagram',
            };
          }
        }

        // B. Busca via Meta Business Portfolios
        try {
          const bizRes = await fetch(`${this.host}/proxy/v22.0/me/businesses?fields=id,name,instagram_business_accounts{id,username,name,profile_picture_url,followers_count,media_count},owned_pages{id,name,instagram_business_account{id,username,name,profile_picture_url,followers_count,media_count}}`, {
            method: 'GET',
            headers: {
              ...this.getAuthHeader(),
              'Provider-Config-Key': 'facebook',
              'Connection-Id': connectionId,
            },
          });

          if (bizRes.ok) {
            const bizData = await bizRes.json();
            for (const biz of bizData.data || []) {
              const igFromBiz = biz.instagram_business_accounts?.data?.[0];
              if (igFromBiz) {
                return {
                  externalAccountId: igFromBiz.id,
                  username: igFromBiz.username || 'instagram_user',
                  name: igFromBiz.name || biz.name || null,
                  profile_picture_url: igFromBiz.profile_picture_url || null,
                  followers_count: igFromBiz.followers_count || 0,
                  media_count: igFromBiz.media_count || 0,
                  platform: 'instagram',
                };
              }
              const pageWithIg = (biz.owned_pages?.data || []).find((p: any) => p.instagram_business_account);
              if (pageWithIg?.instagram_business_account) {
                const ig = pageWithIg.instagram_business_account;
                return {
                  externalAccountId: ig.id,
                  username: ig.username || pageWithIg.name || 'instagram_user',
                  name: ig.name || pageWithIg.name || null,
                  profile_picture_url: ig.profile_picture_url || null,
                  followers_count: ig.followers_count || 0,
                  media_count: ig.media_count || 0,
                  platform: 'instagram',
                };
              }
            }
          }
        } catch (bizErr) {
          console.warn('[NangoClient] bizRes notice:', bizErr);
        }

        // C. Se não tiver Instagram vinculado na página, retorna o perfil do usuário Meta / Facebook
        const userRes = await fetch(`${this.host}/proxy/v22.0/me?fields=id,name,email,picture{data{url}}`, {
          method: 'GET',
          headers: {
            ...this.getAuthHeader(),
            'Provider-Config-Key': 'facebook',
            'Connection-Id': connectionId,
          },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          return {
            externalAccountId: userData.id || connectionId,
            username: userData.name ? userData.name.toLowerCase().replace(/\s+/g, '_') : 'meta_user',
            name: userData.name || 'Usuário Meta',
            profile_picture_url: userData.picture?.data?.url || null,
            followers_count: 0,
            media_count: 0,
            platform: 'facebook',
          };
        }
      }

      // 2. Chamada via Proxy direto para Instagram Basic / Graph
      const proxyRes = await fetch(`${this.host}/proxy/v20.0/me?fields=id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeader(),
          'Provider-Config-Key': providerKey || 'instagram',
          'Connection-Id': connectionId,
        },
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        return {
          externalAccountId: data.id || connectionId,
          username: data.username || 'perfil_instagram',
          name: data.name || data.username || null,
          profile_picture_url: data.profile_picture_url || null,
          followers_count: data.followers_count || 0,
          media_count: data.media_count || 0,
          platform: 'instagram',
        };
      }
    } catch (err: any) {
      console.warn(`[NangoClient] Proxy notice: ${err?.message}`);
    }

    try {
      // 3. Chamada para obter metadados da conexão
      const connRes = await fetch(`${this.host}/connection/${connectionId}?provider_config_key=${providerKey}`, {
        headers: this.getAuthHeader(),
      });
      if (connRes.ok) {
        const conn = await connRes.json();
        const metadata = conn?.metadata || conn?.connection_config || {};
        const endUser = conn?.end_user || conn?.tags || {};
        return {
          externalAccountId: conn?.connection_id || connectionId,
          username: metadata?.username || endUser?.display_name || conn?.account_name || 'perfil_conectado',
          name: metadata?.name || endUser?.display_name || null,
          profile_picture_url: metadata?.profile_picture_url || null,
          followers_count: metadata?.followers_count || 0,
          media_count: metadata?.media_count || 0,
          platform: providerKey === 'facebook' ? 'facebook' : 'instagram',
        };
      }
    } catch (err: any) {
      console.warn(`[NangoClient] Connection notice: ${err?.message}`);
    }

    return {
      externalAccountId: connectionId,
      username: 'perfil_conectado',
      name: 'Perfil Conectado',
      platform: 'instagram',
      followers_count: 0,
      media_count: 0,
    };
  }

  /**
   * Busca publicações do Instagram via Nango Proxy
   */
  async getInstagramMedia(connectionId: string, igId?: string, limit: number = 25, providerKey: string = 'facebook'): Promise<Partial<SocialContent>[]> {
    try {
      const targetEndpoint = igId ? `/${igId}/media` : '/me/media';
      const res = await fetch(`${this.host}/proxy/v22.0${targetEndpoint}?fields=id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}`, {
        headers: {
          ...this.getAuthHeader(),
          'Provider-Config-Key': providerKey,
          'Connection-Id': connectionId,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const mediaList = json?.data || [];
        return mediaList.map((item: any) => ({
          externalContentId: item.id,
          media_type: item.media_type || 'IMAGE',
          media_product_type: item.media_product_type || 'FEED',
          caption: item.caption || null,
          permalink: item.permalink || 'https://instagram.com',
          media_url: item.media_url || item.thumbnail_url || '',
          thumbnail_url: item.thumbnail_url || item.media_url || null,
          published_at: item.timestamp || new Date().toISOString(),
          like_count: item.like_count || 0,
          comments_count: item.comments_count || 0,
          platform: 'instagram',
        }));
      }
    } catch (err: any) {
      console.warn(`[NangoClient] Error fetching Instagram media: ${err?.message}`);
    }
    return [];
  }

  /**
   * Busca métricas diárias de alcance e impressões
   */
  async getInstagramMetrics(connectionId: string, igId?: string, providerKey: string = 'facebook'): Promise<Partial<SocialAccountMetrics>[]> {
    try {
      const targetId = igId || 'me';
      const dateMetricsMap: Record<string, any> = {};

      // 1. Busca reach e follower_count diários
      try {
        const resReach = await fetch(`${this.host}/proxy/v22.0/${targetId}/insights?metric=reach,follower_count&period=day`, {
          headers: {
            ...this.getAuthHeader(),
            'Provider-Config-Key': providerKey,
            'Connection-Id': connectionId,
          },
        });
        if (resReach.ok) {
          const json = await resReach.json();
          (json?.data || []).forEach((insight: any) => {
            const metricName = insight.name;
            (insight.values || []).forEach((val: any) => {
              const date = (val.end_time || '').split('T')[0];
              if (!date) return;
              if (!dateMetricsMap[date]) {
                dateMetricsMap[date] = { metric_date: date, reach: 0, views: 0, profile_views: 0, website_clicks: 0, followers_count: 0 };
              }
              if (metricName === 'reach') dateMetricsMap[date].reach = val.value || 0;
              if (metricName === 'follower_count') dateMetricsMap[date].followers_count = val.value || 0;
            });
          });
        }
      } catch (errReach) {
        console.warn('[NangoClient] reach insights notice:', errReach);
      }

      // 2. Busca totais de interações e visualizações do período
      try {
        const resTotals = await fetch(`${this.host}/proxy/v22.0/${targetId}/insights?metric=views,total_interactions,profile_views,website_clicks&period=day&metric_type=total_value`, {
          headers: {
            ...this.getAuthHeader(),
            'Provider-Config-Key': providerKey,
            'Connection-Id': connectionId,
          },
        });
        if (resTotals.ok) {
          const json = await resTotals.json();
          const today = new Date().toISOString().split('T')[0];
          if (!dateMetricsMap[today]) {
            dateMetricsMap[today] = { metric_date: today, reach: 0, views: 0, profile_views: 0, website_clicks: 0, followers_count: 0 };
          }
          (json?.data || []).forEach((insight: any) => {
            const val = insight.total_value?.value || 0;
            if (insight.name === 'views') dateMetricsMap[today].views = val;
            if (insight.name === 'profile_views') dateMetricsMap[today].profile_views = val;
            if (insight.name === 'website_clicks') dateMetricsMap[today].website_clicks = val;
          });
        }
      } catch (errTotals) {
        console.warn('[NangoClient] totals insights notice:', errTotals);
      }

      const metricsList = Object.values(dateMetricsMap);
      if (metricsList.length > 0) {
        return metricsList.map((m: any) => ({
          ...m,
          platform: 'instagram',
          engagement_rate: m.reach > 0 ? Number(((m.profile_views + m.website_clicks) / m.reach * 100).toFixed(2)) : 0,
        }));
      }
    } catch (err: any) {
      console.warn(`[NangoClient] Error fetching insights: ${err?.message}`);
    }
    return [];
  }
}

export const nangoClient = new NangoClient();
