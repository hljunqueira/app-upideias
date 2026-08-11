"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  User, 
  Key, 
  Bell, 
  Shield, 
  Save, 
  Check, 
  Camera, 
  Crown, 
  Sparkles, 
  Instagram, 
  Lock, 
  Smartphone,
  Eye,
  EyeOff
} from "lucide-react";
import { getActiveUserPlan, getUserCredits, setActiveUserPlan } from "@/lib/plansStore";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "preferences" | "plan">("profile");

  // User Profile State
  const [userName, setUserName] = useState("Henrique Creator");
  const [userEmail, setUserEmail] = useState("creator@upideias.com");
  const [instagramHandle, setInstagramHandle] = useState("@henrique.creator");
  const [userBio, setUserBio] = useState("Especialista em Marketing de Conteúdo & Estratégias de Engajamento no Instagram.");
  const [avatarUrl, setAvatarUrl] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop");
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Preferences State
  const [emailReports, setEmailReports] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [postReminders, setPostReminders] = useState(true);

  // Active Plan State
  const [activePlan, setActivePlan] = useState<string>("Pro");
  const [userCredits, setUserCredits] = useState(450);

  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    setActivePlan(getActiveUserPlan());
    setUserCredits(getUserCredits());

    const handleUpdate = () => {
      setActivePlan(getActiveUserPlan());
      setUserCredits(getUserCredits());
    };
    window.addEventListener("up_plans_updated", handleUpdate);
    return () => window.removeEventListener("up_plans_updated", handleUpdate);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
    }, 2000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto animate-fadeIn text-upLightGray">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
          <Settings className="w-8 h-8 text-upPink" />
          Configurações da Conta
        </h1>
        <p className="text-sm text-upGray mt-1">
          Gerencie suas informações de perfil, preferências de segurança e plano ativo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-4 bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-3 h-fit flex flex-col gap-1.5 shadow-xl">
          {[
            { id: "profile", label: "Perfil de Usuário", icon: User },
            { id: "security", label: "Senha & Segurança", icon: Key },
            { id: "preferences", label: "Preferências & Notificações", icon: Bell },
            { id: "plan", label: "Plano Ativo & Créditos", icon: Crown }
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? "bg-upPink text-white shadow-[0_0_15px_rgba(255,83,104,0.3)]"
                    : "text-upGray hover:text-white hover:bg-upDark/60"
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="md:col-span-8 bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 sm:p-8 shadow-xl">
          
          {/* TAB 1: PERFIL */}
          {activeTab === "profile" && (
            <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
              <h2 className="text-sm font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-4">
                <User className="w-4 h-4 text-upPink" /> Informações de Perfil
              </h2>

              {/* Avatar Upload */}
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 rounded-3xl overflow-hidden border-2 border-upPink/40 shadow-lg group">
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center cursor-pointer text-white">
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-1">Alterar</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{userName}</h3>
                  <p className="text-xs text-upPink font-mono mt-0.5">{instagramHandle}</p>
                  <p className="text-[10px] text-upGray mt-1">Clique na foto para carregar uma nova imagem.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                    Endereço de E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Instagram (@handle)
                </label>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-upPink transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Biografia do Perfil
                </label>
                <textarea
                  rows={3}
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-upBorder/40 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-upPink hover:bg-upPink/90 text-white text-xs font-bold rounded-2xl transition shadow-[0_0_20px_rgba(255,83,104,0.3)] flex items-center gap-2 cursor-pointer"
                >
                  {savedStatus ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                  <span>{savedStatus ? "Alterações Salvas!" : "Salvar Alterações"}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SEGURANÇA */}
          {activeTab === "security" && (
            <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
              <h2 className="text-sm font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-4">
                <Key className="w-4 h-4 text-upPink" /> Senha & Autenticação
              </h2>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Senha Atual
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-upGray hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 2FA Toggle */}
              <div className="p-4 bg-upDark/60 border border-upBorder/40 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Autenticação em Duas Etapas (2FA)</h4>
                    <p className="text-[10px] text-upGray mt-0.5">Adiciona uma camada extra de segurança ao seu login.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className="w-4 h-4 accent-upPink rounded bg-upDark"
                />
              </div>

              <div className="pt-2 border-t border-upBorder/40 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-upPink hover:bg-upPink/90 text-white text-xs font-bold rounded-2xl transition shadow-[0_0_20px_rgba(255,83,104,0.3)] flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Atualizar Senha</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PREFERÊNCIAS */}
          {activeTab === "preferences" && (
            <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
              <h2 className="text-sm font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-4">
                <Bell className="w-4 h-4 text-upPink" /> Preferências de Notificação
              </h2>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-upDark/50 border border-upBorder/40 rounded-2xl cursor-pointer">
                  <div>
                    <h4 className="text-xs font-bold text-white">Relatórios de Desempenho por E-mail</h4>
                    <p className="text-[10px] text-upGray mt-0.5">Receba o resumo semanal de crescimento no seu e-mail.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailReports}
                    onChange={() => setEmailReports(!emailReports)}
                    className="w-4 h-4 accent-upPink"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-upDark/50 border border-upBorder/40 rounded-2xl cursor-pointer">
                  <div>
                    <h4 className="text-xs font-bold text-white">Sugestões Diárias de IA</h4>
                    <p className="text-[10px] text-upGray mt-0.5">Alertas no app com novas ideias geradas para o seu nicho.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiSuggestions}
                    onChange={() => setAiSuggestions(!aiSuggestions)}
                    className="w-4 h-4 accent-upPink"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-upDark/50 border border-upBorder/40 rounded-2xl cursor-pointer">
                  <div>
                    <h4 className="text-xs font-bold text-white">Lembrete de Posts para Aprovação</h4>
                    <p className="text-[10px] text-upGray mt-0.5">Notificações quando o admin enviar uma nova sugestão de post.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={postReminders}
                    onChange={() => setPostReminders(!postReminders)}
                    className="w-4 h-4 accent-upPink"
                  />
                </label>
              </div>

              <div className="pt-2 border-t border-upBorder/40 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-upPink hover:bg-upPink/90 text-white text-xs font-bold rounded-2xl transition shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Preferências</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: PLANO ATIVO & CRÉDITOS */}
          {activeTab === "plan" && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-sm font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-4">
                <Crown className="w-4 h-4 text-upPink" /> Plano Atual & Créditos IA
              </h2>

              <div className="bg-upDark/80 border border-upPink/40 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-upPink uppercase bg-upPink/15 px-3 py-1 rounded-md">
                      Plano Ativo
                    </span>
                    <h3 className="text-2xl font-extrabold text-white mt-2">{activePlan}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold text-upGray uppercase">Saldo de Créditos IA</span>
                    <p className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1.5 justify-end">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span>{userCredits} /mês</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-upBorder/40">
                  <p className="text-xs text-upGray mb-3">Alternar Plano para Testar Permissões de Telas:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["Iniciante", "Pro", "Agência", "Enterprise"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setActiveUserPlan(p)}
                        className={`py-2 rounded-xl text-xs font-bold transition border ${
                          activePlan === p
                            ? "bg-upPink text-white border-upPink shadow-md"
                            : "bg-upDark/60 text-upGray border-upBorder/50 hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
