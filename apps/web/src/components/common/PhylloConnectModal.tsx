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
        workPlatformId?: string;
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
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  // Fetch connected accounts on modal open
  useEffect(() => {
    if (!isOpen) return;
    const loadAccounts = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          const { data } = await supabase
            .from("social_accounts")
            .select("*")
            .eq("user_id", userData.user.id)
            .eq("status", "connected");
          setConnectedAccounts(data || []);
        }
      } catch (err) {
        console.warn("[PhylloConnectModal] Fetch accounts notice:", err);
      }
    };
    loadAccounts();
  }, [isOpen]);

  const handleDisconnect = async (accountId: string) => {
    setDisconnectingId(accountId);
    setErrorMessage(null);
    try {
      const { error } = await supabase
        .from("social_accounts")
        .update({ status: "disconnected", updated_at: new Date().toISOString() })
        .eq("id", accountId);

      if (error) throw error;

      setConnectedAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      if (onSuccess) {
        onSuccess("disconnected");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao desconectar conta social.");
    } finally {
      setDisconnectingId(null);
    }
  };
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

      if (!window.PhylloConnect) {
        throw new Error("SDK da Phyllo ainda não foi carregado. Aguarde um instante e tente novamente.");
      }

      const phylloConnect = window.PhylloConnect.initialize({
        clientDisplayName: "UP Analytics",
        environment: "staging",
        userId: data.userId,
        token: data.token,
        workPlatformId: "9bb8913b-ddd9-430b-a66a-d74d846e6c66",
      });

      phylloConnect.on("accountConnected", async (accountId: string, workId: string, userId: string) => {
        console.log(`[PhylloConnect] accountConnected: accountId=${accountId}, platform=${platform}`);
        setConnectingPlatform(null);
        setSuccessPlatform(platform);

        try {
          const res = await fetch("/api/integrations/phyllo/sync-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accountId, platform: platform || "instagram" }),
          });
          const resData = await res.json();
          console.log("[PhylloConnectModal] Sync account result:", resData);
        } catch (clientErr) {
          console.warn("[PhylloConnectModal] Sync notice:", clientErr);
        }

        window.dispatchEvent(new CustomEvent('social-account-changed'));
        if (onSuccess) {
          onSuccess(platform);
        }
      });

      phylloConnect.on("accountDisconnected", (accountId: string, workId: string, userId: string) => {
        console.log(`[PhylloConnect] accountDisconnected: accountId=${accountId}`);
        window.dispatchEvent(new CustomEvent('social-account-changed'));
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
        setErrorMessage(`Falha na conexão: ${reason || 'Erro desconhecido'}`);
      });

      phylloConnect.open();
    } catch (err: any) {
      console.error("[PhylloConnectModal] Error opening SDK:", err);
      setErrorMessage(err?.message || "Não foi possível abrir o módulo de conexão.");
      setConnectingPlatform(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0e0e14] border border-upBorder/80 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-upBorder/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-upPink/10 text-upPink border border-upPink/20">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Vincular Conta Social</h3>
              <p className="text-xs text-upGray mt-0.5">Conexão segura direta via API oficial da rede social.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-upGray hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connected Accounts List */}
        {connectedAccounts.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-upGray uppercase tracking-wider">Contas Vinculadas</p>
            {connectedAccounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-upCard/60 border border-upBorder/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px]">
                    {acc.profile_picture_url ? (
                      <img
                        src={acc.profile_picture_url}
                        alt={acc.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold text-white text-xs">
                        {(acc.username || "IG").substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white">@{acc.username}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Conectado
                      </span>
                    </div>
                    <p className="text-[11px] text-upGray">{acc.name || "Instagram Account"}</p>
                  </div>
                </div>
                <button
                  disabled={disconnectingId === acc.id}
                  onClick={() => handleDisconnect(acc.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all disabled:opacity-50"
                >
                  {disconnectingId === acc.id ? "Desconectando..." : "Desconectar"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Success Alert */}
        {successPlatform && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Conta do Instagram conectada com sucesso!</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Options */}
        {connectedAccounts.length === 0 && (
          <div className="space-y-4">
            {!isScriptLoaded && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Carregando módulo seguro de integração...</span>
              </div>
            )}

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
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-upCard/80 border border-purple-500/30 hover:border-upPink text-white font-bold text-xs flex items-center justify-between transition-all group disabled:opacity-50 cursor-pointer shadow-md"
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
