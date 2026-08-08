"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";

const headline = ["Estratégia,", "conteúdo", "e", "conhecimento."];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yLogo = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 250]);

  return (
    <section id="hero" ref={ref} className="relative min-h-screen flex items-center overflow-hidden noise grid-bg" data-testid="hero-section">
      {/* Glow aura */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div style={{ y: orbY }} className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-upPink/[0.07] blur-[120px]" />
        <motion.div style={{ y: yLogo }} className="absolute top-1/3 -left-40 w-[400px] h-[400px] rounded-full bg-upPink/[0.06] blur-[100px]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-upBlack to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-36 pb-24 grid lg:grid-cols-12 gap-16 items-center w-full">
        <motion.div style={{ y: yText, opacity }} className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 border border-upBorder bg-upCard/60 backdrop-blur-md rounded-full px-4 py-1.5 mb-8"
            data-testid="hero-badge"
          >
            <Sparkles className="w-3.5 h-3.5 text-upPink" />
            <span className="text-xs uppercase tracking-[0.2em] text-upLightGray">O ecossistema UP Ideias</span>
          </motion.div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.04]">
            {headline.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.28em]"
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="block text-upPink drop-shadow-[0_0_30px_rgba(255,83,104,0.35)]"
            >
              Tudo em um lugar.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="mt-8 text-lg lg:text-xl text-upGray leading-relaxed max-w-xl"
          >
            Métricas do Instagram com diagnóstico de IA, gerador de conteúdo e uma plataforma
            de cursos estilo streaming. <span className="text-upLightGray">Transforme métricas em estratégia.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.15 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/register"
              data-testid="hero-cta-primary"
              className="group inline-flex items-center gap-2 bg-upPink hover:bg-upPinkDark text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,83,104,0.5)] hover:-translate-y-1"
            >
              Testar 7 dias grátis
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#analytics"
              data-testid="hero-cta-secondary"
              className="inline-flex items-center gap-2 border border-upBorder text-upLightGray hover:text-white hover:border-upPink/60 px-8 py-4 rounded-full transition-all duration-300 backdrop-blur-md bg-upCard/40"
            >
              Explorar o ecossistema
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-6 text-sm text-upGray"
          >
            Sem cartão de crédito · Cancele quando quiser
          </motion.p>
        </motion.div>

        {/* Floating logo */}
        <motion.div style={{ y: yLogo, opacity }} className="hidden lg:flex lg:col-span-5 justify-center relative">
          <motion.div
            animate={{ y: [0, -18, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-upPink/25 blur-[80px] rounded-full scale-75" />
            <img
              src="/UP-Logo-removebg-preview.png"
              alt="Símbolo UP"
              className="relative w-[380px] h-auto drop-shadow-[0_0_60px_rgba(255,83,104,0.4)]"
            />
          </motion.div>
          <motion.div
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-8 right-4 bg-upCard/70 backdrop-blur-xl border border-upBorder/60 rounded-2xl px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            <p className="text-xs text-upGray">Engajamento</p>
            <p className="font-display text-xl font-bold text-white">+4,8% <span className="text-upPink text-sm">↑</span></p>
          </motion.div>
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-10 left-0 bg-upCard/70 backdrop-blur-xl border border-upBorder/60 rounded-2xl px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            <p className="text-xs text-upGray">Nova aula disponível</p>
            <p className="font-display text-sm font-bold text-white">Reels que Convertem</p>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#problema"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-upGray hover:text-upPink transition-colors"
        data-testid="hero-scroll-hint"
        aria-label="Rolar para baixo"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.a>
    </section>
  );
}
