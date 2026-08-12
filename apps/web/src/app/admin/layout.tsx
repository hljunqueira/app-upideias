"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { apiLogout, getMe } from "@/lib/api";
import {
  LayoutDashboard,
  Users,
  Instagram,
  CreditCard,
  MessageSquare,
  RefreshCw,
  Cpu,
  GraduationCap,
  ChevronDown,
  Menu,
  X,
  Shield,
  LogOut,
  Search,
  Bell,
  Layout
} from "lucide-react";
import { CommandPalette } from "@/components/ui/CommandPalette";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [adminName, setAdminName] = useState("Administrador Master");
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    getMe().then((u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      const isRoleAdmin = u.role === "admin";
      const isAdminEmail = u.email?.trim().toLowerCase() === "admin@upideias.com";
      if (!isRoleAdmin && !isAdminEmail) {
        router.push("/app/dashboard");
        return;
      }
      if (u.name) setAdminName(u.name);
      if (u.email) setAdminEmail(u.email);
    }).catch(() => {
      router.push("/login");
    });
  }, [router]);

  // Listener para Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const primaryNavItems = [
    { name: "Painel Geral", href: "/admin", icon: LayoutDashboard, exact: true },
    { name: "Usuários", href: "/admin/users", icon: Users },
    { name: "Equipe Interna", href: "/admin/team", icon: Shield },
    { name: "Contas Instagram", href: "/admin/accounts", icon: Instagram },
    { name: "UP Creator", href: "/admin/up-creator", icon: GraduationCap },
  ];

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <div className="bg-upBlack min-h-screen flex flex-col text-upLightGray antialiased">
      {/* Header Fixo Superior Admin (Top Nav Otimizada) */}
      <header className="sticky top-0 z-40 bg-upDark/95 backdrop-blur-xl border-b border-upBorder/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          
          {/* Logo & Brand Admin */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/admin" className="flex items-center gap-0.5 group shrink-0" data-testid="admin-logo">
              <img src="/UP-Logo-removebg-preview.png" alt="UP" className="h-8 w-auto object-contain transition-transform duration-300 group-hover:-rotate-6" />
              <span className="font-script text-2xl text-white font-normal -ml-2.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                ideias
              </span>
            </Link>
          </div>

          {/* Center Navigation Links (Desktop Admin) */}
          <nav className="hidden md:flex items-center gap-1 bg-upCard/40 border border-upBorder/50 p-1 rounded-2xl shrink-0">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-upPink text-white shadow-[0_0_15px_rgba(255,83,104,0.3)] font-semibold"
                      : "text-upGray hover:text-white hover:bg-upCard/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-upCard/60 border border-upBorder hover:border-upPink/40 rounded-xl text-xs text-upGray hover:text-white transition-all shrink-0"
            >
              <Search className="w-3.5 h-3.5 text-upPink shrink-0" />
              <span className="hidden xl:inline">Buscar</span>
              <kbd className="text-[9px] bg-upBlack px-1 py-0.5 rounded border border-upBorder/60 text-upGray font-mono">Ctrl+K</kbd>
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl bg-upCard/60 border border-upBorder hover:border-upPink/40 text-upGray hover:text-white transition-all shrink-0">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-upPink animate-pulse" />
            </button>

            {/* Admin Profile Popover */}
            <div className="relative shrink-0">
              <button
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 bg-upCard/60 border border-upBorder hover:border-upPink/50 rounded-2xl transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-upPink p-[1.5px] shrink-0">
                  <div className="w-full h-full rounded-full bg-upDark flex items-center justify-center font-bold text-xs text-white">
                    A
                  </div>
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight">Admin</span>
                  <span className="text-[9px] text-upPink font-semibold leading-tight">Master</span>
                </div>
                <ChevronDown className="hidden xl:inline w-3 h-3 text-upGray" />
              </button>

              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute top-full mt-2 right-0 w-64 bg-upDark border border-upBorder/80 rounded-2xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl z-50 animate-fade-in space-y-1 text-xs"
                >
                  <div className="px-3 py-2 border-b border-upBorder/40">
                    <p className="text-xs font-bold text-white">{adminName}</p>
                    <p className="text-[10px] text-upGray truncate">{adminEmail || "Admin"}</p>
                  </div>

                  <Link
                    href="/admin/team"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-upLightGray hover:text-white hover:bg-upCard/60 transition-all"
                  >
                    <Users className="w-4 h-4 text-upPink" />
                    <span>Gestão da Equipe Interna</span>
                  </Link>

                  <Link
                    href="/admin/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-upLightGray hover:text-white hover:bg-upCard/60 transition-all"
                  >
                    <Layout className="w-4 h-4 text-upPink" />
                    <span>Editor da Página Inicial</span>
                  </Link>

                  <Link
                    href="/admin/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-upLightGray hover:text-white hover:bg-upCard/60 transition-all"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Configurações do Sistema</span>
                  </Link>

                  <Link
                    href="/admin/plans"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-upLightGray hover:text-white hover:bg-upCard/60 transition-all"
                  >
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>Configuração de Planos</span>
                  </Link>

                  <Link
                    href="/admin/subscriptions"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-upLightGray hover:text-white hover:bg-upCard/60 transition-all"
                  >
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Assinaturas & Cobranças</span>
                  </Link>

                  <div className="border-t border-upBorder/40 pt-1 space-y-1">
                    <Link
                      href="/admin/whatsapp-logs"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-upLightGray hover:text-white hover:bg-upCard/60 transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>Histórico de WhatsApp</span>
                    </Link>

                    <Link
                      href="/admin/sync-logs"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-upLightGray hover:text-white hover:bg-upCard/60 transition-all"
                    >
                      <RefreshCw className="w-4 h-4 text-blue-400" />
                      <span>Sincronizações</span>
                    </Link>

                    <Link
                      href="/admin/ai-usage"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-upLightGray hover:text-white hover:bg-upCard/60 transition-all"
                    >
                      <Cpu className="w-4 h-4 text-amber-400" />
                      <span>Faturamento de IA</span>
                    </Link>
                  </div>

                  <div className="border-t border-upBorder/40 pt-1 space-y-1">
                    <Link
                      href="/app/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-upLightGray hover:text-white hover:bg-upCard/60 transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 text-upPink" />
                      <span>Ir para Área do Usuário</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-upPink hover:bg-upPink/10 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair do Admin</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 text-upGray hover:text-white rounded-xl border border-upBorder bg-upCard/60"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Admin Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-upBorder/60 bg-upDark p-4 space-y-3 animate-fade-in">
            <p className="text-[10px] font-bold uppercase tracking-wider text-upGray px-2">Menu Principal Admin</p>
            <div className="grid grid-cols-2 gap-2">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 rounded-xl bg-upCard/40 border border-upBorder/60 text-xs font-semibold text-white"
                  >
                    <Icon className="w-4 h-4 text-upPink" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <p className="text-[10px] font-bold uppercase tracking-wider text-upGray px-2 pt-2">Configurações & Gestão</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-3 rounded-xl bg-upCard/40 border border-upBorder/60 text-xs font-semibold text-white">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Configurações</span>
              </Link>
              <Link href="/admin/plans" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-3 rounded-xl bg-upCard/40 border border-upBorder/60 text-xs font-semibold text-white">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Planos</span>
              </Link>
              <Link href="/admin/subscriptions" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-3 rounded-xl bg-upCard/40 border border-upBorder/60 text-xs font-semibold text-white">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Assinaturas</span>
              </Link>
              <Link href="/admin/whatsapp-logs" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-3 rounded-xl bg-upCard/40 border border-upBorder/60 text-xs font-semibold text-white">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Admin Container (Amplitude 100%) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {children}
      </main>

      {/* Modal Command Palette (Ctrl+K) */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
}
