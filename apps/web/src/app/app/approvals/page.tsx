"use client";

import { useState, useEffect } from "react";
import { supabase } from "@up-analytics/lib";
import { PlanGate } from "@/components/common/PlanGate";

interface ApprovalItem {
  id: string;
  user_id: string;
  title: string;
  origin?: "agent" | "specialist";
  format?: string;
  caption: string;
  image_url?: string;
  status: "pending" | "approved" | "rejected" | "adjusted";
  client_comment?: string;
  specialist_notes?: string;
  approved_at?: string;
  published_at?: string;
  created_at: string;
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "adjusted">("pending");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estados de Ação
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal de Ajuste / Revisão
  const [requestingItem, setRequestingItem] = useState<ApprovalItem | null>(null);
  const [adjustmentComment, setAdjustmentComment] = useState("");
  const [submittingAdjustment, setSubmittingAdjustment] = useState(false);

  // 1. Carregar aprovações do usuário via API oficial
  const loadApprovals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/posts/approvals");
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals || []);
      }
    } catch (err) {
      console.error("Erro ao carregar aprovações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  // 2. Ouvir atualizações em tempo real pelo Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel("subscriber-approvals-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "content_approvals",
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
  }, []);

  // 3. Copiar legenda para a área de transferência
  const handleCopyCaption = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 4. Aprovar e Publicar diretamente no Instagram Oficial
  const handleApproveAndPublish = async (item: ApprovalItem) => {
    try {
      setPublishingId(item.id);
      setFeedbackMsg(null);

      const res = await fetch("/api/integrations/zernio/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId: item.id,
          content: item.caption,
          mediaUrls: item.image_url ? [item.image_url] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao publicar no Instagram.");
      }

      setFeedbackMsg({
        type: "success",
        text: "Publicação aprovada e enviada com sucesso para o Instagram oficial.",
      });

      // Atualiza localmente
      setApprovals((prev) =>
        prev.map((a) =>
          a.id === item.id
            ? { ...a, status: "approved", published_at: new Date().toISOString() }
            : a
        )
      );
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({
        type: "error",
        text: err.message || "Não foi possível publicar no Instagram.",
      });
    } finally {
      setPublishingId(null);
    }
  };

  // 5. Apenas Aprovar (sem publicar no Instagram imediatamente)
  const handleApproveOnly = async (item: ApprovalItem) => {
    try {
      setApprovingId(item.id);
      setFeedbackMsg(null);

      const res = await fetch("/api/posts/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId: item.id,
          status: "approved",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao aprovar publicação.");
      }

      setFeedbackMsg({
        type: "success",
        text: "Publicação aprovada e arquivada com sucesso.",
      });

      setApprovals((prev) =>
        prev.map((a) =>
          a.id === item.id
            ? { ...a, status: "approved", approved_at: new Date().toISOString() }
            : a
        )
      );
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({
        type: "error",
        text: err.message || "Erro ao aprovar sugestão.",
      });
    } finally {
      setApprovingId(null);
    }
  };

  // 6. Submeter solicitação de ajustes ao Especialista
  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingItem || !adjustmentComment.trim()) return;

    try {
      setSubmittingAdjustment(true);
      setFeedbackMsg(null);

      const res = await fetch("/api/posts/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId: requestingItem.id,
          status: "adjusted",
          clientComment: adjustmentComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao registrar solicitação.");
      }

      setFeedbackMsg({
        type: "success",
        text: "Solicitação de ajustes enviada com sucesso para o especialista.",
      });

      setApprovals((prev) =>
        prev.map((a) =>
          a.id === requestingItem.id
            ? { ...a, status: "adjusted", client_comment: adjustmentComment.trim() }
            : a
        )
      );

      setRequestingItem(null);
      setAdjustmentComment("");
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({
        type: "error",
        text: err.message || "Erro ao enviar solicitação de ajustes.",
      });
    } finally {
      setSubmittingAdjustment(false);
    }
  };

  // Filtros
  const pendingItems = approvals.filter((a) => a.status === "pending");
  const approvedItems = approvals.filter((a) => a.status === "approved");
  const adjustedItems = approvals.filter((a) => a.status === "adjusted" || a.status === "rejected");

  const displayedItems =
    activeTab === "pending"
      ? pendingItems
      : activeTab === "approved"
      ? approvedItems
      : adjustedItems;

  return (
    <PlanGate featureKey="approvals" featureTitle="Aprovações de Conteúdo">
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16 animate-fade-in text-zinc-200">
        
        {/* Cabeçalho Executivo */}
        <div className="border-b border-white/10 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Aprovações de Publicações
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Sugestões estratégicas elaboradas pelo Especialista UP Ideias para aprovação e publicação direta no Instagram.
              </p>
            </div>

            {/* Abas Minimalistas */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-950 border border-white/10 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold transition-all ${
                  activeTab === "pending"
                    ? "bg-upPink text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Pendentes ({pendingItems.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("adjusted")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold transition-all ${
                  activeTab === "adjusted"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Em Revisão ({adjustedItems.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("approved")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold transition-all ${
                  activeTab === "approved"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Aprovados ({approvedItems.length})
              </button>
            </div>
          </div>
        </div>

        {/* Mensagem de Feedback */}
        {feedbackMsg && (
          <div
            className={`p-4 rounded-xl text-xs font-medium border ${
              feedbackMsg.type === "success"
                ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/50 border-rose-500/40 text-rose-300"
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* Lista de Itens */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-zinc-500 uppercase tracking-wider">
            Carregando sugestões do especialista...
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="p-16 border border-white/10 rounded-2xl bg-zinc-950 text-center space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {activeTab === "pending"
                ? "Nenhuma aprovação pendente no momento"
                : activeTab === "adjusted"
                ? "Nenhuma solicitação em revisão"
                : "Nenhuma publicação aprovada ainda"}
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {activeTab === "pending"
                ? "Quando o especialista da UP Ideias enviar uma nova recomendação de postagem, ela aparecerá aqui em tempo real."
                : "O histórico das suas decisões editoriais ficará registrado nesta seção."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedItems.map((item) => {
              const isPublishing = publishingId === item.id;
              const isApproving = approvingId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-xl space-y-5 transition-all hover:border-white/20"
                >
                  {/* Topo do Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold bg-upPink/10 text-upPink border border-upPink/30">
                        {item.format || "Feed"}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Consultoria Editorial UP Ideias
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                      <span>Data: {new Date(item.created_at).toLocaleDateString("pt-BR")}</span>
                      <span>•</span>
                      <span
                        className={`uppercase font-bold ${
                          item.status === "approved"
                            ? "text-emerald-400"
                            : item.status === "adjusted"
                            ? "text-amber-400"
                            : "text-zinc-300"
                        }`}
                      >
                        Status: {item.status === "approved" ? "Aprovado" : item.status === "adjusted" ? "Em Revisão" : "Pendente"}
                      </span>
                    </div>
                  </div>

                  {/* Grid de Conteúdo: Imagem na Esquerda, Texto na Direita */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Coluna da Esquerda: Preview da Imagem */}
                    <div className="md:col-span-4 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                        Visual / Mídia
                      </span>
                      <div className="aspect-square w-full rounded-xl overflow-hidden border border-white/10 bg-zinc-900 flex items-center justify-center relative group">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="p-6 text-center text-[11px] font-mono text-zinc-500 uppercase">
                            Sem criativo anexado
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Coluna da Direita: Título, Copy e Orientações */}
                    <div className="md:col-span-8 space-y-4">
                      <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                          {item.title}
                        </h2>
                      </div>

                      {/* Legenda do Post */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                            Texto da Legenda (Copy Completa)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCaption(item.id, item.caption)}
                            className="text-[11px] font-mono text-upPink hover:underline"
                          >
                            {copiedId === item.id ? "Copiado!" : "Copiar Texto"}
                          </button>
                        </div>
                        <div className="p-3.5 bg-zinc-900/90 border border-white/10 rounded-xl text-xs text-zinc-200 leading-relaxed font-mono whitespace-pre-line">
                          {item.caption}
                        </div>
                      </div>

                      {/* Orientações Estratégicas do Especialista */}
                      {item.specialist_notes && (
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                            Orientações Estratégicas do Especialista
                          </span>
                          <div className="p-3 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-zinc-300 leading-relaxed">
                            {item.specialist_notes}
                          </div>
                        </div>
                      )}

                      {/* Nota de Ajuste Anterior (se houver) */}
                      {item.client_comment && (
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-1">
                            Sua Solicitação de Ajuste Registrada:
                          </span>
                          <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl text-xs text-amber-200 leading-relaxed font-mono">
                            "{item.client_comment}"
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações: Visíveis Apenas para Itens Pendentes ou em Revisão */}
                  {item.status !== "approved" && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setRequestingItem(item);
                          setAdjustmentComment(item.client_comment || "");
                        }}
                        className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white hover:border-white/30 transition-all text-center"
                      >
                        Solicitar Alterações
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApproveOnly(item)}
                        disabled={isApproving || isPublishing}
                        className="px-4 py-2.5 rounded-xl border border-white/20 text-xs font-mono uppercase tracking-wider text-white hover:bg-white/5 transition-all text-center disabled:opacity-40"
                      >
                        {isApproving ? "Aprovando..." : "Apenas Aprovar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApproveAndPublish(item)}
                        disabled={isPublishing || isApproving}
                        className="px-5 py-2.5 rounded-xl bg-upPink hover:bg-upPinkDark text-white text-xs font-mono uppercase tracking-wider font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-40"
                      >
                        {/* Ícone oficial do Instagram (admitido para conexão de rede social) */}
                        <svg
                          className="w-4 h-4 fill-current shrink-0"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <span>{isPublishing ? "Publicando no Instagram..." : "Aprovar e Publicar"}</span>
                      </button>
                    </div>
                  )}

                  {/* Informação de Publicação Concluída */}
                  {item.status === "approved" && (
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-emerald-400">
                      <span>Publicação aprovada pelo assinante.</span>
                      {item.published_at && (
                        <span className="text-zinc-400">
                          Publicado em: {new Date(item.published_at).toLocaleString("pt-BR")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Minimalista de Solicitação de Ajustes */}
        {requestingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
              <div className="border-b border-white/10 pb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-upPink font-bold">
                  Revisão Editorial
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Solicitar Alterações ao Especialista
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Item: <strong className="text-white font-mono">{requestingItem.title}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmitAdjustment} className="space-y-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 block mb-1.5">
                    Descreva os ajustes necessários
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={adjustmentComment}
                    onChange={(e) => setAdjustmentComment(e.target.value)}
                    placeholder="Ex: Gostaria de alterar o gancho inicial para um tom mais direto e enfatizar o benefício X..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-upPink resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRequestingItem(null);
                      setAdjustmentComment("");
                    }}
                    className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-all"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={submittingAdjustment}
                    className="px-5 py-2 rounded-xl bg-upPink hover:bg-upPinkDark text-white text-xs font-mono uppercase tracking-wider font-bold transition-all disabled:opacity-50"
                  >
                    {submittingAdjustment ? "Enviando..." : "Enviar Solicitação"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PlanGate>
  );
}
