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
