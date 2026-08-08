"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Phone,
  Send,
  CheckCheck,
  Clock,
  Trash2
} from "lucide-react";

interface WhatsappLogItem {
  id: string;
  phone: string;
  recipientName: string;
  messageType: "Notificação de Post" | "Alerta de Token" | "Lembrete de Cobrança" | "Relatório Semanal";
  content: string;
  status: "Entregue" | "Enviado" | "Falha no Envio" | "Pendente";
  sentAt: string;
  instanceName: string;
}

const INITIAL_LOGS: WhatsappLogItem[] = [
  {
    id: "log_101",
    phone: "+55 (11) 98765-4321",
    recipientName: "Carlos Silva",
    messageType: "Notificação de Post",
    content: "🚀 Olá Carlos! Seu post '@carlos.midia' agendado para às 18h foi publicado com sucesso no Instagram.",
    status: "Entregue",
    sentAt: "Há 10 mins",
    instanceName: "Evolution_Bot_01",
  },
  {
    id: "log_102",
    phone: "+55 (21) 99888-7766",
    recipientName: "Lucas Rocha",
    messageType: "Alerta de Token",
    content: "⚠️ ATENÇÃO: Seu token do Meta Graph no perfil @burgershop expirou. Acesse o painel para reconectar.",
    status: "Falha no Envio",
    sentAt: "Há 42 mins",
    instanceName: "Evolution_Bot_01",
  },
  {
    id: "log_103",
    phone: "+55 (31) 97777-6655",
    recipientName: "Mariana Costa",
    messageType: "Relatório Semanal",
    content: "📊 Seu relatório semanal de métricas do @modafashion já está disponível! Alcance subiu +24%.",
    status: "Entregue",
    sentAt: "Há 2 horas",
    instanceName: "Evolution_Bot_02",
  },
  {
    id: "log_104",
    phone: "+55 (41) 99111-2233",
    recipientName: "Ana Beatriz",
    messageType: "Lembrete de Cobrança",
    content: "💳 Lembrete UP Ideias: Sua assinatura do Plano Pro vence em 3 dias. Acesse a fatura no painel.",
    status: "Enviado",
    sentAt: "Há 4 horas",
    instanceName: "Evolution_Bot_01",
  },
];

