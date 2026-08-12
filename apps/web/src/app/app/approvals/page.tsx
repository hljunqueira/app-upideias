"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Sparkles, Image as ImageIcon, Copy, Check, MessageSquare, X, Send } from "lucide-react";
import { ApprovalItem, fetchApprovalsFromDb, updateApprovalStatus } from "@/lib/approvalsStore";

import { PlanGate } from "@/components/common/PlanGate";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Feedback Modal
  const [rejectingItem, setRejectingItem] = useState<ApprovalItem | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");

  const loadApprovals = async () => {
    const data = await fetchApprovalsFromDb();
    setApprovals(data);
  };


  useEffect(() => {
    loadApprovals();
    const handleUpdate = () => loadApprovals();
    window.addEventListener("up_approvals_updated", handleUpdate);
    return () => window.removeEventListener("up_approvals_updated", handleUpdate);
  }, []);

  const handleApprove = (id: string) => {
    updateApprovalStatus(id, "approved");
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem) return;
    updateApprovalStatus(rejectingItem.id, "rejected", feedbackNote);
    setRejectingItem(null);
    setFeedbackNote("");
  };

  const handleCopyCaption = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  return (
    <PlanGate featureKey="approvals" featureTitle="Aprovações Pendentes">
      <div className="flex flex-col gap-8 max-w-5xl mx-auto animate-fadeIn text-upLightGray">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-upPink" />
          Aprovações Pendentes
        </h1>
        <p className="text-sm text-upGray mt-1">
          Aprove sugestões visuais enviadas pelo seu gestor/admin ou solicite alterações em 1 clique.
        </p>
      </div>

      {/* Lista de Sugestões de Conteúdo para Aprovação */}
      {pendingApprovals.length === 0 ? (
        <div className="bg-upCard border border-upBorder rounded-2xl p-16 text-center text-upGray flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Tudo Aprovado!</h3>
            <p className="text-xs text-upGray mt-1">
              Não há sugestões pendentes no momento. As novas publicações enviadas pelo admin aparecerão aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingApprovals.map((item) => (
            <div
              key={item.id}
              className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 shadow-2xl space-y-5 transition-all hover:border-upPink/40"
            >
              {/* Header do Card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase bg-upPink/20 text-upPink border border-upPink/30 px-3 py-1 rounded-md">
                    {item.format}
                  </span>
                </div>
                <span className="text-xs font-bold text-upGray flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-upPink" /> Data Alvo: {item.targetDate}
                </span>
              </div>

              {/* Layout Dual Column: Imagem Real da Arte na Esquerda, Detalhes na Direita */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* COLUNA ESQUERDA: Imagem Real / Preview da Arte */}
                <div className="md:col-span-4 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-upGray block">
                    Preview da Arte / Criativo
                  </span>
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-upBorder/60 group shadow-lg bg-upDark">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-3">
                      <span className="text-[10px] font-bold text-white bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md">
                        Arte Sugerida pelo Gestor 🖼️
                      </span>
                    </div>
                  </div>
                </div>

                {/* COLUNA DIREITA: Título, Legenda e Dica Visual */}
                <div className="md:col-span-8 space-y-4">
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>

                  {/* Box 1: Legenda do Post */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-upGray">
                        Legenda do Post
                      </span>
                      <button
                        onClick={() => handleCopyCaption(item.id, item.caption)}
                        className="text-[11px] text-upPink font-semibold hover:underline flex items-center gap-1"
                      >
                        {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === item.id ? "Copiado!" : "Copiar Legenda"}</span>
                      </button>
                    </div>
                    <div className="p-4 bg-upDark/60 border border-upBorder/40 rounded-2xl text-xs text-white leading-relaxed font-mono">
                      {item.caption}
                    </div>
                  </div>

                  {/* Box 2: Ideia Visual & Arte (Orientação Dica do Admin) */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-upPink mb-1.5 block">
                      🎨 Ideia Visual & Dica de Arte (Gestor UP)
                    </span>
                    <div className="p-4 bg-upDark/80 border border-upPink/30 rounded-2xl text-xs text-upLightGray leading-relaxed">
                      {item.visualIdea}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Ação do Cliente */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-upBorder/40">
                <button
                  onClick={() => setRejectingItem(item)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-upDark hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Rejeitar / Solicitar Alteração</span>
                </button>

                <button
                  onClick={() => handleApprove(item.id)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-upPink hover:bg-upPink/90 text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(255,83,104,0.3)] transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprovar Post & Agendar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Rejeição / Feedback para o Admin */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0b0f] border border-upBorder/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
            <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Solicitar Alteração ao Gestor</h3>
              </div>
              <button
                onClick={() => setRejectingItem(null)}
                className="p-1.5 text-upGray hover:text-white bg-white/5 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <p className="text-xs text-upGray">
                Escreva abaixo o que precisa ser ajustado no post <strong className="text-white">"{rejectingItem.title}"</strong>:
              </p>

              <textarea
                rows={3}
                required
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Ex: Gostaria de alterar a paleta de cores para tons de azul e ajustar o tom da legenda..."
                className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-upGray focus:outline-none focus:border-rose-500 transition resize-none"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-4 py-2 bg-upDark hover:bg-white/5 border border-upBorder/60 text-upGray hover:text-white rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Ajustes ao Gestor</span>
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
