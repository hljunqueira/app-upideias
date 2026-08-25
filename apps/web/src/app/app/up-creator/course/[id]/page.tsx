"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Play,
  CheckCircle2,
  ChevronLeft,
  Video,
  FileText,
  Copy,
  Check,
  Award,
  Sparkles,
  MessageSquare,
  Bookmark,
  FastForward,
  GraduationCap
} from "lucide-react";
import { Course, Lesson, Module, fetchCoursesFromDb, fetchModulesFromDb } from "@/lib/coursesStore";
import { CertificateModal } from "@/components/creator/CertificateModal";
import { ProtectedVideoPlayer } from "@/components/creator/ProtectedVideoPlayer";
import { getMe } from "@/lib/api";
import { supabase } from "@up-analytics/lib";

export default function StudentCoursePlayerPage() {
  const params = useParams();
  const courseId = (params?.id as string) || "";

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string>("");
  const [activeLessonId, setActiveLessonId] = useState<string>("");
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isCopiedPrompt, setIsCopiedPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "prompts" | "materials" | "notes" | "comments">("overview");

  const [notes, setNotes] = useState<{ id: string; timestamp: string; text: string }[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      if (!courseId) return;
      try {
        setLoading(true);
        const [u, allCourses, loadedModules] = await Promise.all([
          getMe().catch(() => null),
          fetchCoursesFromDb(),
          fetchModulesFromDb(courseId)
        ]);

        setUser(u);

        const found = allCourses.find((c) => c.id === courseId) || allCourses[0] || null;
        setCourse(found);
        setModules(loadedModules);

        if (loadedModules.length > 0) {
          setActiveModuleId(loadedModules[0].id);
          if (loadedModules[0].lessons.length > 0) {
            setActiveLessonId(loadedModules[0].lessons[0].id);
          }
        }

        // Carregar aulas já concluídas pelo aluno no Supabase
        if (u?.id) {
          const { data: progress } = await supabase
            .from("user_lesson_progress")
            .select("lesson_id, completed")
            .eq("user_id", u.id)
            .eq("completed", true);

          if (progress && progress.length > 0) {
            setCompletedLessonIds(progress.map((p) => p.lesson_id));
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do curso:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [courseId]);

  const activeModule = modules.find((m) => m.id === activeModuleId) || modules[0] || { id: "", title: "", lessons: [] };
  const allLessons = modules.flatMap((m) => m.lessons);
  const activeLesson = allLessons.find((l) => l.id === activeLessonId) || allLessons[0] || null;

  const toggleLessonCompletion = async (lessonId: string) => {
    if (!lessonId) return;
    const isDone = completedLessonIds.includes(lessonId);
    let updated: string[];
    if (isDone) {
      updated = completedLessonIds.filter((id) => id !== lessonId);
    } else {
      updated = [...completedLessonIds, lessonId];
    }
    setCompletedLessonIds(updated);

    // Salva no banco de dados
    if (user?.id) {
      try {
        await supabase.from("user_lesson_progress").upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: !isDone,
          completed_at: !isDone ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn("Erro ao salvar progresso da aula:", e);
      }
    }

    const totalLessons = allLessons.length;
    if (updated.length >= totalLessons && totalLessons > 0) {
      setIsCertificateOpen(true);
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopiedPrompt(true);
    setTimeout(() => setIsCopiedPrompt(false), 2000);
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const note = {
      id: `n-${Date.now()}`,
      timestamp: "02:45",
      text: newNoteText.trim()
    };
    setNotes([...notes, note]);
    setNewNoteText("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080c] p-6 space-y-6 animate-pulse">
        <div className="h-14 bg-white/5 rounded-2xl w-full" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="aspect-video w-full bg-white/5 rounded-3xl" />
            <div className="h-20 bg-white/5 rounded-2xl" />
          </div>
          <div className="lg:col-span-4 h-96 bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#08080c] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-400 mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Curso não encontrado</h2>
        <p className="text-xs text-neutral-400 mb-6 max-w-sm">
          Este curso pode ter sido movido ou ainda está em preparação.
        </p>
        <Link
          href="/app/up-creator"
          className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition"
        >
          Voltar para o Roadmap
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080c] text-neutral-200 antialiased">
      {/* Header Fixo Superior de Aprendizado */}
      <header className="sticky top-0 z-40 bg-[#0c0c14]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/app/up-creator"
              className="p-1.5 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition flex items-center gap-1 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar para o Roadmap</span>
            </Link>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            <div>
              <span className="text-[10px] font-extrabold uppercase text-rose-500 tracking-wider">
                {course.track}
              </span>
              <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {course.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCertificateOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition hover:bg-amber-500/30 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Certificado</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal Dual-Pane */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA/CENTRO (Player de Vídeo & Abas de Estudo) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PLAYER DE VÍDEO PROTEGIDO */}
          <ProtectedVideoPlayer
            videoUrl={activeLesson?.videoUrl || ""}
            title={activeLesson?.title || course.title}
            videoProvider={activeLesson?.videoProvider || "youtube"}
            playbackSpeed={playbackSpeed}
          />

          {/* BARRA DE AÇÕES DA AULA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e0e14] border border-white/10 p-4 rounded-2xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-rose-500 font-extrabold uppercase bg-rose-500/10 px-2 py-0.5 rounded">
                  {activeModule?.title || "Módulo Principal"}
                </span>
                {activeLesson?.durationMinutes && (
                  <span className="text-xs text-neutral-400 font-medium">
                    {activeLesson.durationMinutes} min
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-white">
                {activeLesson?.title || "Selecione uma aula ao lado"}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-[#12121a] border border-white/10 p-1 rounded-xl text-xs">
                <FastForward className="w-3.5 h-3.5 text-neutral-400 ml-1" />
                {[1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      playbackSpeed === speed ? "bg-rose-500 text-white" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {activeLesson && (
                <button
                  onClick={() => toggleLessonCompletion(activeLesson.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
                    completedLessonIds.includes(activeLesson.id)
                      ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      : "bg-rose-500 text-white hover:bg-rose-600 shadow-[0_0_20px_rgba(255,83,104,0.3)]"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {completedLessonIds.includes(activeLesson.id)
                      ? "Aula Concluída!"
                      : "Concluir Aula (+50 XP)"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* ABAS DE ESTUDO */}
          <div className="bg-[#0e0e14] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex gap-2 overflow-x-auto p-3 border-b border-white/5 bg-[#12121a]/40">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "overview" ? "bg-rose-500 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Visão Geral</span>
              </button>

              <button
                onClick={() => setActiveTab("prompts")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "prompts" ? "bg-rose-500 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prompts de IA</span>
              </button>

              <button
                onClick={() => setActiveTab("materials")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "materials" ? "bg-rose-500 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Materiais em PDF</span>
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "notes" ? "bg-rose-500 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Anotações</span>
              </button>

              <button
                onClick={() => setActiveTab("comments")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "comments" ? "bg-rose-500 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comentários</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {activeTab === "overview" && (
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">Sobre esta Aula</h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {activeLesson?.description || course.description || "Assista ao vídeo para absorver as estratégias ensinadas neste módulo."}
                  </p>
                </div>
              )}

              {activeTab === "prompts" && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#12121a] border border-rose-500/30 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-rose-500 uppercase">
                        Prompt de IA Recomendado pelo Especialista
                      </span>
                      <button
                        onClick={() => handleCopyPrompt("Atue como um estrategista de conteúdo para Instagram...")}
                        className="flex items-center gap-1.5 px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition cursor-pointer"
                      >
                        {isCopiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopiedPrompt ? "Copiado!" : "Copiar Prompt"}</span>
                      </button>
                    </div>
                    <pre className="text-xs text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed">
                      "Atue como um estrategista de conteúdo para Instagram. Crie 3 ideias de Reels com hooks de alta retenção nos primeiros 3 segundos para o nicho de marketing."
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === "materials" && (
                <div className="space-y-3">
                  {activeLesson?.attachments && activeLesson.attachments.length > 0 ? (
                    activeLesson.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-3.5 bg-[#12121a]/60 border border-white/5 rounded-2xl"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-rose-500" />
                          <div>
                            <p className="text-xs font-bold text-white">{att.title}</p>
                            <p className="text-[10px] text-neutral-400 uppercase">{att.type}</p>
                          </div>
                        </div>
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
                        >
                          Baixar Arquivo
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-400">Nenhum anexo adicional para esta aula.</p>
                  )}
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Escreva uma anotação desta aula..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="flex-1 bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition cursor-pointer"
                    >
                      Salvar Nota
                    </button>
                  </div>

                  <div className="space-y-2">
                    {notes.map((n) => (
                      <div key={n.id} className="p-3 bg-[#12121a]/50 border border-white/5 rounded-xl flex items-start gap-3">
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                          {n.timestamp}
                        </span>
                        <p className="text-xs text-white flex-1">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "comments" && (
                <div className="p-4 text-center text-neutral-400 text-xs">
                  <p>Seja o primeiro a deixar um comentário sobre esta aula!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Grade de Módulos & Aulas do Curso */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0e0e14] border border-white/10 rounded-3xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>Conteúdo do Curso</span>
              <span className="text-xs font-semibold text-emerald-400">
                {completedLessonIds.length} / {allLessons.length} Concluídas
              </span>
            </h3>

            <div className="space-y-3">
              {modules.map((mod) => (
                <div key={mod.id} className="border border-white/5 rounded-2xl overflow-hidden bg-[#12121a]/40">
                  <div className="p-3 bg-[#12121a]/80 flex items-center justify-between border-b border-white/5">
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">
                      {mod.title}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {mod.lessons.length} Aulas
                    </span>
                  </div>

                  <div className="p-2 space-y-1.5">
                    {mod.lessons.map((lesson) => {
                      const isActive = lesson.id === activeLesson?.id;
                      const isDone = completedLessonIds.includes(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            setActiveModuleId(mod.id);
                            setActiveLessonId(lesson.id);
                          }}
                          className={`p-2.5 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition ${
                            isActive
                              ? "bg-rose-500/20 text-white font-bold border border-rose-500/40"
                              : "text-neutral-400 hover:bg-[#12121a]/80 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            )}
                            <span className="text-xs leading-tight line-clamp-1">{lesson.title}</span>
                          </div>

                          <span className="text-[10px] opacity-75 shrink-0">
                            {lesson.durationMinutes} min
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        course={course}
      />
    </div>
  );
}
