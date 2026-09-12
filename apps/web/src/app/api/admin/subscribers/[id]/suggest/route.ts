import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const subscriberId = resolvedParams?.id;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: adminProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isRoleAdmin = adminProfile?.role === 'admin';
    const isAdminEmail = user.email?.trim().toLowerCase() === 'admin@upideias.com';

    if (!isRoleAdmin && !isAdminEmail) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      format,
      caption,
      imageUrl,
      specialistNotes,
      postMediaId,
      visualDiagnosis,
    } = body;

    if (!caption && !title && !specialistNotes) {
      return NextResponse.json(
        { error: 'Preencha ao menos o título, legenda ou notas do especialista.' },
        { status: 400 }
      );
    }

    const { data: approval, error: insertErr } = await adminClient
      .from('content_approvals')
      .insert({
        user_id: subscriberId,
        origin: 'specialist',
        status: 'pending',
        title: title || 'Direcionamento Estratégico • Especialista UP Ideias',
        format: format || 'Feed Instagram',
        caption: caption || '',
        image_url: imageUrl || null,
        specialist_notes: specialistNotes || null,
        post_media_id: postMediaId || null,
        visual_diagnosis: visualDiagnosis || null,
      })
      .select()
      .single();

    if (insertErr) {
      console.error('[Admin Suggest] Erro ao cadastrar sugestão:', insertErr);
      return NextResponse.json({ error: 'Erro ao registrar sugestão' }, { status: 500 });
    }

    // Cria notificação no banco para o assinante
    try {
      await adminClient.from('notifications').insert({
        user_id: subscriberId,
        type: 'content_suggestion',
        title: 'Nova recomendação do Especialista UP Ideias',
        message: `O Especialista enviou uma sugestão para o seu perfil: "${title || 'Postagem sugerida'}".`,
        read: false,
        data: { approval_id: approval.id, link: '/app/approvals' },
      });
    } catch (notifErr) {
      console.warn('[Admin Suggest] Aviso ao emitir notificação:', notifErr);
    }

    return NextResponse.json({
      success: true,
      approval,
      message: 'Sugestão do Especialista enviada com sucesso em tempo real.',
    });
  } catch (err: any) {
    console.error('[API admin/subscribers/[id]/suggest] Erro:', err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao salvar sugestão' },
      { status: 500 }
    );
  }
}
