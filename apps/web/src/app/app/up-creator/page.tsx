"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Course, Trail, fetchCoursesFromDb, fetchTrailsFromDb, canUserAccessCourse } from "@/lib/coursesStore";
import { getMe } from "@/lib/api";
import { supabase } from "@up-analytics/lib";

export default function UpCreatorPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [selectedTrailId, setSelectedTrailId] = useState<string>("");
  const [studentName, setStudentName] = useState("Aluno UP");
  const [userPlan, setUserPlan] = useState<string>("Iniciante");
  const [teaserModalCourse, setTeaserModalCourse] = useState<Course | null>(null);
  const [completedLessonsCount, setCompletedLessonsCount] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [levelTitle, setLevelTitle] = useState("Em Andamento");

  useEffect(() => {
    async function initData() {
      const u = await getMe().catch(() => null);
      if (u && u.name) {
        setStudentName(u.name);
      }

      // Carregar plano real do usuário
      try {
        const subRes = await fetch("/api/user/subscription");
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.plan) setUserPlan(subData.plan.name || subData.plan);
        }
      } catch {
        /* fallback sem travar */
      }

      const loadedCourses = (await fetchCoursesFromDb()).filter((c) => c.status === "published");
      const loadedTrails = await fetchTrailsFromDb();
      setCourses(loadedCourses);
      setTrails(loadedTrails);
      if (loadedTrails.length > 0) {
        setSelectedTrailId(loadedTrails[0].id);
      }

      if (u?.id) {
        const { data: progressData } = await supabase
          .from("user_lesson_progress")
          .select("completed, updated_at")
          .eq("user_id", u.id);

        const completedLessons = (progressData || []).filter((p) => p.completed);
        const completedCount = completedLessons.length;
        setCompletedLessonsCount(completedCount);

        if (completedCount === 0) {
          setStreakDays(0);
        } else {
          const uniqueDates = new Set(
            completedLessons
              .map((p) => (p.updated_at ? p.updated_at.split("T")[0] : null))
              .filter(Boolean)
          );
          setStreakDays(Math.max(1, uniqueDates.size));
        }

        if (completedCount >= 20) setLevelTitle("Criador Avançado");
        else if (completedCount >= 5) setLevelTitle("Criador Constante");
        else setLevelTitle("Iniciante");
      }
    }
    initData();
  }, []);

  const currentTrail = trails.find((t) => t.id === selectedTrailId) || trails[0] || null;

  const trailCourses = currentTrail
    ? courses
        .filter(
          (c) =>
            (c.track || "").toLowerCase().trim() ===
            (currentTrail.name || "").toLowerCase().trim()
        )
        .sort((a, b) => a.orderIndex - b.orderIndex)
    : courses;

  const studentStats = {
    name: studentName,
    level: levelTitle,
    completedLessons: completedLessonsCount,
    streakDays: streakDays,
  };

  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const u = await getMe().catch(() => null);
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .limit(5);

        if (!error && data && data.length > 0) {
          const board = await Promise.all(
            data.map(async (prof: any, idx: number) => {
              if (!prof || !prof.id) return null;
              const { count } = await supabase
                .from("user_lesson_progress")
                .select("*", { count: "exact", head: true })
                .eq("user_id", prof.id)
                .eq("completed", true);
              return {
                rank: idx + 1,
                name: prof.name || "Membro da Comunidade",
                completed: count || 0,
                avatar: prof.avatar_url || "",
                isMe: u?.id === prof.id,
              };
            })
          );
          const validBoard = board.filter(Boolean) as any[];
          setLeaderboard(
            validBoard
              .sort((a, b) => b.completed - a.completed)
              .map((item, i) => ({ ...item, rank: i + 1 }))
          );
        } else {
          setLeaderboard([]);
        }
      } catch (e) {
        console.warn("Erro ao carregar leaderboard:", e);
        setLeaderboard([]);
      }
    }
    loadLeaderboard();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto animate-fadeIn text-white">
      {/* Banner Principal de Boas-Vindas do Aluno */}
      <div className="bg-[#0B0B0F] border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest bg-white/5 text-white/70 border border-white/10 px-2.5 py-0.5 rounded">
                UP Creator Academy
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest bg-white/5 text-white/70 border border-white/10 px-2.5 py-0.5 rounded">
                {studentStats.streakDays}{" "}
                {studentStats.streakDays === 1 ? "Dia de Estudo" : "Dias de Estudo"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Olá, {studentStats.name}
            </h1>
            <p className="text-xs text-white/60 mt-1 max-w-xl">
              Roadmap sequencial de aprendizado para acelerar suas estratégias de conteúdo e análise.
            </p>
          </div>

          {/* Cards de Métricas do Aluno */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center min-w-[110px]">
              <p className="text-[10px] text-white/50 uppercase font-medium">Aulas</p>
              <h3 className="text-base font-bold text-white mt-0.5">
                {studentStats.completedLessons} concluídas
              </h3>
            </div>

            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center min-w-[110px]">
              <p className="text-[10px] text-white/50 uppercase font-medium">Nível</p>
              <h3 className="text-xs font-semibold text-white mt-1">
                {studentStats.level}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal: Roadmap da Trilha + Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUNA DA ESQUERDA: Roadmap */}
        <div className="lg:col-span-8 space-y-6">
          {/* Cabeçalho de Trilhas */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Trilhas de Aprendizado
            </h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 border-b border-white/10">
            {trails.map((t, idx) => {
              const isSelected = t.id === selectedTrailId;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrailId(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-white text-black border-white"
                      : "bg-[#0B0B0F] text-white/60 hover:text-white border-white/10"
                  }`}
                >
                  <span className="text-[10px] opacity-60">{idx + 1}.</span>
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>

          {/* Trilha Ativa Info */}
          {currentTrail && (
            <div className="bg-[#0B0B0F] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                  Etapa {currentTrail.recommendedOrder}
                </span>
                <span className="text-xs text-white/40">
                  {trailCourses.length} {trailCourses.length === 1 ? "curso" : "cursos"}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{currentTrail.name}</h3>
              {currentTrail.description && (
                <p className="text-xs text-white/60 mt-0.5">{currentTrail.description}</p>
              )}
            </div>
          )}

          {/* LISTA SEQUENCIAL DE CURSOS */}
          {trailCourses.length > 0 ? (
            <div className="space-y-3">
              {trailCourses.map((course, index) => {
                const isAllowed = canUserAccessCourse(userPlan, course.accessTier);
                const isTeaser = !isAllowed && course.showAsTeaser !== false;

                if (!isAllowed && !isTeaser) return null;

                const isFirst = index === 0;
                return (
                  <div
                    key={course.id}
                    className="bg-[#0B0B0F] border border-white/10 hover:border-white/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-4">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/40 font-semibold uppercase shrink-0">
                          Curso
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {isFirst && (
                            <span className="text-[9px] font-semibold uppercase bg-white text-black px-1.5 py-0.5 rounded">
                              Início
                            </span>
                          )}
                          <span className="text-[9px] font-semibold uppercase bg-white/5 text-white/60 px-1.5 py-0.5 rounded border border-white/10">
                            {course.tag}
                          </span>
                          <span className="text-[10px] text-white/40">
                            Nível {course.level}
                          </span>

                          {!isAllowed && (
                            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border border-upPink/30 bg-upPink/10 text-upPink">
                              Exclusivo {course.accessTier}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-semibold text-white">
                          {course.title}
                        </h4>
                        <p className="text-xs text-white/50 line-clamp-1 mt-0.5 max-w-md">
                          {course.description}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-[11px] text-white/40">
                          <span>{course.modulesCount} Módulos</span>
                          <span>•</span>
                          <span>{course.lessonsCount} Aulas</span>
                          <span>•</span>
                          <span>Certificado Incluso</span>
                        </div>
                      </div>
                    </div>

                    {/* Ação */}
                    {isAllowed ? (
                      <Link
                        href={`/app/up-creator/course/${course.id}`}
                        className="shrink-0 px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-semibold uppercase tracking-wider transition self-end sm:self-center cursor-pointer"
                      >
                        Acessar
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setTeaserModalCourse(course)}
                        className="shrink-0 px-4 py-2 bg-upPink/15 hover:bg-upPink/25 text-upPink border border-upPink/30 rounded-lg text-xs font-semibold uppercase tracking-wider transition self-end sm:self-center cursor-pointer"
                      >
                        Fazer Upgrade
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#0B0B0F] border border-white/10 text-center">
              <h4 className="text-sm font-semibold text-white">
                Nenhum curso publicado nesta trilha ainda
              </h4>
              <p className="text-xs text-white/40 mt-1 max-w-md mx-auto">
                O conteúdo desta trilha está sendo preparado e em breve estará disponível.
              </p>
            </div>
          )}
        </div>

        {/* COLUNA DA DIREITA: Ranking */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0B0B0F] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                Ranking de Conclusão
              </h3>
              <span className="text-[10px] text-white/50 uppercase">
                Alunos
              </span>
            </div>

            <div className="space-y-2">
              {leaderboard.map((item) => (
                <div
                  key={item.rank}
                  className={`flex items-center justify-between p-3 rounded-xl transition border ${
                    item.isMe
                      ? "bg-white/10 border-white/30 text-white"
                      : "bg-white/5 border-white/5 text-white/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center text-xs font-semibold text-white/50">
                      {item.rank}
                    </span>
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-7 h-7 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 text-white font-semibold text-[11px] flex items-center justify-center">
                        {item.name ? item.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-white">
                        {item.name} {item.isMe && "(Você)"}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-white/60 font-medium">
                    {item.completed} {item.completed === 1 ? "aula" : "aulas"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Teaser / Upsell */}
      {teaserModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0B0B0F] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-upPink bg-upPink/10 border border-upPink/20 px-2 py-0.5 rounded">
                  Exclusivo {teaserModalCourse.accessTier}
                </span>
                <h3 className="text-base font-bold text-white mt-2">
                  {teaserModalCourse.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTeaserModalCourse(null)}
                className="text-white/40 hover:text-white text-xs font-semibold px-1 py-0.5"
              >
                ✕
              </button>
            </div>

            {/* Thumbnail */}
            {teaserModalCourse.thumbnailUrl && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-neutral-900">
                <img
                  src={teaserModalCourse.thumbnailUrl}
                  alt={teaserModalCourse.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Detalhes */}
            <div className="space-y-3">
              <p className="text-xs text-white/60 leading-relaxed">
                {teaserModalCourse.description ||
                  "Treinamento prático de crescimento e análise de performance."}
              </p>

              <div className="flex items-center gap-2 flex-wrap text-[11px] text-white/40 pt-1">
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                  {teaserModalCourse.modulesCount} Módulos
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                  {teaserModalCourse.lessonsCount} Aulas
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                  Nível {teaserModalCourse.level}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                  Certificado Incluso
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/70 leading-relaxed">
                Este curso está incluído a partir do{" "}
                <strong className="text-white">{teaserModalCourse.accessTier}</strong>. Faça
                upgrade da sua assinatura para acessar todo o conteúdo.
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setTeaserModalCourse(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/40 hover:text-white transition"
              >
                Fechar
              </button>
              <Link
                href={`/checkout?plan=${teaserModalCourse.accessTier.toLowerCase().includes("pro") ? "pro" : teaserModalCourse.accessTier.toLowerCase().includes("premi") ? "premium" : "enterprise"}`}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-white hover:bg-neutral-200 text-black transition"
              >
                Fazer Upgrade
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
