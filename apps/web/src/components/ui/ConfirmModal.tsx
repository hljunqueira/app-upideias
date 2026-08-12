"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  isOpen,
  title = "Confirmar Exclusão",
  description = "Tem certeza que deseja executar esta ação? Esta operação não poderá ser desfeita.",
  confirmText = "Sim, Excluir",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onClose
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md bg-upDark border border-upBorder/80 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-scale-up space-y-6 text-upLightGray"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-upGray hover:text-white hover:bg-upCard/60 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div
            className={`p-4 rounded-2xl border shadow-lg ${
              variant === "danger"
                ? "bg-upPink/10 text-upPink border-upPink/30 shadow-[0_0_20px_rgba(255,83,104,0.3)]"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            }`}
          >
            {variant === "danger" ? <Trash2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>

          <h3 className="text-xl font-extrabold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-upGray leading-relaxed max-w-xs">{description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-2xl bg-upCard/80 hover:bg-upCard text-upLightGray hover:text-white border border-upBorder text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-2xl text-white text-xs font-extrabold shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
              variant === "danger"
                ? "bg-upPink hover:bg-upPink/90 shadow-[0_0_20px_rgba(255,83,104,0.4)]"
                : "bg-amber-500 hover:bg-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            }`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
