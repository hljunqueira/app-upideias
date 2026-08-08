"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const words = "Sua empresa não precisa apenas de mais posts. Precisa de estratégia.".split(" ");
const strategyIndex = words.length - 1;

function Word({ children, progress, range, highlight }: { children: string; progress: any; range: [number, number]; highlight: boolean }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className={`inline-block mr-[0.3em] ${highlight ? "text-upPink" : "text-white"}`}>
      {children}
    </motion.span>
  );
}

export default function Problem() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });

  return (
    <section id="problema" className="relative bg-upBlack" data-testid="problem-section">
      {/* Marquee strip */}
      <div className="border-y border-upBorder/60 py-5 overflow-hidden bg-upDark">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex">
              {["ESTRATÉGIA", "CONTEÚDO", "MÉTRICAS", "INTELIGÊNCIA ARTIFICIAL", "CRESCIMENTO", "APRENDIZADO"].map((w) => (
                <span key={w + k} className="mx-8 font-display text-sm tracking-[0.35em] text-upGray flex items-center gap-8">
                  {w} <span className="text-upPink text-lg">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div ref={ref} className="max-w-5xl mx-auto px-6 py-32 lg:py-44">
        <p className="uppercase tracking-[0.25em] text-upPink text-sm font-semibold mb-10">O problema</p>
        <p className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight flex flex-wrap">
          {words.map((word, i) => (
            <Word
              key={i}
              progress={scrollYProgress}
              range={[i / words.length, (i + 1) / words.length]}
              highlight={i >= strategyIndex - 1}
            >
              {word}
            </Word>
          ))}
        </p>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mt-12 text-lg lg:text-xl text-upGray leading-relaxed max-w-2xl"
        >
          Postar todos os dias sem saber o que funciona é remar contra a maré.
          A UP Ideias une <span className="text-white">dados</span>, <span className="text-white">inteligência artificial</span> e{" "}
          <span className="text-white">conhecimento</span> para você crescer com direção — não com sorte.
        </motion.p>
      </div>
    </section>
  );
}
