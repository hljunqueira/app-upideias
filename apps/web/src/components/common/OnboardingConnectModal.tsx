"use client";

import React, { useState, useEffect } from "react";
import { Instagram, CheckCircle2, ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";

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
      window.dispatchEvent(new CustomEvent("open-nango-modal"));
    }
    // Aguarda abertura do modal oficial
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
      <div className="bg-[#0e0e14] border border-upBorder/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative text-center">
        {/* Step 1: Boas-vindas */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-upPink to-purple-600 p-[1.5px] mx-auto shadow-[0_0_30px_rgba(255,83,104,0.4)]">
              <div className="w-full h-full rounded-[23px] bg-upDark flex items-center justify-center text-upPink">
                <Instagram className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-upPink/20 text-upPink border border-upPink/30 px-3 py-1 rounded-full">
                Primeiro Acesso • Configuração Rápida
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight">
                Bem-vindo ao UP Analytics
              </h3>
              <p className="text-xs text-upGray leading-relaxed max-w-sm mx-auto">
                Para começar a gerar seus relatórios analíticos, análise de engajamento e diagnósticos de alcance, conecte seu perfil do Instagram.
              </p>
            </div>

            <div className="bg-upCard/40 border border-upBorder/60 rounded-2xl p-4 flex items-center gap-3 text-left">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <p className="text-[11px] text-upGray leading-relaxed">
                Conexão 100% segura. Não armazenamos senhas e seus dados permanecem protegidos com criptografia.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                disabled={connecting}
                onClick={handleStartConnection}
                className="w-full py-3.5 bg-upPink hover:bg-upPinkDark text-white font-extrabold text-sm rounded-2xl shadow-[0_0_25px_rgba(255,83,104,0.4)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {connecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Abrindo Conexão Segura...</span>
                  </>
                ) : (
                  <>
                    <Instagram className="w-4 h-4" />
                    <span>Vincular Meu Instagram Agora</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="text-xs text-upGray hover:text-white py-2 transition-colors cursor-pointer"
              >
                Explorar painel e conectar depois
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Sincronizando Métricas */}
        {step === 2 && (
          <div className="py-8 space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-upPink/10 text-upPink border border-upPink/20 flex items-center justify-center mx-auto">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Sincronizando Suas Métricas...</h3>
              <p className="text-xs text-upGray max-w-xs mx-auto">
                Buscando histórico de publicações, engajamento e métricas de perfil diretamente da API oficial.
              </p>
            </div>

            <div className="w-full bg-upCard/60 border border-upBorder/60 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
              <div className="bg-gradient-to-r from-upPink to-purple-500 h-full rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* Step 3: Concluído */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white tracking-tight">
                Conexão Estabelecida com Sucesso
              </h3>
              <p className="text-xs text-upGray max-w-sm mx-auto leading-relaxed">
                Seu perfil foi vinculado e suas métricas foram sincronizadas com sucesso. O seu painel do UP Analytics está pronto para uso.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-sm rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all"
            >
              Ir para o Meu Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