export default function AdminWhatsappLogsPage() {
  const [logs, setLogs] = useState<WhatsappLogItem[]>(INITIAL_LOGS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  
  // Modal State para Disparo Manual
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    phone: string;
    recipientName: string;
    messageType: "Notificação de Post" | "Alerta de Token" | "Lembrete de Cobrança" | "Relatório Semanal";
    content: string;
  }>({
    phone: "",
    recipientName: "",
    messageType: "Notificação de Post",
    content: "",
  });

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.phone.toLowerCase().includes(search.toLowerCase()) ||
      log.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      log.content.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "todos" || log.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleOpenSendModal = () => {
    setFormData({
      phone: "",
      recipientName: "",
      messageType: "Notificação de Post",
      content: "Olá! Notificação enviada pelo painel administrativo UP Ideias.",
    });
    setIsModalOpen(true);
  };

  const handleResendLog = (id: string) => {
    setLogs((prev) =>
      prev.map((log) =>
        log.id === id ? { ...log, status: "Entregue", sentAt: "Agora mesmo" } : log
      )
    );
  };

  const handleDeleteLog = (id: string) => {
    if (confirm("Deseja remover este registro de log de WhatsApp?")) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const handleSendWhatsapp = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: WhatsappLogItem = {
      id: `log_${Date.now()}`,
      phone: formData.phone,
      recipientName: formData.recipientName,
      messageType: formData.messageType,
      content: formData.content,
      status: "Entregue",
      sentAt: "Agora mesmo",
      instanceName: "Evolution_Bot_01",
    };
    setLogs((prev) => [newLog, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-upPink" />
            Logs de Automação de WhatsApp
          </h1>
          <p className="text-sm text-upGray mt-1">
            Monitore o disparo de mensagens automáticas de notificações, cobranças e relatórios via API de WhatsApp.
          </p>
        </div>

        <button
          onClick={handleOpenSendModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-upPink hover:bg-upPinkDark text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(255,83,104,0.3)] hover:scale-[1.02] shrink-0"
        >
          <Send className="w-4 h-4" />
          Disparo Manual por WhatsApp
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Total Disparados</p>
            <p className="text-2xl font-black text-white mt-1">{logs.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-upPink/10 text-upPink flex items-center justify-center border border-upPink/20">
            <Send className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Entregues com Sucesso</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {logs.filter((l) => l.status === "Entregue" || l.status === "Enviado").length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Falhas no Disparo</p>
            <p className="text-2xl font-black text-rose-400 mt-1">
              {logs.filter((l) => l.status === "Falha no Envio").length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-upCard/40 border border-upBorder/60 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-upPink absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por telefone, destinatário ou mensagem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-upDark border border-upBorder/80 rounded-xl text-white placeholder-upGray text-xs focus:outline-none focus:border-upPink transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-upGray font-semibold shrink-0">Filtrar Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-upDark border border-upBorder/80 rounded-xl text-xs text-white focus:outline-none focus:border-upPink transition-all"
          >
            <option value="todos">Todos os Status</option>
            <option value="entregue">Entregues</option>
            <option value="enviado">Enviados</option>
            <option value="falha no envio">Falhas</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-upCard/60 border border-upBorder/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-upLightGray">
            <thead className="bg-upDark/90 border-b border-upBorder/60 text-upGray uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Destinatário & WhatsApp</th>
                <th className="px-6 py-4">Tipo de Mensagem</th>
                <th className="px-6 py-4">Conteúdo</th>
                <th className="px-6 py-4">Instância API</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Horário</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-upBorder/40">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-upGray">
                    Nenhum log de WhatsApp encontrado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-upCard/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-upPink transition-colors">{log.recipientName}</span>
                        <span className="text-[11px] font-mono text-upPink">{log.phone}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-white">
                      {log.messageType}
                    </td>

                    <td className="px-6 py-4 max-w-xs text-upLightGray truncate" title={log.content}>
                      {log.content}
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px] text-upGray">
                      {log.instanceName}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.status === "Entregue" || log.status === "Enviado"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          log.status === "Entregue" || log.status === "Enviado" ? "bg-emerald-400" : "bg-rose-400"
                        }`} />
                        {log.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-upGray text-[11px]">
                      {log.sentAt}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleResendLog(log.id)}
                          className="p-1.5 rounded-lg bg-upDark hover:bg-emerald-500/20 hover:text-emerald-400 border border-upBorder/60 transition-all"
                          title="Reenviar Mensagem"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1.5 rounded-lg bg-upDark hover:bg-rose-500/20 hover:text-rose-400 border border-upBorder/60 transition-all"
                          title="Excluir Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Disparo Manual WhatsApp */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-upBlack/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-upDark border border-upBorder/80 rounded-2xl shadow-[0_0_50px_rgba(255,83,104,0.15)] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-upBorder/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-upPink" />
                Disparo Manual por WhatsApp API
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-upGray hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendWhatsapp} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Nome do Destinatário</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Silva"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Número do WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="+55 (11) 99999-8888"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-upGray">Tipo de Notificação</label>
                <select
                  value={formData.messageType}
                  onChange={(e) => setFormData({ ...formData, messageType: e.target.value as any })}
                  className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                >
                  <option value="Notificação de Post">Notificação de Post Agendado</option>
                  <option value="Alerta de Token">Alerta de Token Expirado</option>
                  <option value="Lembrete de Cobrança">Lembrete de Fatura / Cobrança</option>
                  <option value="Relatório Semanal">Relatório Semanal de IA</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-upGray">Conteúdo da Mensagem</label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="px-4 py-3 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-upBorder/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-upBorder text-upGray hover:text-white text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-upPink hover:bg-upPinkDark text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(255,83,104,0.3)] flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar via API
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
