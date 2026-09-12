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
    const { accountId, questions } = body;

    if (!accountId || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos. Forneça accountId e um array de perguntas (máx 4).' },
        { status: 400 }
      );
    }

    // 1. Valida plano (Ice Breakers disponível exclusivamente em Pro e Enterprise)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .maybeSingle();

    const planLower = (profile?.plan || 'iniciante').toLowerCase();
    if (!planLower.includes('pro') && !planLower.includes('enter') && !planLower.includes('agenc')) {
      return NextResponse.json(
        {
          error: 'Perguntas automáticas no direct (Ice Breakers) estão disponíveis a partir do Plano Pro. Faça upgrade para desbloquear.',
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();

    // 2. Busca conta social
    const { data: account } = await adminClient
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .or(`id.eq.${accountId},external_account_id.eq.${accountId}`)
      .eq('status', 'connected')
      .maybeSingle();

    if (!account?.external_account_id) {
      return NextResponse.json(
        { error: 'Conta social ativa não encontrada.' },
        { status: 404 }
      );
    }

    // 3. Atualiza na Zernio
    const formattedQuestions = questions.slice(0, 4).map((q: any) => ({
      question: typeof q === 'string' ? q : q.question,
      payload: typeof q === 'string' ? q : q.payload || q.question,
    }));

    const result = await zernioClient.setIceBreakers(account.external_account_id, formattedQuestions);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Perguntas rápidas de direct configuradas com sucesso no Instagram.',
    });
  } catch (err: any) {
    console.error('[ZernioIceBreakersRoute] Exception:', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao configurar perguntas automáticas.' },
      { status: 500 }
    );
  }
}
