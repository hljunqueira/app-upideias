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
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-left max-w-3xl mb-20">
          <motion.p
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="uppercase tracking-[0.25em] text-upPink text-sm font-semibold mb-5"
          >
            Como funciona
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]"
          >
            O ciclo de crescimento <span className="text-upPink">UP</span>
          </motion.h2>
        </div>

        <div className="relative">
          {/* Progress line */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-upBorder">
            <motion.div style={{ scaleX: lineScale }} className="h-full bg-upPink origin-left shadow-[0_0_12px_rgba(255,83,104,0.8)]" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
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
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-upCard border border-upBorder flex items-center justify-center mb-6 group-hover:border-upPink group-hover:shadow-[0_0_28px_rgba(255,83,104,0.35)] group-hover:-translate-y-1 transition-all duration-300">
                  <s.icon className="w-7 h-7 text-upPink" />
                </div>
                <span className="font-display text-xs text-upGray tracking-[0.3em] mb-2">0{i + 1}</span>
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
