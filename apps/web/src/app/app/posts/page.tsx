"use client";

import React, { useState, useEffect } from "react";
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

export default function PostsPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [userPlan, setUserPlan] = useState<string>("Iniciante");
  const [userId, setUserId] = useState<string | null>(null);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [analyzingPostId, setAnalyzingPostId] = useState<string | null>(null);
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
        console.warn("Erro ao buscar plano do usuário:", e);
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
          setPosts(data.posts || []);
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

  // 4. Subscrição Supabase Realtime para atualizações instantâneas dos cards
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
              text: "Nova atualização recebida em tempo real.",
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

  // 5. Solicitar auditoria de um post
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

      setFeedback({
        type: "success",
        text:
          data.origin === "agent"
            ? "Diagnóstico técnico gerado pelo Agente UP Ideias."
            : "Solicitação encaminhada para a fila do Especialista UP Ideias.",
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

  // 6. Aprovar sugestão
  const handleApprove = async (approvalId: string) => {
    try {
      const res = await fetch("/api/posts/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalId, status: "approved" }),
      });
      if (res.ok) {
        setApprovals((prev) =>
          prev.map((a) => (a.id === approvalId ? { ...a, status: "approved" } : a))
        );
        setFeedback({ type: "success", text: "Sugestão aprovada com sucesso." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Erro ao aprovar sugestão." });
    }
  };

  // 7. Solicitar ajuste
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
        setFeedback({ type: "success", text: "Solicitação de revisão enviada ao Especialista." });
      }
    } catch (err) {
      setFeedback({ type: "error", text: "Erro ao solicitar revisão." });
    }
  };

  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const processedApprovals = approvals.filter((a) => a.status !== "pending");

  return (
    <div className="flex flex-col gap-8 pb-16 animate-fade-in">
      {/* Header Executivo Sem Ícones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Módulo de Publicações
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-upPink border border-upPink/30 px-2 py-0.5 rounded">
              Plano {userPlan}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-2">
            Gestão de Posts & Criativos
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Feed sincronizado do Instagram, diagnósticos de criativos e direcionamentos estratégicos em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-right">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Status Realtime</span>
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Conectado</span>
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

      {/* SEÇÃO 1: Sugestões & Diagnósticos Ativos em Tempo Real */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Recomendações & Diagnósticos Ativos
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cards sincronizados instantaneamente.
            </p>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {pendingApprovals.length} pendente(s)
          </span>
        </div>

        {loadingApprovals ? (
          <div className="p-8 border border-white/10 rounded-xl text-center text-xs text-zinc-500 uppercase tracking-wider">
            Carregando diagnósticos e recomendações...
          </div>
        ) : pendingApprovals.length === 0 ? (
          <div className="p-6 border border-white/10 rounded-xl bg-zinc-950/60 text-center text-xs text-zinc-400">
            Nenhum diagnóstico pendente no momento. Selecione uma publicação abaixo para iniciar uma análise técnica.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApprovals.map((appr) => (
              <div
                key={appr.id}
                className="p-5 rounded-xl border border-white/10 bg-zinc-950 flex flex-col justify-between gap-4 shadow-xl"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded font-bold ${
                        appr.origin === "specialist"
                          ? "bg-upPink/10 text-upPink border border-upPink/30"
                          : "bg-zinc-800 text-zinc-200 border border-white/10"
                      }`}
                    >
                      {appr.origin === "specialist"
                        ? "Especialista UP Ideias"
                        : "Agente UP Ideias"}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(appr.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {appr.title}
                  </h3>

                  {/* Se houver diagnóstico visual estruturado */}
                  {appr.visual_diagnosis && (
                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/5 text-xs">
                      {appr.visual_diagnosis.gancho_visual && (
                        <div className="bg-zinc-900/60 p-2.5 rounded border border-white/5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-0.5">
                            Gancho Visual
                          </span>
                          <p className="text-zinc-200 leading-relaxed">
                            {appr.visual_diagnosis.gancho_visual}
                          </p>
                        </div>
                      )}
                      {appr.visual_diagnosis.legibilidade_e_contraste && (
                        <div className="bg-zinc-900/60 p-2.5 rounded border border-white/5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-0.5">
                            Legibilidade & Contraste
                          </span>
                          <p className="text-zinc-200 leading-relaxed">
                            {appr.visual_diagnosis.legibilidade_e_contraste}
                          </p>
                        </div>
                      )}
                      {appr.visual_diagnosis.recomendacao_pratica && (
                        <div className="bg-zinc-900/60 p-2.5 rounded border border-white/5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-upPink block mb-0.5 font-bold">
                            Ajuste Prioritário
                          </span>
                          <p className="text-zinc-200 leading-relaxed">
                            {appr.visual_diagnosis.recomendacao_pratica}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notas do Especialista */}
                  {appr.specialist_notes && (
                    <div className="p-3 rounded bg-zinc-900 border border-white/10 text-xs text-zinc-300 leading-relaxed">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                        Direcionamento do Especialista
                      </span>
                      {appr.specialist_notes}
                    </div>
                  )}

                  {/* Copy Sugerida */}
                  {appr.caption && (
                    <div className="p-3 rounded bg-zinc-900/90 border border-white/5 text-xs text-zinc-300 leading-relaxed">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                        Copy Sugerida
                      </span>
                      {appr.caption}
                    </div>
                  )}
                </div>

                {/* Ações de Aprovação / Revisão */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => handleApprove(appr.id)}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Aprovar Sugestão
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewModalApproval(appr)}
                    className="py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Solicitar Revisão
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEÇÃO 2: Grade de Posts Reais do Instagram */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Publicações Sincronizadas da Conta
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Selecione qualquer publicação para gerar uma auditoria técnica de criativo.
            </p>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {posts.length} post(s)
          </span>
        </div>

        {loadingPosts ? (
          <div className="p-12 border border-white/10 rounded-xl text-center text-xs text-zinc-500 uppercase tracking-wider">
            Sincronizando publicações com o Instagram...
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 border border-white/10 rounded-xl text-center text-xs text-zinc-400">
            Nenhuma publicação encontrada para a conta conectada.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => {
              const mediaSrc = post.thumbnail_url || post.media_url;
              const isAnalyzing = analyzingPostId === post.id;

              return (
                <div
                  key={post.id}
                  className="rounded-xl border border-white/10 bg-zinc-950 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {mediaSrc ? (
                      <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                        <img
                          src={mediaSrc}
                          alt={post.caption?.slice(0, 50) || "Post"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur rounded text-[10px] font-mono text-zinc-300 uppercase">
                          {post.media_type || "POST"}
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square bg-zinc-900 flex items-center justify-center text-xs text-zinc-500 font-mono">
                        SEM PRÉVIA
                      </div>
                    )}

                    <div className="p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span>{post.like_count || 0} curtidas</span>
                        <span>{post.comments_count || 0} comentários</span>
                      </div>
                      <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                        {post.caption || "Sem legenda."}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 pt-0">
                    <button
                      type="button"
                      disabled={isAnalyzing}
                      onClick={() => handleRequestAudit(post)}
                      className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-upPink/20 hover:text-upPink hover:border-upPink/40 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                    >
                      {isAnalyzing ? "Auditando Criativo..." : "Auditar Criativo"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Histórico de Aprovações Anteriores */}
      {processedApprovals.length > 0 && (
        <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-white/10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Histórico de Recomendações Concluídas
          </h3>
          <div className="flex flex-col gap-2">
            {processedApprovals.map((appr) => (
              <div
                key={appr.id}
                className="p-3 rounded-lg border border-white/5 bg-zinc-950/60 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                      appr.status === "approved"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                        : appr.status === "adjusted"
                        ? "bg-amber-950 text-amber-400 border border-amber-500/30"
                        : "bg-rose-950 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {appr.status === "approved"
                      ? "Aprovado"
                      : appr.status === "adjusted"
                      ? "Ajuste Solicitado"
                      : "Recusado"}
                  </span>
                  <span className="font-medium text-white">{appr.title}</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {new Date(appr.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para Solicitar Revisão com Comentário */}
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
                Descreva o que deseja ajustar nesta recomendação para o Especialista UP Ideias.
              </p>
            </div>

            <textarea
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Ex: Gostaria de alterar o foco da copy para focar em produto ao invés de serviço..."
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
