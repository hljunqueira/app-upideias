"use client";
import { motion } from "framer-motion";
import { Clock, Film, Play, TrendingUp, Megaphone, PenLine, Target, Layers } from "lucide-react";

const courses = [
  { icon: Target, tag: "Estratégia", title: "Estratégia de Conteúdo do Zero", lessons: 12, duration: "3h 40min", progress: 72, gradient: "from-[#2a1015] via-[#1a0b0e] to-upCard" },
  { icon: Film, tag: "Reels", title: "Reels que Convertem", lessons: 9, duration: "2h 15min", progress: 45, gradient: "from-[#1c1022] via-[#120a16] to-upCard" },
  { icon: TrendingUp, tag: "Vendas", title: "Funil de Vendas no Instagram", lessons: 14, duration: "4h 05min", progress: 0, gradient: "from-[#0f1a24] via-[#0a1016] to-upCard" },
  { icon: PenLine, tag: "Copy", title: "Copywriting Magnético", lessons: 10, duration: "2h 50min", progress: 100, gradient: "from-[#22160c] via-[#160e08] to-upCard" },
  { icon: Layers, tag: "Dados", title: "Métricas na Prática", lessons: 8, duration: "1h 55min", progress: 20, gradient: "from-[#101f18] via-[#0a1410] to-upCard" },
  { icon: Megaphone, tag: "Branding", title: "Marca Pessoal Inesquecível", lessons: 11, duration: "3h 10min", progress: 0, gradient: "from-[#20101f] via-[#140a13] to-upCard" },
];

const tracks = ["Fundamentos", "Criadores de Conteúdo", "Social Media Pro", "Agências & Gestores"];

export default function CreatorShowcase() {
  return (
    <section id="creator" className="relative py-32 lg:py-40 bg-upBlack overflow-hidden noise" data-testid="creator-section">
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-upPink/[0.05] blur-[130px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="uppercase tracking-[0.25em] text-upPink text-sm font-semibold mb-5"
          >
            Pilar 02 — UP Creator
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]"
          >
            Sua plataforma de cursos,
            <br />
            <span className="text-upPink">estilo streaming.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-lg text-upGray leading-relaxed"
          >
            Trilhas de aprendizado, aulas novas todo mês e certificados. Aprenda com quem vive
            de estratégia digital — no ritmo de uma maratona de série.
          </motion.p>
        </div>

        {/* Tracks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-3 mt-10"
        >
          {tracks.map((t, i) => (
            <span
              key={t}
              data-testid={`creator-track-${i}`}
              className={`text-sm px-5 py-2 rounded-full border transition-all duration-300 cursor-default ${
                i === 0
                  ? "bg-upPink text-white border-upPink shadow-[0_0_20px_rgba(255,83,104,0.35)]"
                  : "border-upBorder text-upGray hover:text-white hover:border-upPink/50 bg-upCard/50"
              }`}
            >
              {t}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Streaming shelf */}
      <motion.div
        initial={{ opacity: 0, x: 80 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mt-14 overflow-x-auto no-scrollbar snap-x snap-mandatory"
        data-testid="creator-shelf"
      >
        <div className="flex gap-6 px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pb-6 w-max">
          {courses.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              whileHover={{ y: -10, scale: 1.03 }}
              className="group snap-start w-[280px] shrink-0 rounded-3xl border border-upBorder bg-upCard overflow-hidden cursor-pointer hover:border-upPink/50 hover:shadow-[0_16px_48px_rgba(255,83,104,0.18)] transition-[border,box-shadow] duration-300"
              data-testid={`course-card-${i}`}
            >
              <div className={`relative h-40 bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
                <c.icon className="w-12 h-12 text-upPink/70 group-hover:scale-110 group-hover:text-upPink transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-upBlack/50 backdrop-blur-[2px]">
                  <span className="w-14 h-14 rounded-full bg-upPink flex items-center justify-center shadow-[0_0_30px_rgba(255,83,104,0.6)]">
                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                  </span>
                </div>
                <span className="absolute top-4 left-4 text-[11px] uppercase tracking-wider bg-upBlack/70 backdrop-blur-md text-upPink border border-upPink/30 rounded-full px-3 py-1">
                  {c.tag}
                </span>
                {c.progress === 100 && (
                  <span className="absolute top-4 right-4 text-[11px] bg-upPink text-white rounded-full px-3 py-1 font-semibold">Concluído</span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-white text-lg leading-snug">{c.title}</h3>
                <div className="flex items-center gap-4 mt-3 text-xs text-upGray">
                  <span className="flex items-center gap-1.5"><Film className="w-3.5 h-3.5" /> {c.lessons} aulas</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {c.duration}</span>
                </div>
                <div className="mt-4 h-1.5 bg-upBorder/60 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                    className="h-full bg-upPink rounded-full"
                  />
                </div>
                <p className="text-[11px] text-upGray mt-2">{c.progress > 0 ? `${c.progress}% assistido` : "Começar agora"}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <p className="text-center text-sm text-upGray mt-4">
        Arraste para explorar <span className="text-upPink">→</span> Novos cursos todo mês
      </p>
    </section>
  );
}
