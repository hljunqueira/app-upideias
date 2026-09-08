import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatAboutPostWithGemini } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { message, postCaption, imageUrl, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    const reply = await chatAboutPostWithGemini({
      userMessage: message,
      postCaption,
      imageUrl,
      history: history || [],
    });

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (err: any) {
    console.error("[API Posts Chat] Erro:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao consultar o Agente UP Ideias" },
      { status: 500 }
    );
  }
}
