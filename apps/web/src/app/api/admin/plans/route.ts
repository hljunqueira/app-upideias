import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PlanConfig } from "@up-analytics/types";

export const dynamic = "force-dynamic";

const OFFICIAL_BASE_PLANS = [
  {
    slug: "iniciante",
    name: "Iniciante",
    description: "Ideal para quem está começando e quer validar sua presença com dados reais.",
    monthly_price_cents: 5490,
    annual_price_cents: 54900,
    is_featured: false,
    is_active: true,
    sort_order: 1,
    limits: {
      max_instagram_accounts: 1,
      history_days: 30,
      max_users: 1,
      max_clients: 0
    }
  },
  {
    slug: "premium",
    name: "Premium",
    description: "Para criadores que buscam consistência, planejamento visual e ritmo constante de postagens.",
    monthly_price_cents: 7990,
    annual_price_cents: 79900,
    is_featured: false,
    is_active: true,
    sort_order: 2,
    limits: {
      max_instagram_accounts: 2,
      history_days: 60,
      max_users: 2,
      max_clients: 0
    }
  },
  {
    slug: "pro",
    name: "Pro",
    description: "A ferramenta definitiva para operações sérias, múltiplos perfis e fluxo de aprovação com clientes.",
    monthly_price_cents: 17990,
    annual_price_cents: 179900,
    is_featured: true,
    is_active: true,
    sort_order: 3,
    limits: {
      max_instagram_accounts: 5,
      history_days: 90,
      max_users: 5,
      max_clients: 1
    }
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    description: "Operações corporativas, grandes marcas e agências com demandas sob medida e suporte prioritário.",
    monthly_price_cents: 0,
    annual_price_cents: 0,
    is_featured: false,
    is_active: true,
    sort_order: 4,
    limits: {
      max_instagram_accounts: -1,
      history_days: -1,
      max_users: -1,
      max_clients: -1
    }
  }
];

async function syncOfficialPlansToDatabase(adminClient: any) {
  try {
    // Desativar plano agencia legado se existir
    await adminClient.from("plans").update({ is_active: false }).eq("slug", "agencia");

    for (const p of OFFICIAL_BASE_PLANS) {
      const { data: existing } = await adminClient
        .from("plans")
        .select("id, monthly_price_cents")
        .eq("slug", p.slug)
        .maybeSingle();

      let planId = existing?.id;

      if (existing) {
        // Se o preço estiver desatualizado (ex: 2900 ou 7900), sincroniza com a grade oficial
        if (existing.monthly_price_cents !== p.monthly_price_cents) {
          await adminClient.from("plans").update({
            name: p.name,
            description: p.description,
            monthly_price_cents: p.monthly_price_cents,
            annual_price_cents: p.annual_price_cents,
            is_featured: p.is_featured,
            is_active: true,
            sort_order: p.sort_order
          }).eq("id", existing.id);
        }
      } else {
        const { data: inserted } = await adminClient.from("plans").insert({
          slug: p.slug,
          name: p.name,
          description: p.description,
          monthly_price_cents: p.monthly_price_cents,
          annual_price_cents: p.annual_price_cents,
          is_featured: p.is_featured,
          is_active: true,
          sort_order: p.sort_order
        }).select("id").single();

        if (inserted) planId = inserted.id;
      }

      if (planId) {
        await adminClient.from("plan_limits").upsert({
          plan_id: planId,
          max_instagram_accounts: p.limits.max_instagram_accounts,
          history_days: p.limits.history_days,
          max_users: p.limits.max_users,
          max_clients: p.limits.max_clients,
          max_ai_requests_month: 0,
          max_whatsapp_messages_month: 0
        }, { onConflict: "plan_id" });
      }
    }
  } catch (err) {
    console.error("[API Plans] Erro ao sincronizar planos oficiais no PostgreSQL:", err);
  }
}

