"use client";

import { useState, useEffect, useRef } from "react";
import { X, UploadCloud, Image as ImageIcon, Trash2, RefreshCw, Link as LinkIcon, Loader2, AlertCircle } from "lucide-react";
import { Course } from "@/lib/coursesStore";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => Promise<{ success: boolean; error?: string } | void> | void;
  initialCourse?: Course | null;
  tracks: string[];
}

export function CourseModal({ isOpen, onClose, onSave, initialCourse, tracks }: CourseModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const availableTracks = tracks.filter((t) => t !== "Todos" && t.trim().length > 0);
  const defaultTrack = availableTracks[0] || "APRENDER,PRATICAR E VENDER";

  const [thumbnailMode, setThumbnailMode] = useState<"upload" | "url">("upload");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Course>>({
    title: "",
    description: "",
    track: defaultTrack,
    tag: "Conteúdo",
    lessonInfo: "Módulo 1 • 4 Aulas",
    progress: 0,
    thumbnailUrl: "",
    videoTeaserUrl: "",
    level: "Iniciante",
    xpReward: 350,
    isLandingPageFeatured: true,
    isRecommendedFirst: false,
    accessTier: "Grátis",
    status: "published",
    modulesCount: 1,
    lessonsCount: 4
  });

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setIsSaving(false);
      if (initialCourse) {
        setFormData({ ...initialCourse });
        setCustomImageUrl(initialCourse.thumbnailUrl || "");
        if (initialCourse.thumbnailUrl?.startsWith("http")) {
          setThumbnailMode("url");
        } else {
          setThumbnailMode("upload");
        }
      } else {
        setFormData({
          title: "",
          description: "",
          track: defaultTrack,
          tag: "Conteúdo",
          lessonInfo: "Módulo 1 • 4 Aulas",
          progress: 0,
          thumbnailUrl: "",
          videoTeaserUrl: "",
          level: "Iniciante",
          xpReward: 350,
          isLandingPageFeatured: true,
          isRecommendedFirst: false,
          accessTier: "Grátis",
          status: "published",
          modulesCount: 1,
          lessonsCount: 4
        });
        setCustomImageUrl("");
        setThumbnailMode("upload");
      }
    }
  }, [isOpen, initialCourse?.id, defaultTrack]);

  if (!isOpen) return null;

  // Função para comprimir e redimensionar imagem no cliente via Canvas (evita payload gigante no banco)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        const res = e.target?.result;
        if (typeof res === "string") {
          img.src = res;
        }
      };
      reader.onerror = reject;

      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 675; // Proporção 16:9
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(img.src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Tenta WebP e fallback JPEG
        try {
          const webpData = canvas.toDataURL("image/webp", 0.82);
          resolve(webpData);
        } catch {
          const jpegData = canvas.toDataURL("image/jpeg", 0.82);
          resolve(jpegData);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).");
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file);
      setFormData((prev) => ({ ...prev, thumbnailUrl: compressedDataUrl }));
    } catch (err) {
      console.error("Erro ao processar imagem:", err);
      // Fallback normal
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result;
        if (typeof res === "string") {
          setFormData((prev) => ({ ...prev, thumbnailUrl: res }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setFormData((prev) => ({ ...prev, thumbnailUrl: "" }));
    setCustomImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleApplyUrl = (url: string) => {
    setCustomImageUrl(url);
    setFormData((prev) => ({ ...prev, thumbnailUrl: url.trim() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setErrorMessage("Por favor, informe o título do curso.");
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      const fallbackThumb =
        formData.thumbnailUrl?.trim() ||
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop";

      const courseToSave: Course = {
        id: initialCourse?.id || `course-${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        track: formData.track?.trim() || defaultTrack,
        tag: formData.tag?.trim() || "Geral",
        lessonInfo: formData.lessonInfo || `${formData.modulesCount || 1} Módulo(s)`,
        progress: formData.progress ?? 0,
        thumbnailUrl: fallbackThumb,
        videoTeaserUrl: formData.videoTeaserUrl?.trim() || undefined,
        level: (formData.level as any) || "Iniciante",
        xpReward: Number(formData.xpReward) || 350,
        isLandingPageFeatured: formData.isLandingPageFeatured ?? true,
        isRecommendedFirst: formData.isRecommendedFirst ?? false,
        accessTier: (formData.accessTier as any) || "Grátis",
        orderIndex: initialCourse?.orderIndex || 1,
        status: (formData.status as any) || "published",
        modulesCount: Number(formData.modulesCount) || 1,
        lessonsCount: Number(formData.lessonsCount) || 1,
        createdAt: initialCourse?.createdAt || new Date().toISOString()
      };

      const result = await onSave(courseToSave);
      if (result && typeof result === "object" && result.success === false) {
        setErrorMessage(result.error || "Não foi possível salvar o curso.");
        setIsSaving(false);
        return;
      }

      setIsSaving(false);
      onClose();
    } catch (err: any) {
      console.error("Erro ao submeter formulário:", err);
      setErrorMessage(err?.message || "Erro inesperado ao salvar curso.");
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0b10] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0e0e14] shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {initialCourse ? "Editar Curso" : "Criar Novo Curso"}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cadastre as informações do curso e envie a imagem de capa.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerta de Erro se houver */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Corpo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-white/5">
          
          {/* Formulário */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Título do Curso <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Formação Prática em Criação de Conteúdo"
                className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/80 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Descrição
              </label>
              <textarea
                rows={2}
                value={formData.description || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Resumo prático do que o aluno irá aprender..."
                className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/80 transition resize-none"
              />
            </div>

            {/* Trilha, Tag e Acesso */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Trilha Guiada
                </label>
                {availableTracks.length > 0 ? (
                  <select
                    value={formData.track || defaultTrack}
                    onChange={(e) => setFormData((prev) => ({ ...prev, track: e.target.value }))}
                    className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/80 transition cursor-pointer"
                  >
                    {availableTracks.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.track || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, track: e.target.value }))}
                    placeholder="Nome da Trilha"
                    className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Tag do Badge
                </label>
                <input
                  type="text"
                  value={formData.tag || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
                  placeholder="Ex: Conteúdo, Gravação"
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/80 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Acesso
                </label>
                <select
                  value={formData.accessTier || "Grátis"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accessTier: e.target.value as any }))}
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/80 transition cursor-pointer"
                >
                  <option value="Grátis">Grátis</option>
                  <option value="Plano Pro">Plano Pro</option>
                  <option value="VIP Exclusivo">VIP Exclusivo</option>
                </select>
              </div>
            </div>

            {/* Capa do Curso (Upload ou URL) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-300">
                  Capa do Curso (Thumbnail)
                </label>
                <div className="flex items-center gap-1 bg-[#12121a] p-0.5 rounded-lg border border-white/10 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setThumbnailMode("upload")}
                    className={`px-2 py-0.5 rounded-md font-semibold transition ${
                      thumbnailMode === "upload" ? "bg-rose-500 text-white" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Arquivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnailMode("url")}
                    className={`px-2 py-0.5 rounded-md font-semibold transition ${
                      thumbnailMode === "url" ? "bg-rose-500 text-white" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Link URL
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {formData.thumbnailUrl ? (
                <div className="relative group rounded-2xl overflow-hidden border border-white/15 bg-[#12121a] p-3 flex items-center gap-4">
                  <div className="w-24 h-16 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10">
                    <img
                      src={formData.thumbnailUrl}
                      alt="Thumbnail selecionada"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Capa Carregada</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate">
                      Imagem pronta para exibição nos cards da plataforma.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {thumbnailMode === "upload" ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        title="Substituir imagem"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Trocar</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setThumbnailMode("url")}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        title="Editar URL"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">URL</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Remover imagem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : thumbnailMode === "url" ? (
                <div className="p-4 bg-[#12121a] border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Cole a URL da imagem (ex: https://images.unsplash.com/...)"
                      value={customImageUrl}
                      onChange={(e) => handleApplyUrl(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/80 transition"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Dica: Você pode usar URLs de imagens do Unsplash ou de qualquer CDN seguro.
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("image/")) {
                      try {
                        const compressed = await compressImage(file);
                        setFormData((prev) => ({ ...prev, thumbnailUrl: compressed }));
                      } catch {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const res = event.target?.result;
                          if (typeof res === "string") {
                            setFormData((prev) => ({ ...prev, thumbnailUrl: res }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }
                  }}
                  className="border-2 border-dashed border-white/15 hover:border-rose-500/50 bg-[#12121a]/60 hover:bg-[#12121a] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-rose-500/10 group-hover:text-rose-400 text-neutral-400 flex items-center justify-center mb-2.5 transition">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white group-hover:text-rose-400 transition">
                    Clique para fazer upload da capa ou arraste uma imagem
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    PNG, JPG ou WebP • Otimizado automaticamente
                  </p>
                </div>
              )}
            </div>

            {/* Vídeo Teaser & XP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Vídeo Teaser (YouTube / MP4)
                </label>
                <input
                  type="text"
                  value={formData.videoTeaserUrl || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, videoTeaserUrl: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/80 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Recompensa em XP
                </label>
                <input
                  type="number"
                  value={formData.xpReward || 350}
                  onChange={(e) => setFormData((prev) => ({ ...prev, xpReward: Number(e.target.value) }))}
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/80 transition"
                />
              </div>
            </div>

            {/* Nível e Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nível de Dificuldade
                </label>
                <select
                  value={formData.level || "Iniciante"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value as any }))}
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/80 transition cursor-pointer"
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Status de Publicação
                </label>
                <select
                  value={formData.status || "published"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/80 transition cursor-pointer"
                >
                  <option value="published">Publicado (Visível aos Alunos)</option>
                  <option value="draft">Rascunho (Oculto)</option>
                </select>
              </div>
            </div>

            {/* Checkboxes de Destaque */}
            <div className="pt-2 flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={formData.isLandingPageFeatured ?? true}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isLandingPageFeatured: e.target.checked }))}
                  className="rounded border-white/20 bg-neutral-800 text-rose-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Exibir este curso na Landing Page pública</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={formData.isRecommendedFirst ?? false}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isRecommendedFirst: e.target.checked }))}
                  className="rounded border-white/20 bg-neutral-800 text-rose-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Marcar como "🟢 Começar por aqui" (Primeiro da Trilha)</span>
              </label>
            </div>

            {/* Botões de Ação */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg transition cursor-pointer flex items-center gap-2 disabled:opacity-75"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {isSaving
                    ? "Salvando..."
                    : initialCourse
                    ? "Salvar Alterações"
                    : "Criar Curso"}
                </span>
              </button>
            </div>
          </form>

          {/* Prévia do Card */}
          <div className="lg:col-span-5 p-6 bg-[#0e0e14]/50 flex flex-col justify-center items-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Prévia do Card na Plataforma
            </p>
            <div className="w-full max-w-sm rounded-2xl bg-[#0e0e14] border border-white/10 overflow-hidden shadow-xl">
              <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden flex items-center justify-center">
                {formData.thumbnailUrl ? (
                  <img
                    src={formData.thumbnailUrl}
                    alt="Prévia"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-500 text-xs">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                    <span>Sem capa selecionada</span>
                  </div>
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-bold text-white uppercase">
                  {formData.tag || "Geral"}
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-rose-500/80 text-[9px] font-bold text-white">
                  +{formData.xpReward || 350} XP
                </span>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-[10px] text-neutral-400 font-medium">{formData.track || defaultTrack}</p>
                <h4 className="text-sm font-bold text-white line-clamp-1">{formData.title || "Título do Curso"}</h4>
                <p className="text-xs text-neutral-400 line-clamp-2">{formData.description || "Descrição curta..."}</p>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-neutral-400">
                  <span>{formData.modulesCount || 1} Módulos • {formData.lessonsCount || 4} Aulas</span>
                  <span className="text-white font-semibold">{formData.level || "Iniciante"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
