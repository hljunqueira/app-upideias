import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para conectar sua conta social.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const platform = body?.platform || 'instagram';
    const loginMethod = body?.loginMethod || 'instagram_login';

    // 1. Identifica os limites do plano contratado (fail-closed em Iniciante)
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

    // 2. Verifica se atingiu o limite de contas
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

    // 3. Obtém ou cria perfil isolado do usuário no Zernio
    const profileId = await zernioClient.getOrCreateProfile(user.id, userName);

    // 4. Monta a URL de callback oficial da aplicação com fallback de userId
    const origin = req.headers.get('origin') || req.nextUrl.origin;
    const redirectUrl = `${origin}/api/integrations/zernio/callback?userId=${user.id}`;

    // 5. Gera a URL oficial de conexão (padrão instagram_login direto)
    const session = await zernioClient.getConnectUrl({
      profileId,
      redirectUrl,
      platform,
      loginMethod,
    });

    return NextResponse.json({
      success: true,
      authUrl: session.authUrl,
      state: session.state,
      profileId,
      userId: user.id,
    });
  } catch (err: any) {
    console.error('[ZernioConnectUrlRoute] Error generating connect URL:', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao gerar link de conexão do Instagram.' },
      { status: 500 }
    );
  }
}
