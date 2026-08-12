import crypto from 'crypto';
import { PhylloUser, PhylloUsersListResponse, PhylloSdkTokenResponse, PhylloAccountData, PhylloProfileData } from './types';

/**
 * Validates HMAC SHA-256 signature from Phyllo-Signatures header against RAW body.
 * Supports comma-separated multiple signatures in header (e.g. durante rotação de chaves).
 */
export function verifyPhylloSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret || secret.trim() === '') {
    return false;
  }

  try {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex');

    const expectedBuffer = Buffer.from(computedSignature, 'utf8');
    const candidateSignatures = signatureHeader.split(',').map((s) => s.trim());

    for (const rawCandidate of candidateSignatures) {
      const cleanCandidate = rawCandidate.replace(/^(v\d+=|sha256=)/i, '').trim();
      const headerBuffer = Buffer.from(cleanCandidate, 'utf8');

      if (expectedBuffer.length === headerBuffer.length) {
        if (crypto.timingSafeEqual(expectedBuffer, headerBuffer)) {
          return true;
        }
      }
    }

    return false;
  } catch (err) {
    console.error('[PhylloClient] Error computing signature verification:', err);
    return false;
  }
}

export class PhylloClient {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor(options?: { baseUrl?: string; clientId?: string; clientSecret?: string }) {
    this.baseUrl = (options?.baseUrl || process.env.PHYLLO_BASE_URL || 'https://api.staging.getphyllo.com').replace(/\/$/, '');
    this.clientId = options?.clientId || process.env.PHYLLO_CLIENT_ID || '';
    this.clientSecret = options?.clientSecret || process.env.PHYLLO_CLIENT_SECRET || '';

    if (!this.clientId || !this.clientSecret) {
      console.warn('[PhylloClient] Warn: PHYLLO_CLIENT_ID or PHYLLO_CLIENT_SECRET is missing from environment variables.');
    }
  }

