import {
  SocialAccount,
  SocialAccountMetrics,
  SocialContent,
  SocialContentMetrics,
  AudienceMetrics,
  SocialPlatform,
} from '@up-analytics/types';

export interface SocialProvider {
  connectAccount(platform: SocialPlatform): Promise<SocialAccount>;
  getAccount(accountId: string): Promise<SocialAccount>;
  getAccountMetrics(accountId: string, periodDays: number): Promise<SocialAccountMetrics[]>;
  getContent(accountId: string): Promise<SocialContent[]>;
  getContentMetrics(contentId: string): Promise<SocialContentMetrics[]>;
  getAudience(accountId: string): Promise<AudienceMetrics>;
}
