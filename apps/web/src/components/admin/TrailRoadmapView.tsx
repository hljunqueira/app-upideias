"use client";

import { useState } from "react";
import { Trail, Course, getStoredTrails, saveStoredTrails } from "@/lib/coursesStore";
import { CheckCircle2, Play, ArrowRight, Video, Sparkles, Plus, Award, Edit, Trash2, MapPin } from "lucide-react";
import { TrailModal } from "./TrailModal";

interface TrailRoadmapViewProps {
  trails: Trail[];
  courses: Course[];
  onCourseClick: (course: Course) => void;
  onTrailsChange: (trails: Trail[]) => void;
}

export function TrailRoadmapView({ trails, courses, onCourseClick, onTrailsChange }: TrailRoadmapViewProps) {
  const [selectedTrailId, setSelectedTrailId] = useState<string>(trails[0]?.id || "trail-1");
  const [isTrailModalOpen, setIsTrailModalOpen] = useState(false);
  const [editingTrail, setEditingTrail] = useState<Trail | null>(null);

  const currentTrail = trails.find((t) => t.id === selectedTrailId) || trails[0];

  const handleSaveTrail = (savedTrail: Trail) => {
    let updated: Trail[];
    const exists = trails.some((t) => t.id === savedTrail.id);
    if (exists) {
      updated = trails.map((t) => (t.id === savedTrail.id ? savedTrail : t));
    } else {
      updated = [...trails, savedTrail];
    }
    saveStoredTrails(updated);
    onTrailsChange(updated);
    setSelectedTrailId(savedTrail.id);
  };

  const handleDeleteTrail = (id: string) => {
    if (trails.length <= 1) {
      alert("Você precisa manter pelo menos uma trilha ativa.");
      return;
    }
    if (!confirm("Tem certeza que deseja excluir esta trilha?")) return;
    const updated = trails.filter((t) => t.id !== id);
    saveStoredTrails(updated);
    onTrailsChange(updated);
    setSelectedTrailId(updated[0]?.id || "");
  };

  // Cursos ordenados sequencialmente
  const trailCourses = courses
    .filter((c) => c.track.toLowerCase() === currentTrail?.name.toLowerCase())
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Seleção de Trilhas (Pills) + Botão + Nova Trilha */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-upBorder/40 pb-3">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {trails.map((t, idx) => {
            const isSelected = t.id === selectedTrailId;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTrailId(t.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-upPink text-white border-upPink shadow-[0_0_20px_rgba(255,83,104,0.3)]"
                    : "bg-upDark/60 text-upGray hover:text-white border-upBorder/60 hover:bg-upDark"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span>{t.name}</span>
                <span className="text-[10px] opacity-75 bg-black/20 px-2 py-0.5 rounded-full">
                  {courses.filter((c) => c.track.toLowerCase() === t.name.toLowerCase()).length} cursos
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            setEditingTrail(null);
            setIsTrailModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold shadow-lg transition shrink-0 self-end sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Trilha</span>
        </button>
      </div>

      {/* Detalhes da Trilha Ativa */}
      {currentTrail && (
        <div className="bg-upCard/40 border border-upBorder/60 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-upPink/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-upPink/20 text-upPink border border-upPink/30 px-3 py-1 rounded-full">
                  Trilha Nº {currentTrail.recommendedOrder}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" /> {currentTrail.badge}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{currentTrail.name}</h2>
              <p className="text-xs text-upGray max-w-2xl">{currentTrail.description}</p>
            </div>

            {/* Ações da Trilha (Editar e Excluir) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingTrail(currentTrail);
                  setIsTrailModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 transition"
              >
                <Edit className="w-3.5 h-3.5 text-upPink" />
                <span>Editar Trilha</span>
              </button>

              <button
                onClick={() => handleDeleteTrail(currentTrail.id)}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition"
                title="Excluir Trilha"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visualização de Roadmap Conectado */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-upPink" />
            <span>Roadmap Sequencial de Estudos ("Por Onde Começar")</span>
          </h3>
          <span className="text-xs text-upGray">Ordene a jornada ideal para os alunos</span>
        </div>

        {trailCourses.length === 0 ? (
          <div className="p-8 text-center bg-upDark/40 border border-upBorder/40 rounded-3xl">
            <p className="text-xs text-upGray mb-2">Nenhum curso cadastrado nesta trilha ainda.</p>
            <p className="text-[11px] text-upPink font-semibold">
              Clique em "+ Criar Novo Curso" e selecione a trilha "{currentTrail?.name}".
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-upPink before:via-upPink/50 before:to-transparent">
            {trailCourses.map((course, index) => {
              const isFirst = index === 0;
              return (
                <div key={course.id} className="relative group">
                  {/* Nó de Conexão na Linha */}
                  <div
                    className={`absolute -left-6 top-6 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-md ${
                      isFirst
                        ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)] ring-4 ring-emerald-500/20"
                        : "bg-upDark text-white border border-upPink/60"
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Card do Passo da Trilha */}
                  <div
                    onClick={() => onCourseClick(course)}
                    className="bg-[#0e0e14] border border-upBorder/60 hover:border-upPink/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] group"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-white/10 shrink-0 group-hover:scale-105 transition duration-300"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {isFirst && (
                            <span className="text-[9px] font-extrabold uppercase bg-emerald-500 text-black border border-emerald-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                              🟢 Passo 1 • Começar por Aqui
                            </span>
                          )}
                          <span className="text-[9px] font-extrabold uppercase bg-upPink/20 text-upPink px-2 py-0.5 rounded-md">
                            {course.tag}
                          </span>
                          <span className="text-[10px] text-upGray">{course.accessTier}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-upPink transition">
                          {course.title}
                        </h4>
                        <p className="text-xs text-upGray line-clamp-1 mt-0.5">{course.description}</p>
                        
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-upGray">
                          <span>{course.modulesCount} Módulos</span>
                          <span>•</span>
                          <span>{course.lessonsCount} Aulas</span>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold">+{course.xpReward} XP</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                      <span className="text-xs text-upPink font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        Editar Curso <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de CRUD de Trilhas */}
      <TrailModal
        isOpen={isTrailModalOpen}
        onClose={() => setIsTrailModalOpen(false)}
        onSave={handleSaveTrail}
        initialTrail={editingTrail}
      />
    </div>
  );
}
