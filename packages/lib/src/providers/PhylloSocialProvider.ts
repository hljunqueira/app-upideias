import {
  SocialAccount,
  SocialAccountMetrics,
  SocialContent,
  SocialContentMetrics,
  AudienceMetrics,
  SocialPlatform,
} from '@up-analytics/types';
import { SocialProvider } from './SocialProvider';
import { PhylloClient, phylloClient } from '../phyllo/client';
import { PhylloAccountData, PhylloProfileData } from '../phyllo/types';

export class PhylloSocialProvider implements SocialProvider {
  private client: PhylloClient;

  constructor(client: PhylloClient = phylloClient) {
    this.client = client;
  }

  async connectAccount(platform: SocialPlatform): Promise<SocialAccount> {
    throw new Error('Conexão de contas ocorre no cliente browser via Phyllo Connect SDK.');
  }

  async getAccount(accountId: string): Promise<SocialAccount> {
    const rawAccount = await this.client.getAccount(accountId);
    return this.mapAccountToDomain(rawAccount);
  }

  async getAccountMetrics(accountId: string, periodDays: number): Promise<SocialAccountMetrics[]> {
    return [];
  }

  async getContent(accountId: string): Promise<SocialContent[]> {
    return [];
  }

  async getContentMetrics(contentId: string): Promise<SocialContentMetrics[]> {
    return [];
  }

  async getAudience(accountId: string): Promise<AudienceMetrics> {
    return {
      accountId,
      platform: 'instagram',
      ageDistribution: {},
      genderDistribution: {},
      topCities: [],
      topCountries: [],
      peakActiveHours: [],
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Mapper: Converts Phyllo API DTO (snake_case) to UP Analytics Domain (camelCase)
   */
  mapAccountToDomain(rawAccount: PhylloAccountData, rawProfile?: PhylloProfileData, userId?: string): SocialAccount {
    const platformMap: Record<string, SocialPlatform> = {
      instagram: 'instagram',
      tiktok: 'tiktok',
      youtube: 'youtube',
      linkedin: 'linkedin',
      x: 'x',
      twitter: 'x',
    };

    const workPlatform = (rawAccount.work_platform_name || rawAccount.work_platform_id || 'instagram').toLowerCase();
    const platform: SocialPlatform = platformMap[workPlatform] || 'instagram';

    const followersCount = rawProfile?.reputation?.follower_count || 0;
    const username = rawProfile?.username || rawAccount.platform_username || 'perfil_social';

    return {
      id: rawAccount.id,
      user_id: userId || rawAccount.user_id,
      client_id: null,
      platform,
      externalAccountId: rawAccount.id,
      username,
      name: rawProfile?.full_name || username,
      profile_picture_url: rawProfile?.profile_picture_url || null,
      account_type: 'business',
      followers_count: followersCount,
      media_count: 0,
      connected_at: rawAccount.created_at || new Date().toISOString(),
      disconnected_at: rawAccount.status === 'DISCONNECTED' ? new Date().toISOString() : null,
      status: rawAccount.status === 'CONNECTED' ? 'connected' : 'disconnected',
      created_at: rawAccount.created_at || new Date().toISOString(),
      updated_at: rawAccount.updated_at || new Date().toISOString(),
    };
  }
}
