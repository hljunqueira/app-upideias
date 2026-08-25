"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

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
    if (isOpen) {
      setTitle(initialTitle || "");
      setDescription(initialDescription || "");
    }
  }, [isOpen, initialTitle, initialDescription]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), description.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0b10] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header Clean */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0e0e14]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {initialTitle ? "Editar Módulo" : "Novo Módulo"}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">Defina o nome e os detalhes da seção.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Clean */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Título do Módulo <span className="text-upPink">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Módulo 1: Fundamentos da Estratégia"
              className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-upPink/80 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Descrição (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resumo dos objetivos deste módulo..."
              className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-upPink/80 transition resize-none"
            />
          </div>

          {/* Actions */}
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
              {initialTitle ? "Salvar Módulo" : "Criar Módulo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
