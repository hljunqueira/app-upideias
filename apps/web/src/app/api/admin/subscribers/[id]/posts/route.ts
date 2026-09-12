import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const subscriberId = resolvedParams?.id;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Checa permissão admin
    const { data: adminProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isRoleAdmin = adminProfile?.role === 'admin';
    const isAdminEmail = user.email?.trim().toLowerCase() === 'admin@upideias.com';

    if (!isRoleAdmin && !isAdminEmail) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    // 1. Perfil do assinante
    const { data: subscriber, error: subErr } = await adminClient
      .from('profiles')
      .select('id, name, full_name, email, plan, status, instagram_handle, created_at')
      .eq('id', subscriberId)
      .maybeSingle();

    if (subErr || !subscriber) {
      return NextResponse.json({ error: 'Assinante não encontrado' }, { status: 404 });
    }

    // 2. Conta social conectada
    const { data: accounts } = await adminClient
      .from('social_accounts')
      .select('*')
      .eq('user_id', subscriberId)
      .order('connected_at', { ascending: false });

    const account = accounts?.[0] || null;

    // 3. Posts sincronizados
    let posts: any[] = [];
    if (account?.id) {
      const { data: contentData } = await adminClient
        .from('social_content')
        .select('*')
        .eq('account_id', account.id)
        .order('published_at', { ascending: false })
        .limit(30);

      posts = contentData || [];
    }

    // 4. Sugestões e aprovações ativas desse assinante
    const { data: approvals } = await adminClient
      .from('content_approvals')
      .select('*')
      .eq('user_id', subscriberId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      subscriber: {
        id: subscriber.id,
        name: subscriber.name || subscriber.full_name || subscriber.email?.split('@')[0] || 'Assinante',
        email: subscriber.email,
        plan: subscriber.plan || 'Iniciante',
        status: subscriber.status || 'Ativo',
        instagramHandle: subscriber.instagram_handle
          ? `@${subscriber.instagram_handle.replace(/^@+/, '')}`
          : account?.username
          ? `@${account.username.replace(/^@+/, '')}`
          : '-',
        createdAt: subscriber.created_at,
      },
      account,
      posts,
      approvals: approvals || [],
    });
  } catch (err: any) {
    console.error('[API admin/subscribers/[id]/posts] Erro:', err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao carregar dados do assinante' },
      { status: 500 }
    );
  }
}
