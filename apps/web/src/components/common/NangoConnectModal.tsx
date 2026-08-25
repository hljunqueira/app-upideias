"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, Trash2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Nango from "@nangohq/frontend";

interface NangoConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (platform: string) => void;
}

export function NangoConnectModal({ isOpen, onClose, onSuccess }: NangoConnectModalProps) {
  const supabase = createClient();
  const [connecting, setConnecting] = useState(false);
  const [successPlatform, setSuccessPlatform] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  // Carrega contas conectadas ao abrir o modal
  const loadAccounts = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        const { data } = await supabase
          .from("social_accounts")
          .select("*")
          .eq("user_id", userData.user.id)
          .eq("status", "connected")
          .order("connected_at", { ascending: false });
        setConnectedAccounts(data || []);
      }
    } catch (err) {
      console.warn("[NangoConnectModal] Erro ao buscar contas:", err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
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
      window.dispatchEvent(new CustomEvent("social-account-changed"));
      if (onSuccess) {
        onSuccess("disconnected");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao desconectar conta.");
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleConnect = async (preferredPlatform?: string) => {
    setConnecting(true);
    setErrorMessage(null);
    setSuccessPlatform(null);

    try {
      // 1. Obtém sessão do Nango Connect
      const sessionRes = await fetch("/api/integrations/nango/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: preferredPlatform }),
      });

      if (!sessionRes.ok) {
        const errJson = await sessionRes.json();
        throw new Error(errJson.error || "Falha ao iniciar sessão de conexão com Nango.");
      }

      const sessionData = await sessionRes.json();
      if (!sessionData?.token) {
        throw new Error("Token de sessão do Nango não gerado pelo servidor.");
      }

      // 2. Inicializa o SDK do Nango no frontend com o Connect UI
      const nango = new Nango();
      const connect = nango.openConnectUI({
        onEvent: async (event: any) => {
          if (event.type === "connect") {
            const connectionId = event.payload?.connectionId || event.payload?.connection_id;
            const provider = event.payload?.providerConfigKey || event.payload?.provider || preferredPlatform || "facebook";
            if (!connectionId) return;

            try {
              await fetch("/api/integrations/nango/sync-account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  connectionId: connectionId,
                  platform: provider,
                }),
              });
            } catch (syncErr) {
              console.warn("[NangoConnectModal] Sync warning:", syncErr);
            }

            setSuccessPlatform(provider);
            await loadAccounts();
            window.dispatchEvent(new CustomEvent("social-account-changed"));
            if (onSuccess) onSuccess(provider);

            setTimeout(() => {
              onClose();
              setSuccessPlatform(null);
              setConnecting(false);
            }, 1200);
          } else if (event.type === "error") {
            setErrorMessage(event.payload?.errorMessage || "Erro na autenticação do Instagram / Meta.");
            setConnecting(false);
          } else if (event.type === "close") {
            setConnecting(false);
          }
        },
      });

      connect.setSessionToken(sessionData.token);
    } catch (err: any) {
      console.error("[NangoConnectModal] Connection error:", err);
      if (err?.message?.includes("closed") || err?.message?.includes("cancelled")) {
        setErrorMessage("Conexão cancelada pelo usuário.");
      } else {
        setErrorMessage(err?.message || "Não foi possível conectar com a Meta. Verifique as credenciais.");
      }
    } finally {
      setConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b10] shadow-2xl p-6 sm:p-8">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-white/5 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="font-extrabold text-white text-base">IG</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">Conectar Instagram Oficial</h3>
              <p className="text-xs text-neutral-400">Autenticação oficial Meta Graph API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-neutral-400 hover:bg-white/5 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback de Erro */}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Feedback de Sucesso */}
        {successPlatform && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Conta do Instagram conectada e sincronizada com sucesso!</span>
          </div>
        )}

        {/* Contas Atualmente Conectadas */}
        {connectedAccounts.length > 0 && (
          <div className="mt-5 space-y-2.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Contas Conectadas ({connectedAccounts.length})
            </span>
            {connectedAccounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#12121a] border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px]">
                    {acc.profile_picture_url ? (
                      <img
                        src={acc.profile_picture_url}
                        alt={acc.username}
                        referrerPolicy="no-referrer"
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
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        CONECTADO
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {acc.followers_count ? `${acc.followers_count.toLocaleString("pt-BR")} seguidores` : "Sincronizado"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDisconnect(acc.id)}
                  disabled={disconnectingId === acc.id}
                  title="Desconectar conta"
                  className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="mt-6 space-y-3">
          {/* Botão Oficial Meta Graph para Instagram */}
          <button
            onClick={() => handleConnect("facebook")}
            disabled={connecting}
            className="w-full group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#12121a] via-[#1a0f1c] to-rose-950/40 border border-rose-500/40 hover:border-rose-500/90 transition-all duration-300 shadow-md hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] cursor-pointer disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                IG
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                  <span>Conectar Instagram Profissional</span>
                  <Plus className="w-3.5 h-3.5 text-rose-400" />
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">Autorização oficial Meta Graph API • Sincroniza métricas</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {connecting ? (
                <RefreshCw className="h-4 w-4 text-rose-400 animate-spin" />
              ) : (
                <div className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-all">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Rodapé de Segurança */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Suas credenciais são criptografadas e mantidas sob conformidade oficial da Meta</span>
        </div>
      </div>
    </div>
  );
}
