"use client";

import {
  Users,
  Instagram,
  DollarSign,
  Cpu,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  PlusCircle,
  FileText
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {
  const stats = [
    { name: "Usuários Totais", value: "328", change: "+18 novos este mês", icon: Users },
    { name: "Perfis Conectados", value: "242", change: "+14 este mês", icon: Instagram },
    { name: "Faturamento Estimado", value: "R$ 18.420", change: "MRR Recorrente", icon: DollarSign },
    { name: "Créditos IA Consumidos", value: "18.432", change: "Gemini API", icon: Cpu },
  ];

  const chartData = [
    { name: "Jan", users: 110, revenue: 6200 },
    { name: "Fev", users: 150, revenue: 8400 },
    { name: "Mar", users: 200, revenue: 11200 },
    { name: "Abr", users: 240, revenue: 13500 },
    { name: "Mai", users: 290, revenue: 16100 },
    { name: "Jun", users: 328, revenue: 18420 },
  ];

  const recentLogs = [
    { id: 1, account: "@modafashion", status: "Sucesso", msg: "Sincronização de 12 mídias concluída", time: "Há 4 mins" },
    { id: 2, account: "@burgershop", status: "Falha", msg: "Meta Token expirado ou revogado pelo usuário", time: "Há 12 mins", alert: true },
    { id: 3, account: "@fitnesscorp", status: "Sucesso", msg: "Relatório de WhatsApp enviado", time: "Há 18 mins" },
    { id: 4, account: "@beautyclin", status: "Sucesso", msg: "Diagnóstico semanal de IA gerado", time: "Há 32 mins" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite">Administração UP Analytics</h1>
        <p className="text-sm text-upGray mt-1">Gerencie a plataforma, planos, usuários e monitore logs integrados da VPS.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.name} className="bg-upCard border border-upBorder rounded-2xl p-5 flex flex-col gap-2">
              <div className="flex justify-between items-center text-upGray">
                <span className="text-[10px] font-bold uppercase tracking-wider">{s.name}</span>
                <Icon className="w-4 h-4 text-upPink" />
              </div>
              <div className="text-2xl font-extrabold text-upWhite mt-2">{s.value}</div>
              <span className="text-[10px] text-upGray font-semibold">{s.change}</span>
            </div>
          );
        })}
      </div>

      {/* Platform Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-upCard border border-upBorder rounded-2xl p-6">
          <h3 className="text-sm font-bold text-upWhite mb-6 uppercase tracking-wider">Crescimento de Faturamento (MRR)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26262D" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#111116", borderColor: "#26262D" }} />
                <Bar dataKey="revenue" fill="#FF5368" radius={[4, 4, 0, 0]} name="Faturamento (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shortcuts for admin operations */}
        <div className="bg-upCard border border-upBorder rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-upWhite uppercase tracking-wider mb-6">Ações Rápidas de Admin</h3>
            <div className="flex flex-col gap-4">
              <Link href="/admin/plans" className="flex items-center justify-between p-3.5 bg-upDark border border-upBorder rounded-xl hover:border-upPink/30 transition-all text-xs font-semibold text-upWhite">
                <span>Configurar Preços e Planos</span>
                <PlusCircle className="w-4 h-4 text-upPink" />
              </Link>
              <Link href="/admin/up-creator" className="flex items-center justify-between p-3.5 bg-upDark border border-upBorder rounded-xl hover:border-upPink/30 transition-all text-xs font-semibold text-upWhite">
                <span>Criar Novo Curso UP Creator</span>
                <PlusCircle className="w-4 h-4 text-upPink" />
              </Link>
              <Link href="/admin/sync-logs" className="flex items-center justify-between p-3.5 bg-upDark border border-upBorder rounded-xl hover:border-upPink/30 transition-all text-xs font-semibold text-upWhite">
                <span>Monitorar Sincronização</span>
                <RefreshCw className="w-4 h-4 text-upPink" />
              </Link>
            </div>
          </div>
          <div className="mt-8 p-4 rounded-xl bg-upDark/50 border border-upBorder text-center">
            <span className="text-xs text-upGray block">Status dos Servidores VPS</span>
            <span className="text-xs text-green-400 font-bold mt-1 inline-flex items-center gap-1.5 justify-center">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Supabase, n8n & Evolution Online
            </span>
          </div>
        </div>
      </div>

      {/* Real-time system logs */}
      <div className="bg-upCard border border-upBorder rounded-2xl p-6">
        <h3 className="text-sm font-bold text-upWhite uppercase tracking-wider mb-6">Atividade Recente do Sistema</h3>
        <div className="flex flex-col gap-4">
          {recentLogs.map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-upDark border border-upBorder/60 rounded-xl gap-2">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${log.alert ? 'bg-upPink' : 'bg-green-400'}`}></span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-upWhite">{log.account}</span>
                  <span className="text-[11px] text-upGray mt-0.5">{log.msg}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right self-end sm:self-auto">
                <span className="text-[10px] text-upGray">{log.time}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  log.alert ? 'bg-upPink/10 text-upPink' : 'bg-green-500/10 text-green-400'
                }`}>
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
