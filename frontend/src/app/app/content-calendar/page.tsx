"use client";

import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus,
  Share2
} from "lucide-react";
import { StatusBadge } from "@up-analytics/ui";

export default function ContentCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState("Julho 2026");

  const calendarDays = [
    { day: 28, isCurrentMonth: false, posts: [] },
    { day: 29, isCurrentMonth: false, posts: [] },
    { day: 30, isCurrentMonth: false, posts: [] },
    { day: 1, isCurrentMonth: true, posts: [] },
    { day: 2, isCurrentMonth: true, posts: [] },
    { 
      day: 3, 
      isCurrentMonth: true, 
      posts: [
        { id: "p1", title: "Estratégia vs Postagem", type: "Carrossel", status: "published", time: "18:30" }
      ] 
    },
    { 
      day: 4, 
      isCurrentMonth: true, 
      posts: [
        { id: "p2", title: "3 Hacks de Social Media", type: "Reels", status: "published", time: "12:00" }
      ] 
    },
    { day: 5, isCurrentMonth: true, posts: [] },
    { 
      day: 6, 
      isCurrentMonth: true, 
      posts: [
        { id: "p3", title: "Funil de Conteúdo", type: "Reels", status: "pending", time: "15:00" }
      ] 
    },
    { day: 7, isCurrentMonth: true, posts: [] },
    { day: 8, isCurrentMonth: true, posts: [] },
    { day: 9, isCurrentMonth: true, posts: [] },
    { 
      day: 10, 
      isCurrentMonth: true, 
      posts: [
        { id: "p4", title: "Legendas que Convertem", type: "Imagem", status: "draft", time: "09:00" }
      ] 
    },
    { day: 11, isCurrentMonth: true, posts: [] },
    { day: 12, isCurrentMonth: true, posts: [] },
    { day: 13, isCurrentMonth: true, posts: [] },
    { day: 14, isCurrentMonth: true, posts: [] },
    { day: 15, isCurrentMonth: true, posts: [] },
    { day: 16, isCurrentMonth: true, posts: [] },
    { day: 17, isCurrentMonth: true, posts: [] },
    { day: 18, isCurrentMonth: true, posts: [] },
    { day: 19, isCurrentMonth: true, posts: [] },
    { day: 20, isCurrentMonth: true, posts: [] },
    { day: 21, isCurrentMonth: true, posts: [] },
    { day: 22, isCurrentMonth: true, posts: [] },
    { day: 23, isCurrentMonth: true, posts: [] },
    { day: 24, isCurrentMonth: true, posts: [] },
    { day: 25, isCurrentMonth: true, posts: [] },
    { day: 26, isCurrentMonth: true, posts: [] },
    { day: 27, isCurrentMonth: true, posts: [] },
    { day: 28, isCurrentMonth: true, posts: [] },
    { day: 29, isCurrentMonth: true, posts: [] },
    { day: 30, isCurrentMonth: true, posts: [] },
    { day: 31, isCurrentMonth: true, posts: [] },
    { day: 1, isCurrentMonth: false, posts: [] }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-upPink" />
            Calendário Editorial
          </h1>
          <p className="text-sm text-upGray mt-1">Organize sua distribuição e acompanhe datas de postagem.</p>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-upCard hover:bg-upDark text-upWhite border border-upBorder rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Novo Post
          </button>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between bg-upCard border border-upBorder rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-upWhite">{currentMonth}</span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-upDark text-upLightGray hover:text-upWhite rounded-xl border border-upBorder/60 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-upDark text-upLightGray hover:text-upWhite rounded-xl border border-upBorder/60 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-upCard border border-upBorder rounded-2xl overflow-hidden">
        {/* Days of Week */}
        <div className="grid grid-cols-7 border-b border-upBorder bg-upDark/50 text-center py-3 text-xs font-bold uppercase tracking-wider text-upGray">
          <div>Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div>Sáb</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 grid-rows-5 gap-px bg-upBorder/40">
          {calendarDays.map((dayObj, index) => (
            <div
              key={index}
              className={`min-h-[120px] bg-upCard p-3 flex flex-col gap-2 relative ${
                dayObj.isCurrentMonth ? "" : "opacity-30"
              }`}
            >
              <span className="text-xs font-bold text-upGray self-end">{dayObj.day}</span>
              
              {/* Daily posts */}
              <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[85px] mt-1">
                {dayObj.posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-1.5 rounded-lg bg-upDark border border-upBorder/80 hover:border-upPink/40 transition-all flex flex-col gap-1 cursor-pointer"
                  >
                    <span className="text-[10px] text-upWhite font-semibold truncate leading-tight">
                      {post.title}
                    </span>
                    <div className="flex justify-between items-center text-[8px] text-upGray mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2 h-2 text-upPink" />
                        {post.time}
                      </span>
                      <span className="scale-[0.8] origin-right">
                        <StatusBadge status={post.status} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
