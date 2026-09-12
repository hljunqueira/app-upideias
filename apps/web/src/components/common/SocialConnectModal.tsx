"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface SocialConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (platform: string) => void;
}

function InstagramGlyph({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export function SocialConnectModal({ isOpen, onClose, onSuccess }: SocialConnectModalProps) {
  const supabase = createClient();
  const [connecting, setConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [subLimits, setSubLimits] = useState<{
    maxAccounts: number;
    canConnect: boolean;
    planName: string;
  } | null>(null);
  const [directConnectLink, setDirectConnectLink] = useState<string | null>(null);

  const popupRef = useRef<Window | null>(null);
  const checkClosedIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    } catch {
      // ignore
    }

    try {
      const res = await fetch("/api/user/subscription");
      if (res.ok) {
        const json = await res.json();
        setSubLimits({
          maxAccounts: json?.limits?.maxInstagramAccounts ?? 1,
          canConnect: json?.limits?.canConnectMoreAccounts ?? true,
          planName: json?.plan?.name ?? "Iniciante",
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setDirectConnectLink(null);
    setConnecting(false);
    loadAccounts();

    return () => {
      if (checkClosedIntervalRef.current) {
        clearInterval(checkClosedIntervalRef.current);
      }
    };
  }, [isOpen]);

  // Listener para capturar resposta da janela popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const type = event.data?.type;
      if (type === "social-account-connected" || type === "zernio-connected") {
        if (checkClosedIntervalRef.current) {
          clearInterval(checkClosedIntervalRef.current);
        }
        setConnecting(false);
        setSuccessMessage("Conta do Instagram conectada e sincronizada com sucesso.");
        loadAccounts();
        window.dispatchEvent(
          new CustomEvent("social-account-changed", {
            detail: { accountId: event.data.accountId },
          })
        );
        if (onSuccess) {
          onSuccess("instagram");
        }
      } else if (type === "social-account-error" || type === "zernio-error") {
        if (checkClosedIntervalRef.current) {
          clearInterval(checkClosedIntervalRef.current);
        }
        setConnecting(false);
        const err = decodeURIComponent(event.data.error || "Falha na autorização do Instagram.");
        setErrorMessage(err);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess]);

  const handleDisconnect = async (accountId: string) => {
    setDisconnectingId(accountId);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/integrations/zernio/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Erro ao desconectar perfil.");
      }

      setConnectedAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      window.dispatchEvent(new CustomEvent("social-account-changed"));
      if (onSuccess) {
        onSuccess("disconnected");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao desconectar perfil.");
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setDirectConnectLink(null);

    try {
      const res = await fetch("/api/integrations/zernio/connect-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "instagram",
          loginMethod: "instagram_login",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Falha ao iniciar conexão com o Instagram.");
      }

      const authUrl = json.authUrl;
      setDirectConnectLink(authUrl);

      // Abre popup centralizado
      const width = 580;
      const height = 740;
      const left = Math.max(0, window.screen.width / 2 - width / 2);
      const top = Math.max(0, window.screen.height / 2 - height / 2);

      const popup = window.open(
        authUrl,
        "InstagramConnectWindow",
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=no,toolbar=no`
      );

      popupRef.current = popup;

      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        setErrorMessage(
          "O navegador bloqueou a janela de autorização. Use a opção de abertura em nova aba abaixo."
        );
        setConnecting(false);
      } else {
        // Monitora fechamento manual da janela pelo usuário
        if (checkClosedIntervalRef.current) {
          clearInterval(checkClosedIntervalRef.current);
        }
        checkClosedIntervalRef.current = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosedIntervalRef.current!);
            setConnecting(false);
          }
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao conectar com o Instagram.");
      setConnecting(false);
    }
  };

  if (!isOpen) return null;

  const isLimitReached =
    subLimits && subLimits.maxAccounts !== -1 && connectedAccounts.length >= subLimits.maxAccounts;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-[#0e0e14] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl text-white">
        {/* Cabeçalho Executivo Limpo */}
        <div className="flex items-start justify-between pb-4 mb-5 border-b border-white/10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400">
              Meta Graph API
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Conexão do Instagram
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Vincule seu perfil profissional para sincronizar seguidores, alcance e publicações ao vivo.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="text-sm font-bold font-mono">✕</span>
          </button>
        </div>

        {/* Alertas Textuais Limpos */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 leading-relaxed">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-medium leading-relaxed">
            {successMessage}
          </div>
        )}

        {/* Lista de Perfis Conectados */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Perfis Conectados ({connectedAccounts.length}
              {subLimits && subLimits.maxAccounts !== -1 ? `/${subLimits.maxAccounts}` : ""})
            </span>
            {subLimits && (
              <span className="text-[11px] text-neutral-400 font-mono">
                Plano {subLimits.planName}
              </span>
            )}
          </div>

          {connectedAccounts.length === 0 ? (
            <div className="p-5 rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-center">
              <p className="text-xs text-neutral-400">
                Nenhum perfil do Instagram conectado no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {connectedAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-neutral-900 shrink-0">
                      {acc.profile_picture_url ? (
                        <img
                          src={acc.profile_picture_url}
                          alt={acc.username}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-white text-[10px] bg-gradient-to-tr from-rose-600 to-purple-600">
                          {(acc.username || "IG").substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white tracking-tight">
                        @{acc.username || acc.platform_username || "perfil"}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {(acc.followers_count || 0).toLocaleString("pt-BR")} seguidores · {acc.media_count || 0} publicações
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnect(acc.id)}
                    disabled={disconnectingId === acc.id}
                    className="text-[11px] text-neutral-400 hover:text-rose-400 py-1 px-3 rounded-lg border border-white/10 hover:border-rose-500/30 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {disconnectingId === acc.id ? "Desconectando..." : "Desconectar"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bloco de Ação / Envio da Requisição */}
        {isLimitReached ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
            <p className="text-xs text-amber-200">
              Você atingiu o limite de {subLimits?.maxAccounts} {subLimits?.maxAccounts === 1 ? "conta" : "contas"} conectadas do seu plano {subLimits?.planName}.
            </p>
            <a
              href="/app/billing"
              className="inline-block text-xs font-bold text-rose-400 hover:text-rose-300 underline"
            >
              Fazer upgrade de plano para conectar mais perfis
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg hover:shadow-rose-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
            >
              {connecting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Aguardando autorização no Instagram...</span>
                </>
              ) : (
                <>
                  <InstagramGlyph className="w-4 h-4 shrink-0" />
                  <span>Vincular Instagram Profissional</span>
                </>
              )}
            </button>

            {/* Link de contingência caso pop-up seja bloqueado */}
            {directConnectLink && (
              <div className="text-center pt-0.5">
                <a
                  href={directConnectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer"
                >
                  Abrir autorização em nova aba
                </a>
              </div>
            )}
          </div>
        )}

        {/* Rodapé Orientativo Limpo */}
        <div className="mt-5 pt-3.5 border-t border-white/10 text-center">
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Suporta perfis comerciais e de criador de conteúdo. Seus dados são sincronizados diretamente via API oficial protegida.
          </p>
        </div>
      </div>
    </div>
  );
}
