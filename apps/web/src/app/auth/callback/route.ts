import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/app/dashboard';

  // Prevenção contra Open Redirect: Garante que 'next' seja um caminho relativo interno
  const safeRedirectPath = next.startsWith('/') && !next.startsWith('//') ? next : '/app/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeRedirectPath}`);
    }
  }

  // Em caso de falha na autenticação, redirecionar para a página de erro ou login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
