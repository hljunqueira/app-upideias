import { InstagramAccount, InstagramDailyMetrics, InstagramMedia, InstagramMediaMetrics } from '@up-analytics/types';
import { supabase } from '../supabase';

export async function mockSyncInstagramMetrics(accountId: string): Promise<boolean> {
  const { error } = await supabase.from('sync_logs').insert({
    instagram_account_id: accountId,
    status: 'success',
    message: 'Métricas sincronizadas via VPS',
    finished_at: new Date().toISOString()
  });
  return !error;
}

export async function getInstagramAccounts(): Promise<InstagramAccount[]> {
  try {
    const { data, error } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('status', 'connected');

    if (!error && data && data.length > 0) {
      return data as InstagramAccount[];
    }
  } catch (e) {
    // Ignora e tenta fallback na tabela social_accounts
  }

  try {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('status', 'connected');

    if (!error && data) {
      return data.map((acc: any) => ({
        id: acc.id,
        user_id: acc.user_id,
        username: acc.platform_username || acc.username || acc.account_name || 'perfil',
        account_name: acc.account_name || acc.name || 'Perfil Conectado',
        profile_picture_url: acc.profile_picture_url || '',
        followers_count: acc.followers_count || 0,
        status: acc.status || 'connected',
        connected_at: acc.connected_at || acc.created_at || new Date().toISOString()
      })) as unknown as InstagramAccount[];
    }
  } catch (e) {}

  return [];
}

export async function getDashboardMetrics(accountId: string): Promise<InstagramDailyMetrics[]> {
  const { data, error } = await supabase
    .from('instagram_daily_metrics')
    .select('*')
    .eq('instagram_account_id', accountId)
    .order('metric_date', { ascending: true });

  if (error || !data) return [];
  return data as InstagramDailyMetrics[];
}

export async function getInstagramPosts(accountId: string): Promise<InstagramMedia[]> {
  const { data, error } = await supabase
    .from('instagram_media')
    .select('*')
    .eq('instagram_account_id', accountId)
    .order('published_at', { ascending: false });

  if (error || !data) return [];
  return data as InstagramMedia[];
}

export async function getPostDetails(postId: string): Promise<InstagramMedia> {
  const { data, error } = await supabase
    .from('instagram_media')
    .select('*')
    .eq('id', postId)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Post não encontrado');
  }
  return data as InstagramMedia;
}

export async function getPostMetrics(postId: string): Promise<InstagramMediaMetrics[]> {
  const { data, error } = await supabase
    .from('instagram_media_metrics')
    .select('*')
    .eq('instagram_media_id', postId)
    .order('metric_date', { ascending: true });

  if (error || !data) return [];
  return data as InstagramMediaMetrics[];
}

export async function disconnectInstagramAccount(accountId: string): Promise<void> {
  await supabase
    .from('instagram_accounts')
    .update({ status: 'disconnected', disconnected_at: new Date().toISOString() })
    .eq('id', accountId);
}
