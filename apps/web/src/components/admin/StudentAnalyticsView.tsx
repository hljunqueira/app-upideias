"use client";

import { StudentWatchLog } from "@/lib/coursesStore";
import { Users, Eye, CheckCircle2, Clock, Award, PlayCircle } from "lucide-react";

interface StudentAnalyticsViewProps {
  logs: StudentWatchLog[];
}

export function StudentAnalyticsView({ logs }: StudentAnalyticsViewProps) {
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
              <p className="text-xs text-upGray uppercase tracking-wider font-semibold">Alunos Ativos</p>
              <h3 className="text-xl font-bold text-white">1.248</h3>
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
              <h3 className="text-xl font-bold text-white">78.4%</h3>
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
              <h3 className="text-xl font-bold text-white">45.800 XP</h3>
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
        </div>
      </div>
    </div>
  );
}
