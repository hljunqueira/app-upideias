import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { nangoClient } from '@up-analytics/lib';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { accountId } = await request.json();
    const adminClient = createAdminClient();

    // 1. Busca a conta pertencente ao usuário autenticado
    let query = adminClient
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (accountId) {
      query = query.eq('id', accountId);
    }

    const { data: accounts, error: findError } = await query;

    if (findError || !accounts || accounts.length === 0) {
      return NextResponse.json({ success: true, message: 'Nenhuma conta para desconectar' });
    }

    for (const acc of accounts) {
      // 2. Remove conexão do Nango API para não persistir sessão
      const connectionId = acc.external_account_id;
      if (connectionId) {
        try {
          await fetch(`${nangoClient['host']}/connection/${connectionId}?provider_config_key=facebook`, {
            method: 'DELETE',
            headers: nangoClient['getAuthHeader'](),
          });
          await fetch(`${nangoClient['host']}/connection/${connectionId}?provider_config_key=instagram`, {
            method: 'DELETE',
            headers: nangoClient['getAuthHeader'](),
          });
        } catch (nangoErr) {
          console.warn('[DisconnectRoute] Nango delete notice:', nangoErr);
        }
      }

      // 3. Remove métricas e publicações associadas
      await adminClient.from('social_content').delete().eq('account_id', acc.id);
      await adminClient.from('social_account_metrics').delete().eq('account_id', acc.id);

      // 4. Remove a conta do banco (Hard Delete)
      await adminClient.from('social_accounts').delete().eq('id', acc.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Conta e dados desconectados e excluídos com sucesso.',
    });
  } catch (err: any) {
    console.error('[DisconnectRoute] Error:', err);
    return NextResponse.json({ error: err?.message || 'Erro ao desconectar' }, { status: 500 });
  }
}