  private getAuthHeader(): string {
    const credentials = `${this.clientId}:${this.clientSecret}`;
    const encoded = typeof Buffer !== 'undefined'
      ? Buffer.from(credentials).toString('base64')
      : btoa(credentials);
    return `Basic ${encoded}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': this.getAuthHeader(),
      ...(options.headers as Record<string, string> || {}),
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err: any) {
      console.error(`[PhylloClient] Network error calling ${endpoint}:`, err?.message || err);
      throw new Error(`Erro de rede ao conectar com Phyllo API: ${err?.message || 'Falha de conexão'}`);
    }

    const duration = Date.now() - startTime;
    const requestId = response.headers.get('x-request-id') || response.headers.get('request-id') || 'n/a';

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson: any = {};
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { message: errorText };
      }

      console.error(`[PhylloClient] Error HTTP ${response.status} | Endpoint: ${endpoint} | Duration: ${duration}ms | RequestId: ${requestId}`);

      // Rate limit 429
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(`Rate limit excedido na Phyllo API (429). Tente novamente em ${retryAfter || 5} segundos.`);
      }

      throw new Error(errorJson.message || errorJson.error_message || `Phyllo API retornou HTTP status ${response.status}`);
    }

    console.log(`[PhylloClient] Success HTTP ${response.status} | Endpoint: ${endpoint} | Duration: ${duration}ms | RequestId: ${requestId}`);
    return (await response.json()) as T;
  }

  /**
   * Idempotent user resolution:
   * 1. Check local DB table user_social_providers (if supabaseAdminClient provided)
   * 2. Query Phyllo API GET /v1/users?external_id=upideias:<SUPABASE_USER_ID>
   * 3. If found in Phyllo, persist and return ID
   * 4. Else, POST /v1/users and persist
   */
  async getOrCreateUser(
    supabaseUserId: string,
    userName?: string,
    supabaseAdminClient?: any
  ): Promise<string> {
    if (!supabaseUserId) {
      throw new Error('Supabase User ID é obrigatório para obter ou criar usuário Phyllo.');
    }

    const externalId = `upideias:${supabaseUserId}`;

    // Step 1: Query local DB if client is provided
    if (supabaseAdminClient) {
      try {
        const { data, error } = await supabaseAdminClient
          .from('user_social_providers')
          .select('phyllo_user_id')
          .eq('user_id', supabaseUserId)
          .eq('provider', 'phyllo')
          .maybeSingle();

        if (!error && data?.phyllo_user_id) {
          console.log(`[PhylloClient] Local database cache hit for user ${supabaseUserId} -> phyllo_user_id: ${data.phyllo_user_id}`);
          return data.phyllo_user_id;
        }
      } catch (dbErr: any) {
        console.warn(`[PhylloClient] Local user lookup notice: ${dbErr?.message}`);
      }
    }

    // Step 2: Query Phyllo API by external_id
    try {
      const existingList = await this.request<PhylloUsersListResponse>(`/v1/users?external_id=${encodeURIComponent(externalId)}`, {
        method: 'GET',
      });

      if (existingList?.data && existingList.data.length > 0) {
        const existingUser = existingList.data[0];
        console.log(`[PhylloClient] Found existing Phyllo user by external_id ${externalId} -> ID: ${existingUser.id}`);

        // Persist to local DB if client available
        if (supabaseAdminClient) {
          await supabaseAdminClient.from('user_social_providers').upsert(
            {
              user_id: supabaseUserId,
              provider: 'phyllo',
              phyllo_user_id: existingUser.id,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,provider' }
          );
        }
        return existingUser.id;
      }
    } catch (searchErr: any) {
      console.warn(`[PhylloClient] Phyllo search by external_id failed, attempting creation fallback: ${searchErr?.message}`);
    }

    // Step 3: Create new Phyllo user
    try {
      const newUser = await this.request<PhylloUser>('/v1/users', {
        method: 'POST',
        body: JSON.stringify({
          name: userName || 'Usuário UP',
          external_id: externalId,
        }),
      });

      console.log(`[PhylloClient] Created new Phyllo user for ${externalId} -> ID: ${newUser.id}`);

      if (supabaseAdminClient) {
        await supabaseAdminClient.from('user_social_providers').upsert(
          {
            user_id: supabaseUserId,
            provider: 'phyllo',
            phyllo_user_id: newUser.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,provider' }
        );
      }

      return newUser.id;
    } catch (createErr: any) {
      // Handles rare race condition if user was created concurrently
      const secondCheck = await this.request<PhylloUsersListResponse>(`/v1/users?external_id=${encodeURIComponent(externalId)}`, {
        method: 'GET',
      });
      if (secondCheck?.data && secondCheck.data.length > 0) {
        const phylloId = secondCheck.data[0].id;
        if (supabaseAdminClient) {
          await supabaseAdminClient.from('user_social_providers').upsert(
            { user_id: supabaseUserId, provider: 'phyllo', phyllo_user_id: phylloId, updated_at: new Date().toISOString() },
            { onConflict: 'user_id,provider' }
          );
        }
        return phylloId;
      }
      throw createErr;
    }
  }

  /**
   * Generates a temporary SDK token for Connect SDK Web
   */
  async createSdkToken(phylloUserId: string): Promise<PhylloSdkTokenResponse> {
    const products = [
      'IDENTITY',
      'IDENTITY.AUDIENCE',
      'ENGAGEMENT',
      'ENGAGEMENT.AUDIENCE',
      'INCOME',
      'ACTIVITY',
    ];

    try {
      return await this.request<PhylloSdkTokenResponse>('/v1/sdk-tokens', {
        method: 'POST',
        body: JSON.stringify({
          user_id: phylloUserId,
          products,
        }),
      });
    } catch (err: any) {
      // Fallback if some product is not enabled on account
      console.warn(`[PhylloClient] Product expansion failed, retrying with core products: ${err?.message}`);
      return await this.request<PhylloSdkTokenResponse>('/v1/sdk-tokens', {
        method: 'POST',
        body: JSON.stringify({
          user_id: phylloUserId,
          products: ['IDENTITY', 'ENGAGEMENT'],
        }),
      });
    }
  }

  /**
   * Fetch single account details from Phyllo
   */
  async getAccount(accountId: string): Promise<PhylloAccountData> {
    return await this.request<PhylloAccountData>(`/v1/accounts/${accountId}`, { method: 'GET' });
  }

  /**
   * Fetch profile details from Phyllo
   */
  async getProfile(profileId: string): Promise<PhylloProfileData> {
    return await this.request<PhylloProfileData>(`/v1/profiles/${profileId}`, { method: 'GET' });
  }
}

export const phylloClient = new PhylloClient();