// GET: Retorna os planos salvos no banco com limites
export async function GET() {
  try {
    const adminClient = createAdminClient();

    // Consultar planos atuais no banco
    const { data: currentPlans, error: checkError } = await adminClient
      .from("plans")
      .select("*, plan_limits(*)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    const hasInicianteOutdated = currentPlans?.some(
      (p: any) => p.slug === "iniciante" && p.monthly_price_cents !== 5490
    );
    const hasMissingOfficial = !currentPlans?.some((p: any) => p.slug === "premium");

    if (!currentPlans || currentPlans.length < 4 || hasInicianteOutdated || hasMissingOfficial) {
      await syncOfficialPlansToDatabase(adminClient);
      const { data: refreshed, error: refError } = await adminClient
        .from("plans")
        .select("*, plan_limits(*)")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!refError && refreshed) {
        return NextResponse.json({ plans: refreshed });
      }
    }

    return NextResponse.json({ plans: currentPlans || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro ao consultar planos" }, { status: 500 });
  }
}

// POST: Cria ou atualiza um plano no PostgreSQL da VPS
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado: faça login como administrador" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isMasterAdmin = user.email?.trim().toLowerCase() === "admin@upideias.com" || profile?.role === "admin";
    if (!isMasterAdmin) {
      return NextResponse.json({ error: "Acesso negado: privilégios de administrador necessários" }, { status: 403 });
    }

    const plan: PlanConfig = await req.json();
    if (!plan || !plan.name) {
      return NextResponse.json({ error: "Dados de plano inválidos" }, { status: 400 });
    }

    const slug = (plan.id || plan.name).toLowerCase().replace(/\s+/g, "_");
    const monthlyPriceCents = typeof plan.priceMonthly === "number" ? Math.round(plan.priceMonthly * 100) : 0;
    const annualPriceCents = typeof plan.priceAnnual === "number" ? Math.round(plan.priceAnnual * 100) : 0;

    const { data: existingPlan } = await adminClient
      .from("plans")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    const planPayload = {
      slug,
      name: plan.name,
      description: plan.description || "",
      monthly_price_cents: monthlyPriceCents,
      annual_price_cents: annualPriceCents,
      is_featured: !!plan.featured,
      is_active: true
    };

    let planId = existingPlan?.id;

    if (existingPlan) {
      const { error: updateError } = await adminClient
        .from("plans")
        .update(planPayload)
        .eq("id", existingPlan.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      const { data: inserted, error: insertError } = await adminClient
        .from("plans")
        .insert(planPayload)
        .select("id")
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      planId = inserted.id;
    }

    // Persistir limites reais na tabela plan_limits
    if (planId) {
      const instagramAccounts = plan.instagramAccountsLimit ?? (slug === "iniciante" ? 1 : slug === "premium" ? 2 : slug === "pro" ? 5 : -1);
      const historyDays = plan.historyDaysLimit ?? (slug === "iniciante" ? 30 : slug === "premium" ? 60 : slug === "pro" ? 90 : -1);
      const clientSlots = plan.clientSlotsLimit ?? (slug === "enterprise" ? -1 : slug === "pro" ? 1 : 0);

      await adminClient.from("plan_limits").upsert({
        plan_id: planId,
        max_instagram_accounts: instagramAccounts,
        history_days: historyDays,
        max_clients: clientSlots,
        max_ai_requests_month: 0,
        max_whatsapp_messages_month: 0
      }, { onConflict: "plan_id" });
    }

    // Retorna a lista atualizada de planos diretamente do PostgreSQL
    const { data: allPlans } = await adminClient
      .from("plans")
      .select("*, plan_limits(*)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    return NextResponse.json({ success: true, planId, slug, plans: allPlans || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro interno ao salvar plano" }, { status: 500 });
  }
}

// DELETE: Remove um plano por slug no PostgreSQL
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isMasterAdmin = user.email?.trim().toLowerCase() === "admin@upideias.com" || profile?.role === "admin";
    if (!isMasterAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const planSlug = searchParams.get("slug") || searchParams.get("id");

    if (!planSlug) {
      return NextResponse.json({ error: "Slug ou ID do plano não fornecido" }, { status: 400 });
    }

    const slug = planSlug.toLowerCase().replace(/\s+/g, "_");
    const { error: delError } = await adminClient
      .from("plans")
      .delete()
      .eq("slug", slug);

    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }

    // Retorna a lista atualizada de planos
    const { data: allPlans } = await adminClient
      .from("plans")
      .select("*, plan_limits(*)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    return NextResponse.json({ success: true, deletedSlug: slug, plans: allPlans || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro ao deletar plano" }, { status: 500 });
  }
}
