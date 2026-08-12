"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  FileText,
  BrainCircuit,
  PenTool,
  Calendar,
  CheckSquare,
  Library,
  MessageSquare,
  GraduationCap,
  Users,
  Settings,
  CreditCard,
  X,
  Shield,
  UserCheck,
  Zap,
  RefreshCw,
  Activity,
  Layers,
  Sparkles
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const isAdminArea = pathname?.startsWith("/admin");

  const appItems = [
    { label: "Visão Geral (Dashboard)", href: "/app/dashboard", category: "App", icon: LayoutDashboard },
    { label: "Publicações & Mídia", href: "/app/posts", category: "App", icon: FileText },
    { label: "Estratégias de Conteúdo IA", href: "/app/ai-strategy", category: "App", icon: BrainCircuit },
    { label: "Gerador de Roteiros & Posts", href: "/app/content-generator", category: "App", icon: PenTool },
    { label: "Calendário Editorial", href: "/app/content-calendar", category: "App", icon: Calendar },
    { label: "Aprovações Pendentes", href: "/app/approvals", category: "Ferramentas", icon: CheckSquare },
    { label: "Biblioteca de Assets", href: "/app/library", category: "Ferramentas", icon: Library },
    { label: "Mensagens & Notificações WhatsApp", href: "/app/automations", category: "Ferramentas", icon: MessageSquare },
    { label: "UP Creator (Cursos & Trilhas)", href: "/app/up-creator", category: "Ferramentas", icon: GraduationCap },
    { label: "Gestão de Clientes", href: "/app/client-area", category: "Ferramentas", icon: Users },
    { label: "Configurações da Conta", href: "/app/settings", category: "Conta", icon: Settings },
    { label: "Faturamento & Assinatura", href: "/app/billing", category: "Conta", icon: CreditCard },
  ];

  const adminItems = [
    { label: "Painel Admin (Visão Geral)", href: "/admin", category: "Admin", icon: Shield },
    { label: "Clientes Assinantes", href: "/admin/users", category: "Admin", icon: UserCheck },
    { label: "Equipe Interna & Admins", href: "/admin/team", category: "Admin", icon: Users },
    { label: "Assinaturas & Faturamento", href: "/admin/subscriptions", category: "Admin", icon: CreditCard },
    { label: "Configurador de Planos", href: "/admin/plans", category: "Admin", icon: Layers },
    { label: "Contas Sociais (APIs)", href: "/admin/accounts", category: "Admin", icon: RefreshCw },
    { label: "Gestão UP Creator (Cursos)", href: "/admin/up-creator", category: "Admin", icon: GraduationCap },
    { label: "Logs de Sincronização", href: "/admin/sync-logs", category: "Admin", icon: Activity },
    { label: "Uso de Créditos IA", href: "/admin/ai-usage", category: "Admin", icon: Sparkles },
    { label: "Logs do WhatsApp", href: "/admin/whatsapp-logs", category: "Admin", icon: MessageSquare },
    { label: "Configurações Master", href: "/admin/settings", category: "Admin", icon: Settings },
  ];

  // Prioriza itens de acordo com o contexto atual
  const allItems = isAdminArea ? [...adminItems, ...appItems] : [...appItems, ...adminItems];

  const filtered = allItems.filter(
    (i) =>
      i.label.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase())
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
            placeholder={
              isAdminArea
                ? "Buscar páginas de administração, clientes, planos ou relatórios... (Esc para fechar)"
                : "Digite um comando ou busque uma funcionalidade... (Esc para fechar)"
            }
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
              const isItemAdmin = item.category === "Admin";
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
                    <Icon className={`w-4 h-4 ${isItemAdmin ? "text-amber-400" : "text-upPink"} group-hover:scale-110 transition-transform`} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      isItemAdmin
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold"
                        : "bg-upCard text-upGray border-upBorder/40"
                    }`}
                  >
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-upBlack/50 border-t border-upBorder/40 flex justify-between items-center text-[10px] text-upGray">
          <span>Dica: Pressione as setas para navegar e ENTER para selecionar</span>
          <span className="bg-upCard px-1.5 py-0.5 rounded border border-upBorder/40">ESC</span>
        </div>
      </div>
    </div>
  );
}
