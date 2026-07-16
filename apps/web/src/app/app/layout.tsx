"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
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
  Menu,
  X,
  Bell,
  LogOut
} from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
    { name: "Posts", href: "/app/posts", icon: FileText },
    { name: "Estratégia IA", href: "/app/ai-strategy", icon: BrainCircuit },
    { name: "Gerador de Conteúdo", href: "/app/content-generator", icon: PenTool },
    { name: "Calendário Editorial", href: "/app/content-calendar", icon: Calendar },
    { name: "Aprovações", href: "/app/approvals", icon: CheckSquare, badge: 3 },
    { name: "Biblioteca", href: "/app/library", icon: Library },
    { name: "Mensagens Automáticas", href: "/app/automations", icon: MessageSquare },
    { name: "UP Creator", href: "/app/up-creator", icon: GraduationCap },
    { name: "Área do Cliente", href: "/app/client-area", icon: Users },
    { name: "Faturamento", href: "/app/billing", icon: CreditCard },
    { name: "Configurações", href: "/app/settings", icon: Settings },
  ];

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="bg-upBlack min-h-screen flex text-upLightGray">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-upBorder bg-upDark shrink-0">
        <div className="p-6 h-20 flex flex-col justify-center border-b border-upBorder/40">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-upWhite">UP <span className="text-upPink">Analytics</span></span>
            <span className="text-[10px] text-upGray uppercase tracking-wider font-semibold">by UpIdeias</span>
          </div>
        </div>

        <nav className="flex-grow p-4 flex flex-col gap-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group/menu ${
                  isActive
                    ? "bg-gradient-to-r from-upPink/20 to-upPink/5 text-upWhite border-l-4 border-upPink shadow-lg shadow-upPink/5"
                    : "text-upGray hover:text-upWhite hover:bg-upCard/60 border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform duration-300 group-hover/menu:scale-110 ${isActive ? "text-upPink" : "text-upGray"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-upPink text-upWhite" : "bg-upPink/10 text-upPink"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-upBorder/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-upGray hover:text-upWhite hover:bg-upCard transition-all"
          >
            <LogOut className="w-5 h-5 text-upPink" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-upBlack/80 backdrop-blur-sm">
          <aside className="w-64 border-r border-upBorder bg-upDark flex flex-col h-full">
            <div className="p-6 h-20 flex justify-between items-center border-b border-upBorder/40">
              <span className="text-lg font-bold text-upWhite">UP <span className="text-upPink">Analytics</span></span>
              <button onClick={() => setSidebarOpen(false)} className="text-upWhite">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-grow p-4 flex flex-col gap-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-upPink text-upWhite"
                        : "text-upGray hover:text-upWhite hover:bg-upCard"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? "bg-upWhite text-upPink" : "bg-upPink/10 text-upPink"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-upBorder/40">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-upGray hover:text-upWhite hover:bg-upCard transition-all"
              >
                <LogOut className="w-5 h-5 text-upPink" />
                <span>Sair</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-upBorder/40 bg-upDark/50 backdrop-blur-md flex justify-between items-center px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-upWhite hover:text-upPink transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs text-green-400 font-semibold">Conta Instagram Conectada</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-upGray hover:text-upWhite transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-upPink"></span>
            </button>

            <div className="flex items-center gap-3 border-l border-upBorder/60 pl-6">
              <div className="w-10 h-10 rounded-full bg-upBorder flex items-center justify-center font-bold text-upWhite border border-upBorder">
                C
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-bold text-upWhite">Olá, Creator</span>
                <span className="text-xs text-upGray">Plano Pro</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
