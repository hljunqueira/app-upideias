"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Clock, Film, Play } from "lucide-react";

const courses = [
  { tag: "Estratégia", title: "Estratégia de Conteúdo do Zero", lessons: 12, duration: "3h 40min", progress: 72, video: "https://assets.mixkit.co/videos/44054/44054-720.mp4" },
  { tag: "Reels", title: "Reels que Convertem", lessons: 9, duration: "2h 15min", progress: 45, video: "https://assets.mixkit.co/videos/42291/42291-720.mp4" },
  { tag: "Vendas", title: "Funil de Vendas no Instagram", lessons: 14, duration: "4h 05min", progress: 0, video: "https://assets.mixkit.co/videos/34481/34481-720.mp4" },
  { tag: "Copy", title: "Copywriting Magnético", lessons: 10, duration: "2h 50min", progress: 100, video: "https://assets.mixkit.co/videos/44074/44074-720.mp4" },
  { tag: "Dados", title: "Métricas na Prática", lessons: 8, duration: "1h 55min", progress: 20, video: "https://assets.mixkit.co/videos/30063/30063-720.mp4" },
  { tag: "Branding", title: "Marca Pessoal Inesquecível", lessons: 11, duration: "3h 10min", progress: 0, video: "https://assets.mixkit.co/videos/50484/50484-720.mp4" },
];

const tracks = ["Fundamentos", "Criadores de Conteúdo", "Social Media Pro", "Agências & Gestores"];

function CourseCard({ c, i }: { c: (typeof courses)[0]; i: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(useTransform(rx, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(ry, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.08 }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        rx.set((e.clientY - r.top) / r.height - 0.5);
        ry.set((e.clientX - r.left) / r.width - 0.5);
      }}
      onMouseEnter={() => {
        setHover(true);
        videoRef.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        setHover(false);
        rx.set(0);
        ry.set(0);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }}
      className="group snap-start w-[300px] shrink-0 rounded-3xl border border-upBorder bg-upCard overflow-hidden cursor-pointer hover:border-upPink/60 hover:shadow-[0_20px_60px_rgba(255,83,104,0.25)] transition-[border,box-shadow] duration-300"
      data-testid={`course-card-${i}`}
    >
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-upPink/[0.14] via-upDark to-upCard">
        <span className="absolute inset-0 flex items-center justify-center">
          <Film className="w-10 h-10 text-upPink/50" />
        </span>
        <video
          ref={videoRef}
          src={c.video}
          muted
          loop
          playsInline
          preload="metadata"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${hover ? "opacity-100 scale-105" : "opacity-40 scale-100 grayscale"}`}
        />
        <span className="absolute inset-0 bg-upPink mix-blend-color opacity-40 pointer-events-none" />
        <div className={`absolute inset-0 bg-gradient-to-t from-upCard via-transparent transition-opacity duration-300 ${hover ? "opacity-40" : "opacity-90"}`} />
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${hover ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
          <span className="w-14 h-14 rounded-full bg-upPink flex items-center justify-center shadow-[0_0_35px_rgba(255,83,104,0.7)]">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </span>
        </div>
        <span className="absolute top-4 left-4 text-[11px] uppercase tracking-wider bg-upBlack/70 backdrop-blur-md text-upPink border border-upPink/30 rounded-full px-3 py-1 z-10">
          {c.tag}
        </span>
        {c.progress === 100 && (
          <span className="absolute top-4 right-4 text-[11px] bg-upPink text-white rounded-full px-3 py-1 font-semibold z-10">Concluído</span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display font-semibold text-white text-base leading-snug">{c.title}</h3>
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
      </div>

      <div className="mt-14 overflow-x-auto no-scrollbar snap-x snap-mandatory" data-testid="creator-shelf" style={{ perspective: 1200 }}>
        <div className="flex gap-6 px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pb-8 pt-2 w-max">
          {courses.map((c, i) => (
            <CourseCard key={c.title} c={c} i={i} />
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-upGray mt-4">
        Arraste para explorar <span className="text-upPink">→</span> Novos cursos todo mês
      </p>
    </section>
  );
}
