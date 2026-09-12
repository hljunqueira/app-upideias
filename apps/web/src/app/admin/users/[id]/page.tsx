"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase } from "@up-analytics/lib";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface Subscriber {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  instagramHandle: string;
  createdAt?: string;
}

interface SocialAccount {
  id: string;
  username: string;
  platform?: string;
  followers_count?: number;
  following_count?: number;
  media_count?: number;
  profile_picture_url?: string;
  connected_at?: string;
  status?: string;
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
  client_comment?: string;
  specialist_notes?: string;
  created_at: string;
}

export default function AdminSubscriberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: subscriberId } = use(params);

  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [account, setAccount] = useState<SocialAccount | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingInstagram, setSyncingInstagram] = useState(false);

  // Seleção de post para referência
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);

  // Form de sugestão do especialista
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("Feed Instagram");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [specialistNotes, setSpecialistNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal de desconexão de conta
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);

  // 1. Carregar dados do assinante, conta do Instagram, posts e histórico
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/subscribers/${subscriberId}/posts`);
      if (!res.ok) throw new Error("Erro ao carregar ficha do assinante.");
      const data = await res.json();
      setSubscriber(data.subscriber);
      setAccount(data.account || null);
      setPosts(data.posts || []);
      setApprovals(data.approvals || []);
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({ type: "error", text: err.message || "Erro na conexão com o servidor." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [subscriberId]);

  // 2. Ouvir atualizações de aprovações em tempo real via Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`admin-user-approvals-${subscriberId}`)
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

  // 3. Forçar sincronização imediata do Instagram oficial via /api/integrations/zernio/sync
  const handleSyncInstagram = async () => {
    if (!account?.id && !subscriberId) return;
    try {
      setSyncingInstagram(true);
      setFeedbackMsg(null);

      const res = await fetch("/api/integrations/zernio/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: account?.id, userId: subscriberId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha na sincronização do Instagram.");
      }

      setFeedbackMsg({
        type: "success",
        text: "Sincronização concluída com sucesso. Métricas e postagens atualizadas.",
      });

      await loadData();
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({ type: "error", text: err.message || "Erro ao sincronizar Instagram." });
    } finally {
      setSyncingInstagram(false);
    }
  };

  // 4. Confirmar desconexão da conta do Instagram
  const handleConfirmDisconnect = async () => {
    if (!account?.id) return;
    try {
      await fetch(`/api/admin/accounts?id=${account.id}`, { method: "DELETE" });
      setAccount(null);
      setPosts([]);
      setFeedbackMsg({ type: "success", text: "Conta do Instagram desvinculada." });
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Erro ao desconectar conta." });
    } finally {
      setDisconnectModalOpen(false);
    }
  };

  // 5. Enviar sugestão oficial do Especialista UP Ideias
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
          postMediaId: selectedPost?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao salvar sugestão.");
      }

      setFeedbackMsg({
        type: "success",
        text: "Sugestão enviada com sucesso para o painel do assinante em tempo real.",
      });

      // Limpar campos
      setTitle("");
      setCaption("");
      setImageUrl("");
      setSpecialistNotes("");
      setSelectedPost(null);
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({ type: "error", text: err.message || "Falha no envio da sugestão." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-zinc-500 font-mono text-xs uppercase tracking-wider">
        Carregando ficha completa do assinante...
      </div>
    );
  }

  if (!subscriber) {
    return (
      <div className="p-12 text-center text-zinc-400">
        <p className="text-sm">Assinante não localizado na base de dados.</p>
        <Link href="/admin/users" className="mt-4 inline-block text-xs text-upPink underline font-mono">
          ← Voltar para lista de assinantes
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-zinc-200 pb-16">
      {/* Header Executivo & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <Link href="/admin/users" className="hover:text-white transition-colors uppercase tracking-wider">
              ← Assinantes
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">Ficha Completa</span>
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {subscriber.name}
            </h1>
            <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded font-bold bg-upPink/10 text-upPink border border-upPink/30">
              Plano {subscriber.plan}
            </span>
            <span className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold border ${
              subscriber.status === "Ativo"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
            }`}>
              {subscriber.status}
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-mono mt-1">
            {subscriber.email} • Cadastro: {subscriber.createdAt ? new Date(subscriber.createdAt).toLocaleDateString("pt-BR") : "-"}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSyncInstagram}
            disabled={syncingInstagram || !account}
            className="px-4 py-2 rounded-lg bg-upPink hover:bg-upPinkDark text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 shrink-0"
          >
            {syncingInstagram ? "Sincronizando..." : "Sincronizar Instagram"}
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium border ${
            feedbackMsg.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/30 text-rose-300"
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* BLOCO A: PERFIL & CONEXÃO DO INSTAGRAM */}
      <div className="p-5 rounded-2xl border border-white/10 bg-zinc-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          {account?.profile_picture_url ? (
            <img
              src={account.profile_picture_url}
              alt={account.username}
              className="w-16 h-16 rounded-full object-cover border border-white/20 shrink-0 shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center font-mono font-bold text-upPink text-lg shrink-0">
              IG
            </div>
          )}

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-white">
                {account?.username ? `@${account.username}` : subscriber.instagramHandle || "Sem conta vinculada"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {account ? "Conexão Ativa" : "Pendente"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Plataforma Oficial: Meta Graph API • Vinculado em: {account?.connected_at ? new Date(account.connected_at).toLocaleDateString("pt-BR") : "Aguardando"}
            </p>
          </div>
        </div>

        {/* Contadores da Conta Social */}
        <div className="grid grid-cols-3 gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Seguidores</span>
            <span className="text-xl font-bold text-white font-mono mt-0.5 block">
              {account?.followers_count?.toLocaleString("pt-BR") ?? "-"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Seguindo</span>
            <span className="text-xl font-bold text-white font-mono mt-0.5 block">
              {account?.following_count?.toLocaleString("pt-BR") ?? "-"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Posts Sincronizados</span>
            <span className="text-xl font-bold text-upPink font-mono mt-0.5 block">
              {posts.length}
            </span>
          </div>
        </div>
      </div>

      {/* WORKSPACE DE 2 COLUNAS: FEED REAL (ESQUERDA) & ESPECIALISTA (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* BLOCO B: FEED DE POSTAGENS REAIS SINCRONIZADAS (7 COLUNAS) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Publicações do Assinante ({posts.length})
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Clique em uma publicação para selecioná-la como base da sugestão.
              </p>
            </div>
            {selectedPost && (
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="text-xs text-zinc-400 hover:text-white underline font-mono"
              >
                Limpar seleção
              </button>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="border border-white/10 rounded-2xl p-12 text-center text-xs text-zinc-500 bg-zinc-950/40">
              Nenhuma postagem importada para este assinante no momento.
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
                      if (!title) setTitle(`Otimização do Post: ${post.caption?.slice(0, 30) || "Criativo"}`);
                    }}
                    className={`group cursor-pointer relative rounded-xl border overflow-hidden transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-upPink ring-2 ring-upPink/30 bg-zinc-900"
                        : "border-white/10 hover:border-white/30 bg-zinc-950"
                    }`}
                  >
                    <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                      {mediaSrc ? (
                        <img
                          src={mediaSrc}
                          alt="Post"
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-zinc-500 uppercase">
                          Sem Imagem
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                        {post.media_type || "POST"}
                      </div>
                    </div>

                    <div className="p-2.5 text-[11px] text-zinc-300 line-clamp-2 leading-relaxed border-t border-white/5">
                      {post.caption || "Sem legenda informada."}
                    </div>

                    <div className="p-2 bg-zinc-900/80 flex items-center justify-between text-[10px] text-zinc-400 font-mono border-t border-white/5">
                      <span>{post.like_count || 0} curtidas</span>
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

          {/* HISTÓRICO DE SUGESTÕES ENVIADAS AO CLIENTE */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Histórico de Sugestões Enviadas a este Cliente ({approvals.length})
            </h3>

            {approvals.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono">
                Nenhuma recomendação registrada ainda. Preencha o formulário ao lado para enviar a primeira.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {approvals.map((appr) => (
                  <div
                    key={appr.id}
                    className="p-3.5 rounded-xl border border-white/10 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex flex-col gap-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold bg-upPink/10 text-upPink border border-upPink/20">
                          {appr.format || "Feed"}
                        </span>
                        <span className="font-bold text-white">{appr.title}</span>
                      </div>
                      <p className="text-zinc-400 line-clamp-1 leading-relaxed">{appr.caption}</p>
                      {appr.client_comment && (
                        <p className="text-amber-300 text-[11px] font-mono mt-0.5">
                          Ajuste solicitado pelo cliente: "{appr.client_comment}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] uppercase font-mono font-bold tracking-wider ${
                          appr.status === "approved"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                            : appr.status === "adjusted"
                            ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                            : appr.status === "rejected"
                            ? "bg-rose-950 text-rose-300 border border-rose-500/30"
                            : "bg-zinc-900 text-zinc-300 border border-white/10"
                        }`}
                      >
                        {appr.status === "approved"
                          ? "Aprovado / Publicado"
                          : appr.status === "adjusted"
                          ? "Revisão Solicitada"
                          : appr.status === "rejected"
                          ? "Recusado"
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

        {/* BLOCO C: PAINEL DO ESPECIALISTA • SUGERIR POSTAGENS (5 COLUNAS) */}
        <div className="lg:col-span-5 bg-zinc-950 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 sticky top-6 shadow-xl">
          <div className="border-b border-white/10 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-widest text-upPink font-bold border border-upPink/30 px-2 py-0.5 rounded">
                Especialista UP Ideias
              </span>
              {selectedPost && (
                <span className="text-[10px] font-mono text-zinc-400">
                  Ref: Post #{selectedPost.id.slice(0, 8)}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-white mt-2">
              Sugerir Publicação ao Assinante
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Elabore a recomendação editorial. O assinante receberá uma notificação e poderá aprovar e publicar no Instagram em 1 clique.
            </p>
          </div>

          <form onSubmit={handleSubmitSuggestion} className="flex flex-col gap-3.5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                Título da Recomendação *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Carrossel de Posicionamento e Quebra de Objeções"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-upPink"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
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
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
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
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                Legenda Sugerida (Copy Completa) *
              </label>
              <textarea
                rows={5}
                required
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Redija a copy recomendada com gancho inicial forte, desenvolvimento e CTA clara..."
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-upPink resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                Orientações Estratégicas do Especialista
              </label>
              <textarea
                rows={3}
                value={specialistNotes}
                onChange={(e) => setSpecialistNotes(e.target.value)}
                placeholder="Ex: Sugerimos postar na terça-feira entre 18h e 20h para aproveitar o maior pico de atenção da audiência..."
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-upPink resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full py-2.5 rounded-lg bg-upPink hover:bg-upPinkDark text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {submitting ? "Enviando ao Assinante..." : "Enviar Sugestão ao Assinante"}
            </button>
          </form>
        </div>

      </div>

      {/* Modal de Confirmação de Desconexão */}
      <ConfirmModal
        isOpen={disconnectModalOpen}
        title="Desconectar Perfil do Instagram"
        description="Tem certeza de que deseja revogar o acesso à conta do Instagram deste assinante?"
        confirmText="Confirmar Desconexão"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDisconnect}
        onClose={() => setDisconnectModalOpen(false)}
      />
    </div>
  );
}
