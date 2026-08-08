"use client";
import { motion, useInView, useScroll, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BrainCircuit, CalendarDays, MessageCircle, Wand2 } from "lucide-react";

function useCountUp(target: number, start: boolean, decimals = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const controls = animate(0, target, { duration: 1.8, ease: "easeOut", onUpdate: (v) => setVal(v) });
    return () => controls.stop();
  }, [start, target]);
  return val.toFixed(decimals).replace(".", ",");
}

const features = [
  { icon: BrainCircuit, title: "Diagnóstico estratégico de métricas", desc: "Análise completa de 30 dias de dados do Instagram que mostra o que funcionou e onde focar." },
  { icon: Wand2, title: "Gerador de conteúdo", desc: "Ideias completas com gancho, legenda, roteiro, CTA e hashtags — prontas para publicar." },
  { icon: CalendarDays, title: "Calendário editorial", desc: "Planeje a semana inteira em minutos e mantenha consistência sem esforço." },
  { icon: MessageCircle, title: "Relatórios no WhatsApp", desc: "Resumo semanal do desempenho direto no seu celular. Sem abrir dashboard." },
];

const bars = [42, 68, 55, 80, 62, 92, 74];

export default function AnalyticsShowcase() {
  const dashRef = useRef<HTMLDivElement>(null);
  const inView = useInView(dashRef, { once: true, margin: "-120px" });
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, -6]);
  const followers = useCountUp(12480, inView);
  const reach = useCountUp(48.2, inView, 1);
  const engagement = useCountUp(4.8, inView, 1);

  return (
    <section id="analytics" ref={sectionRef} className="relative py-32 lg:py-40 bg-upDark overflow-hidden noise" data-testid="analytics-section">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-upPink/[0.05] blur-[130px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display text-4xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]"
          >
            Pare de adivinhar.
            <br />
            <span className="font-script text-upPink text-5xl sm:text-6xl lg:text-7xl drop-shadow-[0_0_25px_rgba(255,83,104,0.35)]">Análise, entenda e dê um UP na sua rede social.</span>
          </motion.h2>
          <div className="mt-12 space-y-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                data-testid={`analytics-feature-${i}`}
              >
                <h3 className="font-display font-semibold text-white text-lg">{f.title}</h3>
                <p className="text-upGray mt-1 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Animated dashboard mock */}
        <div style={{ perspective: 1200 }}>
          <motion.div
            ref={dashRef}
            style={{ rotateX }}
            className="relative bg-upCard/80 backdrop-blur-xl border border-upBorder rounded-3xl p-6 lg:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
            data-testid="dashboard-mockup"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <img src="/UP-Logo-removebg-preview.png" alt="" className="h-8 w-auto" />
                <div>
                  <p className="text-sm font-semibold text-white">@upideias</p>
                  <p className="text-xs text-upGray">Últimos 30 dias</p>
                </div>
              </div>
              <span className="text-xs bg-upPink/15 text-upPink border border-upPink/30 rounded-full px-3 py-1">Ativo</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-upDark rounded-2xl p-4 border border-upBorder/60">
                <p className="text-[11px] text-upGray uppercase tracking-wider">Seguidores</p>
                <p className="font-display text-xl lg:text-2xl font-bold text-white mt-1">{Number(followers.replace(",", ".")).toLocaleString("pt-BR")}</p>
                <p className="text-[11px] text-upPink mt-0.5">+3,2% ↑</p>
              </div>
              <div className="bg-upDark rounded-2xl p-4 border border-upBorder/60">
                <p className="text-[11px] text-upGray uppercase tracking-wider">Alcance</p>
                <p className="font-display text-xl lg:text-2xl font-bold text-white mt-1">{reach}k</p>
                <p className="text-[11px] text-upPink mt-0.5">+18% ↑</p>
              </div>
              <div className="bg-upDark rounded-2xl p-4 border border-upBorder/60">
                <p className="text-[11px] text-upGray uppercase tracking-wider">Engaj.</p>
                <p className="font-display text-xl lg:text-2xl font-bold text-white mt-1">{engagement}%</p>
                <p className="text-[11px] text-upPink mt-0.5">+0,9pp ↑</p>
              </div>
            </div>

            {/* Line chart drawing itself */}
            <div className="bg-upDark rounded-2xl p-4 border border-upBorder/60 mb-6">
              <p className="text-xs text-upGray mb-3">Alcance diário</p>
              <svg viewBox="0 0 320 90" className="w-full h-24">
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF5368" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#FF5368" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M0,75 C30,70 45,55 70,58 C95,61 110,40 140,42 C170,44 185,28 215,30 C245,32 260,15 320,10"
                  fill="none"
                  stroke="#FF5368"
                  strokeWidth="2.5"
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.path
                  d="M0,75 C30,70 45,55 70,58 C95,61 110,40 140,42 C170,44 185,28 215,30 C245,32 260,15 320,10 L320,90 L0,90 Z"
                  fill="url(#chartFill)"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 1, delay: 1.4 }}
                />
              </svg>
            </div>

            {/* Bars */}
            <div className="bg-upDark rounded-2xl p-4 border border-upBorder/60">
              <p className="text-xs text-upGray mb-3">Desempenho por post</p>
              <div className="flex items-end gap-2 h-20">
                {bars.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={inView ? { height: `${h}%` } : {}}
                    transition={{ duration: 0.8, delay: 0.6 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex-1 rounded-t-md ${i === 5 ? "bg-upPink shadow-[0_0_16px_rgba(255,83,104,0.5)]" : "bg-upBorder"}`}
                  />
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 2, duration: 0.6 }}
              className="absolute -bottom-6 -right-4 lg:-right-8 bg-upCard border border-upPink/40 rounded-2xl px-5 py-3.5 shadow-[0_8px_40px_rgba(255,83,104,0.2)] backdrop-blur-xl max-w-[240px]"
            >
              <p className="text-[11px] uppercase tracking-wider text-upPink font-semibold">Dica de Estratégia</p>
              <p className="text-xs text-upLightGray mt-1 leading-relaxed">Reels às 19h geram 2,3x mais alcance. Priorize essa janela.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
