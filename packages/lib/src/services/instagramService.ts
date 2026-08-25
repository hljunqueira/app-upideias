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
      .from('social_accounts')
      .select('*')
      .eq('status', 'connected')
      .order('connected_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((acc: any) => ({
        id: acc.id,
        user_id: acc.user_id,
        username: acc.platform_username || acc.username || acc.account_name || 'perfil',
        account_name: acc.account_name || acc.name || 'Perfil Conectado',
        profile_picture_url: acc.profile_picture_url || '',
        bio: acc.bio || '',
        followers_count: acc.followers_count || 0,
        following_count: acc.following_count || 0,
        media_count: acc.media_count || 0,
        status: acc.status || 'connected',
        connected_at: acc.connected_at || acc.created_at || new Date().toISOString()
      })) as unknown as InstagramAccount[];
    }
  } catch (e) {
    // Fallback
  }

  try {
    const { data, error } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('status', 'connected');

    if (!error && data && data.length > 0) {
      return data as InstagramAccount[];
    }
  } catch (err) {
    console.warn('[instagramService] instagram_accounts fetch notice:', err);
  }

  return [];
}

export async function getDashboardMetrics(accountId: string): Promise<InstagramDailyMetrics[]> {
  try {
    const { data, error } = await supabase
      .from('social_account_metrics')
      .select('*')
      .eq('account_id', accountId)
      .order('metric_date', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((m: any) => ({
        id: m.id,
        instagram_account_id: accountId,
        metric_date: m.metric_date || m.date || new Date().toISOString().split('T')[0],
        followers_count: m.followers_count || 0,
        reach: m.reach || m.impressions || 0,
        paid_reach: m.paid_reach || 0,
        impressions: m.impressions || 0,
        engagement_rate: m.engagement_rate || 0,
        created_at: m.created_at || new Date().toISOString()
      })) as unknown as InstagramDailyMetrics[];
    }
  } catch (err) {
    console.warn('[instagramService] social_account_metrics fetch notice:', err);
  }

  try {
    const { data, error } = await supabase
      .from('instagram_daily_metrics')
      .select('*')
      .eq('instagram_account_id', accountId)
      .order('metric_date', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as InstagramDailyMetrics[];
    }
  } catch (err) {
    console.warn('[instagramService] instagram_daily_metrics fetch notice:', err);
  }

  return [];
}

export async function getInstagramPosts(accountId: string): Promise<InstagramMedia[]> {
  try {
    const { data, error } = await supabase
      .from('social_content')
      .select('*')
      .eq('account_id', accountId)
      .order('published_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((post: any) => ({
        id: post.id,
        instagram_account_id: accountId,
        media_type: post.media_type || post.content_type || 'IMAGE',
        caption: post.caption || '',
        media_url: post.media_url || '',
        permalink: post.permalink || 'https://instagram.com',
        thumbnail_url: post.thumbnail_url || post.media_url || '',
        published_at: post.published_at || new Date().toISOString(),
        like_count: post.like_count || 0,
        comments_count: post.comments_count || 0
      })) as unknown as InstagramMedia[];
    }
  } catch (err) {
    console.warn('[instagramService] social_content fetch notice:', err);
  }
  try {
    const { data, error } = await supabase
      .from('instagram_media')
      .select('*')
      .eq('instagram_account_id', accountId)
      .order('published_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as InstagramMedia[];
    }
  } catch (err) {
    console.warn('[instagramService] instagram_media fetch notice:', err);
  }

  return [];
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
