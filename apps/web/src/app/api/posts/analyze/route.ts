import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { analyzeCreativeWithGemini } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const {
      postMediaId,
      imageUrl,
      imageBase64,
      mimeType,
      caption,
      asDraft,
      targetUserId,
    } = body;

    // 1. Checa se o usuário logado é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, plan')
      .eq('id', user.id)
      .maybeSingle();

    const isAdmin = profile?.role === 'admin';

    // Se for admin pedindo rascunho (para apoiar o Especialista no painel admin)
    if (isAdmin && asDraft) {
      const diagnosis = await analyzeCreativeWithGemini({
        imageUrl,
        imageBase64,
        mimeType,
        postCaption: caption,
        isDraftForSpecialist: true,
      });

      return NextResponse.json({
        success: true,
        diagnosis,
      });
    }

    // 2. Determina o plano do usuário (ou targetUserId se admin estiver gerando para um cliente)
    const effectiveUserId = targetUserId && isAdmin ? targetUserId : user.id;

    let userPlan = (profile?.plan || 'iniciante').toLowerCase();
    if (effectiveUserId !== user.id) {
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', effectiveUserId)
        .maybeSingle();
      if (targetProfile?.plan) {
        userPlan = targetProfile.plan.toLowerCase();
      }
    }

    const isIniciante = !userPlan.includes('premi') && !userPlan.includes('pro') && !userPlan.includes('enter');

    // 3. Execução de Análise
    if (isIniciante) {
      // Plano Iniciante: Diagnóstico 100% automatizado assinado pelo Agente UP Ideias
      const diagnosis = await analyzeCreativeWithGemini({
        imageUrl,
        imageBase64,
        mimeType,
        postCaption: caption,
      });

      const adminClient = createAdminClient();
      const { data: approval, error: dbErr } = await adminClient
        .from('content_approvals')
        .insert({
          user_id: effectiveUserId,
          origin: 'agent',
          status: 'pending',
          title: 'Diagnóstico Técnico • Agente UP Ideias',
          format: 'Feed Instagram',
          caption: diagnosis.sugestao_legenda,
          image_url: imageUrl || null,
          post_media_id: postMediaId || null,
          visual_diagnosis: diagnosis,
        })
        .select()
        .single();

      if (dbErr) {
        console.error('[Analyze Post] Erro ao salvar aprovação no banco:', dbErr);
        return NextResponse.json({ error: 'Erro ao registrar diagnóstico' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        origin: 'agent',
        approval,
        diagnosis,
      });
    } else {
      // Planos Premium e Pro: Enfileira para revisão e direcionamento do Especialista UP Ideias
      const adminClient = createAdminClient();
      const { data: approval, error: dbErr } = await adminClient
        .from('content_approvals')
        .insert({
          user_id: effectiveUserId,
          origin: 'specialist',
          status: 'pending',
          title: 'Direcionamento Estratégico • Especialista UP Ideias',
          format: 'Feed Instagram',
          caption: caption || '',
          image_url: imageUrl || null,
          post_media_id: postMediaId || null,
          specialist_notes: 'Fila do Especialista: análise visual e copy em elaboração.',
        })
        .select()
        .single();

      if (dbErr) {
        console.error('[Analyze Post] Erro ao salvar solicitação do especialista:', dbErr);
        return NextResponse.json({ error: 'Erro ao registrar solicitação' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        origin: 'specialist',
        approval,
        message: 'Solicitação direcionada à fila do Especialista UP Ideias.',
      });
    }
  } catch (err: any) {
    console.error('[API posts/analyze] Erro:', err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao processar análise do criativo' },
      { status: 500 }
    );
  }
}
