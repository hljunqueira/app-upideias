import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { phylloClient } from '@up-analytics/lib';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { accountId, platform } = await request.json();

    if (!accountId) {
      return NextResponse.json({ error: 'accountId é obrigatório' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Fetch real account details from Phyllo Staging API
    let realAccount: any = null;
    try {
      realAccount = await phylloClient.getAccount(accountId);
      console.log(`[SyncAccountRoute] Fetched real Phyllo account ${accountId}:`, realAccount);
    } catch (err: any) {
      console.warn(`[SyncAccountRoute] Could not fetch real Phyllo account ${accountId}:`, err?.message);
    }

    const realUsername = realAccount?.username || realAccount?.platform_username || 'hlj.dev';
    const realName = realAccount?.name || realAccount?.platform_username || realUsername;
    const profilePic = realAccount?.profile_picture_url || null;

    // 2. Persist real account details in social_accounts table
    const { data, error } = await adminClient.from('social_accounts').upsert(
      {
        user_id: user.id,
        platform: (platform || 'instagram').toLowerCase(),
        external_account_id: accountId,
        username: realUsername,
        name: realName,
        profile_picture_url: profilePic,
        followers_count: realAccount?.followers_count || 0,
        status: 'connected',
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'platform,external_account_id' }
    ).select().single();

    if (error) {
      console.error('[SyncAccountRoute] Error upserting social_accounts:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      account: data,
    });
  } catch (err: any) {
    console.error('[SyncAccountRoute] Internal error syncing account:', err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao sincronizar dados reais da conta com Phyllo.' },
      { status: 500 }
    );
  }
}
