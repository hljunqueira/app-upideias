export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
  whatsapp_opt_in: boolean;
  whatsapp_opt_in_at: string | null;
  whatsapp_opt_out_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string;
  monthly_price_cents: number;
  annual_price_cents: number;
  trial_days: number;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PlanLimits {
  id: string;
  plan_id: string;
  max_instagram_accounts: number;
  max_users: number;
  max_ai_requests_month: number;
  history_days: number;
  max_clients: number;
  max_scheduled_posts: number;
  max_whatsapp_messages_month: number;
  created_at: string;
  updated_at: string;
}

export interface PlanFeature {
  id: string;
  plan_id: string;
  feature_key: string;
  feature_name: string;
  feature_description: string;
  is_enabled: boolean;
  limit_value: number | null;
  config: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  payment_provider: string;
  payment_provider_customer_id: string;
  payment_provider_subscription_id: string;
  created_at: string;
  updated_at: string;
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'x';

/**
 * Modelo de domínio público seguro para UI e Frontend.
 * NÃO contém tokens ou segredos de acesso ao provedor.
 */
export interface SocialAccount {
  id: string;
  user_id: string;
  client_id: string | null;
  platform: SocialPlatform;
  externalAccountId: string;
  username: string;
  name: string | null;
  profile_picture_url: string | null;
  account_type: string;
  followers_count: number;
  media_count: number;
  connected_at: string;
  disconnected_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;

  // Campos de identificação legados para compatibilidade (deprecados)
  instagram_user_id?: string;
}

/**
 * Credenciais secretas gerenciadas EXCLUSIVAMENTE pelo backend/worker seguro.
 * RESTRIÇÃO DE SEGURANÇA:
 * - NÃO utilizar em componentes React UI;
 * - NÃO serializar para o browser ou respostas de API pública;
 * - NÃO armazenar em stores do frontend (Zustand/Redux/Context).
 */
export interface SocialConnectionCredentials {
  accountId: string;
  platform: SocialPlatform;
  accessToken: string;
  refreshToken?: string | null;
  tokenExpiresAt?: string | null;
}

export type InstagramAccount = SocialAccount;

export interface SocialAccountMetrics {
  id: string;
  accountId: string;
  platform: SocialPlatform;
  metric_date: string;
  followers_count: number;
  reach: number;
  views: number;
  profile_views: number;
  website_clicks: number;
  interactions: number;
  engagement_rate: number;
  created_at: string;

  // Campo de compatibilidade legada
  instagram_account_id?: string;
}

export type InstagramDailyMetrics = SocialAccountMetrics;

export interface SocialContent {
  id: string;
  accountId: string;
  externalContentId: string;
  platform: SocialPlatform;
  media_type: string;
  media_product_type: string;
  caption: string | null;
  permalink: string;
  thumbnail_url: string | null;
  media_url: string;
  published_at: string;
  published_weekday: number;
  published_hour: number;
  like_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;

  // Campos de compatibilidade legada
  instagram_account_id?: string;
  instagram_media_id?: string;
}

export type InstagramMedia = SocialContent;

export interface SocialContentMetrics {
  id: string;
  contentId: string;
  metric_date: string;
  reach: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  total_interactions: number;
  engagement_rate: number;
  created_at: string;

  // Campo de compatibilidade legada
  instagram_media_id?: string;
}

export type InstagramMediaMetrics = SocialContentMetrics;

export interface AudienceMetrics {
  accountId: string;
  platform: SocialPlatform;
  ageDistribution: Record<string, number>;
  genderDistribution: Record<string, number>;
  topCities: Array<{ city: string; country: string; percentage: number }>;
  topCountries: Array<{ country: string; percentage: number }>;
  peakActiveHours: Array<{ hour: number; dayOfWeek: number; engagementScore: number }>;
  updatedAt: string;
}

export interface AiRequest {
  id: string;
  user_id: string;
  instagram_account_id: string;
  request_type: string;
  prompt_tokens: number;
  completion_tokens: number;
  status: string;
  created_at: string;
}

export interface AiInsight {
  id: string;
  user_id: string;
  instagram_account_id: string;
  period_start: string;
  period_end: string;
  insight_type: string;
  title: string;
  summary: string;
  what_improved: any;
  what_got_worse: any;
  opportunities: any;
  recommended_actions: any;
  content_suggestions: any;
  created_at: string;
}

export interface ContentIdea {
  id: string;
  user_id: string;
  client_id: string | null;
  instagram_account_id: string;
  format: string;
  objective: string;
  niche: string;
  tone: string;
  theme: string;
  title: string;
  hook: string;
  caption: string;
  script: string;
  cta: string;
  hashtags: string[];
  visual_suggestion: string;
  status: string;
  planned_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentCalendar {
  id: string;
  user_id: string;
  client_id: string | null;
  content_idea_id: string;
  instagram_account_id: string;
  planned_date: string;
  planned_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentApproval {
  id: string;
  user_id: string;
  client_id: string | null;
  content_idea_id: string;
  status: string;
  client_comment: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentLibrary {
  id: string;
  user_id: string;
  client_id: string | null;
  type: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  owner_user_id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  weekly_report: boolean;
  daily_tips: boolean;
  performance_alerts: boolean;
  billing_alerts: boolean;
  token_alerts: boolean;
  post_reminders: boolean;
  preferred_time: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  user_id: string;
  client_id: string | null;
  instagram_account_id: string;
  type: string;
  phone: string;
  message: string;
  status: string;
  provider_message_id: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface AutomationEvent {
  id: string;
  user_id: string;
  event_type: string;
  payload: any;
  status: string;
  processed_at: string | null;
  created_at: string;
}

export interface SyncLog {
  id: string;
  instagram_account_id: string;
  status: string;
  message: string;
  started_at: string;
  finished_at: string | null;
  created_at: string;
}

export interface UpCreatorCourse {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  required_feature_key: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpCreatorLesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  material_url: string | null;
  required_feature_key: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpCreatorProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  watched_seconds: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
