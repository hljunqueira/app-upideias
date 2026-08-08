"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard, FileText, BrainCircuit, PenTool, Calendar, CheckSquare, Library, MessageSquare, GraduationCap, Users, Settings, CreditCard, X } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const items = [
    { label: "Visão Geral", href: "/app/dashboard", category: "Navegação", icon: LayoutDashboard },
    { label: "Publicações & Mídia", href: "/app/posts", category: "Navegação", icon: FileText },
    { label: "Estratégias", href: "/app/ai-strategy", category: "Navegação", icon: BrainCircuit },
    { label: "Gerador de Conteúdo", href: "/app/content-generator", category: "Navegação", icon: PenTool },
    { label: "Calendário de Postagens", href: "/app/content-calendar", category: "Navegação", icon: Calendar },
    { label: "Aprovações", href: "/app/approvals", category: "Ferramentas", icon: CheckSquare },
    { label: "Biblioteca", href: "/app/library", category: "Ferramentas", icon: Library },
    { label: "Mensagens Automáticas", href: "/app/automations", category: "Ferramentas", icon: MessageSquare },
    { label: "UP Creator", href: "/app/up-creator", category: "Ferramentas", icon: GraduationCap },
    { label: "Área do Cliente", href: "/app/client-area", category: "Ferramentas", icon: Users },
    { label: "Configurações da Conta", href: "/app/settings", category: "Conta", icon: Settings },
    { label: "Faturamento & Planos", href: "/app/billing", category: "Conta", icon: CreditCard },
  ];

  const filtered = items.filter(
    (i) => i.label.toLowerCase().includes(query.toLowerCase()) || i.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-upBlack/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-upDark border border-upBorder/80 rounded-2xl shadow-[0_0_50px_rgba(255,83,104,0.15)] overflow-hidden flex flex-col">
        {/* Search input */}
        <div className="flex items-center px-4 border-b border-upBorder/60 bg-upCard/40">
          <Search className="w-5 h-5 text-upPink shrink-0" />
          <input
            type="text"
            placeholder="Digite um comando ou busque uma funcionalidade... (Esc para fechar)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full px-4 py-4 bg-transparent text-white text-sm placeholder-upGray focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-upGray hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-upGray">Nenhum resultado encontrado para "{query}"</div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href + item.label}
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold text-upLightGray hover:text-white hover:bg-upPink/10 hover:border-upPink/30 border border-transparent transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-upPink group-hover:scale-110 transition-transform" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-upGray uppercase tracking-wider bg-upCard px-2 py-0.5 rounded-md border border-upBorder/40">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-upBlack/50 border-t border-upBorder/40 flex justify-between items-center text-[10px] text-upGray">
          <span>Dica: Use as setas para navegar</span>
          <span className="bg-upCard px-1.5 py-0.5 rounded border border-upBorder/40">ESC</span>
        </div>
      </div>
    </div>
  );
}
