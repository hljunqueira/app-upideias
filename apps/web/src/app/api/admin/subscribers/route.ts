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

    // 1. Buscar todos os perfis cadastrados
    const { data: profiles, error: profError } = await adminClient
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profError) {
      throw profError;
    }

    // 2. Buscar contas sociais conectadas
    const { data: socialAccounts } = await adminClient
      .from("social_accounts")
      .select("id, user_id, username, platform");

    // 3. Buscar aprovações pendentes
    const { data: approvals } = await adminClient
      .from("content_approvals")
      .select("id, user_id, status");

    const mappedUsers = (profiles || []).map((p: any) => {
      const userAccounts = (socialAccounts || []).filter((a: any) => a.user_id === p.id);
      const userApprovals = (approvals || []).filter((appr: any) => appr.user_id === p.id && appr.status === "pending");

      return {
        id: p.id,
        name: p.name || p.full_name || (p.email ? p.email.split("@")[0] : "Assinante"),
        email: p.email || "Sem e-mail",
        plan: p.plan || "Iniciante",
        status: p.status === "Suspenso" ? "Suspenso" : p.status === "Pendente" ? "Pendente" : "Ativo",
        instagramHandle: p.instagram_handle ? `@${p.instagram_handle}` : userAccounts[0]?.username ? `@${userAccounts[0]?.username}` : "-",
        connectedAccountsCount: userAccounts.length,
        pendingApprovalsCount: userApprovals.length,
        role: p.role === "admin" ? "admin" : "user",
        createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR"),
      };
    });

    return NextResponse.json({
      success: true,
      subscribers: mappedUsers,
      total: mappedUsers.length,
    });
  } catch (err: any) {
    console.error("[API Admin Subscribers] Erro ao carregar:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao consultar assinantes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { name, email, plan, status, instagramHandle, role } = body;

    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const newId = crypto.randomUUID();

    const { data, error } = await adminClient.from("profiles").insert({
      id: newId,
      name: name || email.split("@")[0],
      email: email.trim().toLowerCase(),
      plan: plan || "Iniciante",
      status: status || "Ativo",
      instagram_handle: instagramHandle ? instagramHandle.replace(/^@/, "").trim() : null,
      role: role || "user",
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ success: true, subscriber: data });
  } catch (err: any) {
    console.error("[API Admin Subscribers] Erro ao criar:", err);
    return NextResponse.json({ error: err.message || "Erro ao criar assinante" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { id, name, email, plan, status, instagramHandle, role } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do assinante é obrigatório" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (plan !== undefined) updateData.plan = plan;
    if (status !== undefined) updateData.status = status;
    if (instagramHandle !== undefined) updateData.instagram_handle = instagramHandle ? instagramHandle.replace(/^@/, "").trim() : null;
    if (role !== undefined) updateData.role = role;

    const { data, error } = await adminClient
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, subscriber: data });
  } catch (err: any) {
    console.error("[API Admin Subscribers] Erro ao atualizar:", err);
    return NextResponse.json({ error: err.message || "Erro ao atualizar assinante" }, { status: 500 });
  }
}
