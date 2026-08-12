"use client";

import { useEffect, useState } from "react";
import { StudentWatchLog } from "@/lib/coursesStore";
import { Users, Eye, CheckCircle2, Award, PlayCircle } from "lucide-react";
import { supabase } from "@up-analytics/lib";

interface StudentAnalyticsViewProps {
  logs: StudentWatchLog[];
  totalStudents?: number;
}

export function StudentAnalyticsView({ logs, totalStudents = 0 }: StudentAnalyticsViewProps) {
  const [activeStudentsCount, setActiveStudentsCount] = useState<number>(totalStudents);
  const [totalXpDistributed, setTotalXpDistributed] = useState<number>(0);
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
        setActiveStudentsCount(count || totalStudents || 0);

        const { data: progressData } = await supabase
          .from("user_course_progress")
          .select("progress_percent, total_xp_earned");

        if (progressData && progressData.length > 0) {
          const sumXp = progressData.reduce((acc, curr) => acc + (curr.total_xp_earned || 0), 0);
          const sumProgress = progressData.reduce((acc, curr) => acc + (curr.progress_percent || 0), 0);
          setTotalXpDistributed(sumXp);
          setCompletionRate(Math.round(sumProgress / progressData.length));
        } else {
          setTotalXpDistributed(0);
          setCompletionRate(0);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [totalStudents]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Resumo de Analytics do Aluno */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-upCard/40 border border-upBorder/60 rounded-3xl p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-upPink/10 text-upPink rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-upGray uppercase tracking-wider font-semibold">Alunos Cadastrados</p>
              <h3 className="text-xl font-bold text-white">{activeStudentsCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-upCard/40 border border-upBorder/60 rounded-3xl p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-upGray uppercase tracking-wider font-semibold">Taxa de Conclusão Média</p>
              <h3 className="text-xl font-bold text-white">{completionRate}%</h3>
            </div>
          </div>
        </div>

        <div className="bg-upCard/40 border border-upBorder/60 rounded-3xl p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-upGray uppercase tracking-wider font-semibold">XP Distribuído</p>
              <h3 className="text-xl font-bold text-white">{totalXpDistributed.toLocaleString("pt-BR")} XP</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Histórico "Quem Assistiu" */}
      <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-upPink" />
            <h3 className="text-sm font-bold text-white">Últimas Visualizações de Aulas pelos Alunos</h3>
          </div>
          <span className="text-xs text-upGray">Atualizado em tempo real</span>
        </div>

        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-upGray">
              <p className="text-sm font-semibold">Nenhuma visualização registrada ainda.</p>
              <p className="text-xs text-upGray/70 mt-1">
                Conforme os alunos assistirem às aulas no UP Creator, o histórico em tempo real será exibido aqui.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-upDark/60 border-b border-upBorder/40 text-upGray uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-3.5 px-6">Aluno</th>
                  <th className="py-3.5 px-6">Curso</th>
                  <th className="py-3.5 px-6">Aula Assistida</th>
                  <th className="py-3.5 px-6 text-center">Progresso</th>
                  <th className="py-3.5 px-6 text-right">Horário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-upBorder/30">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-upDark/40 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={log.avatarUrl}
                          alt={log.studentName}
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{log.studentName}</p>
                          <p className="text-[10px] text-upGray">{log.studentEmail}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold text-white">{log.courseTitle}</td>

                    <td className="py-4 px-6 text-upGray flex items-center gap-1.5 pt-5">
                      <PlayCircle className="w-3.5 h-3.5 text-upPink shrink-0" />
                      <span>{log.lessonTitle}</span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full rounded-full"
                            style={{ width: `${log.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400">
                          {log.progressPercent}%
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right text-upGray font-medium">{log.watchedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
