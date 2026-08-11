import {
  SocialPlatform,
  SocialAccount,
  SocialAccountMetrics,
  SocialContent,
  SocialContentMetrics,
  AudienceMetrics
} from '@up-analytics/types';

export interface SocialProvider {
  connectAccount(platform: SocialPlatform): Promise<SocialAccount>;
  getAccount(accountId: string): Promise<SocialAccount>;
  getAccountMetrics(accountId: string, periodDays: number): Promise<SocialAccountMetrics[]>;
  getContent(accountId: string): Promise<SocialContent[]>;
  getContentMetrics(contentId: string): Promise<SocialContentMetrics[]>;
  getAudience(accountId: string): Promise<AudienceMetrics>;
}

export class MockSocialProvider implements SocialProvider {
  async connectAccount(platform: SocialPlatform): Promise<SocialAccount> {
    return {
      id: "acc_demo_1",
      user_id: "user_demo",
      client_id: null,
      platform,
      instagram_user_id: "17841400000000000",
      username: "upideias.oficial",
      name: "UP Ideias",
      profile_picture_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
      account_type: "BUSINESS",
      followers_count: 14200,
      media_count: 184,
      access_token: "mock_token",
      token_expires_at: null,
      connected_at: new Date().toISOString(),
      disconnected_at: null,
      status: "connected",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async getAccount(accountId: string): Promise<SocialAccount> {
    return this.connectAccount("instagram");
  }

  async getAccountMetrics(accountId: string, periodDays: number = 30): Promise<SocialAccountMetrics[]> {
    const metrics: SocialAccountMetrics[] = [];
    const now = new Date();
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      metrics.push({
        id: `metric_${i}`,
        instagram_account_id: accountId,
        metric_date: d.toISOString().split('T')[0],
        followers_count: 14000 + i * 10,
        reach: Math.floor(1200 + Math.random() * 800),
        views: Math.floor(2500 + Math.random() * 1500),
        profile_views: Math.floor(150 + Math.random() * 80),
        website_clicks: Math.floor(45 + Math.random() * 25),
        interactions: Math.floor(320 + Math.random() * 180),
        engagement_rate: Number((3.5 + Math.random() * 1.5).toFixed(2)),
        created_at: d.toISOString()
      });
    }
    return metrics;
  }

  async getContent(accountId: string): Promise<SocialContent[]> {
    return [
      {
        id: "content_1",
        instagram_account_id: accountId,
        instagram_media_id: "media_101",
        media_type: "VIDEO",
        media_product_type: "REELS",
        caption: "5 Estratégias de Conteúdo para 2026 #MarketingDigital #SocialMedia",
        permalink: "https://instagram.com/p/demo1",
        thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
        media_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
        published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        published_weekday: 2,
        published_hour: 18,
        like_count: 482,
        comments_count: 38,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  async getContentMetrics(contentId: string): Promise<SocialContentMetrics[]> {
    return [
      {
        id: `cm_${contentId}`,
        instagram_media_id: contentId,
        metric_date: new Date().toISOString().split('T')[0],
        reach: 4800,
        views: 8200,
        likes: 482,
        comments: 38,
        shares: 64,
        saves: 112,
        total_interactions: 696,
        engagement_rate: 4.8,
        created_at: new Date().toISOString()
      }
    ];
  }

  async getAudience(accountId: string): Promise<AudienceMetrics> {
    return {
      accountId,
      platform: "instagram",
      ageDistribution: {
        "18-24": 22,
        "25-34": 54,
        "35-44": 16,
        "45+": 8
      },
      genderDistribution: {
        "Feminino": 62,
        "Masculino": 38
      },
      topCities: [
        { city: "São Paulo", country: "Brasil", percentage: 34 },
        { city: "Rio de Janeiro", country: "Brasil", percentage: 18 },
        { city: "Belo Horizonte", country: "Brasil", percentage: 12 }
      ],
      topCountries: [
        { country: "Brasil", percentage: 92 },
        { country: "Portugal", percentage: 5 },
        { country: "Estados Unidos", percentage: 3 }
      ],
      peakActiveHours: [
        { hour: 12, dayOfWeek: 1, engagementScore: 85 },
        { hour: 18, dayOfWeek: 3, engagementScore: 94 },
        { hour: 21, dayOfWeek: 5, engagementScore: 90 }
      ],
      updatedAt: new Date().toISOString()
    };
  }
}

export const defaultSocialProvider: SocialProvider = new MockSocialProvider();
