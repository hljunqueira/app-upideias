"use client";

import { useState, useEffect } from "react";
import { X, Play, Sparkles, Image as ImageIcon, Video, CheckCircle2, ShieldAlert, Award, GraduationCap, Layers, Upload } from "lucide-react";
import { Course } from "@/lib/coursesStore";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  initialCourse?: Course | null;
  tracks: string[];
}

const DEFAULT_THUMBNAILS = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop"
];

export function CourseModal({ isOpen, onClose, onSave, initialCourse, tracks }: CourseModalProps) {
  const [formData, setFormData] = useState<Partial<Course>>({
    title: "",
    description: "",
    track: tracks[1] || "Fundamentos",
    tag: "Estratégia",
    lessonInfo: "Módulo 1 • Aula 1",
    progress: 0,
    thumbnailUrl: DEFAULT_THUMBNAILS[0],
    videoTeaserUrl: "",
    level: "Iniciante",
    xpReward: 350,
    isLandingPageFeatured: true,
    isRecommendedFirst: false,
    accessTier: "Grátis",
    status: "published",
    modulesCount: 1,
    lessonsCount: 5
  });

  useEffect(() => {
    if (initialCourse) {
      setFormData(initialCourse);
    } else {
      setFormData({
        title: "",
        description: "",
        track: tracks[1] || "Fundamentos",
        tag: "Novo",
        lessonInfo: "Módulo 1 • Aula 1",
        progress: 0,
        thumbnailUrl: DEFAULT_THUMBNAILS[0],
        videoTeaserUrl: "",
        level: "Iniciante",
        xpReward: 350,
        isLandingPageFeatured: true,
        isRecommendedFirst: false,
        accessTier: "Grátis",
        status: "published",
        modulesCount: 1,
        lessonsCount: 5
      });
    }
  }, [initialCourse, isOpen, tracks]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    const courseToSave: Course = {
      id: initialCourse?.id || `c-${Date.now()}`,
      title: formData.title || "Novo Curso",
      description: formData.description || "",
      track: formData.track || "Fundamentos",
      tag: formData.tag || "Estratégia",
      lessonInfo: formData.lessonInfo || "Módulo 1 • Aula 1",
      progress: formData.progress ?? 0,
      thumbnailUrl: formData.thumbnailUrl || DEFAULT_THUMBNAILS[0],
      videoTeaserUrl: formData.videoTeaserUrl || "",
      level: (formData.level as any) || "Iniciante",
      xpReward: formData.xpReward || 350,
      isLandingPageFeatured: formData.isLandingPageFeatured ?? true,
      isRecommendedFirst: formData.isRecommendedFirst ?? false,
      accessTier: (formData.accessTier as any) || "Grátis",
      orderIndex: initialCourse?.orderIndex || Date.now(),
      status: (formData.status as any) || "published",
      modulesCount: formData.modulesCount || 1,
      lessonsCount: formData.lessonsCount || 5,
      createdAt: initialCourse?.createdAt || new Date().toISOString()
    };

    onSave(courseToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header do Modal */}
        <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-upPink/10 text-upPink rounded-2xl border border-upPink/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialCourse ? "Editar Curso & Card da Landing Page" : "Criar Novo Curso UP Creator"}
              </h2>
              <p className="text-xs text-upGray">
                Altere os campos para ver a renderização exata do card em tempo real.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-upGray hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Dual-Pane: Formulário à esquerda, Live Preview à direita */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-upBorder/40">
          
          {/* LADO ESQUERDO: Formulário de Configuração */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 p-6 space-y-5">
            {/* Título & Descrição */}
            <div>
              <label className="block text-xs font-semibold text-upGray mb-1.5 uppercase tracking-wider">
                Título do Curso *
              </label>
              <input
                type="text"
                required
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Masterclass de Reels Virais"
                className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-upGray focus:outline-none focus:border-upPink transition"
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
                placeholder="Resumo envolvente do que o aluno irá aprender..."
                className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition resize-none"
              />
            </div>

            {/* Trilha, Tag & Nível de Acesso - Alinhamento Perfeito */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-upGray mb-1.5 uppercase tracking-wider">
                  Trilha / Categoria
                </label>
                <select
                  value={formData.track || ""}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                  className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                >
                  {tracks.filter((t) => t !== "Todos").map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-upGray mb-1.5 uppercase tracking-wider">
                  Tag do Badge
                </label>
                <input
                  type="text"
                  value={formData.tag || ""}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="Ex: Reels, Copy"
                  className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-upGray mb-1.5 uppercase tracking-wider">
                  Nível de Acesso
                </label>
                <select
                  value={formData.accessTier || "Grátis"}
                  onChange={(e) => setFormData({ ...formData, accessTier: e.target.value as any })}
                  className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                >
                  <option value="Grátis">Grátis</option>
                  <option value="Plano Pro">Plano Pro</option>
                  <option value="VIP Exclusivo">VIP Exclusivo</option>
                </select>
              </div>
            </div>

            {/* Capa / Thumbnail - Exclusivo Drag & Drop / Upload */}
            <div>
              <label className="text-xs font-semibold text-upGray mb-1.5 uppercase tracking-wider block">
                Imagem de Capa (Upload ou Arraste)
              </label>

              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith("image/")) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, thumbnailUrl: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-upBorder/80 hover:border-upPink/80 bg-upDark/60 hover:bg-upDark/90 rounded-2xl cursor-pointer transition group text-center overflow-hidden min-h-[110px]"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, thumbnailUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {formData.thumbnailUrl ? (
                  <div className="flex items-center gap-4 w-full">
                    <img
                      src={formData.thumbnailUrl}
                      alt="Preview Capa"
                      className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="text-left flex-1">
                      <p className="text-xs font-bold text-white group-hover:text-upPink transition">
                        Imagem Selecionada
                      </p>
                      <p className="text-[11px] text-upGray mt-0.5">
                        Clique ou arraste outro arquivo para alterar a capa
                      </p>
                    </div>
                    <span className="px-3 py-1.5 bg-upPink/20 text-upPink border border-upPink/30 rounded-xl text-xs font-bold shrink-0">
                      Alterar Capa
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-upPink/10 text-upPink rounded-2xl mb-2 group-hover:scale-110 transition">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-white group-hover:text-upPink transition">
                      Clique para fazer upload ou arraste a imagem aqui
                    </p>
                    <p className="text-[10px] text-upGray mt-1">
                      PNG, JPG ou WEBP (Proporção recomendada 4:5 ou 600x750px)
                    </p>
                  </>
                )}
              </label>
            </div>

            {/* Vídeo Teaser URL & Nível - Alinhamento Perfeito */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="text-[11px] font-semibold text-upGray mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-upPink shrink-0" />
                  <span>Vídeo Teaser (Trailer)</span>
                </label>
                <input
                  type="url"
                  value={formData.videoTeaserUrl || ""}
                  onChange={(e) => setFormData({ ...formData, videoTeaserUrl: e.target.value })}
                  placeholder="Link YouTube, Cloudflare ou Vimeo..."
                  className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-upGray mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>XP Recompensa (Aluno)</span>
                </label>
                <input
                  type="number"
                  value={formData.xpReward || 350}
                  onChange={(e) => setFormData({ ...formData, xpReward: Number(e.target.value) })}
                  className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                />
              </div>
            </div>

            {/* Toggles de Exibição & Destaque */}
            <div className="p-3.5 bg-upDark/60 border border-upBorder/60 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-upPink" />
                  <div>
                    <p className="text-xs font-semibold text-white">Exibir na Landing Page</p>
                    <p className="text-[10px] text-upGray">Card ativo na prateleira principal do site</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isLandingPageFeatured ?? true}
                  onChange={(e) => setFormData({ ...formData, isLandingPageFeatured: e.target.checked })}
                  className="w-4 h-4 accent-upPink cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-upBorder/40">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-semibold text-white">🟢 Começar Por Aqui (Trilha Guiada)</p>
                    <p className="text-[10px] text-upGray">Selo de recomendação sequencial nº 1 da trilha</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isRecommendedFirst ?? false}
                  onChange={(e) => setFormData({ ...formData, isRecommendedFirst: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Ações */}
            <div className="pt-3 flex justify-end gap-3">
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
                {initialCourse ? "Salvar Alterações" : "Publicar Curso"}
              </button>
            </div>
          </form>

          {/* LADO DIREITO: Live Preview do Card Fiel à Landing Page */}
          <div className="lg:col-span-5 p-6 bg-[#08080c] flex flex-col items-center justify-center relative min-h-[400px]">
            <div className="text-center mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-upPink/10 text-upPink border border-upPink/30 px-3 py-1 rounded-full">
                ⚡ Live Card Preview
              </span>
              <p className="text-[11px] text-upGray mt-1">Renderização idêntica à Landing Page</p>
            </div>

            {/* CARD EXATO DA LANDING PAGE */}
            <div className="relative flex flex-col w-[260px] aspect-[4/5] bg-[#0f0f14] rounded-2xl overflow-hidden group border border-white/10 shadow-2xl transition-all duration-500 hover:border-upPink/50 hover:shadow-[0_20px_50px_rgba(255,83,104,0.3)]">
              {/* Imagem de Fundo */}
              <div className="absolute inset-0">
                <img
                  src={formData.thumbnailUrl || DEFAULT_THUMBNAILS[0]}
                  alt={formData.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/80 to-black/30" />
              </div>

              {/* Top bar com marca UP e Tag */}
              <div className="relative p-4 z-10 flex justify-between items-center pointer-events-none">
                <div className="flex items-center bg-white px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                  <img src="/UP-Logo-removebg-preview.png" alt="UP" className="h-5 w-auto object-contain" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-upPink text-white shadow-md border border-upPink px-2.5 py-0.5 rounded-full backdrop-blur-md">
                  {formData.tag || "NOVO"}
                </span>
              </div>

              {/* Badge opcional de Começar Por Aqui */}
              {formData.isRecommendedFirst && (
                <div className="relative px-4 z-10 -mt-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500 text-black border border-emerald-400 px-2 py-0.5 rounded-md shadow-lg flex items-center gap-1 w-max">
                    🟢 COMEÇAR POR AQUI
                  </span>
                </div>
              )}

              {/* Conteúdo Base do Card */}
              <div className="relative h-full flex flex-col justify-end p-5 z-10 pointer-events-none">
                <div className="flex justify-between items-end mb-4">
                  <div className="flex-1 pr-2">
                    <span className="text-upPink text-[10px] font-extrabold uppercase tracking-widest mb-1 block drop-shadow-md">
                      {formData.accessTier || "Assine um plano"}
                    </span>
                    <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-md">
                      {formData.title || "Título do Seu Curso Aqui"}
                    </h3>
                  </div>

                  {/* Botão de Play */}
                  <div className="flex-shrink-0 bg-white text-black p-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:bg-upPink group-hover:text-white transition-all duration-300">
                    <Play className="w-3.5 h-3.5 ml-0.5 fill-black text-black group-hover:fill-white group-hover:text-white" />
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className="bg-upPink h-full rounded-full shadow-[0_0_10px_rgba(255,83,104,0.8)]"
                    style={{ width: `${formData.progress || 35}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Informações adicionais do preview */}
            <div className="mt-4 text-center">
              <span className="text-[11px] text-upGray">
                Trilha: <strong className="text-white">{formData.track}</strong> • Nível:{" "}
                <strong className="text-white">{formData.level}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
