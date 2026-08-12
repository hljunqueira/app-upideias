import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Priorizar cookie de intenção de checkout temporário caso exista
  const cookieStore = cookies();
  const pendingCheckout = cookieStore.get('up_pending_checkout')?.value;
  const rawNext = pendingCheckout || searchParams.get('next') || '/app/dashboard';

  // Prevenção contra Open Redirect: Garante que o caminho seja relativo e seguro
  const safeRedirectPath = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/app/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${safeRedirectPath}`);
      if (pendingCheckout) {
        response.cookies.delete('up_pending_checkout');
      }
      return response;
    }
  }

  // Em caso de falha na autenticação, redirecionar para a página de login com erro
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
