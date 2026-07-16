"use client";

import { useState } from "react";
import { 
  CheckSquare, 
  ThumbsUp, 
  MessageSquare,
  AlertCircle,
  ThumbsDown,
  Clock
} from "lucide-react";
import { getStatusLabel } from "@up-analytics/lib";
import { StatusBadge } from "@up-analytics/ui";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([
    {
      id: "app-1",
      title: "Funil de Conteúdo Inteligente no Instagram",
      caption: "Aprenda a guiar seu seguidor desde a descoberta até a conversão utilizando formatos corretos de posts.",
      visual_suggestion: "Fundo com paleta escura, realces em coral, textos explicativos simples.",
      format: "Reels",
      status: "pending",
      requested_at: "2026-07-04T10:00:00Z"
    },
    {
      id: "app-2",
      title: "Legendas que Convertem",
      caption: "Pare de escrever legendas genéricas! Se você quer vender no direct, precisa usar esses 3 modelos estruturais.",
      visual_suggestion: "Carrossel com 5 slides contendo templates prontos de legendas.",
      format: "Carrossel",
      status: "pending",
      requested_at: "2026-07-03T15:30:00Z"
    }
  ]);

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(app => 
      app.id === id ? { ...app, status: "approved" } : app
    ));
  };

  const handleReject = (id: string) => {
    setApprovals(prev => prev.map(app => 
      app.id === id ? { ...app, status: "rejected" } : app
    ));
  };

  const pendingApprovals = approvals.filter(a => a.status === "pending");

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
          <CheckSquare className="w-8 h-8 text-upPink" />
          Aprovações pendentes
        </h1>
        <p className="text-sm text-upGray mt-1">
          Aprove conteúdos ou solicite alterações de posts agendados para sua marca.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {pendingApprovals.length > 0 ? (
          pendingApprovals.map((item) => (
            <div key={item.id} className="bg-upCard border border-upBorder rounded-2xl p-6 flex flex-col gap-6">
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="px-2 py-0.5 rounded bg-upPink/10 text-upPink text-[10px] font-bold uppercase tracking-wider">
                    {item.format}
                  </span>
                  <h3 className="text-base font-bold text-upWhite mt-2">{item.title}</h3>
                </div>

                <span className="flex items-center gap-1 text-[10px] text-upGray font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-upPink" />
                  {new Date(item.requested_at).toLocaleDateString("pt-BR")}
                </span>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-upGray font-bold uppercase tracking-wider">Legenda do Post</span>
                  <p className="text-xs text-upLightGray leading-relaxed bg-upDark/50 p-4 rounded-xl border border-upBorder/40">
                    {item.caption}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-upGray font-bold uppercase tracking-wider">Ideia Visual & Arte</span>
                  <p className="text-xs text-upLightGray leading-relaxed bg-upDark/30 p-4 rounded-xl border border-upBorder/20">
                    {item.visual_suggestion}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-upBorder/30 pt-4 mt-2">
                <button 
                  onClick={() => handleReject(item.id)}
                  className="px-4 py-2 border border-upBorder hover:bg-upPink/10 text-upPink text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <ThumbsDown className="w-3.5 h-3.5" /> Rejeitar / Alterar
                </button>
                
                <button 
                  onClick={() => handleApprove(item.id)}
                  className="px-4 py-2 bg-upPink hover:bg-upPinkDark text-upWhite text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> Aprovar Post
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-upCard border border-upBorder rounded-2xl p-16 text-center text-upGray flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center">
              ✓
            </div>
            <div>
              <h3 className="text-sm font-bold text-upWhite">Tudo em dia!</h3>
              <p className="text-xs text-upGray mt-1">Não há aprovações pendentes de posts no momento.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
