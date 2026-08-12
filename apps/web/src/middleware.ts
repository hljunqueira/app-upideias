import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // Failsafe: Redireciona qualquer callback com '?code=' que tenha caído fora de '/auth/callback'
  if (pathname !== '/auth/callback' && searchParams.has('code')) {
    const callbackUrl = new URL('/auth/callback', request.url);
    callbackUrl.search = searchParams.toString();
    return NextResponse.redirect(callbackUrl);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://api.upideias.com';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Executa validação de usuário no servidor Supabase Auth (Fail-Closed)
  let isAuthenticated = false;
  let currentUser: any = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      isAuthenticated = true;
      currentUser = data.user;
    }
  } catch {
    isAuthenticated = false;
  }

  // Proteção estrita de rotas administrativas (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated || !currentUser) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Verificar papel (role) do usuário no perfil do banco
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      const userRole = profile?.role || currentUser?.user_metadata?.role;
      const isAdminEmail = currentUser.email?.trim().toLowerCase() === 'admin@upideias.com';
      if (userRole !== 'admin' && !isAdminEmail) {
        return NextResponse.redirect(new URL('/app/dashboard', request.url));
      }
    } catch {
      // Em caso de falha de consulta do perfil, se não for admin@upideias.com redireciona
      if (currentUser.email?.trim().toLowerCase() !== 'admin@upideias.com') {
        return NextResponse.redirect(new URL('/app/dashboard', request.url));
      }
    }
  }

  // Proteção estrita de rotas privadas (/app/*)
  if (pathname.startsWith('/app')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirecionamento de usuários já autenticados na página de login
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/app/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
