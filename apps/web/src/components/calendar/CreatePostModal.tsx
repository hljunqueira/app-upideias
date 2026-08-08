"use client";

import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Clock, Send, Trash2, CheckCircle2 } from "lucide-react";

export interface ScheduledPost {
  id: string;
  title: string;
  type: "Reels" | "Carrossel" | "Imagem" | "Story";
  status: "published" | "pending" | "draft";
  time: string;
  day: number;
  monthYear: string;
  caption?: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: ScheduledPost) => void;
  onDelete?: (postId: string) => void;
  selectedDay?: number;
  currentMonthYear: string;
  initialPost?: ScheduledPost | null;
}

export function CreatePostModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDay = 1,
  currentMonthYear,
  initialPost
}: CreatePostModalProps) {
  const [formData, setFormData] = useState<Partial<ScheduledPost>>({
    title: "",
    type: "Reels",
    status: "pending",
    time: "18:00",
    caption: ""
  });

  useEffect(() => {
    if (initialPost) {
      setFormData(initialPost);
    } else {
      setFormData({
        title: "",
        type: "Reels",
        status: "pending",
        time: "18:00",
        caption: ""
      });
    }
  }, [initialPost, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    const newPost: ScheduledPost = {
      id: formData.id || `post-${Date.now()}`,
      title: formData.title.trim(),
      type: (formData.type as any) || "Reels",
      status: (formData.status as any) || "pending",
      time: formData.time || "18:00",
      day: initialPost?.day || selectedDay,
      monthYear: currentMonthYear,
      caption: formData.caption || ""
    };

    onSave(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0b0f] border border-upBorder/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative text-upLightGray">
        
        {/* Top Bar Header */}
        <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-upPink" />
            <h3 className="text-sm font-bold text-white">
              {initialPost ? "Editar Agendamento" : `Agendar Post - ${selectedDay} de ${currentMonthYear}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-upGray hover:text-white bg-white/5 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
              Título / Tema da Postagem
            </label>
            <input
              type="text"
              required
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: 5 Dicas para Alavancar o Reels"
              className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                Formato
              </label>
              <select
                value={formData.type || "Reels"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
              >
                <option value="Reels">Reels</option>
                <option value="Carrossel">Carrossel</option>
                <option value="Imagem">Imagem de Feed</option>
                <option value="Story">Story</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                Horário da Postagem
              </label>
              <input
                type="time"
                value={formData.time || "18:00"}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
              Status de Publicação
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "pending", label: "Pendente" },
                { id: "draft", label: "Rascunho" },
                { id: "published", label: "Publicado" }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: st.id as any })}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    formData.status === st.id
                      ? "bg-upPink text-white border-upPink shadow-md"
                      : "bg-upDark/60 text-upGray border-upBorder/50 hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
              Legenda ou Roteiro (Opcional)
            </label>
            <textarea
              rows={3}
              value={formData.caption || ""}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Escreva a legenda ou o roteiro que será postado..."
              className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-upBorder/40">
            {initialPost && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialPost.id);
                  onClose();
                }}
                className="p-2.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-upDark hover:bg-white/5 border border-upBorder/60 text-upGray hover:text-white rounded-xl text-xs font-bold transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-upPink hover:bg-upPink/90 text-white rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(255,83,104,0.3)] transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{initialPost ? "Salvar Alterações" : "Agendar Post"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
