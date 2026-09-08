"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@up-analytics/lib";

interface PostItem {
  id: string;
  externalContentId?: string;
  caption?: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  permalink?: string;
  published_at?: string;
  like_count?: number;
  comments_count?: number;
}

interface ApprovalItem {
  id: string;
  title: string;
  origin: "agent" | "specialist";
  format?: string;
  caption?: string;
  image_url?: string;
  status: "pending" | "approved" | "rejected" | "adjusted";
  client_comment?: string;
  specialist_notes?: string;
  visual_diagnosis?: {
    gancho_visual?: string;
    legibilidade_e_contraste?: string;
    sugestao_legenda?: string;
    recomendacao_pratica?: string;
  };
  created_at: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [userPlan, setUserPlan] = useState<string>("Iniciante");
  const [userId, setUserId] = useState<string | null>(null);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [analyzingPostId, setAnalyzingPostId] = useState<string | null>(null);
  const [isAdoptingId, setIsAdoptingId] = useState<string | null>(null);

  // Chat Contextual
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Modal Ajuste
  const [reviewModalApproval, setReviewModalApproval] = useState<ApprovalItem | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Carregar plano do usuário
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/user/subscription");
        if (res.ok) {
          const data = await res.json();
          setUserPlan(data.plan || "Iniciante");
          setUserId(data.userId);
        }
      } catch (e) {
        console.warn("Erro ao buscar plano:", e);
      }
    }
    loadUser();
  }, []);

  // 2. Carregar posts reais do Instagram sincronizados
  useEffect(() => {
    async function loadLivePosts() {
      setLoadingPosts(true);
      try {
        const res = await fetch("/api/instagram/live-data?period=30D");
        if (res.ok) {
          const data = await res.json();
          const loadedPosts: PostItem[] = data.posts || [];
          setPosts(loadedPosts);
          if (loadedPosts.length > 0) {
            setSelectedPostId(loadedPosts[0].id);
          }
        }
      } catch (err) {
        console.warn("Erro ao carregar publicações:", err);
      } finally {
        setLoadingPosts(false);
      }
    }
    loadLivePosts();
  }, []);

  // 3. Carregar aprovações e diagnósticos
  useEffect(() => {
    async function loadApprovals() {
      setLoadingApprovals(true);
      try {
        const res = await fetch("/api/posts/approvals");
        if (res.ok) {
          const data = await res.json();
          setApprovals(data.approvals || []);
        }
      } catch (err) {
        console.warn("Erro ao carregar aprovações:", err);
      } finally {
        setLoadingApprovals(false);
      }
    }
    loadApprovals();
  }, []);

  // 4. Subscrição Supabase Realtime
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-post-approvals-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "content_approvals",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setApprovals((prev) => [payload.new as ApprovalItem, ...prev]);
            setFeedback({
              type: "success",
              text: "Novo direcionamento recebido em tempo real.",
            });
          } else if (payload.eventType === "UPDATE") {
            setApprovals((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? (payload.new as ApprovalItem) : item
              )
            );
          } else if (payload.eventType === "DELETE") {
            setApprovals((prev) => prev.filter((item) => item.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Post atualmente selecionado
  const selectedPost = posts.find((p) => p.id === selectedPostId) || posts[0] || null;

  // Busca a sugestão correspondente ao post selecionado (se houver)
  const currentApproval = approvals.find((a) => {
    if (!selectedPost) return false;
    const mediaUrl = selectedPost.thumbnail_url || selectedPost.media_url;
    return a.image_url === mediaUrl || (a.format && a.format.includes(selectedPost.id));
  }) || approvals[0] || null;

  // 5. Solicitar auditoria do post selecionado
  const handleRequestAudit = async (post: PostItem) => {
    try {
      setAnalyzingPostId(post.id);
      setFeedback(null);

      const mediaUrl = post.thumbnail_url || post.media_url;
      const res = await fetch("/api/posts/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: mediaUrl,
          caption: post.caption,
          postMediaId: post.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao processar solicitação");

      const isHumanSpecialist = ["Premium", "Pro", "Enterprise", "Agência"].includes(userPlan);

      setFeedback({
        type: "success",
        text: isHumanSpecialist
          ? "Solicitação encaminhada para a fila do Especialista UP Ideias."
          : "Diagnóstico técnico gerado pelo Agente UP Ideias.",
      });

      if (data.approval) {
        setApprovals((prev) => [data.approval, ...prev.filter((a) => a.id !== data.approval.id)]);
      }
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: "error", text: err.message || "Erro na análise" });
    } finally {
      setAnalyzingPostId(null);
    }
  };

  // 6. Adotar Sugestão com Estado de Carregamento
  const handleAdoptSuggestion = async (approvalId: string) => {
    try {
      setIsAdoptingId(approvalId);
      setFeedback(null);

      const res = await fetch("/api/posts/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalId, status: "approved" }),
      });

      if (res.ok) {
        setApprovals((prev) =>
          prev.map((a) => (a.id === approvalId ? { ...a, status: "approved" } : a))
        );
        setFeedback({ type: "success", text: "Sugestão adotada com sucesso." });
      } else {
        throw new Error("Não foi possível adotar a sugestão.");
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Erro ao adotar sugestão." });
    } finally {
      setIsAdoptingId(null);
    }
  };

  // 7. Solicitar Ajuste
  const handleRequestAdjustment = async () => {
    if (!reviewModalApproval) return;
    try {
      const res = await fetch("/api/posts/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId: reviewModalApproval.id,
          status: "adjusted",
          clientComment: reviewComment,
        }),
      });
      if (res.ok) {
        setApprovals((prev) =>
          prev.map((a) =>
            a.id === reviewModalApproval.id
              ? { ...a, status: "adjusted", client_comment: reviewComment }
              : a
          )
        );
        setReviewModalApproval(null);
        setReviewComment("");
        setFeedback({ type: "success", text: "Solicitação de revisão registrada." });
      }
    } catch (err) {
      setFeedback({ type: "error", text: "Erro ao solicitar revisão." });
    }
  };

  // 8. Chat Contextual com o Agente
  const handleSendChatMessage = async (presetText?: string) => {
    const text = (presetText || chatInput).trim();
    if (!text || chatLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!presetText) setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/posts/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          postCaption: selectedPost?.caption || "",
          imageUrl: selectedPost?.thumbnail_url || selectedPost?.media_url || "",
          history: chatMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao consultar o Agente");

      const agentMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply || "Sugestão processada.",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };

      setChatMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Não foi possível gerar a resposta no momento. Tente novamente.",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const isSpecialistPlan = ["Premium", "Pro", "Enterprise", "Agência", "Administrador"].includes(userPlan);
  const isIniciante = userPlan === "Iniciante";

  return (
    <div className="flex flex-col gap-6 pb-16 animate-fade-in text-zinc-200">
      {/* Header Executivo Sem Ícones Decorativos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Módulo de Publicações
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-upPink border border-upPink/30 px-2 py-0.5 rounded font-semibold">
              Plano {userPlan}
            </span>
            {isSpecialistPlan && (
              <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                Especialista Habilitado
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1.5">
            Gestão & Otimização de Posts
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Compare a publicação original com o direcionamento estratégico lado a lado e converse com o Agente para refinamentos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="border border-white/10 rounded-lg px-3 py-1.5 bg-zinc-950 text-right">
            <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-mono">Sincronização</span>
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Ativa</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium border ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/30 text-rose-300"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Seletor Horizontal de Publicações da Conta */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Selecione uma Publicação ({posts.length})
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            Últimos 30 dias
          </span>
        </div>

        {loadingPosts ? (
          <div className="p-6 border border-white/10 rounded-xl text-center text-xs text-zinc-500 font-mono">
            Carregando publicações sincronizadas...
          </div>
        ) : posts.length === 0 ? (
          <div className="p-6 border border-white/10 rounded-xl bg-zinc-950/50 text-center text-xs text-zinc-400">
            Nenhuma publicação recente sincronizada do Instagram.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {posts.map((post) => {
              const mediaSrc = post.thumbnail_url || post.media_url;
              const isSelected = selectedPost?.id === post.id;
              return (
                <button
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border transition-all text-left ${
                    isSelected
                      ? "border-upPink ring-2 ring-upPink/30 scale-[1.02]"
                      : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                  }`}
                >
                  {mediaSrc ? (
                    <img
                      src={mediaSrc}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-[9px] font-mono text-zinc-500 uppercase">
                      Post
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-upPink/10 border-2 border-upPink pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* WORKSPACE LADO A LADO (SPLIT VIEW) */}
      {selectedPost ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
          {/* COLUNA ESQUERDA: POST ORIGINAL DO INSTAGRAM (5 de 12 colunas) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="border border-white/10 rounded-2xl bg-zinc-950 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  Publicação Original
                </span>
                {selectedPost.published_at && (
                  <span className="text-[10px] font-mono text-zinc-500">
                    {new Date(selectedPost.published_at).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>

              {/* Mídia do Post */}
              <div className="aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-white/10 relative">
                {selectedPost.thumbnail_url || selectedPost.media_url ? (
                  <img
                    src={selectedPost.thumbnail_url || selectedPost.media_url}
                    alt="Criativo original"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
                    Mídia Indisponível
                  </div>
                )}
              </div>

              {/* Legenda Original */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Legenda Publicada
                </span>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-xs text-zinc-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {selectedPost.caption || "Esta publicação não possui legenda."}
                </div>
              </div>

              {/* Botão de Auditoria / Recálculo se não houver aprovação ativa */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-mono">
                  {selectedPost.like_count ? `${selectedPost.like_count} curtidas` : "Instagram Live"}
                </span>

                <button
                  type="button"
                  onClick={() => handleRequestAudit(selectedPost)}
                  disabled={analyzingPostId === selectedPost.id}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-zinc-900 text-xs text-zinc-300 hover:text-white font-medium transition-colors"
                >
                  {analyzingPostId === selectedPost.id ? "Analisando..." : "Auditar Novamente"}
                </button>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: SUGESTÃO DO AGENTE / ESPECIALISTA + CHAT (7 de 12 colunas) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Card da Sugestão & Diagnóstico */}
            <div className="border border-white/10 rounded-2xl bg-zinc-950 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded font-bold ${
                      currentApproval?.origin === "specialist" || isSpecialistPlan
                        ? "bg-upPink/10 text-upPink border border-upPink/30"
                        : "bg-zinc-800 text-zinc-200 border border-white/10"
                    }`}
                  >
                    {currentApproval?.origin === "specialist" || isSpecialistPlan
                      ? "Especialista UP Ideias"
                      : "Agente UP Ideias"}
                  </span>
                  {currentApproval?.status && (
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                      • {currentApproval.status === "approved" ? "Adotada" : "Pendente"}
                    </span>
                  )}
                </div>

                {currentApproval?.created_at && (
                  <span className="text-[10px] font-mono text-zinc-500">
                    {new Date(currentApproval.created_at).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>

              {/* Argumento de Upgrade para o Plano Iniciante */}
              {isIniciante && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-upPink/10 to-transparent border border-upPink/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-upPink font-bold">
                      Upgrade Disponível
                    </span>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Esta análise foi processada pelo Agente. Deseja um <strong>Especialista Humano</strong> validando pessoalmente seus posts?
                    </p>
                  </div>
                  <Link
                    href="/app/billing"
                    className="px-3 py-1.5 rounded-lg bg-upPink hover:bg-upPinkDark text-white text-xs font-bold whitespace-nowrap text-center transition-colors uppercase tracking-wider shrink-0"
                  >
                    Ver Planos
                  </Link>
                </div>
              )}

              {/* Conteúdo do Diagnóstico Estruturado */}
              {currentApproval?.visual_diagnosis ? (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-zinc-900/70 p-3 rounded-xl border border-white/5">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                        Gancho Visual (2s Iniciais)
                      </span>
                      <p className="text-xs text-zinc-200 leading-relaxed">
                        {currentApproval.visual_diagnosis.gancho_visual}
                      </p>
                    </div>

                    <div className="bg-zinc-900/70 p-3 rounded-xl border border-white/5">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                        Legibilidade & Contraste
                      </span>
                      <p className="text-xs text-zinc-200 leading-relaxed">
                        {currentApproval.visual_diagnosis.legibilidade_e_contraste}
                      </p>
                    </div>
                  </div>

                  {currentApproval.visual_diagnosis.recomendacao_pratica && (
                    <div className="bg-zinc-900 p-3.5 rounded-xl border border-upPink/20">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-upPink font-bold block mb-1">
                        Ajuste Prioritário Recomendado
                      </span>
                      <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                        {currentApproval.visual_diagnosis.recomendacao_pratica}
                      </p>
                    </div>
                  )}

                  {/* Sugestão de Copy */}
                  {(currentApproval.visual_diagnosis.sugestao_legenda || currentApproval.caption) && (
                    <div className="bg-zinc-900/90 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                        Proposta de Legenda & Copy Otimizada
                      </span>
                      <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                        {currentApproval.visual_diagnosis.sugestao_legenda || currentApproval.caption}
                      </p>
                    </div>
                  )}
                </div>
              ) : currentApproval?.specialist_notes ? (
                <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 text-xs text-zinc-200 leading-relaxed">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    Direcionamento do Especialista
                  </span>
                  {currentApproval.specialist_notes}
                </div>
              ) : (
                <div className="p-8 border border-white/10 rounded-xl text-center flex flex-col items-center gap-3">
                  <p className="text-xs text-zinc-400">
                    Nenhuma recomendação registrada para esta publicação ainda.
                  </p>
                  <button
                    onClick={() => handleRequestAudit(selectedPost)}
                    disabled={analyzingPostId === selectedPost.id}
                    className="px-4 py-2 rounded-lg bg-upPink hover:bg-upPinkDark text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    {analyzingPostId === selectedPost.id
                      ? "Processando..."
                      : isSpecialistPlan
                      ? "Solicitar Parecer do Especialista"
                      : "Gerar Auditoria com o Agente"}
                  </button>
                </div>
              )}

              {/* Botões de Ação com Loading no Adotar */}
              {currentApproval && currentApproval.status !== "approved" && (
                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => handleAdoptSuggestion(currentApproval.id)}
                    disabled={isAdoptingId === currentApproval.id}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {isAdoptingId === currentApproval.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin" />
                        Adotando Sugestão...
                      </span>
                    ) : (
                      "Adotar Sugestão"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewModalApproval(currentApproval)}
                    className="py-2.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Solicitar Ajuste
                  </button>
                </div>
              )}
            </div>

            {/* CHAT CONTEXTUAL COM O AGENTE UP IDEIAS */}
            <div className="border border-white/10 rounded-2xl bg-zinc-950 p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Conversar com o Agente sobre este Post
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Tire dúvidas, peça novas opções de ganchos ou refinamentos de copy em tempo real.
                  </p>
                </div>
              </div>

              {/* Chips de Ações Rápidas */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSendChatMessage("Dê 3 opções de ganchos visuais e headlines alternativas para este criativo.")}
                  className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[11px] text-zinc-300 transition-colors"
                >
                  3 Opções de Ganchos
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage("Como reescrever a legenda de forma mais direta e focada em comentários?")}
                  className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[11px] text-zinc-300 transition-colors"
                >
                  Otimizar para Comentários
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage("Qual a melhor chamada para ação (CTA) para fechar este post?")}
                  className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[11px] text-zinc-300 transition-colors"
                >
                  Melhorar Chamada para Ação
                </button>
              </div>

              {/* Histórico do Chat */}
              <div className="flex flex-col gap-2.5 min-h-[120px] max-h-[260px] overflow-y-auto p-3 rounded-xl bg-zinc-900/60 border border-white/5 scrollbar-thin">
                {chatMessages.length === 0 ? (
                  <div className="m-auto text-center text-zinc-500 text-xs py-4 font-mono">
                    Pergunte qualquer detalhe ou clique em uma sugestão rápida acima.
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "self-end bg-upPink/15 border border-upPink/30 text-white"
                          : "self-start bg-zinc-900 border border-white/10 text-zinc-200"
                      }`}
                    >
                      <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                        {msg.role === "user" ? "Você" : "Agente UP Ideias"} • {msg.time}
                      </span>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))
                )}

                {chatLoading && (
                  <div className="self-start bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-zinc-400 flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-upPink border-t-transparent rounded-full animate-spin" />
                    <span>Agente formulando resposta...</span>
                  </div>
                )}
              </div>

              {/* Input do Chat */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="flex items-center gap-2 pt-1"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Pergunte ao Agente sobre a legenda, imagem ou abordagem..."
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-upPink transition-colors"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-4 py-2 rounded-lg bg-upPink hover:bg-upPinkDark text-white text-xs font-semibold disabled:opacity-40 transition-colors shrink-0"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal para Solicitar Revisão */}
      {reviewModalApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-upPink">
                Solicitação de Ajuste
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                {reviewModalApproval.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Descreva o que deseja ajustar nesta recomendação para a equipe UP Ideias.
              </p>
            </div>

            <textarea
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Ex: Gostaria de alterar o foco da copy para ressaltar um benefício direto..."
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-upPink resize-none leading-relaxed"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setReviewModalApproval(null)}
                className="py-2 px-3 rounded-lg border border-white/10 text-zinc-400 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRequestAdjustment}
                className="py-2 px-4 rounded-lg bg-upPink hover:bg-upPinkDark text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Enviar Comentário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
