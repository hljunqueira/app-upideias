"use client";

import React from "react";
import { Zap, Plus, Sparkles } from "lucide-react";

interface CreditBadgeProps {
  currentCredits?: number;
  maxCredits?: number;
  onRechargeClick?: () => void;
}

export function CreditBadge({
  currentCredits = 1450,
  maxCredits = 2000,
  onRechargeClick,
}: CreditBadgeProps) {
  const percentage = Math.min(100, Math.max(0, (currentCredits / maxCredits) * 100));

  return (
    <div className="flex items-center gap-3 bg-upCard/80 border border-upBorder/80 px-3.5 py-1.5 rounded-xl shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-lg bg-upPink/20 text-upPink flex items-center justify-center border border-upPink/30">
          <Zap className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-white">{currentCredits.toLocaleString("pt-BR")}</span>
            <span className="text-[10px] text-upGray font-semibold">/ {maxCredits.toLocaleString("pt-BR")} créditos</span>
          </div>
          {/* Progress Bar */}
          <div className="w-24 h-1.5 bg-upDark rounded-full overflow-hidden mt-0.5 border border-upBorder/40">
            <div
              className="h-full bg-gradient-to-r from-upPink to-purple-500 transition-all duration-500 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={onRechargeClick}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-upPink hover:bg-upPinkDark text-white font-bold text-[10px] uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(255,83,104,0.3)] hover:scale-105 shrink-0"
        title="Comprar créditos adicionais"
      >
        <Plus className="w-3 h-3" />
        Recarregar
      </button>
    </div>
  );
}
