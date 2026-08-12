"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Shield,
  Instagram
} from "lucide-react";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { getMe, apiLogout } from "@/lib/api";
import { getInstagramAccounts } from "@up-analytics/lib";
import { PhylloConnectModal } from "@/components/common/PhylloConnectModal";
import { fetchNotificationsFromDatabase, getNotifications, markAllNotificationsAsRead, NotificationItem } from "@/lib/notificationsStore";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [instagramHandle, setInstagramHandle] = useState<string | null>(null);
  const [isPhylloModalOpen, setIsPhylloModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetchNotificationsFromDatabase("user").then((notifs) => {
      setNotifications(notifs);
    });
    const handleUpdate = () => setNotifications(getNotifications("user"));
    window.addEventListener("up_notifications_updated", handleUpdate);
    return () => window.removeEventListener("up_notifications_updated", handleUpdate);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const checkAuth = async () => {
      try {
        const u = await getMe();
        setUser(u);
        setAuthChecked(true);
        getInstagramAccounts()
          .then((accs) => {
            if (accs && accs.length > 0) {
              setInstagramHandle(accs[0].username ? `@${accs[0].username}` : "@upideias");
            }
          })
          .catch(() => {});
      } catch {
        router.replace("/login");
      }
    };
    checkAuth();
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
    { name: "Visão Geral", href: "/app/dashboard", icon: LayoutDashboard },
    { name: "Publicações", href: "/app/posts", icon: FileText },
    { name: "Estratégias", href: "/app/ai-strategy", icon: BrainCircuit },
    { name: "Gerador", href: "/app/content-generator", icon: PenTool },
    { name: "Calendário", href: "/app/content-calendar", icon: Calendar },
  ];

  const toolsItems = [
    { name: "Aprovações", href: "/app/approvals", icon: CheckSquare, badge: 3 },
    { name: "Biblioteca", href: "/app/library", icon: Library },
    { name: "Mensagens Automáticas", href: "/app/automations", icon: MessageSquare },
    { name: "UP Creator", href: "/app/up-creator", icon: GraduationCap },
    { name: "Área do Cliente", href: "/app/client-area", icon: Users },
  ];

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      /* ignore logout error */
    }
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  if (!authChecked) {
    return (
      <div className="bg-upBlack min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-upPink border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-upGray font-semibold">Verificando sessão...</span>
        </div>
      </div>
    );
  }

  const firstName = (user?.name || "Usuário").split(" ")[0];

  return (
    <div className="bg-upBlack min-h-screen flex flex-col text-upLightGray antialiased">
      {/* Header Fixo Superior (Top Nav Otimizada e Despoluída) */}
      <header className="sticky top-0 z-40 bg-upDark/90 backdrop-blur-xl border-b border-upBorder/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/app/dashboard" className="flex items-center gap-0.5 group shrink-0" data-testid="app-logo">
              <img src="/UP-Logo-removebg-preview.png" alt="UP" className="h-8 w-auto object-contain transition-transform duration-300 group-hover:-rotate-6" />
              <span className="font-script text-2xl text-white font-normal -ml-2.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                ideias
              </span>
            </Link>

            {/* Status Chip Instagram com Phyllo Connect SDK */}
            <button
              onClick={() => setIsPhylloModalOpen(true)}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-upCard/60 border border-upBorder text-xs text-upLightGray hover:border-upPink/50 shrink-0 transition-all cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${instagramHandle ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <Instagram className="w-3.5 h-3.5 text-upPink" />
              <span className="font-medium text-[11px]">{instagramHandle || "Conectar Instagram"}</span>
            </button>
          </div>

          {/* Center Navigation Links (Desktop Despoluído) */}
          <nav className="hidden md:flex items-center gap-1 bg-upCard/40 border border-upBorder/50 p-1 rounded-2xl shrink-0">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
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

            {/* Dropdown "Ferramentas" */}
            <div className="relative">
              <button
                onClick={() => setToolsDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  toolsItems.some((t) => pathname.startsWith(t.href))
                    ? "text-upPink bg-upPink/10 border border-upPink/30"
                    : "text-upGray hover:text-white hover:bg-upCard/80"
                }`}
              >
                <span>Mais</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {toolsDropdownOpen && (
                <div
                  onMouseLeave={() => setToolsDropdownOpen(false)}
                  className="absolute top-full mt-2 right-0 w-56 bg-upDark border border-upBorder/80 rounded-2xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl z-50 animate-fade-in space-y-1"
                >
                  {toolsItems.map((tool) => {
                    const ToolIcon = tool.icon;
                    const isToolActive = pathname.startsWith(tool.href);
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setToolsDropdownOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isToolActive ? "bg-upPink/20 text-upPink" : "text-upLightGray hover:text-white hover:bg-upCard/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <ToolIcon className="w-4 h-4 text-upPink" />
                          <span>{tool.name}</span>
                        </div>
                        {tool.badge && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-upPink text-white">
                            {tool.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
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

            {/* Notifications Dropdown Popover */}
            <div className="relative shrink-0">
              <button
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="relative p-2 rounded-xl bg-upCard/60 border border-upBorder hover:border-upPink/40 text-upGray hover:text-white transition-all shrink-0"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-upPink animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div
                  onMouseLeave={() => setNotificationsOpen(false)}
                  className="absolute top-full mt-2 right-0 w-80 bg-upDark border border-upBorder/80 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl z-50 animate-fadeIn space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-upBorder/40 pb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-upPink" />
                      <h4 className="text-xs font-bold text-white">Notificações</h4>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-upPink text-white">
                          {unreadCount} novas
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          const updated = await markAllNotificationsAsRead("user");
                          setNotifications(updated);
                        }}
                        className="text-[10px] text-upPink font-semibold hover:underline cursor-pointer"
                      >
                        Marcar lidas
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border text-xs transition ${
                          item.unread
                            ? "bg-upPink/10 border-upPink/30 text-white"
                            : "bg-upDark/40 border-upBorder/20 text-upGray"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-white text-[11px]">{item.title}</span>
                          <span className="text-[9px] text-upGray">{item.time}</span>
                        </div>
                        <p className="text-[11px] leading-tight text-upGray">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Popover */}
            <div className="relative shrink-0">
              <button
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 bg-upCard/60 border border-upBorder hover:border-upPink/50 rounded-2xl transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-upPink to-purple-600 p-[1.5px] shrink-0">
                  <div className="w-full h-full rounded-full bg-upDark flex items-center justify-center font-bold text-xs text-white">
                    {firstName[0]}
                  </div>
                </div>
                <span className="hidden xl:inline text-xs font-semibold text-white">{firstName}</span>
                <ChevronDown className="hidden xl:inline w-3 h-3 text-upGray" />
              </button>

              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute top-full mt-2 right-0 w-52 bg-upDark border border-upBorder/80 rounded-2xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl z-50 animate-fade-in space-y-1"
                >
                  <div className="px-3 py-2 border-b border-upBorder/40">
                    <p className="text-xs font-bold text-white">{user?.name || "Usuário UP"}</p>
                    <p className="text-[10px] text-upGray truncate">{user?.email}</p>
                  </div>
                  {(user?.role === "admin" || user?.email?.trim().toLowerCase() === "admin@upideias.com") && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-upCard/60 transition-all border-b border-upBorder/40 pb-2"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      Painel Admin
                    </Link>
                  )}
                  <Link
                    href="/app/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-upLightGray hover:text-white hover:bg-upCard/60 transition-all"
                  >
                    <Settings className="w-4 h-4 text-upPink" />
                    Configurações
                  </Link>
                  <Link
                    href="/app/billing"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-upLightGray hover:text-white hover:bg-upCard/60 transition-all"
                  >
                    <CreditCard className="w-4 h-4 text-upPink" />
                    Plano & Faturamento
                  </Link>
                  <div className="border-t border-upBorder/40 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-upPink hover:bg-upPink/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da Conta
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 text-upGray hover:text-white rounded-xl border border-upBorder bg-upCard/60"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-upBorder/60 bg-upDark p-4 space-y-3 animate-fade-in">
            <p className="text-[10px] font-bold uppercase tracking-wider text-upGray px-2">Menu Principal</p>
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

            <p className="text-[10px] font-bold uppercase tracking-wider text-upGray px-2 pt-2">Ferramentas</p>
            <div className="grid grid-cols-2 gap-2">
              {toolsItems.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 rounded-xl bg-upCard/40 border border-upBorder/60 text-xs font-semibold text-white"
                  >
                    <ToolIcon className="w-4 h-4 text-upPink" />
                    <span>{tool.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main App Container (Total Amplitude 100%) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {children}
      </main>

      {/* Modal Command Palette (Ctrl+K) */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

      {/* Modal de Conexão de Redes Sociais via Phyllo Connect SDK */}
      <PhylloConnectModal
        isOpen={isPhylloModalOpen}
        onClose={() => setIsPhylloModalOpen(false)}
        onSuccess={() => {
          getInstagramAccounts().then((accs) => {
            if (accs && accs.length > 0) {
              setInstagramHandle(accs[0].username ? `@${accs[0].username}` : "@upideias");
            }
          });
        }}
      />
    </div>
  );
}
