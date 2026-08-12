import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { phylloClient } from '@up-analytics/lib';

export async function POST() {
  try {
    // 1. Validate Supabase Session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para conectar sua conta social.' },
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();
    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário UP';

    // 2. Get or create Phyllo User (idempotent 4-step check)
    const phylloUserId = await phylloClient.getOrCreateUser(user.id, userName, adminClient);

    // 3. Generate SDK Token for Phyllo Connect SDK
    const sdkTokenResponse = await phylloClient.createSdkToken(phylloUserId);

    // 4. Return strictly public temporary token + userId to frontend
    return NextResponse.json({
      token: sdkTokenResponse.sdk_token,
      userId: phylloUserId,
    });
  } catch (err: any) {
    console.error('[ConnectTokenRoute] Error generating Phyllo SDK Token:', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Falha interna ao gerar token de conexão com Phyllo.' },
      { status: 500 }
    );
  }
}
