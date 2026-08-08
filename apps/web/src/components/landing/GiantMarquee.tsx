"use client";
import { motion } from "framer-motion";

const items = ["ESTRATÉGIA", "MÉTRICAS", "DESEMPENHO", "CONTEÚDO", "INSTAGRAM", "CURSOS", "CRESCIMENTO"];

export default function GiantMarquee() {
  return (
    <div className="relative bg-upBlack border-y border-upBorder/50 py-8 overflow-hidden select-none" data-testid="giant-marquee">
      {/* Glow ambiental */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-upBlack to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-upBlack to-transparent z-10 pointer-events-none" />

      {/* Esteira contínua e infinita com Framer Motion */}
      <div className="flex whitespace-nowrap overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 65 }}
          className="flex whitespace-nowrap items-center shrink-0"
        >
          {[...items, ...items, ...items, ...items].map((w, i) => (
            <span key={i} className="flex items-center">
              <span className={`font-display font-extrabold text-5xl lg:text-7xl tracking-tight mx-8 ${i % 2 === 0 ? "text-white" : "text-upPink"}`}>
                {w}
              </span>
              <img 
                src="/UP-Logo-removebg-preview.png" 
                alt="" 
                className="h-14 lg:h-16 w-auto object-contain mx-8 drop-shadow-[0_0_15px_rgba(255,83,104,0.6)]" 
              />
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
