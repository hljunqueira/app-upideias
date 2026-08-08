"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Instagram,
  CreditCard,
  MessageSquare,
  RefreshCw,
  Cpu,
  GraduationCap,
  PlusCircle,
  Menu,
  X,
  Shield,
  LogOut
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Painel Geral", href: "/admin", icon: LayoutDashboard, exact: true },
    { name: "Usuários", href: "/admin/users", icon: Users },
    { name: "Contas Instagram", href: "/admin/accounts", icon: Instagram },
    { name: "Assinaturas", href: "/admin/subscriptions", icon: CreditCard },
    { name: "Planos Configuráveis", href: "/admin/plans", icon: Shield },
    { name: "Logs de WhatsApp", href: "/admin/whatsapp-logs", icon: MessageSquare },
    { name: "Logs de Sincronização", href: "/admin/sync-logs", icon: RefreshCw },
    { name: "Faturamento de IA", href: "/admin/ai-usage", icon: Cpu },
    { name: "Gerenciar UP Creator", href: "/admin/up-creator", icon: GraduationCap },
  ];

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="bg-upBlack min-h-screen flex text-upLightGray">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-upBorder bg-upDark shrink-0">
        <div className="p-6 h-20 flex flex-col justify-center border-b border-upBorder/40">
          <div className="flex items-center gap-2.5">
            <img src="/UP-Logo-removebg-preview.png" alt="UP Ideias" className="h-9 w-auto" />
            <span className="font-display text-base font-bold tracking-tight text-upWhite">UP <span className="text-upPink">ADMIN</span></span>
          </div>
        </div>

        <nav className="flex-grow p-4 flex flex-col gap-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-upPink text-upWhite shadow-md shadow-upPink/15"
                    : "text-upGray hover:text-upWhite hover:bg-upCard"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
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
            <span>Sair do Admin</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-upBlack/80 backdrop-blur-sm">
          <aside className="w-64 border-r border-upBorder bg-upDark flex flex-col h-full">
            <div className="p-6 h-20 flex justify-between items-center border-b border-upBorder/40">
              <span className="text-lg font-bold text-upWhite">UP <span className="text-upPink">Admin</span></span>
              <button onClick={() => setSidebarOpen(false)} className="text-upWhite">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-grow p-4 flex flex-col gap-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-upPink text-upWhite"
                        : "text-upGray hover:text-upWhite hover:bg-upCard"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
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
            <div className="flex items-center gap-2 px-3 py-1 bg-upPink/10 border border-upPink/20 rounded-full">
              <Shield className="w-3.5 h-3.5 text-upPink" />
              <span className="text-xs text-upPink font-semibold">Painel Administrativo Principal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-upBorder flex items-center justify-center font-bold text-upWhite border border-upBorder">
              A
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-bold text-upWhite">Administrador</span>
              <span className="text-xs text-upPink font-semibold">Acesso Total</span>
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
