"use client";

import { useState } from "react";
import { X, Send, Eye, Users, TrendingUp, Sparkles, Image as ImageIcon, Calendar, CheckCircle2 } from "lucide-react";
import { ApprovalItem, saveApprovalItem } from "@/lib/approvalsStore";

interface AdminSuggestContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    handle?: string;
  } | null;
}

export function AdminSuggestContentModal({
  isOpen,
  onClose,
  user
}: AdminSuggestContentModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    format: "Reels" as "Reels" | "Carrossel" | "Imagem" | "Story",
    targetDate: "05/08/2026",
    caption: "",
    visualIdea: "",
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop"
  });
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newItem: ApprovalItem = {
      id: `app-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      title: formData.title.trim(),
      format: formData.format,
      targetDate: formData.targetDate || "05/08/2026",
      caption: formData.caption.trim() || "Aprenda as melhores estratégias no Instagram.",
      visualIdea: formData.visualIdea.trim() || "Fundo escuro, realce na cor da marca e texto explicativo simples.",
      imageUrl: formData.imageUrl,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    saveApprovalItem(newItem);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn text-upLightGray">
      <div className="bg-[#0b0b0f] border border-upBorder/60 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header Superior */}
        <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-upPink" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Sugerir Conteúdo Visual • {user.name}
              </h3>
              <p className="text-[10px] text-upGray">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-upGray hover:text-white bg-white/5 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo de Métricas do Usuário */}
        <div className="p-6 space-y-6">
          <div className="bg-upDark/60 border border-upBorder/50 p-4 rounded-2xl grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] text-upGray uppercase font-semibold">Seguidores</p>
              <p className="text-sm font-extrabold text-white mt-0.5">12.430</p>
            </div>
            <div>
              <p className="text-[10px] text-upGray uppercase font-semibold">Alcance Médio</p>
              <p className="text-sm font-extrabold text-upPink mt-0.5">31.000</p>
            </div>
            <div>
              <p className="text-[10px] text-upGray uppercase font-semibold">Melhor Formato</p>
              <p className="text-xs font-extrabold text-amber-400 mt-0.5">Reels Curto</p>
            </div>
          </div>

          {sentSuccess ? (
            <div className="p-8 text-center bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-white">Sugestão Enviada com Sucesso!</h4>
              <p className="text-xs text-upGray">
                O cliente recebeu a ideia em sua aba de Aprovações Pendentes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                    Título / Tema da Postagem
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: 3 Hacks de Reels para Vendas"
                    className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                      Formato
                    </label>
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                      className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                    >
                      <option value="Reels">Reels</option>
                      <option value="Carrossel">Carrossel</option>
                      <option value="Imagem">Imagem</option>
                      <option value="Story">Story</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                      Data Sugerida
                    </label>
                    <input
                      type="text"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      placeholder="05/08/2026"
                      className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Legenda Sugerida do Post
                </label>
                <textarea
                  rows={2}
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Texto explicativo para a legenda..."
                  className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition resize-none"
                />
              </div>

              {/* Upload da Imagem Real do Post */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Imagem Real do Post / Mockup de Arte
                </label>
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("image/")) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, imageUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="relative flex items-center gap-4 p-3 border-2 border-dashed border-upBorder/80 hover:border-upPink/80 bg-upDark/60 rounded-2xl cursor-pointer transition group overflow-hidden"
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
                          setFormData({ ...formData, imageUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  {formData.imageUrl ? (
                    <>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white group-hover:text-upPink transition">
                          Imagem Selecionada
                        </p>
                        <p className="text-[10px] text-upGray mt-0.5">
                          Clique ou arraste outra imagem para alterar a arte
                        </p>
                      </div>
                      <span className="px-3 py-1.5 bg-upPink/20 text-upPink border border-upPink/30 rounded-xl text-xs font-bold shrink-0">
                        Alterar
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 py-1">
                      <div className="p-2.5 bg-upPink/10 text-upPink rounded-xl">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-upPink transition">
                          Clique para fazer upload da arte ou arraste aqui
                        </p>
                        <p className="text-[10px] text-upGray">
                          PNG, JPG ou WEBP
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upPink mb-1.5 block">
                  🎨 Ideia Visual & Dica de Arte (Orientação para o Cliente)
                </label>
                <textarea
                  rows={2}
                  value={formData.visualIdea}
                  onChange={(e) => setFormData({ ...formData, visualIdea: e.target.value })}
                  placeholder="Ex: Fundo escuro com paleta em coral (#FF5368), realces em texto grande, transição no segundo 3..."
                  className="w-full bg-upDark border border-upPink/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-upBorder/40">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-upDark hover:bg-white/5 border border-upBorder/60 text-upGray hover:text-white rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-upPink hover:bg-upPink/90 text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(255,83,104,0.3)] transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar para Aprovação do Cliente</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
