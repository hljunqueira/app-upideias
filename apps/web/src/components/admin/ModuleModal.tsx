"use client";

import { useState, useEffect } from "react";
import { X, Layers, FileText } from "lucide-react";

interface ModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description?: string) => void;
  initialTitle?: string;
  initialDescription?: string;
}

export function ModuleModal({
  isOpen,
  onClose,
  onSave,
  initialTitle = "",
  initialDescription = ""
}: ModuleModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setTitle(initialTitle || "");
    setDescription(initialDescription || "");
  }, [initialTitle, initialDescription, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), description.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-upPink/10 text-upPink rounded-2xl border border-upPink/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialTitle ? "Editar Módulo" : "Novo Módulo do Curso"}
              </h2>
              <p className="text-xs text-upGray">Defina o nome e os detalhes da seção.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-upGray hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-upGray mb-1.5 uppercase tracking-wider">
              Título do Módulo *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Módulo 1: Fundamentos da Estratégia"
              className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-upPink transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-upGray mb-1.5 uppercase tracking-wider">
              Descrição (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resumo dos objetivos deste módulo..."
              className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-upPink transition resize-none"
            />
          </div>

          {/* Actions */}
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
              {initialTitle ? "Salvar Módulo" : "Criar Módulo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
