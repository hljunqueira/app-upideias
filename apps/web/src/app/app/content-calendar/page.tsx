"use client";

import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus
} from "lucide-react";
import { StatusBadge } from "@up-analytics/ui";
import { CreatePostModal, ScheduledPost } from "@/components/calendar/CreatePostModal";

import { PlanGate } from "@/components/common/PlanGate";

export default function ContentCalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);

  // Posts agendados do calendário
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    { id: "p1", title: "Estratégia vs Postagem", type: "Carrossel", status: "published", time: "18:30", day: 3, monthYear: "Julho 2026", caption: "Comparativo entre estratégia e postagem aleatória." },
    { id: "p2", title: "3 Hacks de Social Media", type: "Reels", status: "published", time: "12:00", day: 4, monthYear: "Julho 2026", caption: "Hacks rápidos de retenção." },
    { id: "p3", title: "Funil de Conteúdo", type: "Reels", status: "pending", time: "15:00", day: 6, monthYear: "Julho 2026", caption: "Como criar um funil de atração no Reels." },
    { id: "p4", title: "Legendas que Convertem", type: "Imagem", status: "draft", time: "09:00", day: 10, monthYear: "Julho 2026", caption: "Modelos de CTA para direct." }
  ]);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  const currentMonthYearStr = `${currentMonthName} ${currentYear}`;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Gerar dias do mês atual
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Dom

  // Dias do mês anterior para completar a 1ª semana
  const prevMonthDays = new Date(year, month, 0).getDate();
  const leadingDays = Array.from({ length: firstDayOfWeek }, (_, i) => ({
    day: prevMonthDays - firstDayOfWeek + i + 1,
    isCurrentMonth: false
  }));

  // Dias do mês atual
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    isCurrentMonth: true
  }));

  // Combinar dias para o grid
  const allGridDays = [...leadingDays, ...monthDays];

  // Handlers para o Modal
  const handleOpenNewPostForDay = (day: number) => {
    setSelectedDay(day);
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleOpenEditPost = (e: React.MouseEvent, post: ScheduledPost) => {
    e.stopPropagation();
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleSavePost = (savedPost: ScheduledPost) => {
    const exists = scheduledPosts.some((p) => p.id === savedPost.id);
    if (exists) {
      setScheduledPosts(scheduledPosts.map((p) => (p.id === savedPost.id ? savedPost : p)));
    } else {
      setScheduledPosts([...scheduledPosts, savedPost]);
    }
  };

  const handleDeletePost = (postId: string) => {
    setScheduledPosts(scheduledPosts.filter((p) => p.id !== postId));
  };

  return (
    <PlanGate featureKey="contentCalendar" featureTitle="Calendário Editorial">
      <div className="flex flex-col gap-8 animate-fadeIn text-upLightGray">
      
      {/* Header com Titulo e Botão Novo Post */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-upPink" />
            Calendário Editorial
          </h1>
          <p className="text-sm text-upGray mt-1">
            Organize sua distribuição, clique no dia desejado para agendar e acompanhe as datas de postagem.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleOpenNewPostForDay(new Date().getDate())}
            className="px-4 py-2.5 bg-upPink hover:bg-upPink/90 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(255,83,104,0.3)] flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Post</span>
          </button>
        </div>
      </div>

      {/* Month Navigator Funcional (< e >) */}
      <div className="flex items-center justify-between bg-upCard border border-upBorder rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-base font-extrabold text-white">{currentMonthYearStr}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-upDark text-upLightGray hover:text-white rounded-xl border border-upBorder/60 transition-all cursor-pointer"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-upDark text-upLightGray hover:text-white rounded-xl border border-upBorder/60 transition-all cursor-pointer"
            title="Próximo Mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Interativo */}
      <div className="bg-upCard border border-upBorder rounded-2xl overflow-hidden shadow-2xl">
        {/* Days of Week */}
        <div className="grid grid-cols-7 border-b border-upBorder bg-upDark/60 text-center py-3 text-xs font-extrabold uppercase tracking-wider text-upGray">
          <div>Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div>Sáb</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-px bg-upBorder/40">
          {allGridDays.map((dayObj, index) => {
            const dayPosts = dayObj.isCurrentMonth
              ? scheduledPosts.filter((p) => p.day === dayObj.day && p.monthYear === currentMonthYearStr)
              : [];

            return (
              <div
                key={index}
                onClick={() => dayObj.isCurrentMonth && handleOpenNewPostForDay(dayObj.day)}
                className={`min-h-[120px] bg-[#0d0d14] hover:bg-[#12121c] p-3 flex flex-col justify-between relative transition group ${
                  dayObj.isCurrentMonth ? "cursor-pointer" : "opacity-25"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] opacity-0 group-hover:opacity-100 text-upPink font-bold transition">
                    + Criar
                  </span>
                  <span className="text-xs font-extrabold text-upGray group-hover:text-white transition">
                    {dayObj.day}
                  </span>
                </div>

                {/* Posts Agendados para o Dia */}
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[85px] mt-1">
                  {dayPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={(e) => handleOpenEditPost(e, post)}
                      className="p-2 rounded-xl bg-upDark border border-upBorder/80 hover:border-upPink/60 transition-all flex flex-col gap-1 shadow-md hover:scale-[1.02]"
                    >
                      <span className="text-[10px] text-white font-bold truncate leading-tight">
                        {post.title}
                      </span>
                      <div className="flex justify-between items-center text-[8px] text-upGray mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-upPink" />
                          {post.time}
                        </span>
                        <span className="scale-[0.85] origin-right font-extrabold">
                          <StatusBadge status={post.status} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Criar / Editar Post no Calendário */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePost}
        onDelete={handleDeletePost}
        selectedDay={selectedDay}
        currentMonthYear={currentMonthYearStr}
        initialPost={editingPost}
      />
    </div>
    </PlanGate>
  );
}
