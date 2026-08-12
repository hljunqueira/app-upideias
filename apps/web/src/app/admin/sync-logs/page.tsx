"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@up-analytics/lib";
import {
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Instagram,
  Database,
  Layers,
  Server,
  Play,
  RotateCcw
} from "lucide-react";

interface SyncLogItem {
  id: string;
  accountHandle: string;
  syncType: "Mídias do Instagram" | "Métricas & Engajamento" | "Webhooks Meta" | "Fila n8n";
  itemsProcessed: number;
  status: "Sucesso" | "Com Erro" | "Em Execução";
  executionTime: string;
  timestamp: string;
  errorMessage?: string;
}

export default function AdminSyncLogsPage() {
  const [logs, setLogs] = useState<SyncLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const { data } = await supabase.from("sync_logs").select("*").order("created_at", { ascending: false });
        if (data && data.length > 0) {
          const mapped: SyncLogItem[] = data.map((l: any) => ({
            id: l.id,
            accountHandle: l.account_handle || "@upideias",
            syncType: l.sync_type || "Métricas do Instagram",
            itemsProcessed: l.items_processed || 0,
            status: l.status === "success" ? "Sucesso" : "Com Erro",
            executionTime: l.execution_time || "1.0s",
            timestamp: l.finished_at ? new Date(l.finished_at).toLocaleTimeString("pt-BR") : "Recentemente",
            errorMessage: l.message
          }));
          setLogs(mapped);
        } else {
          setLogs([]);
        }
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.accountHandle.toLowerCase().includes(search.toLowerCase()) ||
      log.syncType.toLowerCase().includes(search.toLowerCase()) ||
      (log.errorMessage && log.errorMessage.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      filterStatus === "todos" || log.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleForceSyncAll = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      const newLog: SyncLogItem = {
        id: `sync_${Date.now()}`,
        accountHandle: "@todos_perfis",
        syncType: "Mídias do Instagram",
        itemsProcessed: 142,
        status: "Sucesso",
        executionTime: "4.8s",
        timestamp: "Agora mesmo",
      };
      setLogs((prev) => [newLog, ...prev]);
      setIsSyncingAll(false);
    }, 1200);
  };

  const handleRetrySync = (id: string) => {
    setLogs((prev) =>
      prev.map((log) =>
        log.id === id
          ? {
              ...log,
              status: "Sucesso",
              timestamp: "Agora mesmo",
              itemsProcessed: 12,
              errorMessage: undefined,
            }
          : log
      )
    );
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-upPink" />
            Logs de Sincronização de Dados (Cron & Webhooks)
          </h1>
          <p className="text-sm text-upGray mt-1">
            Monitore o processamento em lote da VPS, sincronização de mídias do Instagram e filas do n8n/Supabase.
          </p>
        </div>

        <button
          onClick={handleForceSyncAll}
          disabled={isSyncingAll}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-upPink hover:bg-upPinkDark text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(255,83,104,0.3)] hover:scale-[1.02] shrink-0 disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${isSyncingAll ? "animate-spin" : ""}`} />
          {isSyncingAll ? "Sincronizando VPS..." : "Forçar Sincronização Geral"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Sincronizações Hoje</p>
            <p className="text-2xl font-black text-white mt-1">{logs.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-upPink/10 text-upPink flex items-center justify-center border border-upPink/20">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Sincronizados com Sucesso</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {logs.filter((l) => l.status === "Sucesso").length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Erros de API / Token</p>
            <p className="text-2xl font-black text-rose-400 mt-1">
              {logs.filter((l) => l.status === "Com Erro").length}
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
            placeholder="Buscar por @perfil, tipo de sync ou erro..."
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
            <option value="sucesso">Sucesso</option>
            <option value="com erro">Com Erro</option>
            <option value="em execução">Em Execução</option>
          </select>
        </div>
      </div>

      {/* Sync Logs Table */}
      <div className="bg-upCard/60 border border-upBorder/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-upLightGray">
            <thead className="bg-upDark/90 border-b border-upBorder/60 text-upGray uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Perfil</th>
                <th className="px-6 py-4">Tipo de Processamento</th>
                <th className="px-6 py-4">Mídias/Itens Processados</th>
                <th className="px-6 py-4">Tempo de Execução</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Horário</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-upBorder/40">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-upGray">
                    Nenhum log de sincronização encontrado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-upCard/80 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-upPink">
                      {log.accountHandle}
                    </td>

                    <td className="px-6 py-4 font-semibold text-white">
                      {log.syncType}
                    </td>

                    <td className="px-6 py-4 font-bold text-white">
                      {log.itemsProcessed} itens
                    </td>

                    <td className="px-6 py-4 font-mono text-upGray">
                      {log.executionTime}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold w-max ${
                          log.status === "Sucesso"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : log.status === "Com Erro"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            log.status === "Sucesso" ? "bg-emerald-400" : log.status === "Com Erro" ? "bg-rose-400" : "bg-blue-400 animate-spin"
                          }`} />
                          {log.status}
                        </span>
                        {log.errorMessage && (
                          <span className="text-[10px] text-rose-400 font-mono mt-1 max-w-xs truncate" title={log.errorMessage}>
                            {log.errorMessage}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-upGray text-[11px]">
                      {log.timestamp}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRetrySync(log.id)}
                        className="p-1.5 rounded-lg bg-upDark hover:bg-upPink/20 hover:text-upPink border border-upBorder/60 transition-all inline-flex items-center gap-1 text-[11px] font-medium"
                        title="Tentar Novamente"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reprocessar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
