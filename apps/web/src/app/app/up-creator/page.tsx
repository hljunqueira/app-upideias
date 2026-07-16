"use client";

import { useState } from "react";
import { 
  GraduationCap, 
  Play, 
  CheckCircle2, 
  Clock, 
  Award,
  Video
} from "lucide-react";

export default function UpCreatorPage() {
  const [activeCourse, setActiveCourse] = useState("all");

  const courses = [
    {
      id: "course-1",
      title: "Tráfego Pago & Instagram Ads",
      lessons: 8,
      duration: "4h 15m",
      progress: 60,
      image: "🎯",
      category: "traffic"
    },
    {
      id: "course-2",
      title: "Design Premium com Canva & Figma",
      lessons: 10,
      duration: "5h 30m",
      progress: 20,
      image: "🎨",
      category: "design"
    },
    {
      id: "course-3",
      title: "Estratégia de Funil de Reels",
      lessons: 6,
      duration: "2h 45m",
      progress: 100,
      image: "📈",
      category: "strategy"
    }
  ];

  const filteredCourses = activeCourse === "all" 
    ? courses 
    : courses.filter(c => c.category === activeCourse);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-upPink" />
            UP Creator Academy
          </h1>
          <p className="text-sm text-upGray mt-1">Aulas e treinamentos exclusivos para alavancar seu Instagram.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="inline-flex bg-upCard rounded-xl p-1 border border-upBorder w-fit">
        {[
          { id: "all", label: "Todos os Cursos" },
          { id: "strategy", label: "Estratégia" },
          { id: "traffic", label: "Tráfego" },
          { id: "design", label: "Design" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCourse(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeCourse === tab.id ? "bg-upPink text-upWhite" : "text-upGray hover:text-upWhite"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-upCard border border-upBorder hover:border-upBorder/80 rounded-2xl p-5 flex flex-col justify-between gap-6 transition-all group relative overflow-hidden">
            
            {/* Top info */}
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-upDark border border-upBorder/80 flex items-center justify-center text-2xl">
                {course.image}
              </div>

              <div>
                <h3 className="text-sm font-bold text-upWhite group-hover:text-upPink transition-colors leading-snug">
                  {course.title}
                </h3>
                <div className="flex items-center gap-3 text-[10px] text-upGray mt-3">
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-upPink" /> {course.lessons} aulas
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {course.duration}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] text-upGray font-bold uppercase tracking-wider">
                <span>Progresso</span>
                <span>{course.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-upDark rounded-full overflow-hidden">
                <div 
                  className="h-full bg-upPink rounded-full transition-all duration-500" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Action button */}
            {course.progress === 100 ? (
              <div className="flex items-center gap-1.5 text-xs text-green-400 font-bold mt-2">
                <CheckCircle2 className="w-4 h-4" /> Concluído
              </div>
            ) : (
              <button className="w-full py-2.5 bg-upDark hover:bg-upBorder border border-upBorder hover:text-upWhite text-upLightGray text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-upPink fill-upPink" /> Assistir Aulas
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
