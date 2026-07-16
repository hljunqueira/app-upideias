import React, { useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardPremiumProps {
  name: string;
  value: string; // Ex: "12.430", "3,82%", "R$ 1.250"
  change: string; // Ex: "+2,6%", "-1,8%"
  icon: LucideIcon;
  status: "up" | "down" | "neutral";
  type?: "instagram" | "facebook";
  className?: string;
}

export const MetricCardPremium: React.FC<MetricCardPremiumProps> = ({
  name,
  value,
  change,
  icon: Icon,
  status,
  type = "instagram",
  className,
}) => {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    // Extrai os dígitos numéricos para animar
    const numericPart = value.replace(/[^0-9]/g, "");
    const number = parseInt(numericPart, 10);
    
    if (isNaN(number)) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000; // 1s
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    let currentFrame = 0;

    const counter = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      // Easing out quad
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.round(number * easeProgress);
      
      // Formata de volta para o padrão original
      let formattedVal = "";
      if (value.includes("%")) {
        // Ex: 3,82% -> 3.82 -> formatted
        const decimalParts = value.split(/[%,]/);
        if (decimalParts.length > 1) {
          const decimals = decimalParts[1];
          formattedVal = `${Math.floor(currentVal / 100)},${decimals}%`;
        } else {
          formattedVal = `${currentVal}%`;
        }
      } else if (value.includes("R$")) {
        formattedVal = `R$ ${currentVal.toLocaleString("pt-BR")}`;
      } else {
        formattedVal = currentVal.toLocaleString("pt-BR");
      }

      setDisplayValue(formattedVal);

      if (currentFrame >= totalFrames) {
        clearInterval(counter);
        setDisplayValue(value);
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [value]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-upCard p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border-upBorder",
        type === "instagram" ? "hover:border-upPink/30" : "hover:border-blue-500/30",
        className
      )}
    >
      {/* Background glow badge */}
      <div
        className={cn(
          "absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-[0.03] blur-xl",
          type === "instagram" ? "bg-upPink" : "bg-blue-500"
        )}
      />

      <div className="flex justify-between items-center text-upGray">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-upGray/80">
          {name}
        </span>
        <div
          className={cn(
            "p-2 rounded-xl border border-upBorder/60 bg-upDark/50",
            type === "instagram" ? "text-upPink" : "text-blue-400"
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-3xl font-extrabold text-upWhite tracking-tight">
          {displayValue}
        </h3>
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
            status === "up"
              ? "bg-green-500/10 text-green-400"
              : status === "down"
              ? "bg-upPink/10 text-upPink"
              : "bg-upGray/10 text-upGray"
          )}
        >
          {status === "up" ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : status === "down" ? (
            <ArrowDownRight className="w-3 h-3" />
          ) : null}
          {change}
        </span>
        <span className="text-[10px] text-upGray font-medium">vs. anterior</span>
      </div>
    </div>
  );
};
