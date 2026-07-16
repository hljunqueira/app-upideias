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
  const { data, error } = await supabase
    .from('instagram_accounts')
    .select('*')
    .eq('status', 'connected');

  if (error || !data) {
    return [];
  }
  return data as InstagramAccount[];
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
