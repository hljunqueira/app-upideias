"use client";

import { useState } from "react";
import { Trail, Course, saveTrailToDb, deleteTrailFromDb } from "@/lib/coursesStore";
import { CheckCircle2, Play, ArrowRight, Video, Sparkles, Plus, Award, Edit, Trash2, MapPin } from "lucide-react";
import { TrailModal } from "./TrailModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface TrailRoadmapViewProps {
  trails: Trail[];
  courses: Course[];
  onCourseClick: (course: Course) => void;
  onTrailsChange: (trails: Trail[]) => void;
}

export function TrailRoadmapView({
  trails,
  courses,
  onCourseClick,
  onTrailsChange
}: TrailRoadmapViewProps) {
  const [selectedTrailId, setSelectedTrailId] = useState<string>(trails[0]?.id || "");
  const [isTrailModalOpen, setIsTrailModalOpen] = useState(false);
  const [editingTrail, setEditingTrail] = useState<Trail | null>(null);
  const [deletingTrailId, setDeletingTrailId] = useState<string | null>(null);

  const currentTrail = trails.find((t) => t.id === selectedTrailId) || trails[0];

  const handleOpenAddTrail = () => {
    setEditingTrail(null);
    setIsTrailModalOpen(true);
  };

  const handleOpenEditTrail = (trail: Trail) => {
    setEditingTrail(trail);
    setIsTrailModalOpen(true);
  };

  const handleSaveTrail = async (savedTrail: Trail) => {
    await saveTrailToDb(savedTrail);
    const exists = trails.some((t) => t.id === savedTrail.id);
    let updated: Trail[];
    if (exists) {
      updated = trails.map((t) => (t.id === savedTrail.id ? savedTrail : t));
    } else {
      updated = [...trails, savedTrail];
    }
    onTrailsChange(updated);
    setSelectedTrailId(savedTrail.id);
  };

  const onRequestDeleteTrail = (id: string) => {
    setDeletingTrailId(id);
  };

  const handleConfirmDeleteTrail = async () => {
    if (!deletingTrailId) return;
    await deleteTrailFromDb(deletingTrailId);
    const updated = trails.filter((t) => t.id !== deletingTrailId);
    onTrailsChange(updated);
    setSelectedTrailId(updated[0]?.id || "");
    setDeletingTrailId(null);
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
                onClick={() => onRequestDeleteTrail(currentTrail.id)}
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
          <h4 className="text-xs font-bold uppercase tracking-wider text-upGray flex items-center gap-2">
            <MapPin className="w-4 h-4 text-upPink" /> Ordem Recomendada de Estudos da Trilha
          </h4>
          <span className="text-[11px] text-upGray">
            {trailCourses.length} {trailCourses.length === 1 ? "curso associado" : "cursos associados"}
          </span>
        </div>

        {trailCourses.length === 0 ? (
          <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-8 text-center text-upGray">
            <p className="text-xs">Nenhum curso associado a esta trilha ainda.</p>
            <p className="text-[11px] text-upGray/70 mt-1">
              Edite um curso e selecione a trilha &quot;{currentTrail?.name}&quot; para associá-lo.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {trailCourses.map((course, index) => {
              const isFirst = index === 0;
              return (
                <div
                  key={course.id}
                  onClick={() => onCourseClick(course)}
                  className="bg-[#0e0e14] border border-upBorder/60 hover:border-upPink/50 rounded-2xl p-4 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Número do Passo */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isFirst
                            ? "bg-upPink text-white shadow-[0_0_15px_rgba(255,83,104,0.4)]"
                            : "bg-white/5 text-upGray border border-white/10 group-hover:border-upPink/40 group-hover:text-white"
                        }`}
                      >
                        {index + 1}
                      </div>

                      {/* Informações do Curso */}
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-bold text-white group-hover:text-upPink transition">
                            {course.title}
                          </h4>
                          {isFirst && (
                            <span className="text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                              Começar por Aqui
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-upGray line-clamp-1">{course.description}</p>

                        <div className="flex items-center gap-3 mt-2 text-[10px] text-upGray">
                          <span>{course.modulesCount} Módulos</span>
                          <span>•</span>
                          <span>{course.lessonsCount} Aulas</span>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold">+{course.xpReward} XP</span>
                        </div>
                      </div>
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

      {/* Modal Customizado de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!deletingTrailId}
        title="Excluir Trilha Guiada"
        description="Tem certeza que deseja excluir esta trilha? Os cursos associados serão preservados."
        confirmText="Sim, Excluir Trilha"
        cancelText="Cancelar"
        onConfirm={handleConfirmDeleteTrail}
        onClose={() => setDeletingTrailId(null)}
      />
    </div>
  );
}
