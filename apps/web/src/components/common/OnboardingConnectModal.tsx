"use client";

import React, { useState, useEffect } from "react";
import { Instagram } from "lucide-react";

interface OnboardingConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function OnboardingConnectModal({ isOpen, onClose, onSuccess }: OnboardingConnectModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleConnected = () => {
      setConnecting(false);
      setStep(3);
    };

    window.addEventListener("social-account-changed", handleConnected);
    return () => {
      window.removeEventListener("social-account-changed", handleConnected);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartConnection = () => {
    setConnecting(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-social-modal"));
    }
    setTimeout(() => {
      setConnecting(false);
    }, 1000);
  };

  const handleFinish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("up_onboarding_completed", "true");
    }
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0e0e14] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative text-center">
        {/* Step 1: Boas-vindas */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full">
                Configuração Inicial
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Boas-vindas ao UP Analytics
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
                Para começar a visualizar relatórios analíticos, engajamento e métricas de alcance, vincule seu perfil profissional do Instagram.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
              <p className="text-xs text-neutral-300 font-medium">Autenticação Oficial Direta</p>
              <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                Conexão oficial via Meta Graph API. Senhas nunca são acessadas e todos os dados são protegidos por criptografia de ponta a ponta.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                disabled={connecting}
                onClick={handleStartConnection}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {connecting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Iniciando Conexão...</span>
                  </>
                ) : (
                  <>
                    <Instagram className="w-4 h-4 shrink-0" />
                    <span>Vincular Perfil do Instagram</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="text-xs text-neutral-400 hover:text-white py-2 transition-colors cursor-pointer"
              >
                Explorar painel e conectar mais tarde
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Sincronizando Métricas */}
        {step === 2 && (
          <div className="py-8 space-y-6 animate-fade-in">
            <div className="w-12 h-12 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin mx-auto" />

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Sincronizando Métricas Oficiais...</h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Consultando histórico de publicações, engajamento e métricas de alcance diretamente da API oficial.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Concluído */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
                Pronto para Uso
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Conexão Estabelecida com Sucesso
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Seu perfil foi vinculado e suas métricas foram sincronizadas. Seu painel do UP Analytics está pronto.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Acessar Painel Principal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
