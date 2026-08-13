import { NextResponse } from 'next/server';
import { phylloClient } from '@up-analytics/lib';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId') || '925c4a4c-2c24-4541-8514-e1779c50c7c5';

    let accountRes: any = null;
    let profilesRes: any = null;
    let contentsRes: any = null;
    let accountErr: string | null = null;
    let profileErr: string | null = null;
    let contentsErr: string | null = null;

    try {
      accountRes = await phylloClient.getAccount(accountId);
    } catch (e: any) {
      accountErr = e?.message || String(e);
    }

    try {
      profilesRes = await phylloClient.getProfilesByAccount(accountId);
    } catch (e: any) {
      profileErr = e?.message || String(e);
    }

    try {
      contentsRes = await phylloClient.getContentsByAccount(accountId);
    } catch (e: any) {
      contentsErr = e?.message || String(e);
    }

    // Also query local DB for this account
    const adminClient = createAdminClient();
    const { data: dbAccount } = await adminClient
      .from('social_accounts')
      .select('*')
      .eq('external_account_id', accountId)
      .maybeSingle();

    return NextResponse.json({
      accountId,
      accountRes,
      accountErr,
      profilesRes,
      profileErr,
      contentsRes,
      contentsErr,
      dbAccount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
