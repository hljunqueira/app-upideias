"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
    if (isOpen) {
      if (initialTrail) {
        setFormData({ ...initialTrail });
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
    }
  }, [isOpen, initialTrail?.id]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const trailToSave: Trail = {
      id: initialTrail?.id || `trail-${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description?.trim() || "",
      color: formData.color || "#ff5368",
      badge: formData.badge?.trim() || "Essencial",
      recommendedOrder: Number(formData.recommendedOrder) || 1,
      videoIntroUrl: formData.videoIntroUrl?.trim() || ""
    };

    onSave(trailToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0b10] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0e0e14]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {initialTrail ? "Editar Trilha" : "Criar Nova Trilha"}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">Configure a jornada sequencial recomendada.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário Clean */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Nome da Trilha <span className="text-upPink">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Inteligência Artificial no Instagram"
              className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-upPink/80 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Descrição Curta
            </label>
            <textarea
              rows={2}
              value={formData.description || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva os objetivos desta trilha..."
              className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-upPink/80 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Selo / Badge
              </label>
              <input
                type="text"
                value={formData.badge || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                placeholder="Ex: Essencial"
                className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-upPink/80 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Ordem de Exibição
              </label>
              <input
                type="number"
                value={formData.recommendedOrder || 1}
                onChange={(e) => setFormData((prev) => ({ ...prev, recommendedOrder: Number(e.target.value) }))}
                className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-upPink/80 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Link do Vídeo Teaser (YouTube / Vimeo)
            </label>
            <input
              type="url"
              value={formData.videoIntroUrl || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, videoIntroUrl: e.target.value }))}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-upPink/80 transition"
            />
          </div>

          {/* Ações */}
          <div className="pt-3 flex justify-end gap-2.5 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-upPink hover:bg-upPink/90 shadow-md transition cursor-pointer"
            >
              {initialTrail ? "Salvar Trilha" : "Criar Trilha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
