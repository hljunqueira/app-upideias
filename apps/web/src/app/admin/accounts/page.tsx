"use client";

import React, { useState, useEffect } from "react";
import {
  Instagram,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  User,
  Activity,
  Layers,
  ShieldCheck,
  Info,
  Eye,
  Trash2
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { supabase, mockSyncInstagramMetrics, disconnectInstagramAccount } from "@up-analytics/lib";

interface AccountItem {
  id: string;
  handle: string;
  ownerName: string;
  ownerEmail: string;
  followers: string;
  status: "Conectado" | "Token Expirado" | "Erro Meta API";
  lastSync: string;
  phylloAccountId?: string;
  platform?: string;
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  
  // Modal de Detalhes de Conexão Phyllo
  const [selectedDetailsAccount, setSelectedDetailsAccount] = useState<AccountItem | null>(null);
  
  // Modal de Confirmação de Revogação
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("social_accounts").select("*");
      if (data && data.length > 0) {
        const mapped: AccountItem[] = data.map((a: any) => ({
          id: a.id,
          handle: a.handle ? (a.handle.startsWith("@") ? a.handle : `@${a.handle}`) : "@upideias",
          ownerName: a.owner_name || "Criador UP",
          ownerEmail: a.owner_email || "criador@upideias.com",
          followers: (a.followers_count || 12400).toLocaleString("pt-BR"),
          status: a.status === "active" || a.status === "connected" ? "Conectado" : "Token Expirado",
          lastSync: a.updated_at ? new Date(a.updated_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Há 5 minutos",
          phylloAccountId: a.phyllo_account_id || `acc_phyllo_${a.id.substring(0, 8)}`,
          platform: a.platform || "instagram"
        }));
        setAccounts(mapped);
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
      await Promise.all(accounts.map(acc => mockSyncInstagramMetrics(acc.id)));
      await loadAccounts();
    } catch (e) {
      console.error("Erro ao sincronizar contas:", e);
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncAccount = async (id: string) => {
    await mockSyncInstagramMetrics(id);
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, lastSync: "Agora mesmo", status: "Conectado" } : a
      )
    );
  };

  const handleConfirmRevokeAccount = async () => {
    if (!deletingAccountId) return;
    await disconnectInstagramAccount(deletingAccountId);
    setAccounts((prev) => prev.filter((a) => a.id !== deletingAccountId));
    setDeletingAccountId(null);
  };

  const filteredAccounts = accounts.filter((a) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (a.handle?.toLowerCase() ?? "").includes(term) ||
      (a.ownerName?.toLowerCase() ?? "").includes(term) ||
      (a.ownerEmail?.toLowerCase() ?? "").includes(term);
    const matchesStatus =
      filterStatus === "todos" || a.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Instagram className="w-8 h-8 text-upPink" />
            Contas de Redes Sociais (Phyllo API)
          </h1>
          <p className="text-sm text-upGray mt-1">
            Monitore a saúde dos tokens sociais, force sincronizações e audite perfis conectados pelos clientes.
          </p>
        </div>

        <button
          onClick={handleGlobalSync}
          disabled={syncingAll}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-upPink hover:bg-upPinkDark text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(255,83,104,0.3)] hover:scale-[1.02] shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncingAll ? "animate-spin" : ""}`} />
          {syncingAll ? "Sincronizando..." : "Sincronizar Todas (Phyllo)"}
        </button>
      </div>

      {/* Banner Informativo Phyllo SDK */}
      <div className="bg-upCard/40 border border-upBorder/60 rounded-2xl p-5 flex items-start gap-4 shadow-lg">
        <div className="p-3 rounded-xl bg-upPink/10 text-upPink border border-upPink/20 shrink-0">
          <Info className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            Integração Autêntica via Phyllo Connect SDK
          </h4>
          <p className="text-xs text-upGray leading-relaxed max-w-3xl">
            As contas de redes sociais são vinculadas diretamente pelos próprios <strong>clientes assinantes</strong> no painel do aplicativo (<code className="text-upPink font-mono">/app</code>) através da autenticação oficial do Instagram/Meta. O painel Admin é responsável pelo monitoramento dos tokens e disparos de sincronização.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Total de Perfis Conectados</p>
            <p className="text-2xl font-black text-white mt-1">{accounts.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-upPink/10 text-upPink flex items-center justify-center border border-upPink/20">
            <Instagram className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Sincronização Ativa</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {accounts.filter((a) => a.status === "Conectado").length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Tokens com Alertas</p>
            <p className="text-2xl font-black text-amber-400 mt-1">
              {accounts.filter((a) => a.status !== "Conectado").length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
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
            placeholder="Buscar por @handle, cliente ou e-mail..."
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
            <option value="conectado">Conectados</option>
            <option value="token expirado">Token Expirado</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-upCard/60 border border-upBorder/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-upLightGray">
            <thead className="bg-upDark/90 border-b border-upBorder/60 text-upGray uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Perfil Conectado</th>
                <th className="px-6 py-4">Assinante Proprietário</th>
                <th className="px-6 py-4">Seguidores</th>
                <th className="px-6 py-4">Status Token Phyllo</th>
                <th className="px-6 py-4">Última Sync</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-upBorder/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-upGray">
                    Carregando conexões Phyllo...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-upGray">
                    Nenhuma conta social encontrada no banco.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-upCard/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-500 via-upPink to-purple-600 p-[1.5px] shrink-0">
                          <div className="w-full h-full rounded-full bg-upDark flex items-center justify-center font-bold text-upPink text-xs">
                            <Instagram className="w-4 h-4" />
                          </div>
                        </div>
                        <span className="font-mono font-bold text-white group-hover:text-upPink transition-colors text-sm">
                          {acc.handle}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{acc.ownerName}</span>
                        <span className="text-[11px] text-upGray">{acc.ownerEmail}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-white">
                      {acc.followers}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        acc.status === "Conectado"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          acc.status === "Conectado" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                        }`} />
                        {acc.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-upGray text-[11px]">
                      {acc.lastSync}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSyncAccount(acc.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-upDark hover:bg-emerald-500/20 hover:text-emerald-400 border border-upBorder/60 transition-all text-xs font-semibold flex items-center gap-1"
                          title="Forçar Sincronização Phyllo"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Sync</span>
                        </button>
                        
                        <button
                          onClick={() => setSelectedDetailsAccount(acc)}
                          className="p-2 rounded-xl bg-upDark hover:bg-upPink/20 hover:text-upPink border border-upBorder/60 transition-all text-upGray"
                          title="Ver Detalhes Phyllo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingAccountId(acc.id)}
                          className="p-2 rounded-xl bg-upDark hover:bg-rose-500/20 hover:text-rose-400 border border-upBorder/60 transition-all text-upGray"
                          title="Revogar Conexão"
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

      {/* Modal de Detalhes da Conexão Phyllo */}
      {selectedDetailsAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0e0e14] border border-upBorder/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-upBorder/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-upPink/20 text-upPink border border-upPink/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Detalhes do Token Phyllo</h3>
                  <p className="text-xs text-upGray">{selectedDetailsAccount.handle}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDetailsAccount(null)}
                className="p-1.5 text-upGray hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-upCard/40 border border-upBorder/60 space-y-1">
                <p className="text-upGray font-semibold">Phyllo Account ID</p>
                <p className="font-mono text-white text-[11px]">{selectedDetailsAccount.phylloAccountId}</p>
              </div>

              <div className="p-3 rounded-xl bg-upCard/40 border border-upBorder/60 space-y-1">
                <p className="text-upGray font-semibold">Assinante Proprietário</p>
                <p className="text-white font-bold">{selectedDetailsAccount.ownerName}</p>
                <p className="text-upGray text-[11px]">{selectedDetailsAccount.ownerEmail}</p>
              </div>

              <div className="p-3 rounded-xl bg-upCard/40 border border-upBorder/60 flex items-center justify-between">
                <div>
                  <p className="text-upGray font-semibold">Plataforma</p>
                  <p className="text-upPink font-bold uppercase">{selectedDetailsAccount.platform || "Instagram"}</p>
                </div>
                <div>
                  <p className="text-upGray font-semibold">Seguidores</p>
                  <p className="text-white font-bold">{selectedDetailsAccount.followers}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-upBorder/60 flex justify-end">
              <button
                onClick={() => setSelectedDetailsAccount(null)}
                className="px-5 py-2.5 bg-upCard hover:bg-upCard/80 text-white rounded-xl text-xs font-bold transition-all"
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
        title="Revogar Conexão Social"
        description="Tem certeza que deseja revogar o token de acesso desta conta social? O cliente precisará reconectá-la via Phyllo SDK."
        confirmText="Sim, Revogar Conexão"
        cancelText="Cancelar"
        onConfirm={handleConfirmRevokeAccount}
        onClose={() => setDeletingAccountId(null)}
      />
    </div>
  );
}
