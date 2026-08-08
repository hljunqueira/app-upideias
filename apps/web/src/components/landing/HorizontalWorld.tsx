"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BarChart3, PlaySquare, ArrowDown } from "lucide-react";
import BgVideo from "./BgVideo";

export default function HorizontalWorld() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", "-200vw"]);
  const dot1 = useTransform(scrollYProgress, [0, 0.33], [1, 0.3]);
  const dot2 = useTransform(scrollYProgress, [0.15, 0.5, 0.8], [0.3, 1, 0.3]);
  const dot3 = useTransform(scrollYProgress, [0.66, 1], [0.3, 1]);

  return (
    <section id="mundo" ref={ref} className="relative h-[400vh] bg-upBlack" data-testid="horizontal-world">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ x }} className="flex h-full w-[300vw]">
          {/* Panel 1 — O Problema */}
          <div className="relative w-screen h-full flex items-center overflow-hidden">
            <BgVideo
              className="absolute inset-0 w-full h-full object-cover opacity-50 [filter:grayscale(1)_brightness(0.9)]"
              src="https://assets.mixkit.co/videos/44820/44820-720.mp4"
            />
            <div className="video-tint" />
            <div className="absolute inset-0 bg-gradient-to-r from-upBlack via-upBlack/60 to-upBlack/90" />
            <div className="relative max-w-7xl mx-auto px-6 w-full">
              <p className="uppercase tracking-[0.3em] text-upPink text-sm font-semibold mb-8">O problema</p>
              <h2 className="font-display font-bold tracking-tight leading-[0.98]">
                <span className="block text-grad text-4xl sm:text-6xl lg:text-8xl">POSTS ALEATÓRIOS</span>
                <span className="block text-white text-4xl sm:text-6xl lg:text-8xl mt-2">NÃO CONSTROEM</span>
                <span className="block text-upPink text-4xl sm:text-6xl lg:text-8xl mt-2 drop-shadow-[0_0_30px_rgba(255,83,104,0.4)]">IMPÉRIOS.</span>
              </h2>
              <p className="mt-10 text-lg lg:text-xl text-upLightGray/70 max-w-xl leading-relaxed">
                Sua empresa não precisa apenas de mais posts. Precisa de <span className="text-white font-semibold">estratégia</span>.
                Continue rolando e conheça os dois pilares do mundo UP. →
              </p>
            </div>
          </div>

          {/* Panel 2 — UP Analytics */}
          <div className="relative w-screen h-full flex items-center overflow-hidden bg-upDark grid-bg">
            <span className="absolute -bottom-8 lg:-bottom-16 left-0 font-display font-bold text-[9rem] sm:text-[15rem] lg:text-[24rem] leading-none text-upPink/10 select-none">01</span>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-upPink/[0.07] blur-[120px] rounded-full" />
            <div className="relative max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display font-bold tracking-tight text-white text-4xl sm:text-6xl lg:text-7xl leading-[1.0] mb-8">
                  UP <span className="text-upPink">ANALYTICS</span>
                </h2>
                <p className="mt-8 text-lg text-upLightGray/70 max-w-md leading-relaxed">
                  Métricas reais do Instagram, organização estratégica de dados e relatórios
                  no WhatsApp. Pare de adivinhar, meça, entenda e aja.
                </p>
              </div>
              <div className="hidden lg:flex flex-col gap-4">
                {["Análise de 30 dias de métricas e relatório de desempenho", "Ideias de post com gancho, roteiro e hashtags", "Resumo semanal direto no seu WhatsApp"].map((t, i) => (
                  <div key={i} className="bg-upCard/70 backdrop-blur-xl border border-upBorder rounded-2xl px-6 py-5 flex items-center gap-4" style={{ marginLeft: i * 40 }}>
                    <span className="font-display text-upPink font-bold">0{i + 1}</span>
                    <p className="text-upLightGray text-sm">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel 3 — UP Creator */}
          <div className="relative w-screen h-full flex items-center overflow-hidden">
            <BgVideo
              className="absolute inset-0 w-full h-full object-cover opacity-40 [filter:grayscale(1)_brightness(0.9)]"
              src="https://assets.mixkit.co/videos/44074/44074-720.mp4"
            />
            <div className="video-tint" />
            <div className="absolute inset-0 bg-gradient-to-r from-upBlack via-upBlack/70 to-upBlack/40" />
            <span className="absolute -bottom-8 lg:-bottom-16 left-0 font-display font-bold text-[9rem] sm:text-[15rem] lg:text-[24rem] leading-none text-upPink/10 select-none">02</span>
            <div className="relative max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display font-bold tracking-tight text-white text-4xl sm:text-6xl lg:text-7xl leading-[1.0] mb-8">
                  UP <span className="text-upPink">CREATOR</span>
                </h2>
                <p className="mt-8 text-lg text-upLightGray/70 max-w-md leading-relaxed">
                  Sua plataforma de cursos estilo streaming: trilhas, aulas novas todo mês
                  e certificados. Aprenda no ritmo de uma maratona de série.
                </p>
                <div className="mt-10 inline-flex items-center gap-3 text-upPink">
                  <ArrowDown className="w-5 h-5 animate-bounce" />
                  <span className="text-sm uppercase tracking-[0.25em]">Continue para explorar os pilares</span>
                </div>
              </div>
              <div className="hidden lg:flex flex-col gap-4">
                {[
                  "Plataforma no estilo streaming para maratonar conhecimento",
                  "Trilhas de aprendizado e novas aulas todos os meses",
                  "Certificados de conclusão para validar seu crescimento"
                ].map((t, i) => (
                  <div key={i} className="bg-upCard/70 backdrop-blur-xl border border-upBorder rounded-2xl px-6 py-5 flex items-center gap-4" style={{ marginLeft: i * 40 }}>
                    <span className="font-display text-upPink font-bold">0{i + 1}</span>
                    <p className="text-upLightGray text-sm">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {[dot1, dot2, dot3].map((o, i) => (
            <motion.span key={i} style={{ opacity: o }} className="w-8 h-1.5 rounded-full bg-upPink" />
          ))}
        </div>
      </div>
    </section>
  );
}
