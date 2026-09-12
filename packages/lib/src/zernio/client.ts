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
  topCities?: Array<{ city: string; percentage: number }>;
  topCountries?: Array<{ country: string; percentage: number }>;
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
      const res = await fetch(`${this.baseUrl}/accounts/${accountId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const raw = data.account || data;

      return {
        _id: raw._id || accountId,
        platform: raw.platform || 'instagram',
        username: raw.username || raw.accountUsernames?.[0] || 'perfil',
        displayName: raw.displayName || raw.name || raw.username || 'Perfil Conectado',
        profilePictureUrl: raw.profilePictureUrl || raw.profile_picture_url || '',
        bio: raw.bio || raw.biography || '',
        followersCount: raw.followersCount || raw.followers_count || 0,
        followingCount: raw.followingCount || raw.following_count || 0,
        mediaCount: raw.mediaCount || raw.media_count || 0,
        tokenStatus: raw.tokenStatus || 'active',
        profileId: raw.profileId,
        connectedAt: raw.connectedAt || raw.createdAt || new Date().toISOString(),
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

      return list.map((raw: any) => ({
        _id: raw._id,
        platform: raw.platform || 'instagram',
        username: raw.username || raw.accountUsernames?.[0] || 'perfil',
        displayName: raw.displayName || raw.name || raw.username || 'Perfil Conectado',
        profilePictureUrl: raw.profilePictureUrl || raw.profile_picture_url || '',
        bio: raw.bio || raw.biography || '',
        followersCount: raw.followersCount || raw.followers_count || 0,
        followingCount: raw.followingCount || raw.following_count || 0,
        mediaCount: raw.mediaCount || raw.media_count || 0,
        tokenStatus: raw.tokenStatus || 'active',
        profileId: raw.profileId,
        connectedAt: raw.connectedAt || raw.createdAt,
      }));
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
   * Busca insights agregados do Instagram (Alcance, Visualizações, Contas com engajamento, Interações)
   */
  async getInstagramInsights(
    accountId: string,
    startDateOrOptions?: string | { period?: string; startDate?: string; endDate?: string },
    endDateParam?: string
  ): Promise<ZernioInsightsData | null> {
    try {
      const params = new URLSearchParams({ accountId });
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (typeof startDateOrOptions === 'object' && startDateOrOptions !== null) {
        startDate = startDateOrOptions.startDate;
        endDate = startDateOrOptions.endDate;
        if (startDateOrOptions.period) {
          params.set('period', startDateOrOptions.period);
        }
      } else {
        startDate = startDateOrOptions;
        endDate = endDateParam;
      }

      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await fetch(`${this.baseUrl}/analytics/instagram/account-insights?${params.toString()}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return {
        views: data.views || data.impressions || 0,
        reach: data.reach || 0,
        interactions: data.totalInteractions || data.interactions || 0,
        accountsEngaged: data.accountsEngaged || 0,
        dailyMetrics: data.daily || [],
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
    startDateOrOptions?: string | { period?: string; startDate?: string; endDate?: string },
    endDateParam?: string
  ) {
    try {
      const params = new URLSearchParams({ accountId });
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (typeof startDateOrOptions === 'object' && startDateOrOptions !== null) {
        startDate = startDateOrOptions.startDate;
        endDate = startDateOrOptions.endDate;
        if (startDateOrOptions.period) {
          params.set('period', startDateOrOptions.period);
        }
      } else {
        startDate = startDateOrOptions;
        endDate = endDateParam;
      }

      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

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
      return {
        genderAgeDistribution: data.genderAge || data.age || {},
        topCities: data.cities || [],
        topCountries: data.countries || [],
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
   * Busca as 25 publicações mais recentes sincronizadas ao vivo da plataforma
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
        caption: p.caption || p.text || '',
        mediaType: (p.mediaType || p.type || 'IMAGE').toUpperCase(),
        mediaUrl: p.mediaUrl || p.url || '',
        thumbnailUrl: p.thumbnailUrl || p.thumbnail_url || p.mediaUrl || '',
        permalink: p.permalink || p.url || `https://instagram.com/p/${p.id}`,
        likeCount: p.likeCount || p.likes || 0,
        commentsCount: p.commentsCount || p.comments || 0,
        publishedAt: p.publishedAt || p.timestamp || p.createdAt || new Date().toISOString(),
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
