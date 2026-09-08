import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nangoClient } from '@up-analytics/lib';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const platform = body?.platform || undefined;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para conectar sua conta social.' },
        { status: 401 }
      );
    }

    // 1. Busca perfil para identificar limite de contas do plano contratado
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .maybeSingle();

    const planLower = (profile?.plan || 'iniciante').toLowerCase();
    const maxAccountsAllowed = planLower.includes('enter')
      ? -1
      : planLower.includes('pro')
      ? 5
      : planLower.includes('premi')
      ? 2
      : 1;

    // 2. Verifica se o usuário atingiu o teto de contas
    if (maxAccountsAllowed !== -1) {
      const { count } = await supabase
        .from('social_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'connected');

      if ((count || 0) >= maxAccountsAllowed) {
        return NextResponse.json(
          {
            error: `Limite de contas atingido para seu plano (${count}/${maxAccountsAllowed}). Faça upgrade para conectar mais perfis do Instagram.`,
            limitReached: true,
            currentCount: count,
            maxAllowed: maxAccountsAllowed,
          },
          { status: 403 }
        );
      }
    }

    const userName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Usuário UP';

    const session = await nangoClient.createConnectSession(user.id, user.email, userName, platform);

    return NextResponse.json({
      success: true,
      token: session?.token,
      connectLink: session?.connectLink,
      publicKey: process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY || process.env.NANGO_PUBLIC_KEY || '',
      userId: user.id,
    });
  } catch (err: any) {
    console.error('[NangoSessionRoute] Error creating Nango connect session:', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao iniciar sessão de conexão Nango.' },
      { status: 500 }
    );
  }
}
