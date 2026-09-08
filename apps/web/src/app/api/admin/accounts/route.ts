import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false, status: 401, error: "Não autenticado" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();

  const isRoleAdmin = profile?.role === "admin";
  const isAdminEmail = user.email?.trim().toLowerCase() === "admin@upideias.com";

  if (!isRoleAdmin && !isAdminEmail) {
    return { authorized: false, status: 403, error: "Acesso restrito a administradores" };
  }

  return { authorized: true, user };
}

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const adminClient = createAdminClient();

    // 1. Busca apenas contas reais com status = 'connected'
    const { data: accounts, error } = await adminClient
      .from("social_accounts")
      .select("id, user_id, username, platform, status, external_account_id, followers_count, profile_picture_url, connected_at, updated_at")
      .eq("status", "connected")
      .order("connected_at", { ascending: false });

    if (error) throw error;

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        success: true,
        accounts: [],
        total: 0,
        activeCount: 0,
        alertCount: 0,
      });
    }

    // 2. Busca os perfis proprietários dessas contas
    const userIds = Array.from(new Set(accounts.map((a) => a.user_id).filter(Boolean)));
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, name, full_name, email, plan")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const mapped = accounts.map((a) => {
      const p = profileMap.get(a.user_id);
      const rawHandle = a.username || "";
      const handle = rawHandle ? (rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`) : "-";

      return {
        id: a.id,
        handle,
        ownerName: p?.name || p?.full_name || p?.email?.split("@")[0] || "Assinante",
        ownerEmail: p?.email || "-",
        ownerPlan: p?.plan || "Pro",
        followers: (a.followers_count ?? 0).toLocaleString("pt-BR"),
        status: "Conectado" as const,
        lastSync: a.updated_at
          ? new Date(a.updated_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          : "Sincronizado",
        connectedAt: a.connected_at
          ? new Date(a.connected_at).toLocaleDateString("pt-BR")
          : "-",
        nangoConnectionId: a.external_account_id || `acc_${a.id.substring(0, 8)}`,
        platform: a.platform || "instagram",
        avatarUrl: a.profile_picture_url || null,
      };
    });

    return NextResponse.json({
      success: true,
      accounts: mapped,
      total: mapped.length,
      activeCount: mapped.length,
      alertCount: 0,
    });
  } catch (err: any) {
    console.error("[API Admin Accounts] Erro:", err);
    return NextResponse.json({ error: err.message || "Erro ao consultar contas" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID da conta é obrigatório" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("social_accounts").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Conta desconectada com sucesso" });
  } catch (err: any) {
    console.error("[API Admin Accounts DELETE] Erro:", err);
    return NextResponse.json({ error: err.message || "Erro ao excluir conta" }, { status: 500 });
  }
}
