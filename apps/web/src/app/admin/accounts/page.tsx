"use client";

import React, { useState } from "react";
import {
  Instagram,
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  User,
  Activity,
  Layers
} from "lucide-react";

interface AccountItem {
  id: string;
  handle: string;
  ownerName: string;
  ownerEmail: string;
  followers: string;
  status: "Conectado" | "Token Expirado" | "Erro Meta API";
  lastSync: string;
}

const INITIAL_ACCOUNTS: AccountItem[] = [
  { id: "1", handle: "@carlos.midia", ownerName: "Carlos Silva", ownerEmail: "carlos@midia.com", followers: "14.2k", status: "Conectado", lastSync: "Há 5 mins" },
  { id: "2", handle: "@modafashion", ownerName: "Mariana Costa", ownerEmail: "mariana@fashion.com", followers: "89.5k", status: "Conectado", lastSync: "Há 12 mins" },
  { id: "3", handle: "@burgershop", ownerName: "Lucas Rocha", ownerEmail: "lucas@burger.com", followers: "32.1k", status: "Token Expirado", lastSync: "Há 2 dias" },
  { id: "4", handle: "@fitnesscorp", ownerName: "Ana Beatriz", ownerEmail: "ana@fit.com", followers: "45.8k", status: "Conectado", lastSync: "Há 1 hora" },
  { id: "5", handle: "@beautyclin", ownerName: "Fernanda Lima", ownerEmail: "nanda@beauty.com", followers: "19.3k", status: "Erro Meta API", lastSync: "Há 3 horas" },
];

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AccountItem[]>(INITIAL_ACCOUNTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    handle: string;
    ownerName: string;
    ownerEmail: string;
    followers: string;
    status: "Conectado" | "Token Expirado" | "Erro Meta API";
  }>({
    handle: "",
    ownerName: "",
    ownerEmail: "",
    followers: "",
    status: "Conectado",
  });

  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      a.handle.toLowerCase().includes(search.toLowerCase()) ||
      a.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      a.ownerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "todos" || a.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setFormData({
      handle: "",
      ownerName: "",
      ownerEmail: "",
      followers: "0",
      status: "Conectado",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (account: AccountItem) => {
    setEditingAccount(account);
    setFormData({
      handle: account.handle,
      ownerName: account.ownerName,
      ownerEmail: account.ownerEmail,
      followers: account.followers,
      status: account.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm("Deseja realmente remover esta conta do Instagram?")) {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSyncAccount = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, lastSync: "Agora mesmo", status: "Conectado" } : a
      )
    );
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      // Update
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === editingAccount.id
            ? { ...a, ...formData }
            : a
        )
      );
    } else {
      // Create
      const newAccount: AccountItem = {
        id: String(Date.now()),
        ...formData,
        lastSync: "Agora mesmo",
      };
      setAccounts((prev) => [newAccount, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Instagram className="w-8 h-8 text-upPink" />
            Contas do Instagram Conectadas
          </h1>
          <p className="text-sm text-upGray mt-1">
            Monitore o status das APIs do Meta Graph, force sincronização manual e gerencie perfis vinculados.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-upPink hover:bg-upPinkDark text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(255,83,104,0.3)] hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Vincular Conta
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Total de Perfis</p>
            <p className="text-2xl font-black text-white mt-1">{accounts.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-upPink/10 text-upPink flex items-center justify-center border border-upPink/20">
            <Instagram className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Sincronização OK</p>
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
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Tokens Expirados/Erro</p>
            <p className="text-2xl font-black text-rose-400 mt-1">
              {accounts.filter((a) => a.status !== "Conectado").length}
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
            placeholder="Buscar por @handle, proprietário ou e-mail..."
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
            <option value="erro meta api">Erro Meta API</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-upCard/60 border border-upBorder/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-upLightGray">
            <thead className="bg-upDark/90 border-b border-upBorder/60 text-upGray uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Perfil Instagram</th>
                <th className="px-6 py-4">Proprietário</th>
                <th className="px-6 py-4">Seguidores</th>
                <th className="px-6 py-4">Status Meta API</th>
                <th className="px-6 py-4">Última Sincronização</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-upBorder/40">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-upGray">
                    Nenhuma conta do Instagram encontrada.
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
                          : acc.status === "Token Expirado"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          acc.status === "Conectado" ? "bg-emerald-400 animate-pulse" : acc.status === "Token Expirado" ? "bg-amber-400" : "bg-rose-400"
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
                          className="p-1.5 rounded-lg bg-upDark hover:bg-emerald-500/20 hover:text-emerald-400 border border-upBorder/60 transition-all"
                          title="Sincronizar Agora"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(acc)}
                          className="p-1.5 rounded-lg bg-upDark hover:bg-upPink/20 hover:text-upPink border border-upBorder/60 transition-all"
                          title="Editar Perfil"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="p-1.5 rounded-lg bg-upDark hover:bg-rose-500/20 hover:text-rose-400 border border-upBorder/60 transition-all"
                          title="Remover Perfil"
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

      {/* Modal CRUD (Vincular / Editar Instagram) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-upBlack/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-upDark border border-upBorder/80 rounded-2xl shadow-[0_0_50px_rgba(255,83,104,0.15)] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-upBorder/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Instagram className="w-5 h-5 text-upPink" />
                {editingAccount ? "Editar Perfil do Instagram" : "Vincular Nova Conta Instagram"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-upGray hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-upGray">Nome do Usuário/Proprietário</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Silva"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-upGray">E-mail do Proprietário</label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@dominio.com"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Handle (@instagram)</label>
                  <input
                    type="text"
                    required
                    placeholder="@seuperfil"
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                    className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Seguidores Estimados</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 15.4k"
                    value={formData.followers}
                    onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                    className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-upGray">Status da Integração Graph API</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                >
                  <option value="Conectado">Conectado (Token Válido)</option>
                  <option value="Token Expirado">Token Expirado (Renovação Necessária)</option>
                  <option value="Erro Meta API">Erro Meta API (Verificar Permissões)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-upBorder/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-upBorder text-upGray hover:text-white text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-upPink hover:bg-upPinkDark text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(255,83,104,0.3)]"
                >
                  {editingAccount ? "Salvar Alterações" : "Vincular Perfil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
