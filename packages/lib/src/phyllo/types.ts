/**
 * Browser / Connect SDK Event Names
 */
export type PhylloBrowserEvent =
  | 'accountConnected'
  | 'accountDisconnected'
  | 'tokenExpired'
  | 'exit'
  | 'connectionFailure';

/**
 * Official Phyllo Webhook Event Types (UPPERCASE)
 */
export type PhylloWebhookEventType =
  | 'ACCOUNTS.CONNECTED'
  | 'ACCOUNTS.DISCONNECTED'
  | 'ACCOUNTS.STATUS_UPDATED'
  | 'PROFILES.ADDED'
  | 'PROFILES.UPDATED'
  | 'CONTENTS.ADDED'
  | 'CONTENTS.UPDATED'
  | string;

export interface PhylloUser {
  id: string;
  name: string;
  external_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface PhylloUsersListResponse {
  data: PhylloUser[];
  offset?: number;
  limit?: number;
}

export interface PhylloSdkTokenRequest {
  user_id: string;
  products: string[];
}

export interface PhylloSdkTokenResponse {
  sdk_token: string;
  expires_at: string;
  user_id: string;
}

export interface PhylloAccountData {
  id: string;
  user_id: string;
  work_platform_id: string;
  work_platform_name?: string;
  platform_username?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface PhylloProfileData {
  id: string;
  account_id: string;
  user_id: string;
  work_platform_id: string;
  username: string;
  full_name?: string;
  profile_picture_url?: string;
  reputation?: {
    follower_count?: number;
    following_count?: number;
    subscribers_count?: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface PhylloWebhookPayload {
  event: PhylloWebhookEventType;
  event_id: string;
  account_id?: string;
  user_id?: string;
  work_platform_id?: string;
  profile_id?: string;
  timestamp?: string;
  data?: Record<string, any>;
}
