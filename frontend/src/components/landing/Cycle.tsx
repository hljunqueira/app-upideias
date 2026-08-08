"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, Sparkles, BarChart3, TrendingUp } from "lucide-react";

const steps = [
  { icon: GraduationCap, title: "Aprenda", desc: "Domine estratégia com as trilhas do UP Creator." },
  { icon: Sparkles, title: "Aplique", desc: "Gere ideias, roteiros e legendas com IA em segundos." },
  { icon: BarChart3, title: "Meça", desc: "Acompanhe métricas reais e receba diagnósticos." },
  { icon: TrendingUp, title: "Cresça", desc: "Repita o ciclo e escale com direção, não com sorte." },
];

export default function Cycle() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.5"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="ciclo" ref={ref} className="relative py-32 lg:py-40 bg-upDark overflow-hidden noise grid-bg" data-testid="cycle-section">
      <span className="absolute top-10 right-6 font-script text-upPink/20 text-8xl lg:text-9xl select-none rotate-[-6deg]">o ciclo</span>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-left max-w-3xl mb-24">
          <motion.p
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="uppercase tracking-[0.3em] text-upPink text-sm font-semibold mb-5"
          >
            Como funciona
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display text-4xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]"
          >
            O ciclo de crescimento <span className="text-upPink drop-shadow-[0_0_25px_rgba(255,83,104,0.4)]">UP</span>
          </motion.h2>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-upBorder">
            <motion.div style={{ scaleX: lineScale }} className="h-full bg-upPink origin-left shadow-[0_0_12px_rgba(255,83,104,0.8)]" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center group"
                data-testid={`cycle-step-${i}`}
              >
                <span className="absolute -top-14 font-display font-bold text-[7rem] leading-none text-stroke opacity-60 select-none group-hover:text-stroke-pink transition-all duration-300">
                  {i + 1}
                </span>
                <div className="relative z-10 w-24 h-24 rounded-3xl bg-upCard border border-upBorder flex items-center justify-center mb-6 group-hover:border-upPink group-hover:shadow-[0_0_35px_rgba(255,83,104,0.4)] group-hover:-translate-y-2 group-hover:rotate-3 transition-all duration-300">
                  <s.icon className="w-9 h-9 text-upPink" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white">{s.title}</h3>
                <p className="text-upGray mt-3 leading-relaxed max-w-[240px]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
