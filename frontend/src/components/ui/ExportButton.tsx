import React, { useState } from "react";
import { cn } from "../../utils/cn";
import { Download, Check, Loader2 } from "lucide-react";

interface ExportButtonProps {
  onExport?: () => void;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ onExport, className }) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = () => {
    if (status !== "idle") return;
    setStatus("loading");
    
    // Simulate export/download duration
    setTimeout(() => {
      setStatus("success");
      if (onExport) onExport();
      
      // Reset back to idle
      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    }, 1800);
  };

  return (
    <button
      onClick={handleClick}
      disabled={status === "loading"}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 select-none cursor-pointer border",
        status === "idle" && "bg-upPink hover:bg-upPinkDark text-upWhite border-upPink/20 hover:scale-[1.02]",
        status === "loading" && "bg-upCard text-upGray border-upBorder cursor-not-allowed",
        status === "success" && "bg-green-500 text-upWhite border-green-400/20 scale-[1.02]",
        className
      )}
    >
      <span className="flex items-center gap-2">
        {status === "idle" && (
          <>
            <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            <span>Exportar Relatório</span>
          </>
        )}
        {status === "loading" && (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-upPink" />
            <span>Gerando PDF...</span>
          </>
        )}
        {status === "success" && (
          <>
            <Check className="w-4 h-4 text-upWhite" />
            <span>Download Concluído!</span>
          </>
        )}
      </span>
    </button>
  );
};
