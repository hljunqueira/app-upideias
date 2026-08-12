"use client";

import { useState, useEffect } from "react";
import {
  Course,
  Module,
  Lesson,
  fetchModulesFromDb,
  saveModuleToDb,
  deleteModuleFromDb,
  saveLessonToDb,
  deleteLessonFromDb
} from "@/lib/coursesStore";
import { ChevronDown, ChevronRight, Plus, Video, Edit, Trash2, Clock, Award, FileText } from "lucide-react";
import { LessonModal } from "./LessonModal";
import { ModuleModal } from "./ModuleModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export function ModuleLessonBuilder({ courses }: { courses: Course[] }) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);

  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  // State dos Modais
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [activeModuleIdForLesson, setActiveModuleIdForLesson] = useState<string>("");

  // State do Modal de Confirmação de Exclusão
  const [deleteTarget, setDeleteTarget] = useState<{ type: "module" | "lesson"; moduleId: string; lessonId?: string } | null>(null);

  useEffect(() => {
    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  useEffect(() => {
    async function loadCourseModules() {
      if (!selectedCourseId) return;
      setLoading(true);
      const loaded = await fetchModulesFromDb(selectedCourseId);
      setModules(loaded);
      if (loaded.length > 0 && !expandedModuleId) {
        setExpandedModuleId(loaded[0].id);
      }
      setLoading(false);
    }
    loadCourseModules();
  }, [selectedCourseId]);

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // --- CRUD DE MÓDULOS ---
  const handleOpenAddModule = () => {
    setEditingModule(null);
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: Module) => {
    setEditingModule(mod);
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (title: string, description?: string) => {
    if (editingModule) {
      const updatedMod: Module = { ...editingModule, title, description };
      await saveModuleToDb(updatedMod);
      setModules(modules.map((m) => (m.id === editingModule.id ? updatedMod : m)));
    } else {
      const newMod: Module = {
        id: `m-${Date.now()}`,
        courseId: selectedCourseId,
        title,
        description,
        order: modules.length + 1,
        lessons: []
      };
      await saveModuleToDb(newMod);
      setModules([...modules, newMod]);
      setExpandedModuleId(newMod.id);
    }
  };

  const onRequestDeleteModule = (moduleId: string) => {
    setDeleteTarget({ type: "module", moduleId });
  };

  const onRequestDeleteLesson = (moduleId: string, lessonId: string) => {
    setDeleteTarget({ type: "lesson", moduleId, lessonId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "module") {
      await deleteModuleFromDb(deleteTarget.moduleId);
      setModules(modules.filter((m) => m.id !== deleteTarget.moduleId));
    } else if (deleteTarget.type === "lesson" && deleteTarget.lessonId) {
      await deleteLessonFromDb(deleteTarget.lessonId);
      setModules(
        modules.map((m) => {
          if (m.id === deleteTarget.moduleId) {
            return { ...m, lessons: m.lessons.filter((l) => l.id !== deleteTarget.lessonId) };
          }
          return m;
        })
      );
    }
    setDeleteTarget(null);
  };

  // --- CRUD DE AULAS ---
  const handleOpenAddLesson = (moduleId: string) => {
    setActiveModuleIdForLesson(moduleId);
    setEditingLesson(null);
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (lesson: Lesson) => {
    setActiveModuleIdForLesson(lesson.moduleId);
    setEditingLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (savedLesson: Lesson) => {
    await saveLessonToDb(savedLesson, selectedCourseId);
    setModules(
      modules.map((m) => {
        if (m.id === savedLesson.moduleId) {
          const exists = m.lessons.some((l) => l.id === savedLesson.id);
          let newLessons: Lesson[];
          if (exists) {
            newLessons = m.lessons.map((l) => (l.id === savedLesson.id ? savedLesson : l));
          } else {
            newLessons = [...m.lessons, savedLesson];
          }
          return { ...m, lessons: newLessons };
        }
        return m;
      })
    );
  };


  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Seletor de Curso */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-upCard/40 border border-upBorder/60 rounded-3xl p-5 backdrop-blur-xl">
        <div>
          <h3 className="text-sm font-bold text-white mb-0.5">Selecione o Curso para Gerenciar Conteúdo</h3>
          <p className="text-xs text-upGray">Gerencie módulos, aulas, links de vídeo e materiais complementares.</p>
        </div>

        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition min-w-[260px]"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({c.track})
            </option>
          ))}
        </select>
      </div>

      {/* Cabeçalho do Curso Selecionado & Botão Adicionar Módulo */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-upPink bg-upPink/10 px-2.5 py-1 rounded-full border border-upPink/20">
            {currentCourse?.track}
          </span>
          <h2 className="text-lg font-bold text-white mt-1">{currentCourse?.title}</h2>
        </div>

        <button
          onClick={handleOpenAddModule}
          className="flex items-center gap-2 px-4 py-2 bg-upPink hover:bg-upPink/90 text-white rounded-2xl text-xs font-bold shadow-[0_0_15px_rgba(255,83,104,0.3)] transition"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Módulo</span>
        </button>
      </div>

      {/* Lista de Módulos (Accordion) */}
      <div className="space-y-4">
        {modules.map((mod) => {
          const isExpanded = expandedModuleId === mod.id;
          return (
            <div
              key={mod.id}
              className="bg-[#0e0e14] border border-upBorder/60 rounded-2xl overflow-hidden transition-all duration-300"
            >
              {/* Header do Módulo */}
              <div
                onClick={() => setExpandedModuleId(isExpanded ? "" : mod.id)}
                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer bg-upDark/50 hover:bg-upDark/80 transition border-b border-upBorder/40"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-upPink shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-upGray shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{mod.title}</h4>
                      <span className="text-[10px] font-semibold text-upGray bg-white/5 px-2.5 py-0.5 rounded-full shrink-0">
                        {mod.lessons.length} Aulas
                      </span>
                    </div>
                    {mod.description && (
                      <p className="text-[11px] text-upGray mt-0.5">{mod.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditModule(mod);
                    }}
                    className="p-1.5 text-upGray hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition"
                    title="Editar Módulo"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDeleteModule(mod.id);
                    }}
                    className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition"
                    title="Excluir Módulo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAddLesson(mod.id);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-upPink/20 text-upPink hover:bg-upPink/30 border border-upPink/40 rounded-xl text-xs font-bold transition ml-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Aula</span>
                  </button>
                </div>
              </div>

              {/* Lista de Aulas do Módulo */}
              {isExpanded && (
                <div className="p-4 space-y-3 bg-[#08080c]">
                  {mod.lessons.length === 0 ? (
                    <div className="p-6 text-center text-upGray">
                      <p className="text-xs mb-2">Nenhuma aula neste módulo ainda.</p>
                      <button
                        onClick={() => handleOpenAddLesson(mod.id)}
                        className="text-xs text-upPink font-bold hover:underline"
                      >
                        + Adicionar Primeira Aula
                      </button>
                    </div>
                  ) : (
                    mod.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="bg-upDark/60 border border-upBorder/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-upPink/40 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-upPink/10 text-upPink rounded-xl shrink-0">
                            <Video className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-bold text-upGray">#{idx + 1}</span>
                              <h5 className="text-xs font-bold text-white">{lesson.title}</h5>
                              {lesson.isFreePreview && (
                                <span className="text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                                  Degustação Grátis
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-upGray truncate max-w-md mt-0.5">
                              Provedor: <strong className="text-white uppercase">{lesson.videoProvider}</strong> • {lesson.videoUrl}
                            </p>

                            {/* Anexos */}
                            {lesson.attachments && lesson.attachments.length > 0 && (
                              <div className="flex gap-2 mt-1">
                                {lesson.attachments.map((att) => (
                                  <span key={att.id} className="text-[9px] bg-white/5 text-upGray px-2 py-0.5 rounded flex items-center gap-1">
                                    <FileText className="w-2.5 h-2.5 text-upPink" /> {att.title}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Metadados e Ações da Aula */}
                        <div className="flex items-center gap-4 text-xs text-upGray self-end sm:self-center">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-upGray" /> {lesson.durationMinutes} min
                          </span>
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Award className="w-3 h-3" /> +{lesson.xpPoints} XP
                          </span>

                          <div className="flex items-center gap-1.5 ml-2 border-l border-upBorder/40 pl-3">
                            <button
                              onClick={() => handleOpenEditLesson(lesson)}
                              className="p-1.5 text-upGray hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition"
                              title="Editar Aula"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onRequestDeleteLesson(mod.id, lesson.id)}
                              className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition"
                              title="Excluir Aula"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Módulos */}
      <ModuleModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        onSave={handleSaveModule}
        initialTitle={editingModule?.title}
        initialDescription={editingModule?.description}
      />

      {/* Modal de Aulas */}
      <LessonModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onSave={handleSaveLesson}
        initialLesson={editingLesson}
        moduleId={activeModuleIdForLesson}
      />

      {/* Modal Customizado de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === "module" ? "Excluir Módulo" : "Excluir Aula"}
        description={
          deleteTarget?.type === "module"
            ? "Tem certeza que deseja excluir este módulo e todas as suas aulas? Esta ação não pode ser desfeita."
            : "Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita."
        }
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
