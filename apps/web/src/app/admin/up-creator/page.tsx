"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Clock,
  Award,
  Users,
  Play,
  CheckCircle2,
  Eye,
  Trash2,
  Edit,
  ArrowUpRight,
  Shield,
  Layers,
  MapPin
} from "lucide-react";
import {
  Course,
  Trail,
  INITIAL_TRAILS,
  INITIAL_STUDENT_LOGS,
  getStoredCourses,
  saveStoredCourses,
  getStoredTrails
} from "@/lib/coursesStore";
import { CourseModal } from "@/components/admin/CourseModal";
import { TrailRoadmapView } from "@/components/admin/TrailRoadmapView";
import { ModuleLessonBuilder } from "@/components/admin/ModuleLessonBuilder";
import { StudentAnalyticsView } from "@/components/admin/StudentAnalyticsView";

export default function AdminUpCreatorPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [trails, setTrails] = useState<Trail[]>(INITIAL_TRAILS);
  const [activeTab, setActiveTab] = useState<"courses" | "trails" | "modules" | "analytics">("courses");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("Todos");

  // State do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    setCourses(getStoredCourses());
    setTrails(getStoredTrails());

    const handleCourseUpdate = () => setCourses(getStoredCourses());
    const handleTrailUpdate = () => setTrails(getStoredTrails());

    window.addEventListener("up_courses_updated", handleCourseUpdate);
    window.addEventListener("up_trails_updated", handleTrailUpdate);

    return () => {
      window.removeEventListener("up_courses_updated", handleCourseUpdate);
      window.removeEventListener("up_trails_updated", handleTrailUpdate);
    };
  }, []);

  const handleSaveCourse = (updatedCourse: Course) => {
    let newCourses: Course[];
    const exists = courses.some((c) => c.id === updatedCourse.id);
    if (exists) {
      newCourses = courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c));
    } else {
      newCourses = [updatedCourse, ...courses];
    }
    setCourses(newCourses);
    saveStoredCourses(newCourses);
  };

  const handleDeleteCourse = (id: string) => {
    if (!confirm("Tem certeza que deseja remover este curso do UP Creator?")) return;
    const newCourses = courses.filter((c) => c.id !== id);
    setCourses(newCourses);
    saveStoredCourses(newCourses);
  };

  const handleToggleLandingFeatured = (id: string) => {
    const newCourses = courses.map((c) =>
      c.id === id ? { ...c, isLandingPageFeatured: !c.isLandingPageFeatured } : c
    );
    setCourses(newCourses);
    saveStoredCourses(newCourses);
  };

  const trackOptions = ["Todos", ...trails.map((t) => t.name)];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.track.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = selectedTrack === "Todos" || c.track === selectedTrack;
    const matchesStatus =
      selectedStatus === "Todos"
        ? true
        : selectedStatus === "landing"
        ? c.isLandingPageFeatured
        : c.status === selectedStatus;
    return matchesSearch && matchesTrack && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn text-upLightGray">
      
      {/* Header Principal do Painel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-upBorder/40 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2.5 bg-upPink/10 text-upPink rounded-2xl border border-upPink/20 shadow-[0_0_15px_rgba(255,83,104,0.2)]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gerenciamento <span className="text-upPink">UP Creator</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-upGray max-w-2xl">
            Crie, ordene e publique conteúdos interativos. Tudo o que você publicar aqui é sincronizado em tempo real na Landing Page e na Plataforma do Aluno.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCourse(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-upPink hover:bg-upPink/90 text-white rounded-2xl font-bold text-xs shadow-[0_0_25px_rgba(255,83,104,0.4)] transition-all transform hover:-translate-y-0.5"
          data-testid="create-course-button"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Curso</span>
        </button>
      </div>

      {/* 4 Cards de KPIs no Topo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-upCard/40 border border-upBorder/60 rounded-3xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-upPink/50 transition duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-upGray uppercase tracking-wider font-semibold">Total de Cursos</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{courses.length}</h3>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
                {courses.filter((c) => c.isLandingPageFeatured).length} ativos na Landing Page
              </span>
            </div>
            <div className="p-3 bg-upPink/10 text-upPink rounded-2xl group-hover:scale-110 transition duration-300">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-upCard/40 border border-upBorder/60 rounded-3xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/50 transition duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-upGray uppercase tracking-wider font-semibold">Trilhas Ativas</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{trails.length}</h3>
              <span className="text-[10px] text-purple-400 font-semibold mt-1 block">
                Com ordem recomendada
              </span>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl group-hover:scale-110 transition duration-300">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-upCard/40 border border-upBorder/60 rounded-3xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-blue-500/50 transition duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-upGray uppercase tracking-wider font-semibold">Carga Horária Total</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {courses.reduce((acc, curr) => acc + curr.lessonsCount * 12, 0)} min
              </h3>
              <span className="text-[10px] text-blue-400 font-semibold mt-1 block">
                ~{Math.round(courses.reduce((acc, curr) => acc + curr.lessonsCount * 12, 0) / 60)} horas de aulas
              </span>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:scale-110 transition duration-300">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-upCard/40 border border-upBorder/60 rounded-3xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/50 transition duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-upGray uppercase tracking-wider font-semibold">Alunos Acessando</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">1.248</h3>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
                +12% este mês
              </span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl group-hover:scale-110 transition duration-300">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Navegação por Abas Principais (Sem Emojis) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-upBorder/40 pb-2">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === "courses"
                ? "bg-upPink text-white border-upPink shadow-[0_0_15px_rgba(255,83,104,0.3)]"
                : "bg-upDark/40 text-upGray hover:text-white border-upBorder/50"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Cursos & Landing Cards</span>
          </button>

          <button
            onClick={() => setActiveTab("trails")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === "trails"
                ? "bg-upPink text-white border-upPink shadow-[0_0_15px_rgba(255,83,104,0.3)]"
                : "bg-upDark/40 text-upGray hover:text-white border-upBorder/50"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Trilhas Guiadas (Roadmap)</span>
          </button>

          <button
            onClick={() => setActiveTab("modules")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === "modules"
                ? "bg-upPink text-white border-upPink shadow-[0_0_15px_rgba(255,83,104,0.3)]"
                : "bg-upDark/40 text-upGray hover:text-white border-upBorder/50"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Módulos & Aulas</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === "analytics"
                ? "bg-upPink text-white border-upPink shadow-[0_0_15px_rgba(255,83,104,0.3)]"
                : "bg-upDark/40 text-upGray hover:text-white border-upBorder/50"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Quem Assistiu (Analytics)</span>
          </button>
        </div>

        {/* Alterne de Visão (Apenas na aba de cursos) */}
        {activeTab === "courses" && (
          <div className="flex items-center gap-1 bg-upDark/60 border border-upBorder/60 p-1 rounded-2xl shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition ${
                viewMode === "grid" ? "bg-upPink text-white font-bold" : "text-upGray hover:text-white"
              }`}
              title="Visão em Grid (Cards Féis da Landing Page)"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards Landing</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition ${
                viewMode === "table" ? "bg-upPink text-white font-bold" : "text-upGray hover:text-white"
              }`}
              title="Visão em Tabela Admin"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Tabela Gestão</span>
            </button>
          </div>
        )}
      </div>

      {/* CONTEÚDO DA ABA 1: CURSOS & LANDING CARDS */}
      {activeTab === "courses" && (
        <div className="space-y-6">
          {/* Barra de Busca e Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-upCard/40 border border-upBorder/60 p-4 rounded-3xl backdrop-blur-xl">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-upGray" />
              <input
                type="text"
                placeholder="Buscar por curso, tag ou trilha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-upDark border border-upBorder/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
              >
                {trackOptions.map((t) => (
                  <option key={t} value={t}>
                    Trilha: {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
              >
                <option value="Todos">Status: Todos</option>
                <option value="landing">Na Landing Page</option>
                <option value="published">Publicado</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>
          </div>

          {/* VISÃO EM GRID (CARDS IDÊNTICOS À LANDING PAGE) */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCourses.map((c) => (
                <div
                  key={c.id}
                  className="relative flex flex-col aspect-[4/5] bg-[#0f0f14] rounded-2xl overflow-hidden group border border-white/10 shadow-2xl transition-all duration-500 hover:border-upPink/50 hover:shadow-[0_20px_50px_rgba(255,83,104,0.3)]"
                >
                  {/* Imagem de Fundo com Zoom */}
                  <div className="absolute inset-0">
                    <img
                      src={c.thumbnailUrl}
                      alt={c.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/80 to-black/30" />
                  </div>

                  {/* Top Bar Admin (Badge UP, Tag e Botões Rápidos) */}
                  <div className="relative p-3.5 z-10 flex justify-between items-center">
                    <div className="flex items-center bg-white px-2.5 py-1 rounded-full border border-white/20 shadow-md">
                      <img src="/UP-Logo-removebg-preview.png" alt="UP" className="h-4 w-auto object-contain" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest bg-upPink text-white shadow-md border border-upPink px-2 py-0.5 rounded-full">
                        {c.tag}
                      </span>
                    </div>
                  </div>

                  {/* Badges de Status (Se está ativo na landing page) */}
                  <div className="relative px-3.5 z-10 space-y-1">
                    {c.isRecommendedFirst && (
                      <span className="text-[9px] font-extrabold uppercase bg-emerald-500 text-black px-2 py-0.5 rounded flex items-center gap-1 w-max shadow-md">
                        🟢 COMEÇAR POR AQUI
                      </span>
                    )}
                    {c.isLandingPageFeatured && (
                      <span className="text-[9px] font-extrabold uppercase bg-blue-500/80 text-white px-2 py-0.5 rounded flex items-center gap-1 w-max shadow-md backdrop-blur-sm">
                        ⭐ Ativo na Landing
                      </span>
                    )}
                  </div>

                  {/* Conteúdo Base do Card */}
                  <div className="relative h-full flex flex-col justify-end p-4 z-10">
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex-1 pr-2">
                        <span className="text-upPink text-[9px] font-extrabold uppercase tracking-widest mb-1 block">
                          {c.track}
                        </span>
                        <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-md">
                          {c.title}
                        </h3>
                      </div>

                      {/* Botão de Edição Rápida */}
                      <button
                        onClick={() => {
                          setEditingCourse(c);
                          setIsModalOpen(true);
                        }}
                        className="bg-white text-black p-2.5 rounded-full shadow-lg hover:bg-upPink hover:text-white transition duration-300"
                        title="Editar Curso"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Barra de Progresso Demo */}
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden backdrop-blur-sm mb-2">
                      <div
                        className="bg-upPink h-full rounded-full shadow-[0_0_10px_rgba(255,83,104,0.8)]"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>

                    {/* Ações do Admin no Rodapé do Card */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px]">
                      <button
                        onClick={() => handleToggleLandingFeatured(c.id)}
                        className={`font-semibold hover:underline ${
                          c.isLandingPageFeatured ? "text-emerald-400" : "text-upGray"
                        }`}
                      >
                        {c.isLandingPageFeatured ? "Exibindo na Landing" : "+ Add à Landing"}
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(c.id)}
                        className="text-red-400 hover:text-red-300 transition"
                        title="Excluir Curso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* VISÃO EM TABELA ADMIN */
            <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-upDark/60 border-b border-upBorder/40 text-upGray uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3.5 px-6">Curso</th>
                      <th className="py-3.5 px-6">Trilha & Tag</th>
                      <th className="py-3.5 px-6">Acesso</th>
                      <th className="py-3.5 px-6">XP</th>
                      <th className="py-3.5 px-6 text-center">Landing Page</th>
                      <th className="py-3.5 px-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-upBorder/30">
                    {filteredCourses.map((c) => (
                      <tr key={c.id} className="hover:bg-upDark/40 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.thumbnailUrl}
                              alt={c.title}
                              className="w-10 h-10 rounded-xl object-cover border border-white/10"
                            />
                            <div>
                              <p className="font-bold text-white text-xs">{c.title}</p>
                              <p className="text-[10px] text-upGray line-clamp-1 max-w-xs">{c.description}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="font-semibold text-white block">{c.track}</span>
                          <span className="text-[10px] text-upPink font-extrabold uppercase">{c.tag}</span>
                        </td>

                        <td className="py-4 px-6">
                          <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[10px] text-white font-medium">
                            {c.accessTier}
                          </span>
                        </td>

                        <td className="py-4 px-6 font-bold text-amber-400">+{c.xpReward} XP</td>

                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleToggleLandingFeatured(c.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition ${
                              c.isLandingPageFeatured
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-white/5 text-upGray border-white/10 hover:text-white"
                            }`}
                          >
                            {c.isLandingPageFeatured ? "Ativo" : "Inativo"}
                          </button>
                        </td>

                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingCourse(c);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-upGray hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(c.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: TRILHAS GUIADAS (ROADMAP) */}
      {activeTab === "trails" && (
        <TrailRoadmapView
          trails={trails}
          courses={courses}
          onCourseClick={(course) => {
            setEditingCourse(course);
            setIsModalOpen(true);
          }}
          onTrailsChange={(updated) => setTrails(updated)}
        />
      )}

      {/* CONTEÚDO DA ABA 3: MÓDULOS E AULAS */}
      {activeTab === "modules" && <ModuleLessonBuilder courses={courses} />}

      {/* CONTEÚDO DA ABA 4: QUEM ASSISTIU (ANALYTICS) */}
      {activeTab === "analytics" && <StudentAnalyticsView logs={INITIAL_STUDENT_LOGS} />}

      {/* MODAL DE CRIAÇÃO E EDIÇÃO COM LIVE PREVIEW */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
        }}
        onSave={handleSaveCourse}
        initialCourse={editingCourse}
        tracks={trackOptions}
      />
    </div>
  );
}
