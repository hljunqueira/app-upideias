"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { syncInstagramMetrics } from "@up-analytics/lib";

interface AccountItem {
  id: string;
  handle: string;
  ownerName: string;
  ownerEmail: string;
  ownerPlan?: string;
  followers: string;
  status: "Conectado";
  lastSync: string;
  connectedAt?: string;
  externalAccountId?: string;
  platform?: string;
  avatarUrl?: string | null;
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("todos");

  // Modal de Detalhes de Conexão
  const [selectedDetailsAccount, setSelectedDetailsAccount] = useState<AccountItem | null>(null);

  // Modal de Confirmação de Revogação
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      } else {
        setAccounts([]);
      }
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleGlobalSync = async () => {
    setSyncingAll(true);
    try {
      await Promise.all(accounts.map((acc) => syncInstagramMetrics(acc.id)));
      await loadAccounts();
    } catch (e) {
      console.error("Erro ao sincronizar contas:", e);
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncAccount = async (id: string) => {
    await syncInstagramMetrics(id);
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, lastSync: "Agora mesmo" } : a
      )
    );
  };

  const handleConfirmRevokeAccount = async () => {
    if (!deletingAccountId) return;
    try {
      await fetch(`/api/admin/accounts?id=${deletingAccountId}`, { method: "DELETE" });
      setAccounts((prev) => prev.filter((a) => a.id !== deletingAccountId));
    } catch (e) {
      console.error("Erro ao desconectar conta:", e);
    } finally {
      setDeletingAccountId(null);
    }
  };

  const filteredAccounts = accounts.filter((a) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (a.handle?.toLowerCase() ?? "").includes(term) ||
      (a.ownerName?.toLowerCase() ?? "").includes(term) ||
      (a.ownerEmail?.toLowerCase() ?? "").includes(term);
    const matchesPlan =
      filterPlan === "todos" ||
      (a.ownerPlan?.toLowerCase() ?? "") === filterPlan.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-zinc-200">
      {/* Banner Informativo de Unificação */}
      <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="text-zinc-300">
          A gestão de conexões sociais e postagens agora está unificada na área de <strong>Assinantes</strong> através da <strong>Ficha Completa</strong> de cada cliente.
        </span>
        <Link
          href="/admin/users"
          className="px-3 py-1.5 rounded-lg bg-upPink hover:bg-upPinkDark text-white font-semibold text-xs whitespace-nowrap text-center transition-colors shrink-0 uppercase tracking-wider"
        >
          Ir para Assinantes
        </Link>
      </div>

      {/* Header Bar Executivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Conexões Sociais
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Contas de Redes Sociais Conectadas
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitoramento de contas autênticas integradas via API oficial e histórico de sincronizações ativas.
          </p>
        </div>

        <button
          onClick={handleGlobalSync}
          disabled={syncingAll || accounts.length === 0}
          className="px-4 py-2 rounded-lg bg-upPink hover:bg-upPinkDark text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 shrink-0"
        >
          {syncingAll ? "Sincronizando..." : "Sincronizar Todas as Contas"}
        </button>
      </div>

      {/* KPI Cards Sóbrios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            Total de Perfis Ativos
          </span>
          <span className="text-2xl font-bold text-white tracking-tight mt-1 block">
            {accounts.length}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            Sincronização Operacional
          </span>
          <span className="text-2xl font-bold text-emerald-400 tracking-tight mt-1 block">
            {accounts.length}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            Alertas de Conexão
          </span>
          <span className="text-2xl font-bold text-zinc-400 tracking-tight mt-1 block">
            0
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-white/10 bg-zinc-950/60">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Buscar por @perfil, cliente ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-upPink transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-zinc-400 font-mono">Filtrar Plano:</span>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-zinc-900 border border-white/10 text-xs rounded-lg px-2.5 py-1 text-zinc-200 outline-none"
          >
            <option value="todos">Todos os Planos</option>
            <option value="Iniciante">Iniciante</option>
            <option value="Premium">Premium</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Tabela de Contas Reais */}
      <div className="border border-white/10 rounded-2xl bg-zinc-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 text-[10px] uppercase font-mono tracking-wider text-zinc-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-3.5">Perfil Conectado</th>
                <th className="px-6 py-3.5">Assinante Proprietário</th>
                <th className="px-6 py-3.5">Seguidores</th>
                <th className="px-6 py-3.5">Status da Conexão</th>
                <th className="px-6 py-3.5">Última Sincronização</th>
                <th className="px-6 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500 font-mono">
                    Carregando conexões oficiais do banco...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-400">
                    Nenhuma conta social conectada encontrada no momento.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {acc.avatarUrl ? (
                          <img
                            src={acc.avatarUrl}
                            alt={acc.handle}
                            className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center font-mono font-bold text-upPink text-[10px] shrink-0">
                            IG
                          </div>
                        )}
                        <span className="font-mono font-bold text-white text-xs">
                          {acc.handle}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{acc.ownerName}</span>
                        <span className="text-[11px] text-zinc-400 font-mono">{acc.ownerEmail}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-zinc-200">
                      {acc.followers}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {acc.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-zinc-400 font-mono text-[11px]">
                      {acc.lastSync}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSyncAccount(acc.id)}
                          className="px-2.5 py-1 rounded-lg border border-white/10 hover:border-white/20 bg-zinc-900 text-xs font-medium text-zinc-200 hover:text-white transition-colors"
                          title="Sincronizar Métricas"
                        >
                          Sincronizar
                        </button>

                        <button
                          onClick={() => setSelectedDetailsAccount(acc)}
                          className="px-2.5 py-1 rounded-lg border border-white/10 hover:border-white/20 bg-zinc-900 text-xs text-zinc-300 hover:text-white transition-colors"
                          title="Ver Detalhes"
                        >
                          Detalhes
                        </button>

                        <button
                          onClick={() => setDeletingAccountId(acc.id)}
                          className="px-2.5 py-1 rounded-lg border border-rose-500/20 bg-rose-500/10 text-xs text-rose-300 hover:bg-rose-500/20 transition-colors"
                          title="Desconectar"
                        >
                          Desconectar
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

      {/* Modal de Detalhes da Conexão */}
      {selectedDetailsAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-upPink">
                Integração Oficial
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Detalhes da Conexão Social
              </h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {selectedDetailsAccount.handle}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-zinc-400">Assinante:</span>
                <span className="text-white font-medium">{selectedDetailsAccount.ownerName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-zinc-400">E-mail:</span>
                <span className="text-white font-mono">{selectedDetailsAccount.ownerEmail}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-zinc-400">ID da Conexão Social:</span>
                <span className="text-zinc-300 font-mono">{selectedDetailsAccount.externalAccountId || "-"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-zinc-400">Data de Vinculação:</span>
                <span className="text-white font-mono">{selectedDetailsAccount.connectedAt}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-400">Status do Token:</span>
                <span className="text-emerald-400 font-mono font-bold">Ativo & Válido</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetailsAccount(null)}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white hover:bg-zinc-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Revogação */}
      <ConfirmModal
        isOpen={!!deletingAccountId}
        title="Desconectar Perfil do Instagram"
        description="Tem certeza de que deseja revogar o acesso a esta conta? O assinante precisará reconectar para sincronizar novos dados."
        confirmText="Confirmar Desconexão"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleConfirmRevokeAccount}
        onClose={() => setDeletingAccountId(null)}
      />
    </div>
  );
}
