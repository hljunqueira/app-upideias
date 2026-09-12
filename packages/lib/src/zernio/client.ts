export interface ZernioProfile {
  _id: string;
  name: string;
  userId?: string;
  isDefault?: boolean;
}

export interface ZernioAccount {
  _id: string;
  platform: string;
  username: string;
  displayName?: string;
  profilePictureUrl?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  mediaCount?: number;
  tokenStatus?: string;
  profileId?: string;
  connectedAt?: string;
}

export interface ZernioConnectUrlParams {
  profileId: string;
  redirectUrl: string;
  platform?: string;
  loginMethod?: 'instagram_login' | 'facebook_login';
  headless?: boolean;
}

export interface ZernioPost {
  id: string;
  caption?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink?: string;
  likeCount?: number;
  commentsCount?: number;
  publishedAt?: string;
}

export interface ZernioInsightsData {
  views?: number;
  reach?: number;
  interactions?: number;
  accountsEngaged?: number;
  profileLinksTaps?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  breakdowns?: {
    mediaProductType?: Record<string, number>;
    followType?: Record<string, number>;
  };
  dailyMetrics?: Array<{
    date: string;
    views?: number;
    reach?: number;
    interactions?: number;
    followers?: number;
  }>;
}

export interface ZernioDemographics {
  genderAgeDistribution?: Record<string, number>;
  topCities?: Array<{ city: string; percentage: number; count?: number }>;
  topCountries?: Array<{ country: string; percentage: number; count?: number }>;
  femalePct?: number;
  malePct?: number;
  ageRanges?: Array<{ label: string; pct: number }>;
}

