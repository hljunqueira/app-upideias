"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Award,
  Flame,
  Play,
  CheckCircle2,
  MapPin,
  Trophy,
  Layers
} from "lucide-react";
import { Course, Trail, fetchCoursesFromDb, fetchTrailsFromDb } from "@/lib/coursesStore";
import { getMe } from "@/lib/api";
import { supabase } from "@up-analytics/lib";

export default function UpCreatorPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [selectedTrailId, setSelectedTrailId] = useState<string>("");
  const [studentName, setStudentName] = useState("Aluno UP");
  const [xpTotal, setXpTotal] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [levelTitle, setLevelTitle] = useState("Criador (Nível 1)");

  useEffect(() => {
    async function initData() {
      const u = await getMe().catch(() => null);
      if (u && u.name) {
        setStudentName(u.name);
      }

      const loadedCourses = (await fetchCoursesFromDb()).filter((c) => c.status === "published");
      const loadedTrails = await fetchTrailsFromDb();
      setCourses(loadedCourses);
      setTrails(loadedTrails);
      if (loadedTrails.length > 0) {
        setSelectedTrailId(loadedTrails[0].id);
      }

      if (u?.id) {
        const { count } = await supabase
          .from("user_lesson_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", u.id);
        
        const completedCount = count || 0;
        const totalXp = completedCount * 50;
        setXpTotal(totalXp);
        setStreakDays(completedCount > 0 ? Math.min(30, completedCount + 1) : 1);
        if (totalXp >= 1000) setLevelTitle("Criador Pro (Nível 3)");
        else if (totalXp >= 300) setLevelTitle("Criador Ativo (Nível 2)");
        else setLevelTitle("Criador (Nível 1)");
      }
    }
    initData();
  }, []);

  const currentTrail = trails.find((t) => t.id === selectedTrailId) || trails[0];

  const trailCourses = courses
    .filter((c) => c.track.toLowerCase() === currentTrail?.name.toLowerCase())
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const studentStats = {
    name: studentName,
    level: levelTitle,
    xpTotal: xpTotal,
    streakDays: streakDays
  };

  const leaderboard = [
    { rank: 1, name: "Juliana Mendes", xp: 3200, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" },
    { rank: 2, name: "Henrique Junqueira", xp: 1450, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop", isMe: true },
    { rank: 3, name: "Lucas Alencar", xp: 1280, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop" },
    { rank: 4, name: "Carla Silveira", xp: 950, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop" }
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto animate-fadeIn text-upLightGray">
      
      {/* Banner Principal de Boas-Vindas do Aluno */}
      <div className="bg-gradient-to-r from-[#12121c] via-[#0d0d16] to-[#140b15] border border-upBorder/60 rounded-3xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-upPink/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-upPink/20 text-upPink border border-upPink/30 px-3 py-1 rounded-full flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> UP Creator Academy
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400" /> {studentStats.streakDays} Dias de Ofensiva 🔥
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              Bem-vindo de volta, <span className="text-upPink">{studentStats.name}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-upGray mt-1 max-w-xl">
              Siga seu roadmap sequencial de estudos. Conclua as aulas para ganhar XP e manter sua ofensiva ativa.
            </p>
          </div>

          {/* Cards de Métricas Rápidas do Aluno */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-upDark/80 border border-upBorder/80 p-4 rounded-2xl text-center min-w-[120px]">
              <p className="text-[10px] text-upGray uppercase font-semibold">XP Acumulado</p>
              <h3 className="text-xl font-extrabold text-amber-400 mt-0.5">+{studentStats.xpTotal} XP</h3>
            </div>
            
            <div className="bg-upDark/80 border border-upBorder/80 p-4 rounded-2xl text-center min-w-[120px]">
              <p className="text-[10px] text-upGray uppercase font-semibold">Seu Nível</p>
              <h3 className="text-xs font-bold text-white mt-1.5">{studentStats.level}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal: Roadmap da Trilha + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA DA ESQUERDA: Roadmap Sequencial de Trilhas Guiadas */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Pills de Seleção de Trilha */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-upPink" />
              <span>Trilhas Guiadas de Aprendizado</span>
            </h2>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 border-b border-upBorder/40">
            {trails.map((t, idx) => {
              const isSelected = t.id === selectedTrailId;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrailId(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-upPink text-white border-upPink shadow-[0_0_20px_rgba(255,83,104,0.3)]"
                      : "bg-upDark/60 text-upGray hover:text-white border-upBorder/60"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>

          {/* Trilha Ativa Info */}
          {currentTrail && (
            <div className="bg-upCard/40 border border-upBorder/60 rounded-3xl p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded-md">
                  Trilha Recomendada Nº {currentTrail.recommendedOrder}
                </span>
                <span className="text-xs text-upGray">
                  {trailCourses.length} Cursos nesta etapa
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{currentTrail.name}</h3>
              <p className="text-xs text-upGray mt-0.5">{currentTrail.description}</p>
            </div>
          )}

          {/* LINHA DO TEMPO SEQUENCIAL DE CURSOS (Rocketseat / DIO Style) */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-upPink before:via-upPink/50 before:to-transparent">
            {trailCourses.map((course, index) => {
              const isFirst = index === 0;
              return (
                <div key={course.id} className="relative group">
                  {/* Nó Numerado */}
                  <div
                    className={`absolute -left-6 top-6 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-md ${
                      isFirst
                        ? "bg-emerald-500 text-black ring-4 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                        : "bg-upDark text-white border border-upPink/60"
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Card do Curso na Trilha do Aluno */}
                  <div className="bg-[#0e0e14] border border-upBorder/60 hover:border-upPink/60 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-4">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-white/10 shrink-0 group-hover:scale-105 transition duration-300"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {isFirst && (
                            <span className="text-[9px] font-extrabold uppercase bg-emerald-500 text-black border border-emerald-400 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                              🟢 COMEÇAR POR AQUI
                            </span>
                          )}
                          <span className="text-[9px] font-extrabold uppercase bg-upPink/20 text-upPink px-2.5 py-0.5 rounded-md">
                            {course.tag}
                          </span>
                          <span className="text-[10px] text-upGray font-medium">Nível: {course.level}</span>
                        </div>

                        <h4 className="text-base font-bold text-white group-hover:text-upPink transition">
                          {course.title}
                        </h4>
                        <p className="text-xs text-upGray line-clamp-1 mt-0.5 max-w-md">{course.description}</p>

                        <div className="flex items-center gap-3 mt-3 text-[11px] text-upGray">
                          <span>{course.modulesCount} Módulos</span>
                          <span>•</span>
                          <span>{course.lessonsCount} Aulas</span>
                          <span>•</span>
                          <span className="text-amber-400 font-bold">+{course.xpReward} XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Botão para Acessar o Player do Curso */}
                    <Link
                      href={`/app/up-creator/course/${course.id}`}
                      className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-upPink hover:bg-upPink/90 text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(255,83,104,0.3)] transition self-end sm:self-center"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Iniciar Curso</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA DA DIREITA: Leaderboard da Semana */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-upBorder/40 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Ranking da Semana</h3>
              </div>
              <span className="text-[10px] text-upPink font-semibold bg-upPink/10 px-2 py-0.5 rounded-full">
                Liga dos Criadores
              </span>
            </div>

            <div className="space-y-3">
              {leaderboard.map((item) => (
                <div
                  key={item.rank}
                  className={`flex items-center justify-between p-3 rounded-2xl transition border ${
                    item.isMe
                      ? "bg-upPink/15 border-upPink/40 text-white shadow-md"
                      : "bg-upDark/50 border-upBorder/30 text-upGray hover:bg-upDark"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                        item.rank === 1
                          ? "bg-amber-400 text-black shadow-md"
                          : item.rank === 2
                          ? "bg-slate-300 text-black"
                          : item.rank === 3
                          ? "bg-amber-700 text-white"
                          : "bg-white/10 text-upGray"
                      }`}
                    >
                      {item.rank}
                    </span>
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">
                        {item.name} {item.isMe && "(Você)"}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-amber-400">+{item.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
