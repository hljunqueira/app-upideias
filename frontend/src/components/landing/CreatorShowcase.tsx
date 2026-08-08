"use client";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Check, ChevronDown, Clock, Film, Play, Plus, ThumbsUp } from "lucide-react";

const courses = [
  { tag: "Estratégia", title: "Estratégia de Conteúdo do Zero", lessons: 12, duration: "3h 40min", progress: 72, match: 98, level: "Iniciante", video: "https://assets.mixkit.co/videos/44054/44054-360.mp4" },
  { tag: "Reels", title: "Reels que Convertem", lessons: 9, duration: "2h 15min", progress: 45, match: 96, level: "Intermediário", video: "https://assets.mixkit.co/videos/42291/42291-360.mp4" },
  { tag: "Vendas", title: "Funil de Vendas no Instagram", lessons: 14, duration: "4h 05min", progress: 0, match: 93, level: "Avançado", video: "https://assets.mixkit.co/videos/34481/34481-360.mp4" },
  { tag: "Copy", title: "Copywriting Magnético", lessons: 10, duration: "2h 50min", progress: 100, match: 97, level: "Intermediário", video: "https://assets.mixkit.co/videos/44074/44074-360.mp4" },
  { tag: "Dados", title: "Métricas na Prática", lessons: 8, duration: "1h 55min", progress: 20, match: 91, level: "Iniciante", video: "https://assets.mixkit.co/videos/30063/30063-360.mp4" },
  { tag: "Branding", title: "Marca Pessoal Inesquecível", lessons: 11, duration: "3h 10min", progress: 0, match: 95, level: "Todos", video: "https://assets.mixkit.co/videos/50484/50484-360.mp4" },
];

const tracks = ["Fundamentos", "Criadores de Conteúdo", "Social Media Pro", "Agências & Gestores"];

function NetflixCard({ c, i }: { c: (typeof courses)[0]; i: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.08 }}
      onMouseEnter={() => {
        setHover(true);
        videoRef.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        setHover(false);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }}
      className={`group relative snap-start w-[300px] shrink-0 rounded-xl bg-upCard overflow-visible transition-all duration-300 ease-out ${
        hover ? "scale-[1.14] z-30 shadow-[0_24px_70px_rgba(0,0,0,0.85)]" : "scale-100 z-0"
      }`}
      data-testid={`course-card-${i}`}
    >
      <div className={`rounded-xl overflow-hidden border transition-colors duration-300 ${hover ? "border-upPink/40 bg-[#181820]" : "border-upBorder bg-upCard"}`}>
        {/* Media */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-upPink/[0.14] via-upDark to-upCard">
          <span className="absolute inset-0 flex items-center justify-center">
            <Film className="w-10 h-10 text-upPink/40" />
          </span>
          <video
            ref={videoRef}
            src={c.video}
            muted
            loop
            playsInline
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hover ? "opacity-100" : "opacity-0"}`}
          />
          <span className={`absolute inset-0 bg-upPink mix-blend-color pointer-events-none transition-opacity duration-500 ${hover ? "opacity-0" : "opacity-35"}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-upCard/90 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider bg-upBlack/70 backdrop-blur-md text-upPink border border-upPink/30 rounded-full px-2.5 py-0.5 z-10">
            {c.tag}
          </span>
          {c.progress === 100 && (
            <span className="absolute top-3 right-3 text-[10px] bg-upPink text-white rounded-full px-2.5 py-0.5 font-semibold z-10 flex items-center gap-1">
              <Check className="w-3 h-3" /> Concluído
            </span>
          )}
          {/* Netflix-style logo mark */}
          <img src="/UP-Logo-removebg-preview.png" alt="" className="absolute bottom-2 left-3 h-6 w-auto opacity-80" />
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display font-semibold text-white text-[15px] leading-snug">{c.title}</h3>
          </div>

          {/* Netflix expanded panel */}
          <div className={`overflow-hidden transition-all duration-300 ease-out ${hover ? "max-h-44 opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"}`}>
            <div className="flex items-center gap-2.5">
              <button
                aria-label={`Assistir ${c.title}`}
                data-testid={`course-play-btn-${i}`}
                className="w-9 h-9 rounded-full bg-white hover:bg-upLightGray flex items-center justify-center transition-colors"
              >
                <Play className="w-4 h-4 text-upBlack fill-upBlack ml-0.5" />
              </button>
              <button
                aria-label="Adicionar à minha lista"
                data-testid={`course-add-btn-${i}`}
                className="w-9 h-9 rounded-full border-2 border-upGray/60 hover:border-white text-upLightGray hover:text-white flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                aria-label="Avaliar curso"
                className="w-9 h-9 rounded-full border-2 border-upGray/60 hover:border-white text-upLightGray hover:text-white flex items-center justify-center transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <span className="ml-auto w-9 h-9 rounded-full border-2 border-upGray/60 text-upLightGray flex items-center justify-center">
                <ChevronDown className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-center gap-3 mt-3.5 text-xs">
              <span className="text-upPink font-bold">{c.match}% pra você</span>
              <span className="border border-upGray/50 text-upGray px-1.5 py-0.5 rounded text-[10px] uppercase">HD</span>
              <span className="text-upLightGray/80">{c.level}</span>
            </div>

            <div className="flex items-center gap-4 mt-2.5 text-xs text-upGray">
              <span className="flex items-center gap-1.5"><Film className="w-3.5 h-3.5" /> {c.lessons} aulas</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {c.duration}</span>
            </div>
          </div>

          {/* Progress (always visible) */}
          <div className="mt-3 h-1 bg-upBorder/60 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${c.progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
              className="h-full bg-upPink rounded-full"
            />
          </div>
          <p className="text-[11px] text-upGray mt-1.5">{c.progress > 0 ? `${c.progress}% assistido` : "Começar agora"}</p>
        </div>
      </div>
    </motion.div>
  );
}

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
            className="uppercase tracking-[0.3em] text-upPink text-sm font-semibold mb-5"
          >
            Pilar 02 — UP Creator
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display text-4xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]"
          >
            Sua plataforma de cursos,
            <br />
            <span className="font-script text-upPink text-6xl lg:text-8xl font-bold drop-shadow-[0_0_25px_rgba(255,83,104,0.35)]">estilo streaming.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-lg text-upGray leading-relaxed"
          >
            Trilhas de aprendizado, aulas novas todo mês e certificados. Passe o mouse nos
            cards e sinta o preview — como numa maratona de série.
          </motion.p>
        </div>

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

        <p className="font-display text-white font-semibold text-lg mt-14 mb-5 flex items-center gap-2">
          Em alta no UP Creator <span className="text-upPink">›</span>
        </p>
      </div>

      <div className="overflow-x-auto no-scrollbar snap-x snap-mandatory" data-testid="creator-shelf">
        <div className="flex gap-5 px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pt-4 pb-20 w-max">
          {courses.map((c, i) => (
            <NetflixCard key={c.title} c={c} i={i} />
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-upGray -mt-8">
        Arraste para explorar <span className="text-upPink">→</span> Novos cursos todo mês
      </p>
    </section>
  );
}
