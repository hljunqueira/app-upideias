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

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const adminClient = createAdminClient();
    const { searchParams } = new URL(req.url);
    const planFilter = searchParams.get("plan"); // "Premium" | "Pro" | "Enterprise" | null
    const statusFilter = searchParams.get("status"); // "pending" | "approved" | "all"

    // 1. Buscar assinantes elegíveis para especialista (Premium, Pro, Enterprise)
    let query = adminClient
      .from("profiles")
      .select("id, name, email, plan, status, instagram_handle")
      .in("plan", ["Premium", "Pro", "Enterprise", "Agência"]);

    if (planFilter && planFilter !== "all") {
      query = query.eq("plan", planFilter);
    }

    const { data: subscribers, error: subsError } = await query;
    if (subsError) throw subsError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, items: [], total: 0 });
    }

    const subscriberIds = subscribers.map((s) => s.id);
    const subMap = new Map(subscribers.map((s) => [s.id, s]));

    // 2. Buscar aprovações/sugestões com origin="specialist" ou de usuários elegíveis
    let apprQuery = adminClient
      .from("content_approvals")
      .select("*")
      .in("user_id", subscriberIds)
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      apprQuery = apprQuery.eq("status", statusFilter);
    }

    const { data: approvals, error: apprErr } = await apprQuery;
    if (apprErr) throw apprErr;

    // 3. Buscar contas sociais conectadas desses assinantes
    const { data: accounts } = await adminClient
      .from("social_accounts")
      .select("id, user_id, username, profile_picture_url")
      .in("user_id", subscriberIds);

    const accountMap = new Map((accounts || []).map((a) => [a.user_id, a]));

    // 4. Mapear itens da fila de especialista
    const queueItems = (approvals || []).map((appr: any) => {
      const sub = subMap.get(appr.user_id);
      const acc = accountMap.get(appr.user_id);

      return {
        id: appr.id,
        approvalId: appr.id,
        userId: appr.user_id,
        userName: sub?.name || sub?.email?.split("@")[0] || "Assinante",
        userEmail: sub?.email,
        userPlan: sub?.plan || "Pro",
        instagramHandle: sub?.instagram_handle
          ? `@${sub.instagram_handle.replace(/^@+/, "")}`
          : acc?.username
          ? `@${acc.username.replace(/^@+/, "")}`
          : "-",
        title: appr.title,
        status: appr.status, // "pending" | "approved" | "rejected" | "adjusted"
        origin: appr.origin,
        format: appr.format || "Reels / Post",
        caption: appr.caption || "",
        imageUrl: appr.image_url || null,
        specialistNotes: appr.specialist_notes || "",
        visualDiagnosis: appr.visual_diagnosis || null,
        createdAt: appr.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      items: queueItems,
      total: queueItems.length,
    });
  } catch (err: any) {
    console.error("[API Admin Analysis Queue] Erro:", err);
    return NextResponse.json({ error: err.message || "Erro na fila de análise" }, { status: 500 });
  }
}
