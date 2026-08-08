"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Play, X, Video, Sparkles, CheckCircle2 } from "lucide-react";
import { Course, getStoredCourses } from "@/lib/coursesStore";

const tracks = ["Todos", "Fundamentos", "Criadores de Conteúdo", "Social Media Pro", "Agências & Gestores"];

function CourseCard({
  c,
  i,
  onPlayClick
}: {
  c: Course;
  i: number;
  onPlayClick: (c: Course) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      className="relative flex flex-col w-[260px] sm:w-[280px] aspect-[4/5] bg-[#0f0f14] rounded-2xl overflow-hidden group cursor-pointer border border-white/10 shadow-2xl shrink-0 snap-start transition-all duration-500 hover:border-upPink/50 hover:shadow-[0_20px_50px_rgba(255,83,104,0.3)]"
      data-testid={`course-card-${i}`}
    >
      {/* Imagem de Fundo com Efeito Zoom */}
      <div className="absolute inset-0">
        <img
          src={c.thumbnailUrl}
          alt={c.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/80 to-black/30" />
      </div>

      {/* Top bar com marca d'água da logo UP */}
      <div className="relative p-4 z-10 flex justify-between items-center pointer-events-none">
        <div className="flex items-center bg-white px-3 py-1.5 rounded-full border border-white/20 shadow-md">
          <img src="/UP-Logo-removebg-preview.png" alt="UP" className="h-6 w-auto object-contain" />
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-upPink text-white shadow-md border border-upPink px-3 py-1 rounded-full backdrop-blur-md">
          {c.tag}
        </span>
      </div>

      {/* Badge de Recomendação de Estudo (Trilha Guiada) */}
      {c.isRecommendedFirst && (
        <div className="relative px-4 z-10 -mt-2">
          <span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500 text-black border border-emerald-400 px-2.5 py-0.5 rounded-md shadow-lg flex items-center gap-1 w-max">
            🟢 COMEÇAR POR AQUI
          </span>
        </div>
      )}

      {/* Conteúdo Base do Card */}
      <div className="relative h-full flex flex-col justify-end p-5 z-10 pointer-events-none">
        <div className="flex justify-between items-end mb-4">
          <div className="flex-1 pr-2">
            <span className="text-upPink text-[10px] font-extrabold uppercase tracking-widest mb-1.5 block drop-shadow-md">
              {c.accessTier || "Assine um plano"}
            </span>
            <h3 className="text-white font-bold text-base leading-tight line-clamp-2 drop-shadow-md">
              {c.title}
            </h3>
          </div>

          {/* Botão de Play */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayClick(c);
            }}
            className="flex-shrink-0 bg-white text-black p-3.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:bg-upPink group-hover:text-white group-hover:scale-110 transition-all duration-300 pointer-events-auto"
            title="Assistir Teaser do Curso"
          >
            <Play className="w-4 h-4 ml-0.5 fill-black text-black group-hover:fill-white group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="bg-upPink h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,83,104,0.8)]"
            style={{ width: `${c.progress}%` }}
          />
        </div>
      </div>

      <Link href="/register" className="absolute inset-0 z-0" aria-label={`Assinar plano para ${c.title}`} />
    </motion.div>
  );
}

export default function CreatorShowcase() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTrack, setActiveTrack] = useState("Todos");
  const [selectedTeaserCourse, setSelectedTeaserCourse] = useState<Course | null>(null);

  const shelfRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    setCourses(getStoredCourses().filter((c) => c.isLandingPageFeatured));

    const handleUpdate = () => {
      setCourses(getStoredCourses().filter((c) => c.isLandingPageFeatured));
    };

    window.addEventListener("up_courses_updated", handleUpdate);
    return () => window.removeEventListener("up_courses_updated", handleUpdate);
  }, []);

  const filteredCourses = courses.filter(
    (c) => activeTrack === "Todos" || c.track === activeTrack
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!shelfRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - shelfRef.current.offsetLeft);
    setScrollLeft(shelfRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !shelfRef.current) return;
    e.preventDefault();
    const x = e.pageX - shelfRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    shelfRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section id="creator" className="relative py-32 lg:py-40 bg-upBlack overflow-hidden noise" data-testid="creator-section">
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-upPink/[0.05] blur-[130px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
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
            Trilhas de aprendizado guiadas, aulas novas todo mês e certificados. Explore o catálogo
            e assista de onde quiser no formato maratona de série.
          </motion.p>
        </div>

        {/* Dynamic Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-3 mt-10"
        >
          {tracks.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTrack(t)}
              data-testid={`creator-track-${i}`}
              className={`text-sm px-6 py-2.5 rounded-full border font-medium transition-all duration-300 cursor-pointer ${
                activeTrack === t
                  ? "bg-upPink text-white border-upPink shadow-[0_0_25px_rgba(255,83,104,0.5)] scale-105"
                  : "border-upBorder text-upGray hover:text-white hover:border-upPink/60 bg-upCard/60 hover:bg-upCard"
              }`}
            >
              {t}
            </button>
          ))}
        </motion.div>

        <p className="font-display text-white font-semibold text-lg mt-14 mb-5 flex items-center gap-2">
          Em alta no UP Creator <span className="text-upPink">›</span>
        </p>
      </div>

      {/* Course Cards Shelf */}
      <div 
        ref={shelfRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`overflow-x-auto no-scrollbar snap-x snap-mandatory select-none ${isMouseDown ? "cursor-grabbing" : "cursor-grab"}`} 
        data-testid="creator-shelf"
      >
        <div className="flex gap-6 px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pt-4 pb-20 w-max">
          {filteredCourses.map((c, i) => (
            <CourseCard
              key={c.id || c.title}
              c={c}
              i={i}
              onPlayClick={(course) => setSelectedTeaserCourse(course)}
            />
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-upGray -mt-8">
        Clique e arraste com o mouse para o lado <span className="text-upPink">↔</span> Cursos sincronizados via Admin
      </p>

      {/* Modal de Vídeo Teaser quando o usuário clica no Play */}
      {selectedTeaserCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase bg-upPink/20 text-upPink border border-upPink/30 px-2.5 py-1 rounded-full">
                  Teaser do Curso
                </span>
                <h3 className="text-sm font-bold text-white truncate">{selectedTeaserCourse.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTeaserCourse(null)}
                className="p-1.5 text-upGray hover:text-white bg-white/5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 relative">
                {selectedTeaserCourse.videoTeaserUrl ? (
                  <iframe
                    src={
                      selectedTeaserCourse.videoTeaserUrl.includes("youtube.com")
                        ? selectedTeaserCourse.videoTeaserUrl.replace("watch?v=", "embed/")
                        : selectedTeaserCourse.videoTeaserUrl
                    }
                    title={selectedTeaserCourse.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center p-8">
                    <Video className="w-12 h-12 text-upPink mx-auto mb-3 opacity-80" />
                    <p className="text-sm font-bold text-white mb-1">{selectedTeaserCourse.title}</p>
                    <p className="text-xs text-upGray max-w-sm">
                      {selectedTeaserCourse.description || "Assine um plano para liberar todas as aulas deste curso."}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div>
                  <p className="text-xs text-upGray">
                    Trilha: <strong className="text-white">{selectedTeaserCourse.track}</strong> • Nível:{" "}
                    <strong className="text-white">{selectedTeaserCourse.level}</strong>
                  </p>
                </div>
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-upPink hover:bg-upPink/90 text-white rounded-2xl text-xs font-bold shadow-[0_0_20px_rgba(255,83,104,0.4)] transition"
                >
                  Começar a Assistir Agora →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
