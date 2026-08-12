"use client";

import { useState, useEffect } from "react";
import { 
  Library, 
  Search, 
  FolderPlus, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Trash2,
  Calendar,
  X,
  Upload,
  Download,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Plus
} from "lucide-react";

import { PlanGate } from "@/components/common/PlanGate";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export interface LibraryItem {
  id: string;
  title: string;
  type: "image" | "video" | "document";
  description: string;
  updated_at: string;
  fileUrl?: string;
  externalUrl?: string;
}

const INITIAL_LIBRARY_ITEMS: LibraryItem[] = [];

const STORAGE_KEY = "up_library_items";

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video" | "document">("all");
  
  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<LibraryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingLibraryItemId, setDeletingLibraryItemId] = useState<string | null>(null);

  // New Item Form State
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"image" | "video" | "document">("image");
  const [newDescription, setNewDescription] = useState("");
  const [newFileUrl, setNewFileUrl] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(JSON.parse(raw));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LIBRARY_ITEMS));
        setItems(INITIAL_LIBRARY_ITEMS);
      }
    } catch {
      setItems(INITIAL_LIBRARY_ITEMS);
    }
  }, []);

  const saveItemsToStorage = (newItems: LibraryItem[]) => {
    setItems(newItems);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: LibraryItem = {
      id: `lib-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      description: newDescription.trim() || "Sem descrição informada.",
      fileUrl: newFileUrl || (newType === "image" ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" : undefined),
      updated_at: new Date().toISOString()
    };

    saveItemsToStorage([newItem, ...items]);
    setIsUploadOpen(false);
    setNewTitle("");
    setNewDescription("");
    setNewFileUrl("");
  };

  const onRequestDeleteItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingLibraryItemId(id);
  };

  const handleConfirmDeleteItem = () => {
    if (!deletingLibraryItemId) return;
    const filtered = items.filter((i) => i.id !== deletingLibraryItemId);
    saveItemsToStorage(filtered);
    if (previewItem?.id === deletingLibraryItemId) {
      setPreviewItem(null);
    }
    setDeletingLibraryItemId(null);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(url);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <PlanGate featureKey="library" featureTitle="Biblioteca de Conteúdo">
      <div className="flex flex-col gap-8 animate-fadeIn text-upLightGray">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
            <Library className="w-8 h-8 text-upPink" />
            Biblioteca de Conteúdo
          </h1>
          <p className="text-sm text-upGray mt-1">
            Armazene e gerencie ideias salvas, artes de design, vídeos e documentos.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-5 py-2.5 bg-upPink hover:bg-upPink/90 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(255,83,104,0.3)] flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Upload de Arquivo</span>
        </button>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-upGray" />
          <input
            type="text"
            placeholder="Buscar arquivos ou referências..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-upCard border border-upBorder rounded-2xl text-xs text-upWhite placeholder-upGray outline-none focus:border-upPink/50 transition-all"
          />
        </div>

        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1 bg-upCard p-1 rounded-2xl border border-upBorder w-full sm:w-auto overflow-x-auto">
          {[
            { id: "all", label: "Todos" },
            { id: "image", label: "Imagens" },
            { id: "video", label: "Vídeos" },
            { id: "document", label: "Roteiros" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === tab.id
                  ? "bg-upPink text-white shadow-md"
                  : "text-upGray hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setPreviewItem(item)}
              className="bg-[#0e0e14] border border-upBorder/60 hover:border-upPink/50 rounded-3xl p-5 flex flex-col justify-between gap-5 transition-all shadow-xl group cursor-pointer hover:-translate-y-1"
            >
              <div className="flex flex-col gap-4">
                {/* Thumb ou Icon Header */}
                {item.fileUrl && item.type === "image" ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-upBorder/40">
                    <img
                      src={item.fileUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-upDark border border-upBorder/80 flex items-center justify-center text-upPink group-hover:border-upPink/40 transition">
                    {item.type === "image" && <ImageIcon className="w-6 h-6" />}
                    {item.type === "video" && <Video className="w-6 h-6" />}
                    {item.type === "document" && <FileText className="w-6 h-6" />}
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-upWhite leading-snug group-hover:text-upPink transition">
                    {item.title}
                  </h3>
                  <p className="text-xs text-upGray mt-2 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center border-t border-upBorder/30 pt-4 text-[10px] text-upGray">
                <span className="flex items-center gap-1 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-upPink" />
                  {new Date(item.updated_at).toLocaleDateString("pt-BR")}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => onRequestDeleteItem(item.id, e)}
                    className="p-1.5 text-upGray hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Excluir item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-upCard border border-upBorder rounded-3xl p-16 text-center text-upGray flex flex-col items-center justify-center gap-3">
            <Library className="w-10 h-10 text-upGray opacity-40" />
            <h3 className="text-base font-bold text-white">Nenhum item encontrado</h3>
            <p className="text-xs text-upGray max-w-xs">
              Não há arquivos nesta categoria. Clique no botão de Upload para adicionar novo conteúdo.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Upload de Arquivo / Novo Asset */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0b0f] border border-upBorder/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
            <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-upPink" />
                <h3 className="text-sm font-bold text-white">Adicionar Novo Arquivo / Asset</h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 text-upGray hover:text-white bg-white/5 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Título do Asset / Arquivo
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Logo Vetorial em PNG"
                  className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Tipo de Conteúdo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "image", label: "Imagem", icon: ImageIcon },
                    { id: "video", label: "Vídeo", icon: Video },
                    { id: "document", label: "Documento", icon: FileText }
                  ].map((t) => {
                    const IconComp = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewType(t.id as any)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                          newType === t.id
                            ? "bg-upPink text-white border-upPink shadow-md"
                            : "bg-upDark/60 text-upGray border-upBorder/50 hover:text-white"
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Arquivo de Mídia
                </label>
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setNewFileUrl(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="relative flex items-center justify-center p-6 border-2 border-dashed border-upBorder/80 hover:border-upPink bg-upDark/60 rounded-2xl cursor-pointer transition group"
                >
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setNewFileUrl(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  {newFileUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={newFileUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover" />
                      <span className="text-xs font-bold text-emerald-400">Arquivo Carregado com Sucesso!</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Upload className="w-6 h-6 text-upPink group-hover:scale-110 transition" />
                      <span className="text-xs font-bold text-white">Arraste um arquivo ou clique para carregar</span>
                      <span className="text-[10px] text-upGray">Imagens, MP4, PDFs ou Documentos</span>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Descrição ou Instruções
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Instruções de uso ou notas explicativas do arquivo..."
                  className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-upBorder/40">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 bg-upDark hover:bg-white/5 border border-upBorder/60 text-upGray hover:text-white rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-upPink hover:bg-upPink/90 text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(255,83,104,0.3)] transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Salvar na Biblioteca</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização Detalhada do Item */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0b0f] border border-upBorder/60 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative space-y-4">
            
            <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-upPink" />
                <h3 className="text-sm font-bold text-white truncate max-w-xs">{previewItem.title}</h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-upGray hover:text-white bg-white/5 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {previewItem.fileUrl && previewItem.type === "image" && (
                <div className="w-full max-h-[300px] rounded-2xl overflow-hidden border border-upBorder/60">
                  <img src={previewItem.fileUrl} alt={previewItem.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-upPink tracking-wider">Descrição</span>
                <p className="text-xs text-upLightGray leading-relaxed bg-upDark/60 p-4 rounded-2xl border border-upBorder/40">
                  {previewItem.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-upBorder/40">
                <button
                  onClick={() => onRequestDeleteItem(previewItem.id)}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </button>

                <div className="flex items-center gap-2">
                  {previewItem.fileUrl && (
                    <button
                      onClick={() => handleCopyLink(previewItem.fileUrl!)}
                      className="px-4 py-2 bg-upDark hover:bg-white/5 border border-upBorder/60 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      {copiedId === previewItem.fileUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedId === previewItem.fileUrl ? "Copiado!" : "Copiar Link"}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setPreviewItem(null)}
                    className="px-5 py-2 bg-upPink text-white rounded-xl text-xs font-bold transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Customizado de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!deletingLibraryItemId}
        title="Excluir Item da Biblioteca"
        description="Tem certeza que deseja remover este arquivo/asset da sua biblioteca? Esta ação não pode ser desfeita."
        confirmText="Sim, Excluir Item"
        cancelText="Cancelar"
        onConfirm={handleConfirmDeleteItem}
        onClose={() => setDeletingLibraryItemId(null)}
      />
    </div>
    </PlanGate>
  );
}
