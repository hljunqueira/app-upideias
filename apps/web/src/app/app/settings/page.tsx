"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  User, 
  Key, 
  Bell, 
  Crown, 
  Save, 
  Check, 
  Camera, 
  Instagram, 
  Loader2,
  ArrowUpRight,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@up-analytics/lib";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "preferences" | "plan">("profile");

  // User Profile State
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [userBio, setUserBio] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  
  // Security State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [securityMsg, setSecurityMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Preferences State
  const [emailReports, setEmailReports] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [postReminders, setPostReminders] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);

  // Active Plan State
  const [activePlan, setActivePlan] = useState<string>("Iniciante");

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          setUserEmail(user.email || "");

          // 1. Carregar perfil no Supabase
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            setUserName(profile.name || "");
            setUserBio(profile.bio || "");
            setUserPhone(profile.phone || "");
            setAvatarUrl(profile.avatar_url || "");
            if (profile.plan) {
              const raw = profile.plan.toLowerCase();
              if (raw.includes("enter")) setActivePlan("Enterprise");
              else if (raw.includes("premi")) setActivePlan("Premium");
              else if (raw.includes("inic")) setActivePlan("Iniciante");
              else setActivePlan(profile.plan);
            } else {
              setActivePlan("Iniciante");
            }
          }

          // 2. Carregar conta do Instagram conectada
          const { data: acc } = await supabase
            .from("social_accounts")
            .select("username")
            .eq("user_id", user.id)
            .eq("platform", "instagram")
            .maybeSingle();

          if (acc?.username) {
            setInstagramHandle(`@${acc.username}`);
          } else if (profile?.instagram_handle) {
            setInstagramHandle(profile.instagram_handle.startsWith("@") ? profile.instagram_handle : `@${profile.instagram_handle}`);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do usuário:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSavingProfile(true);
    setProfileSuccessMsg("");

    try {
      const cleanHandle = instagramHandle.replace("@", "").trim();
      const { error } = await supabase
        .from("profiles")
        .update({
          name: userName.trim(),
          bio: userBio.trim(),
          phone: userPhone.trim(),
          instagram_handle: cleanHandle,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (error) throw error;

      setProfileSuccessMsg("Dados de perfil salvos com sucesso!");
      setTimeout(() => setProfileSuccessMsg(""), 3500);
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err);
      alert(err.message || "Erro ao salvar perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg(null);

    if (newPassword.length < 6) {
      setSecurityMsg({ text: "A senha deve conter no mínimo 6 caracteres.", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityMsg({ text: "As senhas informadas não coincidem.", type: "error" });
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSecurityMsg({ text: "Senha alterada com sucesso!", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setSecurityMsg({ text: err.message || "Erro ao atualizar senha.", type: "error" });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPreferences(true);
    try {
      if (userId) {
        await supabase
          .from("profiles")
          .update({
            email_notifications: emailReports,
            updated_at: new Date().toISOString()
          })
          .eq("id", userId);
      }
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar preferências:", err);
    } finally {
      setSavingPreferences(false);
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
          Gerencie suas informações cadastrais, credenciais de segurança e preferências corporativas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-4 bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-3 h-fit flex flex-col gap-1.5 shadow-xl">
          {[
            { id: "profile", label: "Perfil de Usuário", icon: User },
            { id: "security", label: "Senha & Segurança", icon: Key },
            { id: "preferences", label: "Preferências & Notificações", icon: Bell },
            { id: "plan", label: "Plano Vigente & Recursos", icon: Crown }
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
          
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-upGray">
              <Loader2 className="w-7 h-7 animate-spin text-upPink" />
              <p className="text-xs">Carregando configurações...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: PERFIL */}
              {activeTab === "profile" && (
                <form onSubmit={handleSaveProfile} className="space-y-6 animate-fadeIn">
                  <h2 className="text-sm font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-4">
                    <User className="w-4 h-4 text-upPink" /> Informações de Perfil
                  </h2>

                  {profileSuccessMsg && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
                      <Check className="w-4 h-4" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}

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
                        placeholder="Seu nome"
                        className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                        Endereço de E-mail
                      </label>
                      <input
                        type="email"
                        disabled
                        value={userEmail}
                        className="w-full bg-upDark/60 border border-upBorder/40 rounded-2xl px-4 py-2.5 text-xs text-upGray cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                        Instagram Oficial (@handle)
                      </label>
                      <div className="relative">
                        <Instagram className="w-4 h-4 text-upGray absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={instagramHandle}
                          onChange={(e) => setInstagramHandle(e.target.value)}
                          placeholder="@perfil"
                          className="w-full bg-upDark border border-upBorder/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-upPink transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                        Telefone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                      Biografia / Descrição Profissional
                    </label>
                    <textarea
                      rows={3}
                      value={userBio}
                      onChange={(e) => setUserBio(e.target.value)}
                      placeholder="Descreva a atuação da sua empresa ou perfil de autoridade..."
                      className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition resize-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 border-t border-upBorder/40 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-3 bg-upPink hover:bg-upPinkDark text-white text-xs font-bold rounded-2xl transition shadow-[0_0_20px_rgba(255,83,104,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Salvando...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Salvar Alterações</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: SEGURANÇA */}
              {activeTab === "security" && (
                <form onSubmit={handleUpdatePassword} className="space-y-6 animate-fadeIn">
                  <h2 className="text-sm font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-4">
                    <Key className="w-4 h-4 text-upPink" /> Redefinir Senha de Acesso
                  </h2>

                  {securityMsg && (
                    <div className={`p-3 rounded-xl flex items-center gap-2 text-xs ${
                      securityMsg.type === "success" 
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border border-red-500/30 text-red-400"
                    }`}>
                      {securityMsg.type === "success" ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      <span>{securityMsg.text}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
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

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                    />
                  </div>

                  <div className="pt-2 border-t border-upBorder/40 flex justify-end">
                    <button
                      type="submit"
                      disabled={updatingPassword || !newPassword}
                      className="px-6 py-3 bg-upPink hover:bg-upPinkDark text-white text-xs font-bold rounded-2xl transition shadow-[0_0_20px_rgba(255,83,104,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {updatingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Atualizando...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Atualizar Senha</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: PREFERÊNCIAS */}
              {activeTab === "preferences" && (
                <form onSubmit={handleSavePreferences} className="space-y-6 animate-fadeIn">
                  <h2 className="text-sm font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-4">
                    <Bell className="w-4 h-4 text-upPink" /> Preferências de Comunicação & Notificação
                  </h2>

                  {prefSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
                      <Check className="w-4 h-4" />
                      <span>Preferências salvas com sucesso!</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-upDark/50 border border-upBorder/40 rounded-2xl cursor-pointer">
                      <div>
                        <h4 className="text-xs font-bold text-white">Relatórios Semanais de Performance</h4>
                        <p className="text-[10px] text-upGray mt-0.5">Receba o resumo executivo das suas métricas consolidadas por e-mail.</p>
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
                        <h4 className="text-xs font-bold text-white">Alertas de Pautas & Ideias Estratégicas</h4>
                        <p className="text-[10px] text-upGray mt-0.5">Receba sugestões inteligentes alinhadas ao calendário editorial.</p>
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
                        <h4 className="text-xs font-bold text-white">Notificação de Aprovações Pendentes</h4>
                        <p className="text-[10px] text-upGray mt-0.5">Alertas imediatos quando postagens precisarem de validação do cliente ou gestor.</p>
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
                      disabled={savingPreferences}
                      className="px-6 py-3 bg-upPink hover:bg-upPinkDark text-white text-xs font-bold rounded-2xl transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {savingPreferences ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Salvando...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Salvar Preferências</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 4: PLANO ATIVO & CRÉDITOS */}
              {activeTab === "plan" && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-sm font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-4">
                    <Crown className="w-4 h-4 text-upPink" /> Plano Vigente & Recursos Habilitados
                  </h2>

                  <div className="bg-upDark/80 border border-upPink/40 p-6 rounded-3xl space-y-5 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold text-upPink uppercase bg-upPink/15 px-3 py-1 rounded-md">
                          Plano Atual
                        </span>
                        <h3 className="text-2xl font-extrabold text-white mt-2">{activePlan}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-extrabold text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          Assinatura Ativa
                        </span>
                        <p className="text-xs text-upGray mt-1.5">
                          Acesso completo aos recursos contratados
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-upBorder/40 flex items-center justify-between">
                      <p className="text-xs text-upGray">
                        Deseja alterar a capacidade de marcas ou recursos da sua conta?
                      </p>
                      <Link
                        href="/app/billing"
                        className="px-4 py-2 bg-upPink hover:bg-upPinkDark text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md"
                      >
                        <span>Gerenciar Assinatura</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
