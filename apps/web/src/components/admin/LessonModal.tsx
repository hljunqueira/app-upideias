"use client";

import { useState, useEffect } from "react";
import { X, Video, Clock, Award, CheckCircle2, FileText, Plus, Trash2 } from "lucide-react";
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
    if (initialLesson) {
      setFormData(initialLesson);
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
  }, [initialLesson, isOpen]);

  if (!isOpen) return null;

  const handleAddAttachment = () => {
    if (!newAttachmentTitle.trim()) return;
    const item: LessonAttachment = {
      id: `att-${Date.now()}`,
      title: newAttachmentTitle,
      url: newAttachmentUrl || "#",
      type: newAttachmentType
    };
    setAttachments([...attachments, item]);
    setNewAttachmentTitle("");
    setNewAttachmentUrl("");
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    const lessonToSave: Lesson = {
      id: initialLesson?.id || `l-${Date.now()}`,
      moduleId,
      title: formData.title || "Nova Aula",
      videoUrl: formData.videoUrl || "",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-upPink/10 text-upPink rounded-2xl border border-upPink/20">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialLesson ? "Editar Aula do Módulo" : "Adicionar Nova Aula"}
              </h2>
              <p className="text-xs text-upGray">Cadastre o vídeo, duração e materiais complementares.</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-upGray mb-1.5 uppercase tracking-wider">
              Título da Aula *
            </label>
            <input
              type="text"
              required
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Aula 1 - Estruturando o Hook em 3 Segundos"
              className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-upPink transition"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-upGray mb-1 uppercase tracking-wider">
                URL do Vídeo (Vimeo/YouTube/MP4) *
              </label>
              <input
                type="url"
                required
                value={formData.videoUrl || ""}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-upPink transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-upGray mb-1 uppercase tracking-wider">
                Provedor
              </label>
              <select
                value={formData.videoProvider || "youtube"}
                onChange={(e) => setFormData({ ...formData, videoProvider: e.target.value as any })}
                className="w-full bg-upDark border border-upBorder/80 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-upPink transition"
              >
                <option value="youtube">🔴 YouTube (Não Listado / 100% Grátis)</option>
                <option value="cloudflare">⚡ Cloudflare Stream (Anti-Download)</option>
                <option value="vimeo">📽️ Vimeo Pro (Privacidade Domínio)</option>
                <option value="panda">🐼 Panda Video (Anti-Download & CPF)</option>
                <option value="mp4">💾 MP4 Direto</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-upGray mb-1 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-upPink" /> Duração (Minutos)
              </label>
              <input
                type="number"
                value={formData.durationMinutes || 10}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-upPink transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-upGray mb-1 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" /> XP para o Aluno
              </label>
              <input
                type="number"
                value={formData.xpPoints || 50}
                onChange={(e) => setFormData({ ...formData, xpPoints: Number(e.target.value) })}
                className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-upPink transition"
              />
            </div>
          </div>

          {/* Toggle Degustação Grátis */}
          <div className="p-3 bg-upDark/60 border border-upBorder/60 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-semibold text-white">Aula de Degustação Grátis</p>
                <p className="text-[10px] text-upGray">Permite assistir sem plano pago ativado</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.isFreePreview ?? false}
              onChange={(e) => setFormData({ ...formData, isFreePreview: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Anexos e Materiais de Apoio */}
          <div className="space-y-2 pt-2 border-t border-upBorder/40">
            <label className="text-[11px] font-semibold text-upGray uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-upPink" /> Materiais de Apoio (PDFs / Prompts IA)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Título do Material"
                value={newAttachmentTitle}
                onChange={(e) => setNewAttachmentTitle(e.target.value)}
                className="sm:col-span-5 bg-upDark border border-upBorder/80 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <select
                value={newAttachmentType}
                onChange={(e) => setNewAttachmentType(e.target.value as any)}
                className="sm:col-span-3 bg-upDark border border-upBorder/80 rounded-xl px-2 py-1.5 text-xs text-white"
              >
                <option value="pdf">PDF</option>
                <option value="prompt">Prompt IA</option>
                <option value="link">Link</option>
              </select>
              <button
                type="button"
                onClick={handleAddAttachment}
                className="sm:col-span-4 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Anexo
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 bg-upDark/40 border border-upBorder/40 rounded-xl text-xs text-upGray"
                  >
                    <span className="font-medium text-white truncate max-w-xs">{att.title} ({att.type})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              {initialLesson ? "Salvar Aula" : "Adicionar Aula"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
