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
    const { accountId, content, mediaUrls, publishAt, firstComment, approvalId } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'O conteúdo da publicação (legenda) é obrigatório.' },
        { status: 400 }
      );
    }

    // 1. Valida plano do usuário (Iniciante não possui agendamento de posts)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .maybeSingle();

    const planLower = (profile?.plan || 'iniciante').toLowerCase();
    if (planLower.includes('iniciante') || planLower.includes('start')) {
      return NextResponse.json(
        {
          error: 'Agendamento e publicação automática não estão disponíveis no Plano Iniciante. Faça upgrade para o Plano Premium ou Pro.',
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();

    // 2. Localiza a conta social do usuário (específica ou primeira conectada)
    let account = null;
    if (accountId) {
      const { data } = await adminClient
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .or(`id.eq.${accountId},external_account_id.eq.${accountId}`)
        .eq('status', 'connected')
        .maybeSingle();
      account = data;
    } else {
      const { data } = await adminClient
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'connected')
        .order('connected_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      account = data;
    }

    if (!account?.external_account_id) {
      return NextResponse.json(
        { error: 'Conta do Instagram conectada não encontrada. Conecte sua conta do Instagram antes de publicar.' },
        { status: 404 }
      );
    }

    // 3. Executa a publicação/agendamento oficial via Zernio
    const result = await zernioClient.createPost({
      accountId: account.external_account_id,
      content,
      mediaUrls,
      publishAt,
      firstComment,
    });

    // 4. Se veio de uma aprovação, atualiza content_approvals imediatamente
    if (approvalId) {
      await adminClient
        .from('content_approvals')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          published_at: publishAt ? null : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', approvalId)
        .eq('user_id', user.id);
    }

    // 4. Registra no calendário de conteúdo local
    await adminClient.from('content_calendar').insert({
      user_id: user.id,
      instagram_account_id: account.id,
      planned_date: publishAt ? new Date(publishAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      planned_time: publishAt ? new Date(publishAt).toISOString().split('T')[1].substring(0, 5) : new Date().toISOString().split('T')[1].substring(0, 5),
      status: publishAt ? 'scheduled' : 'published',
      notes: content,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: publishAt ? 'Publicação agendada com sucesso.' : 'Publicação realizada com sucesso.',
    });
  } catch (err: any) {
    console.error('[ZernioPublishRoute] Exception:', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao agendar ou publicar post.' },
      { status: 500 }
    );
  }
}
