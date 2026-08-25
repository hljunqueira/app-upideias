"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Lesson, LessonAttachment } from "@/lib/coursesStore";

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lesson: Lesson) => void;
  initialLesson?: Lesson | null;
  moduleId: string;
}

export function LessonModal({ isOpen, onClose, onSave, initialLesson, moduleId }: LessonModalProps) {
  const [formData, setFormData] = useState<Partial<Lesson>>({
    title: "",
    videoUrl: "",
    videoProvider: "youtube",
    durationMinutes: 10,
    isFreePreview: false,
    xpPoints: 50,
    attachments: []
  });

  const [attachments, setAttachments] = useState<LessonAttachment[]>([]);
  const [newAttachmentTitle, setNewAttachmentTitle] = useState("");
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("");
  const [newAttachmentType, setNewAttachmentType] = useState<"pdf" | "prompt" | "link">("pdf");

  useEffect(() => {
    if (isOpen) {
      if (initialLesson) {
        setFormData({ ...initialLesson });
        setAttachments(initialLesson.attachments || []);
      } else {
        setFormData({
          title: "",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          videoProvider: "youtube",
          durationMinutes: 12,
          isFreePreview: false,
          xpPoints: 50,
          attachments: []
        });
        setAttachments([]);
      }
    }
  }, [isOpen, initialLesson?.id]);

  if (!isOpen) return null;

  const handleAddAttachment = () => {
    if (!newAttachmentTitle.trim()) return;
    const item: LessonAttachment = {
      id: `att-${Date.now()}`,
      title: newAttachmentTitle.trim(),
      url: newAttachmentUrl.trim() || "#",
      type: newAttachmentType
    };
    setAttachments((prev) => [...prev, item]);
    setNewAttachmentTitle("");
    setNewAttachmentUrl("");
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    const lessonToSave: Lesson = {
      id: initialLesson?.id || `l-${Date.now()}`,
      moduleId,
      title: formData.title.trim(),
      videoUrl: formData.videoUrl?.trim() || "",
      videoProvider: formData.videoProvider || "youtube",
      durationMinutes: Number(formData.durationMinutes) || 10,
      isFreePreview: formData.isFreePreview ?? false,
      xpPoints: Number(formData.xpPoints) || 50,
      attachments
    };

    onSave(lessonToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0b10] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0e0e14]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {initialLesson ? "Editar Aula" : "Adicionar Aula"}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">Cadastre o vídeo, duração e materiais complementares.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário Clean */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Título da Aula <span className="text-upPink">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Aula 1 - Estruturando o Hook em 3 Segundos"
              className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-upPink/80 transition"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                URL do Vídeo <span className="text-upPink">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.videoUrl || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-upPink/80 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Provedor
              </label>
              <select
                value={formData.videoProvider || "youtube"}
                onChange={(e) => setFormData((prev) => ({ ...prev, videoProvider: e.target.value as any }))}
                className="w-full bg-[#12121a] border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-upPink/80 transition cursor-pointer"
              >
                <option value="youtube">YouTube</option>
                <option value="cloudflare">Cloudflare Stream</option>
                <option value="vimeo">Vimeo</option>
                <option value="panda">Panda Video</option>
                <option value="mp4">MP4 Direto</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Duração (Minutos)
              </label>
              <input
                type="number"
                value={formData.durationMinutes ?? 10}
                onChange={(e) => setFormData((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-upPink/80 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                XP para o Aluno
              </label>
              <input
                type="number"
                value={formData.xpPoints ?? 50}
                onChange={(e) => setFormData((prev) => ({ ...prev, xpPoints: Number(e.target.value) }))}
                className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-upPink/80 transition"
              />
            </div>
          </div>

          {/* Toggle Degustação */}
          <div className="p-3 bg-[#12121a] border border-white/5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white">Aula de Degustação Grátis</p>
              <p className="text-[11px] text-neutral-400">Permite assistir sem plano pago ativado</p>
            </div>
            <input
              type="checkbox"
              checked={formData.isFreePreview ?? false}
              onChange={(e) => setFormData((prev) => ({ ...prev, isFreePreview: e.target.checked }))}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Anexos e Materiais */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="block text-xs font-semibold text-neutral-300">
              Materiais de Apoio (PDFs / Links / Prompts)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Título do Material"
                value={newAttachmentTitle}
                onChange={(e) => setNewAttachmentTitle(e.target.value)}
                className="sm:col-span-5 bg-[#12121a] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500"
              />
              <select
                value={newAttachmentType}
                onChange={(e) => setNewAttachmentType(e.target.value as any)}
                className="sm:col-span-3 bg-[#12121a] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white cursor-pointer"
              >
                <option value="pdf">PDF</option>
                <option value="prompt">Prompt IA</option>
                <option value="link">Link</option>
              </select>
              <button
                type="button"
                onClick={handleAddAttachment}
                className="sm:col-span-4 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white border border-white/10 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 bg-[#12121a] border border-white/5 rounded-xl text-xs"
                  >
                    <span className="font-medium text-neutral-300 truncate max-w-xs">{att.title} ({att.type})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-neutral-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              {initialLesson ? "Salvar Aula" : "Adicionar Aula"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
