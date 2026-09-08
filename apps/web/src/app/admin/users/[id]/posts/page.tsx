"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase } from "@up-analytics/lib";

interface Subscriber {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  instagramHandle: string;
  createdAt?: string;
}

interface PostItem {
  id: string;
  external_content_id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  permalink?: string;
  like_count?: number;
  comments_count?: number;
  published_at?: string;
}

interface ApprovalItem {
  id: string;
  title: string;
  origin: "agent" | "specialist";
  format: string;
  caption: string;
  image_url?: string;
  status: "pending" | "approved" | "rejected" | "adjusted";
  specialist_notes?: string;
  visual_diagnosis?: {
    gancho_visual?: string;
    legibilidade_e_contraste?: string;
    sugestao_legenda?: string;
    recomendacao_pratica?: string;
  };
  created_at: string;
}

export default function AdminSubscriberPostsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: subscriberId } = use(params);

  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Seleção de post para análise/inspeção
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);

  // Form de sugestão do especialista
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("Feed Instagram");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [specialistNotes, setSpecialistNotes] = useState("");
  const [visualDiagnosis, setVisualDiagnosis] = useState<any>(null);

  const [drafting, setDrafting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Carregar dados do assinante e posts
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/subscribers/${subscriberId}/posts`);
      if (!res.ok) throw new Error("Erro ao carregar dados do assinante");
      const data = await res.json();
      setSubscriber(data.subscriber);
      setPosts(data.posts || []);
      setApprovals(data.approvals || []);
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({ type: "error", text: err.message || "Erro na conexão" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [subscriberId]);

  // 2. Conectar Supabase Realtime para ouvir aprovações/mudanças de status
  useEffect(() => {
    const channel = supabase
      .channel(`admin-approvals-${subscriberId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "content_approvals",
          filter: `user_id=eq.${subscriberId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setApprovals((prev) => [payload.new as ApprovalItem, ...prev]);
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
  }, [subscriberId]);

  // 3. Gerar rascunho de apoio interno para o Especialista
  const handleGenerateDraft = async (post?: PostItem) => {
    const target = post || selectedPost;
    const mediaUrl = target?.media_url || target?.thumbnail_url || imageUrl;

    if (!mediaUrl) {
      setFeedbackMsg({
        type: "error",
        text: "Selecione uma publicação ou insira a URL da imagem para gerar a leitura técnica.",
      });
      return;
    }

    try {
      setDrafting(true);
      setFeedbackMsg(null);
      const res = await fetch("/api/posts/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: mediaUrl,
          caption: target?.caption || caption,
          postMediaId: target?.id,
          asDraft: true,
          targetUserId: subscriberId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha ao gerar rascunho");
      }

      const diag = data.diagnosis;
      setVisualDiagnosis(diag);
      setTitle(`Otimização Estratégica: ${target ? "Post Sincronizado" : "Novo Criativo"}`);
      setCaption(diag.sugestao_legenda || target?.caption || "");
      setImageUrl(mediaUrl);
      setSpecialistNotes(
        `Gancho Visual: ${diag.gancho_visual}\nLegibilidade: ${diag.legibilidade_e_contraste}\nAjuste Recomendado: ${diag.recomendacao_pratica}`
      );
      setFeedbackMsg({
        type: "success",
        text: "Rascunho técnico gerado. Ajuste a recomendação antes de enviar ao assinante.",
      });
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({ type: "error", text: err.message || "Erro ao processar visão do post." });
    } finally {
      setDrafting(false);
    }
  };

  // 4. Enviar sugestão oficial do Especialista
  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFeedbackMsg(null);

      const res = await fetch(`/api/admin/subscribers/${subscriberId}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          format,
          caption,
          imageUrl,
          specialistNotes,
          visualDiagnosis,
          postMediaId: selectedPost?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao salvar sugestão");
      }

      setFeedbackMsg({
        type: "success",
        text: "Sugestão oficial enviada com sucesso ao painel do assinante em tempo real.",
      });

      // Limpa formulário
      setTitle("");
      setCaption("");
      setImageUrl("");
      setSpecialistNotes("");
      setVisualDiagnosis(null);
      setSelectedPost(null);
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({ type: "error", text: err.message || "Erro no envio" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-zinc-400 text-xs tracking-wider uppercase">
        Carregando área de trabalho do assinante...
      </div>
    );
  }

  if (!subscriber) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>Assinante não encontrado.</p>
        <Link href="/admin/users" className="mt-4 inline-block text-xs text-upPink underline">
          Voltar para lista de assinantes
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-16">
      {/* Header Executivo Sem Ícones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/users"
              className="text-xs uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
            >
              ← Voltar para Clientes
            </Link>
            <span className="text-zinc-600">|</span>
            <span className="text-xs font-mono uppercase tracking-wider text-upPink border border-upPink/30 px-2.5 py-0.5 rounded">
              Plano {subscriber.plan}
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
              {subscriber.status}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mt-2">
            {subscriber.name}
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            {subscriber.email} • Instagram: {subscriber.instagramHandle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-zinc-900/80 border border-white/10 rounded-lg px-4 py-2 text-right">
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Posts Sincronizados</p>
            <p className="text-lg font-bold text-white font-mono">{posts.length}</p>
          </div>
          <div className="bg-zinc-900/80 border border-white/10 rounded-lg px-4 py-2 text-right">
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Sugestões Ativas</p>
            <p className="text-lg font-bold text-white font-mono">{approvals.length}</p>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3 rounded-lg text-xs font-medium border ${
            feedbackMsg.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/30 text-rose-300"
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* Grid de 2 Colunas: Feed Real (Esquerda) e Painel do Especialista (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Coluna Esquerda: Feed de Posts Sincronizados */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Publicações do Instagram
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Selecione uma publicação para auditoria ou otimização visual direta.
              </p>
            </div>
            {selectedPost && (
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="text-xs text-zinc-400 hover:text-white underline"
              >
                Limpar seleção
              </button>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="border border-white/10 rounded-xl p-8 text-center text-xs text-zinc-400">
              Nenhuma publicação sincronizada no momento para esta conta.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {posts.map((post) => {
                const isSelected = selectedPost?.id === post.id;
                const mediaSrc = post.thumbnail_url || post.media_url;

                return (
                  <div
                    key={post.id}
                    onClick={() => {
                      setSelectedPost(post);
                      setImageUrl(mediaSrc || "");
                      if (!caption) setCaption(post.caption || "");
                    }}
                    className={`group cursor-pointer relative rounded-lg border overflow-hidden transition-all ${
                      isSelected
                        ? "border-upPink ring-1 ring-upPink shadow-lg bg-zinc-900"
                        : "border-white/10 hover:border-white/30 bg-zinc-950"
                    }`}
                  >
                    {mediaSrc ? (
                      <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                        <img
                          src={mediaSrc}
                          alt={post.caption?.slice(0, 40) || "Post"}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-[10px] text-white">
                          <span>{post.like_count || 0} curtidas</span>
                          <span>{post.comments_count || 0} comentários</span>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square bg-zinc-900 flex items-center justify-center text-xs text-zinc-500 font-mono">
                        SEM IMAGEM
                      </div>
                    )}

                    <div className="p-2 border-t border-white/5 bg-zinc-900/60 text-[11px] text-zinc-300 line-clamp-2">
                      {post.caption || "Sem legenda."}
                    </div>

                    <div className="px-2 py-1 bg-zinc-950 flex items-center justify-between text-[10px] text-zinc-400 font-mono border-t border-white/5">
                      <span>{post.media_type || "POST"}</span>
                      {isSelected ? (
                        <span className="text-upPink font-bold">SELECIONADO</span>
                      ) : (
                        <span className="group-hover:text-white">SELECIONAR</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Histórico de Sugestões Enviadas a este Assinante */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Histórico de Sugestões & Status em Tempo Real
            </h3>

            {approvals.length === 0 ? (
              <p className="text-xs text-zinc-500">Nenhuma sugestão enviada até o momento.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {approvals.map((appr) => (
                  <div
                    key={appr.id}
                    className="p-3 rounded-lg border border-white/10 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded ${
                            appr.origin === "specialist"
                              ? "bg-upPink/10 text-upPink border border-upPink/30"
                              : "bg-zinc-800 text-zinc-300 border border-white/10"
                          }`}
                        >
                          {appr.origin === "specialist"
                            ? "Especialista UP Ideias"
                            : "Agente UP Ideias"}
                        </span>
                        <span className="font-bold text-white">{appr.title}</span>
                      </div>
                      <p className="text-zinc-400 line-clamp-1">{appr.caption}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                          appr.status === "approved"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                            : appr.status === "rejected"
                            ? "bg-rose-950 text-rose-400 border border-rose-500/30"
                            : appr.status === "adjusted"
                            ? "bg-amber-950 text-amber-400 border border-amber-500/30"
                            : "bg-zinc-900 text-zinc-300 border border-white/10"
                        }`}
                      >
                        {appr.status === "approved"
                          ? "Aprovado"
                          : appr.status === "rejected"
                          ? "Recusado"
                          : appr.status === "adjusted"
                          ? "Ajuste Solicitado"
                          : "Pendente"}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(appr.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Painel do Especialista UP Ideias */}
        <div className="lg:col-span-5 bg-zinc-950 border border-white/10 rounded-xl p-5 flex flex-col gap-5 sticky top-6">
          <div className="border-b border-white/10 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-widest text-upPink font-bold border border-upPink/30 px-2 py-0.5 rounded">
                Especialista UP Ideias
              </span>
              {selectedPost && (
                <span className="text-[10px] text-zinc-400 font-mono">Post #{selectedPost.id.slice(0, 8)}</span>
              )}
            </div>
            <h2 className="text-base font-bold text-white mt-2">
              Elaborar Pauta & Direcionamento
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Envie sugestões de melhoria de criativo, gancho ou copy diretamente para o assinante.
            </p>
          </div>

          {/* Botão de Rascunho com Motor Visual */}
          <div className="p-3 bg-zinc-900/60 border border-white/10 rounded-lg flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white">Apoio Interno de Visão</span>
              <span className="text-[10px] text-zinc-400 font-mono">Gemini Vision</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Realiza a leitura da imagem selecionada para pré-preencher o gancho visual e contraste.
            </p>
            <button
              type="button"
              disabled={drafting || (!selectedPost && !imageUrl)}
              onClick={() => handleGenerateDraft()}
              className="mt-1 w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold tracking-wider transition-colors disabled:opacity-40"
            >
              {drafting ? "Analisando Imagem..." : "Gerar Rascunho com Motor Visual"}
            </button>
          </div>

          <form onSubmit={handleSubmitSuggestion} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                Título da Recomendação
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Otimização de Gancho e Headline para Carrossel"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-upPink"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                  Formato
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-upPink"
                >
                  <option value="Feed Instagram">Feed Único</option>
                  <option value="Carrossel">Carrossel</option>
                  <option value="Reels">Reels</option>
                  <option value="Stories">Stories</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                  URL da Imagem / Criativo
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-upPink"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                Sugestão de Legenda & Copy
              </label>
              <textarea
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Insira a copy recomendada com gancho inicial forte e CTA clara..."
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-upPink resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                Orientações do Especialista UP Ideias
              </label>
              <textarea
                rows={3}
                value={specialistNotes}
                onChange={(e) => setSpecialistNotes(e.target.value)}
                placeholder="Notas estratégicas (ex: ajuste contraste da tipografia, mude a headline dos primeiros 2 segundos)..."
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-upPink resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full py-2.5 rounded-lg bg-upPink hover:bg-upPinkDark text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {submitting ? "Enviando em Tempo Real..." : "Enviar Sugestão ao Assinante"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
