"use client";

import React, { useState, useEffect } from "react";
import { X, Instagram, Youtube, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    PhylloConnect?: {
      initialize: (config: {
        clientDisplayName: string;
        environment: 'staging' | 'production';
        userId: string;
        token: string;
        workId?: string;
      }) => {
        on: (event: string, callback: (...args: any[]) => void) => void;
        open: () => void;
      };
    };
  }
}

interface PhylloConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (platform: string) => void;
}

export function PhylloConnectModal({ isOpen, onClose, onSuccess }: PhylloConnectModalProps) {
  const supabase = createClient();
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [successPlatform, setSuccessPlatform] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);

  // Dynamically load Phyllo Connect Web SDK v2
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.PhylloConnect) {
      setIsScriptLoaded(true);
      return;
    }

    const scriptId = "phyllo-connect-sdk";
    if (document.getElementById(scriptId)) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://cdn.getphyllo.com/connect/v2/phyllo-connect.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => setErrorMessage("Não foi possível carregar o widget do Phyllo Connect SDK.");
    document.body.appendChild(script);
  }, []);

  if (!isOpen) return null;

  const handleConnect = async (platform: string) => {
    setErrorMessage(null);
    setConnectingPlatform(platform);

    try {
      // 1. Request temporary SDK Token server-side
      const response = await fetch("/api/integrations/phyllo/connect-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok || !data.token || !data.userId) {
        throw new Error(data.error || "Erro ao obter token de conexão seguro da Phyllo.");
      }

      // 2. Validate Phyllo SDK script availability
      if (!window.PhylloConnect) {
        throw new Error("SDK da Phyllo ainda não foi carregado. Aguarde um instante e tente novamente.");
      }

      // 3. Initialize official Phyllo Connect SDK
      const phylloConnect = window.PhylloConnect.initialize({
        clientDisplayName: "UP Analytics",
        environment: "staging",
        userId: data.userId,
        token: data.token,
      });

      // 4. Attach Browser event listeners (official browser event names)
      phylloConnect.on("accountConnected", async (accountId: string, workId: string, userId: string) => {
        console.log(`[PhylloConnect] accountConnected: accountId=${accountId}, platform=${platform}`);
        setConnectingPlatform(null);
        setSuccessPlatform(platform);

        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user?.id) {
            await supabase.from("social_accounts").upsert(
              {
                user_id: userData.user.id,
                platform: platform || "instagram",
                external_account_id: accountId,
                username: "creator_upideias",
                name: "Creator UP",
                status: "connected",
                connected_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "platform,external_account_id" }
            );
          }
        } catch (clientErr) {
          console.warn("[PhylloConnect] Fast client sync notice:", clientErr);
        }

        if (onSuccess) {
          onSuccess(platform);
        }
      });

      phylloConnect.on("accountDisconnected", (accountId: string, workId: string, userId: string) => {
        console.log(`[PhylloConnect] accountDisconnected: accountId=${accountId}`);
      });

      phylloConnect.on("tokenExpired", (userId: string) => {
        console.warn(`[PhylloConnect] tokenExpired for userId=${userId}`);
        setConnectingPlatform(null);
        setErrorMessage("O token de sessão expirou. Por favor, tente reconectar.");
      });

      phylloConnect.on("exit", (reason: string, userId: string) => {
        console.log(`[PhylloConnect] exit: reason=${reason}`);
        setConnectingPlatform(null);
      });

      phylloConnect.on("connectionFailure", (reason: string, accountId: string, workId: string, userId: string) => {
        console.error(`[PhylloConnect] connectionFailure: reason=${reason}`);
        setConnectingPlatform(null);
        setErrorMessage(`Falha ao conectar conta social: ${reason || "Tente novamente"}`);
      });

      // 5. Open Phyllo Connect UI
      phylloConnect.open();
    } catch (err: any) {
      console.error("[PhylloConnectModal] Connection error:", err?.message || err);
      setConnectingPlatform(null);
      setErrorMessage(err?.message || "Ocorreu um erro ao abrir a conexão de redes sociais.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0e0e14] border border-upBorder/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-upBorder/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-upPink/20 text-upPink border border-upPink/30 flex items-center justify-center">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Vincular Conta Social</h3>
              <p className="text-xs text-upGray">Conexão segura direta via API oficial da rede social.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-upGray hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content */}
        {successPlatform ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-white">Conta Vinculada com Sucesso!</h4>
            <p className="text-xs text-upGray max-w-xs mx-auto">
              As métricas e publicações do seu perfil foram sincronizadas e estão prontas para análise no UP Analytics.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-upPink hover:bg-upPinkDark text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(255,83,104,0.3)] transition-all"
            >
              Ir para o Painel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-upCard/40 border border-upBorder/60 rounded-2xl p-4 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <p className="text-xs text-upGray leading-relaxed">
                Suas credenciais são protegidas com criptografia de ponta a ponta. Não armazenamos senhas de redes sociais.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Instagram */}
              <button
                disabled={connectingPlatform === "instagram" || !isScriptLoaded}
                onClick={() => handleConnect("instagram")}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-upCard/80 border border-purple-500/30 hover:border-upPink text-white font-bold text-xs flex items-center justify-between transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white group-hover:text-upPink transition-colors">Conectar Instagram Business / Creator</p>
                    <p className="text-[11px] text-upGray">Reels, Stories, alcance e engajamento</p>
                  </div>
                </div>
                {connectingPlatform === "instagram" ? (
                  <RefreshCw className="w-4 h-4 text-upPink animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-upGray group-hover:text-white group-hover:translate-x-1 transition-all" />
                )}
              </button>

              {/* YouTube */}
              <button
                disabled={connectingPlatform === "youtube" || !isScriptLoaded}
                onClick={() => handleConnect("youtube")}
                className="w-full p-4 rounded-2xl bg-upCard/50 border border-upBorder/60 hover:border-red-500/50 text-white font-bold text-xs flex items-center justify-between transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-600 text-white">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">Conectar YouTube Channel</p>
                    <p className="text-[11px] text-upGray">Inscrições, retenção e inscritos</p>
                  </div>
                </div>
                {connectingPlatform === "youtube" ? (
                  <RefreshCw className="w-4 h-4 text-red-400 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-upGray group-hover:text-white group-hover:translate-x-1 transition-all" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
