import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado', isAuthenticated: false },
        { status: 401 }
      );
    }

    // 1. Busca perfil no Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, plan, status, has_used_upgrade_discount')
      .eq('id', user.id)
      .maybeSingle();

    // 2. Checagem de Administrador (Acesso total irrestrito a todas as páginas)
    const isRoleAdmin = profile?.role === 'admin';
    const isAdminEmail = user.email?.trim().toLowerCase() === 'admin@upideias.com';
    const isAdmin = isRoleAdmin || isAdminEmail;

    // 3. Contar contas sociais conectadas no momento
    const { count: connectedAccountsCount } = await supabase
      .from('social_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'connected');

    if (isAdmin) {
      return NextResponse.json({
        isAuthenticated: true,
        isAdmin: true,
        role: 'admin',
        userId: user.id,
        email: user.email,
        plan: 'Administrador',
        planSlug: 'enterprise',
        status: 'Ativo',
        hasUsedUpgradeDiscount: false,
        subscription: null,
        limits: {
          maxInstagramAccounts: -1,
          historyDays: -1,
          maxClients: -1,
          connectedAccountsCount: connectedAccountsCount || 0,
          canConnectMoreAccounts: true,
        },
        allowedFeatures: {
          dashboard: true,
          posts: true,
          exportReports: true,
          upCreator: true,
          contentCalendar: true,
          library: true,
          approvals: true,
          clientArea: true,
          aiStrategy: true,
          contentGenerator: true,
        },
      });
    }

    // 4. Busca assinatura ativa mais recente em subscriptions (para assinantes regulares)
    const { data: subsData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    const activeSub = subsData?.[0] || null;

    // Normaliza nome do plano contratado
    const rawPlan = (activeSub?.plan_name || profile?.plan || 'Iniciante').trim().toLowerCase();
    let planSlug = 'iniciante';
    let planName = 'Iniciante';

    if (rawPlan.includes('enter')) {
      planSlug = 'enterprise';
      planName = 'Enterprise';
    } else if (rawPlan.includes('pro')) {
      planSlug = 'pro';
      planName = 'Pro';
    } else if (rawPlan.includes('premi')) {
      planSlug = 'premium';
      planName = 'Premium';
    } else {
      planSlug = 'iniciante';
      planName = 'Iniciante';
    }

    const isIniciante = planSlug === 'iniciante';
    const isPremium = planSlug === 'premium';
    const isPro = planSlug === 'pro';
    const isEnterprise = planSlug === 'enterprise';

    // 5. Limites estritos por plano
    const maxInstagramAccounts = isIniciante ? 1 : isPremium ? 2 : isPro ? 5 : -1;
    const historyDays = isIniciante ? 30 : isPremium ? 60 : isPro ? 90 : -1;
    const maxClients = isEnterprise ? -1 : isPro ? 1 : 0;

    const limits = {
      maxInstagramAccounts,
      historyDays,
      maxClients,
      connectedAccountsCount: connectedAccountsCount || 0,
      canConnectMoreAccounts:
        maxInstagramAccounts === -1 || (connectedAccountsCount || 0) < maxInstagramAccounts,
    };

    const allowedFeatures = {
      dashboard: true,
      posts: true,
      exportReports: true, // Universal para todos os planos
      upCreator: true,
      contentCalendar: isPremium || isPro || isEnterprise,
      library: isPremium || isPro || isEnterprise,
      approvals: isPro || isEnterprise,
      clientArea: isEnterprise,
      aiStrategy: false,
      contentGenerator: false,
    };

    return NextResponse.json({
      isAuthenticated: true,
      userId: user.id,
      email: user.email,
      plan: planName,
      planSlug,
      status: profile?.status || 'Ativo',
      hasUsedUpgradeDiscount: profile?.has_used_upgrade_discount === true,
      subscription: activeSub,
      limits,
      allowedFeatures,
    });
  } catch (err: any) {
    console.error('[API user/subscription] Erro:', err);
    return NextResponse.json(
      { error: err?.message || 'Erro ao carregar permissões do plano' },
      { status: 500 }
    );
  }
}
