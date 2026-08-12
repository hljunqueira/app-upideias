"use client";

import React, { useState } from "react";
import { X, Instagram, Youtube, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";

interface PhylloConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (platform: string) => void;
}

export function PhylloConnectModal({ isOpen, onClose, onSuccess }: PhylloConnectModalProps) {
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [successPlatform, setSuccessPlatform] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (platform: string) => {
    setConnectingPlatform(platform);
    
    // Simula abertura do Widget SDK da Phyllo (Phyllo Connect SDK)
    setTimeout(() => {
      setConnectingPlatform(null);
      setSuccessPlatform(platform);
      if (onSuccess) {
        onSuccess(platform);
      }
    }, 1500);
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
              <h3 className="text-lg font-bold text-white">Vincular Conta Social (Phyllo SDK)</h3>
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
                disabled={connectingPlatform === "instagram"}
                onClick={() => handleConnect("instagram")}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-upCard/80 border border-purple-500/30 hover:border-upPink text-white font-bold text-xs flex items-center justify-between transition-all group"
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

              {/* TikTok / YouTube placeholders */}
              <button
                disabled={connectingPlatform === "youtube"}
                onClick={() => handleConnect("youtube")}
                className="w-full p-4 rounded-2xl bg-upCard/50 border border-upBorder/60 hover:border-red-500/50 text-white font-bold text-xs flex items-center justify-between transition-all group"
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
