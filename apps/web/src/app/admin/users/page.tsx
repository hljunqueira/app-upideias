"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Instagram,
  Mail,
  MoreVertical,
  X,
  UserCheck,
  UserX,
  CreditCard
} from "lucide-react";

import { AdminSuggestContentModal } from "@/components/admin/AdminSuggestContentModal";

interface UserItem {
  id: string;
  name: string;
  email: string;
  plan: "Iniciante" | "Pro" | "Agência";
  status: "Ativo" | "Suspenso" | "Pendente";
  instagramHandle: string;
  createdAt: string;
}

const INITIAL_USERS: UserItem[] = [
  { id: "1", name: "Carlos Silva", email: "carlos@midia.com", plan: "Pro", status: "Ativo", instagramHandle: "@carlos.midia", createdAt: "12/05/2026" },
  { id: "2", name: "Mariana Costa", email: "mariana@fashion.com", plan: "Agência", status: "Ativo", instagramHandle: "@modafashion", createdAt: "04/06/2026" },
  { id: "3", name: "Lucas Rocha", email: "lucas@burger.com", plan: "Iniciante", status: "Suspenso", instagramHandle: "@burgershop", createdAt: "20/06/2026" },
  { id: "4", name: "Ana Beatriz", email: "ana@fit.com", plan: "Pro", status: "Ativo", instagramHandle: "@fitnesscorp", createdAt: "01/07/2026" },
  { id: "5", name: "Fernanda Lima", email: "nanda@beauty.com", plan: "Pro", status: "Pendente", instagramHandle: "@beautyclin", createdAt: "05/08/2026" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("todos");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [suggestUser, setSuggestUser] = useState<UserItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    plan: "Iniciante" | "Pro" | "Agência";
    status: "Ativo" | "Suspenso" | "Pendente";
    instagramHandle: string;
  }>({
    name: "",
    email: "",
    plan: "Pro",
    status: "Ativo",
    instagramHandle: "",
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.instagramHandle.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = filterPlan === "todos" || u.plan.toLowerCase() === filterPlan.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      plan: "Pro",
      status: "Ativo",
      instagramHandle: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserItem) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      plan: user.plan,
      status: user.status,
      instagramHandle: user.instagramHandle,
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      // Update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, ...formData }
            : u
        )
      );
    } else {
      // Create
      const newUser: UserItem = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date().toLocaleDateString("pt-BR"),
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-upPink" />
            Gestão de Usuários
          </h1>
          <p className="text-sm text-upGray mt-1">
            Cadastre, edite permissões, altere planos e gerencie o status dos clientes da plataforma.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-upPink hover:bg-upPinkDark text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(255,83,104,0.3)] hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Total de Clientes</p>
            <p className="text-2xl font-black text-white mt-1">{users.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-upPink/10 text-upPink flex items-center justify-center border border-upPink/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Assinantes Ativos</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {users.filter((u) => u.status === "Ativo").length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Suspensos / Pendentes</p>
            <p className="text-2xl font-black text-upPink mt-1">
              {users.filter((u) => u.status !== "Ativo").length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-upPink/10 text-upPink flex items-center justify-center border border-upPink/20">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-upCard/40 border border-upBorder/60 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-upPink absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou @instagram..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-upDark border border-upBorder/80 rounded-xl text-white placeholder-upGray text-xs focus:outline-none focus:border-upPink transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-upGray font-semibold shrink-0">Filtrar Plano:</span>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-3 py-2 bg-upDark border border-upBorder/80 rounded-xl text-xs text-white focus:outline-none focus:border-upPink transition-all"
          >
            <option value="todos">Todos os Planos</option>
            <option value="iniciante">Iniciante</option>
            <option value="pro">Pro</option>
            <option value="agência">Agência</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-upCard/60 border border-upBorder/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-upLightGray">
            <thead className="bg-upDark/90 border-b border-upBorder/60 text-upGray uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Instagram</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Cadastro</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-upBorder/40">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-upGray">
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-upCard/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-upPink to-purple-600 p-[1.5px] shrink-0">
                          <div className="w-full h-full rounded-full bg-upDark flex items-center justify-center font-bold text-white text-xs">
                            {user.name[0]}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-upPink transition-colors">{user.name}</span>
                          <span className="text-[11px] text-upGray">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-upPink">
                      {user.instagramHandle}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        user.plan === "Agência"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : user.plan === "Pro"
                          ? "bg-upPink/10 text-upPink border border-upPink/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {user.plan}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        user.status === "Ativo"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : user.status === "Suspenso"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === "Ativo" ? "bg-emerald-400" : user.status === "Suspenso" ? "bg-rose-400" : "bg-amber-400"
                        }`} />
                        {user.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-upGray text-[11px]">
                      {user.createdAt}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSuggestUser(user)}
                          className="px-3 py-1.5 rounded-xl bg-upPink/20 text-upPink hover:bg-upPink/30 border border-upPink/40 text-xs font-bold transition-all flex items-center gap-1.5"
                          title="Ver Métricas e Sugerir Conteúdo"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                          <span>📊 Métricas & Sugerir</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 rounded-xl bg-upDark hover:bg-upPink/20 hover:text-upPink border border-upBorder/60 transition-all text-upGray"
                          title="Editar Usuário"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded-xl bg-upDark hover:bg-rose-500/20 hover:text-rose-400 border border-upBorder/60 transition-all text-upGray"
                          title="Excluir Usuário"
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

      {/* Modal de Sugestão de Conteúdo pelo Admin */}
      <AdminSuggestContentModal
        isOpen={Boolean(suggestUser)}
        onClose={() => setSuggestUser(null)}
        user={suggestUser}
      />

      {/* Modal CRUD (Criar / Editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-upBlack/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-upDark border border-upBorder/80 rounded-2xl shadow-[0_0_50px_rgba(255,83,104,0.15)] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-upBorder/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {editingUser ? <Edit2 className="w-5 h-5 text-upPink" /> : <Plus className="w-5 h-5 text-upPink" />}
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-upGray hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-upGray">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Souza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-upGray">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@dominio.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-upGray">Instagram (@handle)</label>
                <input
                  type="text"
                  required
                  placeholder="@seuperfil"
                  value={formData.instagramHandle}
                  onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                  className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Plano</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
                    className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  >
                    <option value="Iniciante">Iniciante (R$97)</option>
                    <option value="Pro">Pro (R$197)</option>
                    <option value="Agência">Agência (R$497)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Status da Conta</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Suspenso">Suspenso</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
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
                  {editingUser ? "Salvar Alterações" : "Criar Usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
