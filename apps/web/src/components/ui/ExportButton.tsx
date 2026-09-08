"use client";

import React, { useState } from "react";
import { cn } from "../../utils/cn";

interface ExportButtonProps {
  onExport?: () => void;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ onExport, className }) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = () => {
    if (status !== "idle") return;
    setStatus("loading");

    setTimeout(() => {
      setStatus("success");
      if (onExport) onExport();

      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    }, 1200);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      className={cn(
        "relative inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer border",
        status === "idle" && "bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20",
        status === "loading" && "bg-white/5 text-white/50 border-white/10 cursor-not-allowed",
        status === "success" && "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        className
      )}
    >
      <span>
        {status === "idle" && "Exportar Relatório"}
        {status === "loading" && "Gerando Arquivo..."}
        {status === "success" && "Download Pronto"}
      </span>
    </button>
  );
};
