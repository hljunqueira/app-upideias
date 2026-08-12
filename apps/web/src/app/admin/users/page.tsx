"use client";

import React, { useState, useEffect } from "react";
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
import { ConfirmModal } from "@/components/ui/ConfirmModal";

import { supabase } from "@up-analytics/lib";
import { getStoredPlans, PlanConfig } from "@/lib/plansStore";

interface UserItem {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: "Ativo" | "Suspenso" | "Pendente";
  instagramHandle: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [availablePlans, setAvailablePlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("todos");

  useEffect(() => {
    setAvailablePlans(getStoredPlans());
  }, []);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("profiles").select("*");
        if (data && data.length > 0) {
          const mapped: UserItem[] = data.map((p: any) => ({
            id: p.id,
            name: p.name || p.full_name || "Usuário UP",
            email: p.email || "Sem e-mail",
            plan: p.plan || "Pro",
            status: "Ativo",
            instagramHandle: p.instagram_handle || "@upideias",
            createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString("pt-BR") : "Hoje"
          }));
          setUsers(mapped);
        } else {
          setUsers([]);
        }
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [suggestUser, setSuggestUser] = useState<UserItem | null>(null);
  
  // Modal State para Confirmação de Exclusão
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    plan: string;
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

  const onRequestDeleteUser = (id: string) => {
    setDeletingUserId(id);
  };

  const handleConfirmDeleteUser = () => {
    if (!deletingUserId) return;
    setUsers((prev) => prev.filter((u) => u.id !== deletingUserId));
    setDeletingUserId(null);
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
                          onClick={() => onRequestDeleteUser(user.id)}
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

      {/* Modal de sugestão de conteúdo do admin */}
      {suggestUser && (
        <AdminSuggestContentModal
          isOpen={!!suggestUser}
          onClose={() => setSuggestUser(null)}
          user={suggestUser}
        />
      )}

      {/* Modal de Criação / Edição de Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-upDark border border-upBorder/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-upBorder/60 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingUser ? "Editar Usuário" : "Criar Novo Usuário"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-upGray hover:text-white rounded-lg hover:bg-upCard transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-upGray">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: João da Silva"
                  className="w-full px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-upGray">E-mail</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@email.com"
                  className="w-full px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-upGray">Handle do Instagram (@)</label>
                <input
                  type="text"
                  value={formData.instagramHandle}
                  onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                  placeholder="@seuusuario"
                  className="w-full px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Plano</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  >
                    {availablePlans.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
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

      {/* Modal Customizado de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!deletingUserId}
        title="Excluir Usuário"
        description="Tem certeza que deseja remover este usuário? O acesso dele ao painel será revogado."
        confirmText="Sim, Excluir Usuário"
        cancelText="Cancelar"
        onConfirm={handleConfirmDeleteUser}
        onClose={() => setDeletingUserId(null)}
      />
    </div>
  );
}