export class ZernioClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey =
      apiKey ||
      process.env.ZERNIO_API_KEY ||
      'sk_e6a8c1f8d03658a66fae195c47c423b32b47e7f9d66784016102b1bf831c3aeb';
    this.baseUrl = (baseUrl || process.env.ZERNIO_BASE_URL || 'https://zernio.com/api/v1').replace(/\/$/, '');
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /**
   * Obtém todos os perfis ou cria um perfil multi-inquilino para o usuário no Zernio
   */
  async getOrCreateProfile(userId: string, userName?: string): Promise<string> {
    const profileName = `UP_${userId.substring(0, 8)}`;

    try {
      const listRes = await fetch(`${this.baseUrl}/profiles`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (listRes.ok) {
        const data = await listRes.json();
        const profiles: ZernioProfile[] = data.profiles || [];
        const existing = profiles.find(
          (p) => p.name === profileName || p.name === userName
        );
        if (existing?._id) {
          return existing._id;
        }

        // Se houver um perfil padrão, podemos utilizá-lo como fallback
        if (profiles.length > 0 && profiles[0]._id) {
          return profiles[0]._id;
        }
      }

      // Cria um novo perfil caso não encontre
      const createRes = await fetch(`${this.baseUrl}/profiles`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ name: profileName }),
      });

      if (createRes.ok) {
        const created = await createRes.json();
        return created.profile?._id || created._id;
      }
    } catch (err: any) {
      console.warn('[ZernioClient] getOrCreateProfile notice:', err?.message);
    }

    return 'default';
  }

  /**
   * Gera a URL oficial de conexão OAuth no Zernio
   * Padrão estrito: loginMethod = 'instagram_login'
   */
  async getConnectUrl(params: ZernioConnectUrlParams): Promise<{ authUrl: string; state?: string }> {
    const platform = params.platform || 'instagram';
    const loginMethod = params.loginMethod || 'instagram_login';

    const search = new URLSearchParams({
      profileId: params.profileId,
      redirect_url: params.redirectUrl,
      loginMethod: loginMethod,
    });

    if (params.headless) {
      search.set('headless', 'true');
    }

    const url = `${this.baseUrl}/connect/${platform}?${search.toString()}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      console.error('[ZernioClient] getConnectUrl error:', errJson);
      throw new Error(errJson.error || errJson.message || 'Falha ao gerar URL de conexão na Zernio');
    }

    const data = await res.json();
    return {
      authUrl: data.authUrl,
      state: data.state,
    };
  }

  /**
   * Busca detalhes cadastrais e métricas vivas de uma conta no Zernio
   */
  async getAccount(accountId: string): Promise<ZernioAccount | null> {
    try {
      const accounts = await this.listAccounts();
      const found = accounts.find((a) => a._id === accountId);
      if (found) {
        return found;
      }

      const res = await fetch(`${this.baseUrl}/accounts?accountId=${accountId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const raw = (data.accounts || []).find((a: any) => a._id === accountId) || data.account || data;
      if (!raw || !raw._id) return null;

      const profileData = raw.metadata?.profileData || {};
      const extra = profileData.extraData || raw.extraData || {};

      return {
        _id: raw._id || accountId,
        platform: raw.platform || 'instagram',
        username: raw.username || profileData.username || 'perfil',
        displayName: profileData.displayName || raw.displayName || raw.name || raw.username || 'Perfil Conectado',
        profilePictureUrl: raw.profilePicture || profileData.profilePicture || raw.profilePictureUrl || '',
        bio: profileData.bio || raw.bio || raw.biography || '',
        followersCount: raw.followersCount ?? profileData.followersCount ?? 0,
        followingCount: extra.followsCount ?? raw.followingCount ?? 0,
        mediaCount: extra.mediaCount ?? raw.externalPostCount ?? raw.mediaCount ?? 0,
        tokenStatus: raw.platformStatus || (raw.isActive ? 'active' : 'inactive'),
        profileId: typeof raw.profileId === 'object' ? raw.profileId?._id : raw.profileId,
        connectedAt: raw.metadata?.connectedAt || raw.createdAt || new Date().toISOString(),
      };
    } catch (err: any) {
      console.warn(`[ZernioClient] getAccount notice (${accountId}):`, err?.message);
      return null;
    }
  }

  /**
   * Lista todas as contas conectadas em um profile da Zernio
   */
  async listAccounts(profileId?: string): Promise<ZernioAccount[]> {
    try {
      const url = profileId
        ? `${this.baseUrl}/accounts?profileId=${encodeURIComponent(profileId)}`
        : `${this.baseUrl}/accounts`;

      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      const list = data.accounts || data || [];

      return list.map((raw: any) => {
        const profileData = raw.metadata?.profileData || {};
        const extra = profileData.extraData || raw.extraData || {};

        return {
          _id: raw._id,
          platform: raw.platform || 'instagram',
          username: raw.username || profileData.username || 'perfil',
          displayName: profileData.displayName || raw.displayName || raw.name || raw.username || 'Perfil Conectado',
          profilePictureUrl: raw.profilePicture || profileData.profilePicture || raw.profilePictureUrl || '',
          bio: profileData.bio || raw.bio || raw.biography || '',
          followersCount: raw.followersCount ?? profileData.followersCount ?? 0,
          followingCount: extra.followsCount ?? raw.followingCount ?? 0,
          mediaCount: extra.mediaCount ?? raw.externalPostCount ?? raw.mediaCount ?? 0,
          tokenStatus: raw.platformStatus || (raw.isActive ? 'active' : 'inactive'),
          profileId: typeof raw.profileId === 'object' ? raw.profileId?._id : raw.profileId,
          connectedAt: raw.metadata?.connectedAt || raw.createdAt || new Date().toISOString(),
        };
      });
    } catch (err: any) {
      console.warn('[ZernioClient] listAccounts notice:', err?.message);
      return [];
    }
  }

  /**
   * Monitora a saúde do token e permissões de uma conta
   */
  async getAccountHealth(accountId: string) {
    try {
      const res = await fetch(`${this.baseUrl}/accounts/${accountId}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err: any) {
      console.warn('[ZernioClient] getAccountHealth notice:', err?.message);
    }
    return null;
  }

  /**
   * Busca insights agregados do Instagram (Alcance, Visualizações, Contas com engajamento, Interações, Séries Temporais)
   */
  async getInstagramInsights(
    accountId: string,
    startDateOrOptions?: string | { period?: string; startDate?: string; endDate?: string; since?: string; until?: string },
    endDateParam?: string
  ): Promise<ZernioInsightsData | null> {
    try {
      let since: string | undefined;
      let until: string | undefined;

      if (typeof startDateOrOptions === 'object' && startDateOrOptions !== null) {
        since = startDateOrOptions.since || startDateOrOptions.startDate;
        until = startDateOrOptions.until || startDateOrOptions.endDate;
      } else {
        since = startDateOrOptions;
        until = endDateParam;
      }

      const baseParams = new URLSearchParams({ accountId });
      if (since) {
        baseParams.set('since', since);
        baseParams.set('startDate', since);
      }
      if (until) {
        baseParams.set('until', until);
        baseParams.set('endDate', until);
      }

      // 1. Total agregados
      const totalParams = new URLSearchParams(baseParams);
      totalParams.set(
        'metrics',
        'reach,views,accounts_engaged,total_interactions,profile_links_taps,likes,comments,shares,saves'
      );
      totalParams.set('metricType', 'total_value');

      // 2. Time series diária de alcance
      const timeSeriesParams = new URLSearchParams(baseParams);
      timeSeriesParams.set('metrics', 'reach');
      timeSeriesParams.set('metricType', 'time_series');

      // 3. Breakdown por media_product_type (POST vs STORY vs REELS)
      const mediaBreakdownParams = new URLSearchParams(baseParams);
      mediaBreakdownParams.set('metrics', 'reach');
      mediaBreakdownParams.set('breakdown', 'media_product_type');

      // 4. Breakdown por follow_type (FOLLOWER vs NON_FOLLOWER)
      const followBreakdownParams = new URLSearchParams(baseParams);
      followBreakdownParams.set('metrics', 'reach');
      followBreakdownParams.set('breakdown', 'follow_type');

      const [totalRes, tsRes, mediaRes, followRes] = await Promise.all([
        fetch(`${this.baseUrl}/analytics/instagram/account-insights?${totalParams.toString()}`, {
          method: 'GET',
          headers: this.getHeaders(),
        }).catch(() => null),
        fetch(`${this.baseUrl}/analytics/instagram/account-insights?${timeSeriesParams.toString()}`, {
          method: 'GET',
          headers: this.getHeaders(),
        }).catch(() => null),
        fetch(`${this.baseUrl}/analytics/instagram/account-insights?${mediaBreakdownParams.toString()}`, {
          method: 'GET',
          headers: this.getHeaders(),
        }).catch(() => null),
        fetch(`${this.baseUrl}/analytics/instagram/account-insights?${followBreakdownParams.toString()}`, {
          method: 'GET',
          headers: this.getHeaders(),
        }).catch(() => null),
      ]);

      if (!totalRes || !totalRes.ok) {
        return null;
      }

      const totalData = await totalRes.json();
      const m = totalData.metrics || {};

      const views = m.views?.total ?? m.views ?? totalData.views ?? totalData.impressions ?? 0;
      const reach = m.reach?.total ?? m.reach ?? totalData.reach ?? 0;
      const interactions =
        m.total_interactions?.total ??
        m.total_interactions ??
        m.interactions?.total ??
        totalData.totalInteractions ??
        totalData.interactions ??
        0;
      const accountsEngaged =
        m.accounts_engaged?.total ?? m.accounts_engaged ?? totalData.accountsEngaged ?? 0;
      const profileLinksTaps = m.profile_links_taps?.total ?? m.profile_links_taps ?? 0;
      const likes = m.likes?.total ?? m.likes ?? 0;
      const comments = m.comments?.total ?? m.comments ?? 0;
      const shares = m.shares?.total ?? m.shares ?? 0;
      const saves = m.saves?.total ?? m.saves ?? 0;

      // Parse time series
      let dailyMetrics: Array<{
        date: string;
        views?: number;
        reach?: number;
        interactions?: number;
        followers?: number;
      }> = [];

      if (tsRes && tsRes.ok) {
        const tsData = await tsRes.json();
        const reachValues = tsData.metrics?.reach?.values || [];
        const viewRatio = reach > 0 ? views / reach : 1.5;

        dailyMetrics = reachValues.map((v: any) => {
          const dayReach = Number(v.value) || 0;
          const dayViews = Math.round(dayReach * viewRatio);
          return {
            date: v.date,
            reach: dayReach,
            views: dayViews,
            interactions: dayReach > 0 ? Math.max(1, Math.round((dayReach / reach) * interactions)) : 0,
          };
        });
      }

      // Parse breakdowns
      const mediaProductType: Record<string, number> = {};
      if (mediaRes && mediaRes.ok) {
        const mediaData = await mediaRes.json();
        const list = mediaData.metrics?.reach?.breakdowns || [];
        list.forEach((b: any) => {
          mediaProductType[b.dimension] = Number(b.value) || 0;
        });
      }

      const followType: Record<string, number> = {};
      if (followRes && followRes.ok) {
        const followData = await followRes.json();
        const list = followData.metrics?.reach?.breakdowns || [];
        list.forEach((b: any) => {
          followType[b.dimension] = Number(b.value) || 0;
        });
      }

      return {
        views,
        reach,
        interactions,
        accountsEngaged,
        profileLinksTaps,
        likes,
        comments,
        shares,
        saves,
        breakdowns: {
          mediaProductType,
          followType,
        },
        dailyMetrics,
      };
    } catch (err: any) {
      console.warn('[ZernioClient] getInstagramInsights notice:', err?.message);
      return null;
    }
  }

  /**
   * Busca série histórica diária de seguidores mantida pelo snapshotter do Zernio
   */
  async getFollowerHistory(
    accountId: string,
    startDateOrOptions?: string | { period?: string; startDate?: string; endDate?: string; since?: string; until?: string },
    endDateParam?: string
  ) {
    try {
      const params = new URLSearchParams({ accountId });
      let since: string | undefined;
      let until: string | undefined;

      if (typeof startDateOrOptions === 'object' && startDateOrOptions !== null) {
        since = startDateOrOptions.since || startDateOrOptions.startDate;
        until = startDateOrOptions.until || startDateOrOptions.endDate;
      } else {
        since = startDateOrOptions;
        until = endDateParam;
      }

      if (since) {
        params.set('since', since);
        params.set('startDate', since);
      }
      if (until) {
        params.set('until', until);
        params.set('endDate', until);
      }

      const res = await fetch(`${this.baseUrl}/analytics/instagram/follower-history?${params.toString()}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err: any) {
      console.warn('[ZernioClient] getFollowerHistory notice:', err?.message);
    }
    return null;
  }

  /**
   * Busca demografia da audiência (Gênero, Faixa Etária, Cidades, Países)
   */
  async getDemographics(accountId: string): Promise<ZernioDemographics | null> {
    try {
      const res = await fetch(`${this.baseUrl}/analytics/instagram/demographics?accountId=${accountId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const demo = data.demographics || {};

      // Cidades ordenadas e formatadas
      const rawCities = demo.city || [];
      const sortedCities = [...rawCities].sort((a: any, b: any) => (b.value || 0) - (a.value || 0));
      const totalCityCount = sortedCities.reduce((acc: number, c: any) => acc + (c.value || 0), 0);

      const stateMap: Record<string, string> = {
        'Santa Catarina': 'SC',
        'São Paulo (state)': 'SP',
        'Rio Grande do Sul': 'RS',
        'Rio de Janeiro (state)': 'RJ',
        'Minas Gerais': 'MG',
        'Goiás': 'GO',
        'Alagoas': 'AL',
        'Paraná': 'PR',
      };

      const topCities = sortedCities.slice(0, 5).map((c: any) => {
        let name = c.dimension || '';
        for (const [st, uf] of Object.entries(stateMap)) {
          name = name.replace(st, uf);
        }
        const pct = totalCityCount > 0 ? Math.round(((c.value || 0) / totalCityCount) * 100) : 0;
        return {
          city: name,
          percentage: pct,
          count: c.value,
        };
      });

      // Gênero
      const rawGender = demo.gender || [];
      let femaleCount = 0;
      let maleCount = 0;
      rawGender.forEach((g: any) => {
        if (g.dimension === 'F') femaleCount += g.value || 0;
        if (g.dimension === 'M') maleCount += g.value || 0;
      });
      const totalGender = femaleCount + maleCount;
      const femalePct = totalGender > 0 ? Math.round((femaleCount / totalGender) * 100) : 52;
      const malePct = totalGender > 0 ? 100 - femalePct : 48;

      // Idades
      const rawAge = demo.age || [];
      const totalAge = rawAge.reduce((acc: number, a: any) => acc + (a.value || 0), 0);
      const ageGroups = [
        { label: '18-24 anos', keys: ['18-24'] },
        { label: '25-34 anos', keys: ['25-34'] },
        { label: '35-44 anos', keys: ['35-44'] },
        { label: '45+ anos', keys: ['45-54', '55-64', '65+'] },
      ];

      const ageRanges = ageGroups.map((grp) => {
        const sum = rawAge
          .filter((a: any) => grp.keys.includes(a.dimension))
          .reduce((s: number, a: any) => s + (a.value || 0), 0);
        const pct = totalAge > 0 ? Math.round((sum / totalAge) * 100) : 0;
        return { label: grp.label, pct };
      });

      // Países
      const rawCountries = demo.country || [];
      const totalCountryCount = rawCountries.reduce((acc: number, c: any) => acc + (c.value || 0), 0);
      const topCountries = rawCountries.slice(0, 5).map((c: any) => ({
        country: c.dimension,
        percentage: totalCountryCount > 0 ? Math.round(((c.value || 0) / totalCountryCount) * 100) : 0,
        count: c.value,
      }));

      const genderAgeDistribution: Record<string, number> = {
        'F.total': femaleCount,
        'M.total': maleCount,
      };

      return {
        genderAgeDistribution,
        topCities,
        topCountries,
        femalePct,
        malePct,
        ageRanges,
      };
    } catch (err: any) {
      console.warn('[ZernioClient] getDemographics notice:', err?.message);
      return null;
    }
  }

  /**
   * Busca curva de decaimento de engajamento do conteúdo
   */
  async getContentDecay(accountId: string) {
    try {
      const res = await fetch(`${this.baseUrl}/analytics/content-decay?accountId=${accountId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err: any) {
      console.warn('[ZernioClient] getContentDecay notice:', err?.message);
    }
    return null;
  }

  /**
   * Busca correlação de frequência de postagem vs engajamento
   */
  async getPostingFrequency(accountId: string) {
    try {
      const res = await fetch(`${this.baseUrl}/analytics/posting-frequency?accountId=${accountId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err: any) {
      console.warn('[ZernioClient] getPostingFrequency notice:', err?.message);
    }
    return null;
  }

  /**
   * Busca as publicações mais recentes sincronizadas ao vivo da plataforma
   */
  async getAccountPosts(accountId: string, limit: number = 25): Promise<ZernioPost[]> {
    try {
      const res = await fetch(`${this.baseUrl}/accounts/${accountId}/posts?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      const list = data.posts || data || [];

      return list.map((p: any) => ({
        id: p.id || p._id,
        caption: p.message || p.caption || p.text || '',
        mediaType: (p.mediaType || p.type || (p.picture ? 'IMAGE' : 'POST')).toUpperCase(),
        mediaUrl: p.picture || p.mediaUrl || p.url || '',
        thumbnailUrl: p.picture || p.thumbnailUrl || p.thumbnail_url || p.mediaUrl || '',
        permalink: p.permalink || p.url || `https://instagram.com/p/${p.id}`,
        likeCount: p.likeCount ?? p.likes ?? 0,
        commentsCount: p.commentCount ?? p.commentsCount ?? p.comments ?? 0,
        publishedAt: p.createdTime || p.publishedAt || p.timestamp || p.createdAt || new Date().toISOString(),
      }));
    } catch (err: any) {
      console.warn('[ZernioClient] getAccountPosts notice:', err?.message);
      return [];
    }
  }

  /**
   * Publica ou agenda uma publicação oficial com suporte a 1º comentário
   */
  async createPost(params: {
    accountId: string;
    content: string;
    mediaUrls?: string[];
    publishAt?: string;
    firstComment?: string;
  }) {
    const body: any = {
      platforms: [
        {
          platform: 'instagram',
          accountId: params.accountId,
        },
      ],
      content: params.content,
    };

    if (params.mediaUrls && params.mediaUrls.length > 0) {
      body.media = params.mediaUrls.map((url) => ({
        type: url.match(/\.(mp4|mov)$/i) ? 'video' : 'image',
        url,
      }));
    }

    if (params.publishAt) {
      body.scheduledFor = params.publishAt;
    } else {
      body.publishNow = true;
    }

    if (params.firstComment) {
      body.platformSpecificData = {
        instagram: {
          firstComment: params.firstComment,
        },
      };
    }

    const res = await fetch(`${this.baseUrl}/posts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || errJson.message || 'Falha ao criar publicação no Zernio');
    }

    return await res.json();
  }

  /**
   * Configura Ice Breakers (Perguntas Rápidas de FAQ no Direct do Instagram)
   */
  async setIceBreakers(accountId: string, questions: Array<{ question: string; payload?: string }>) {
    const res = await fetch(`${this.baseUrl}/account-settings/instagram/ice-breakers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        accountId,
        iceBreakers: questions.slice(0, 4),
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || errJson.message || 'Falha ao configurar Ice Breakers');
    }

    return await res.json();
  }

  /**
   * Desconecta e remove uma conta social no Zernio
   */
  async deleteAccount(accountId: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/accounts/${accountId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return res.ok;
    } catch (err: any) {
      console.warn('[ZernioClient] deleteAccount notice:', err?.message);
      return false;
    }
  }
}

export const zernioClient = new ZernioClient();
