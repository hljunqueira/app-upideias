import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: approvals, error } = await supabase
      .from('content_approvals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API posts/approvals] Erro ao buscar aprovações:', error);
      return NextResponse.json({ error: 'Erro ao carregar aprovações' }, { status: 500 });
    }

    return NextResponse.json({ approvals: approvals || [] });
  } catch (err: any) {
    console.error('[API posts/approvals] Exceção:', err);
    return NextResponse.json({ error: err?.message || 'Falha ao listar aprovações' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { approvalId, status, clientComment } = body;

    if (!approvalId || !status) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { data: updated, error: updateErr } = await adminClient
      .from('content_approvals')
      .update({
        status,
        client_comment: clientComment || null,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', approvalId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateErr) {
      console.error('[API posts/approvals] Erro ao atualizar status:', updateErr);
      return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, approval: updated });
  } catch (err: any) {
    console.error('[API posts/approvals] Exceção:', err);
    return NextResponse.json({ error: err?.message || 'Falha na atualização' }, { status: 500 });
  }
}
