"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Video, Sparkles, Award } from "lucide-react";
import { Trail } from "@/lib/coursesStore";

interface TrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trail: Trail) => void;
  initialTrail?: Trail | null;
}

export function TrailModal({ isOpen, onClose, onSave, initialTrail }: TrailModalProps) {
  const [formData, setFormData] = useState<Partial<Trail>>({
    name: "",
    description: "",
    color: "#ff5368",
    badge: "Essencial",
    recommendedOrder: 1,
    videoIntroUrl: ""
  });

  useEffect(() => {
    if (initialTrail) {
      setFormData(initialTrail);
    } else {
      setFormData({
        name: "",
        description: "",
        color: "#ff5368",
        badge: "Nova Trilha",
        recommendedOrder: 1,
        videoIntroUrl: ""
      });
    }
  }, [initialTrail, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const trailToSave: Trail = {
      id: initialTrail?.id || `trail-${Date.now()}`,
      name: formData.name || "Nova Trilha",
      description: formData.description || "",
      color: formData.color || "#ff5368",
      badge: formData.badge || "Essencial",
      recommendedOrder: Number(formData.recommendedOrder) || 1,
      videoIntroUrl: formData.videoIntroUrl || ""
    };

    onSave(trailToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialTrail ? "Editar Trilha de Aprendizado" : "Criar Nova Trilha de Aprendizado"}
              </h2>
              <p className="text-xs text-upGray">Configure a jornada sequencial recomendada.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-upGray hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-upGray mb-1.5 uppercase tracking-wider">
              Nome da Trilha *
            </label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Inteligência Artificial no Instagram"
              className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-upPink transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-upGray mb-1.5 uppercase tracking-wider">
              Descrição Curta
            </label>
            <textarea
              rows={2}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva os objetivos desta trilha..."
              className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-upPink transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-upGray mb-1 uppercase tracking-wider">
                Selo / Badge (Ex: Essencial)
              </label>
              <input
                type="text"
                value={formData.badge || ""}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="Ex: Mais Popular"
                className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-upPink transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-upGray mb-1 uppercase tracking-wider">
                Ordem Recomendada (1, 2, 3...)
              </label>
              <input
                type="number"
                value={formData.recommendedOrder || 1}
                onChange={(e) => setFormData({ ...formData, recommendedOrder: Number(e.target.value) })}
                className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-upPink transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-upGray mb-1 uppercase tracking-wider flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-upPink" /> Link do Vídeo Teaser da Trilha (YouTube/Vimeo)
            </label>
            <input
              type="url"
              value={formData.videoIntroUrl || ""}
              onChange={(e) => setFormData({ ...formData, videoIntroUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition"
            />
          </div>

          {/* Ações */}
          <div className="pt-4 flex justify-end gap-3 border-t border-upBorder/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-upGray hover:text-white bg-white/5 hover:bg-white/10 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-upPink hover:bg-upPink/90 shadow-[0_0_20px_rgba(255,83,104,0.4)] transition"
            >
              {initialTrail ? "Salvar Trilha" : "Criar Trilha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
