import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { zernioClient } from '@up-analytics/lib';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const accountId = body?.accountId;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Identificador de conta ausente.' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Busca a conta vinculada ao usuário
    const { data: account } = await adminClient
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .or(`id.eq.${accountId},external_account_id.eq.${accountId}`)
      .maybeSingle();

    if (!account) {
      return NextResponse.json(
        { error: 'Conta não encontrada ou não pertence a este usuário.' },
        { status: 404 }
      );
    }

    // 2. Tenta desconectar na Zernio se tiver external_account_id
    if (account.external_account_id) {
      try {
        await zernioClient.deleteAccount(account.external_account_id);
      } catch (zernioErr: any) {
        console.warn(
          '[ZernioDisconnect] Falha na deleção remota na Zernio (continuando desconexão local):',
          zernioErr?.message
        );
      }
    }

    // 3. Atualiza status no banco local para disconnected
    await adminClient
      .from('social_accounts')
      .update({
        status: 'disconnected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    return NextResponse.json({
      success: true,
      message: 'Conta do Instagram desconectada com sucesso.',
      accountId: account.id,
    });
  } catch (err: any) {
    console.error('[ZernioDisconnectRoute] Exception:', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao desconectar conta.' },
      { status: 500 }
    );
  }
}
