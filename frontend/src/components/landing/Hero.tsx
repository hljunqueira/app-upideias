"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section id="hero" ref={ref} className="relative min-h-screen flex flex-col justify-center overflow-hidden" data-testid="hero-section">
      {/* Video background */}
      <motion.div style={{ scale: videoScale }} className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          src="https://assets.mixkit.co/videos/18140/18140-720.mp4"
        />
      </motion.div>
      <div className="absolute inset-0 bg-upBlack/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-upBlack/80 via-transparent to-upBlack" />
      <div className="absolute inset-0 bg-gradient-to-r from-upPink/[0.12] via-transparent to-transparent" />

      <motion.div style={{ y: textY, opacity }} className="relative max-w-7xl mx-auto px-6 w-full pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.1 }}
          className="inline-flex items-center gap-2 border border-white/20 bg-white/5 backdrop-blur-xl rounded-full px-5 py-2 mb-10"
          data-testid="hero-badge"
        >
          <Sparkles className="w-4 h-4 text-upPink" />
          <span className="text-xs uppercase tracking-[0.3em] text-white">O ecossistema UP Ideias</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 2.15 }}
          className="font-script text-upPink text-3xl lg:text-5xl mb-4 rotate-[-2deg] origin-left drop-shadow-[0_0_20px_rgba(255,83,104,0.4)]"
        >
          feito para quem cria —
        </motion.p>
        <h1 className="font-display font-bold tracking-tight leading-[0.95]">
          <motion.span
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 2.2, ease: [0.22, 1, 0.36, 1] }}
            className="block text-white text-6xl sm:text-7xl lg:text-[7.5rem]"
          >
            IDEIAS QUE
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 2.4, ease: [0.22, 1, 0.36, 1] }}
            className="block text-stroke text-6xl sm:text-7xl lg:text-[7.5rem]"
          >
            SOBEM DE
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 2.6, ease: [0.22, 1, 0.36, 1] }}
            className="block text-upPink text-6xl sm:text-7xl lg:text-[7.5rem] drop-shadow-[0_0_40px_rgba(255,83,104,0.45)]"
          >
            NÍVEL. ↗
          </motion.span>
        </h1>

        <div className="mt-12 grid lg:grid-cols-2 gap-10 items-end">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.9 }}
            className="text-lg lg:text-xl text-upLightGray/80 leading-relaxed max-w-xl"
          >
            Métricas do Instagram com diagnóstico de IA, gerador de conteúdo e uma
            plataforma de cursos estilo streaming. <span className="text-white font-semibold">Transforme métricas em estratégia.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3.05 }}
            className="flex flex-wrap items-center gap-4 lg:justify-end"
          >
            <Link
              href="/register"
              data-testid="hero-cta-primary"
              className="group inline-flex items-center gap-2 bg-upPink hover:bg-upPinkDark text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:shadow-[0_0_45px_rgba(255,83,104,0.6)] hover:-translate-y-1"
            >
              Testar 7 dias grátis
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#mundo"
              data-testid="hero-cta-secondary"
              className="inline-flex items-center gap-2 border border-white/25 text-white hover:border-upPink px-8 py-4 rounded-full transition-all duration-300 backdrop-blur-xl bg-white/5 hover:bg-upPink/10"
            >
              Entrar no mundo UP
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.3, duration: 0.8 }}
        className="relative border-t border-white/10 bg-upBlack/40 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-6">
          {[
            ["+2,3x", "alcance com IA"],
            ["30 dias", "de métricas analisadas"],
            ["6+ trilhas", "no UP Creator"],
            ["7 dias", "de teste grátis"],
          ].map(([v, l]) => (
            <div key={l} className="flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-upPink">{v}</span>
              <span className="text-xs text-upGray uppercase tracking-wider">{l}</span>
            </div>
          ))}
          <motion.a
            href="#mundo"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="text-upGray hover:text-upPink transition-colors"
            aria-label="Rolar para baixo"
            data-testid="hero-scroll-hint"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
