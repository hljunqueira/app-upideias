"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Shield,
  Instagram,
  Mail,
  User,
  X,
  UserCheck,
  UserX,
  CreditCard,
  Key,
  RefreshCw,
  Sparkles,
  Activity
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
  role: "user" | "admin";
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [availablePlans, setAvailablePlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("todos");

  useEffect(() => {
    setAvailablePlans(getStoredPlans());
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        const mapped: UserItem[] = data.map((p: any) => ({
          id: p.id,
          name: p.name || p.full_name || "Cliente UP",
          email: p.email || "Sem e-mail",
          plan: p.plan || "Pro",
          status: p.status === "Suspenso" ? "Suspenso" : p.status === "Pendente" ? "Pendente" : "Ativo",
          instagramHandle: p.instagram_handle || "@upideias",
          role: p.role === "admin" ? "admin" : "user",
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
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [suggestUser, setSuggestUser] = useState<UserItem | null>(null);

  // Modal State para Confirmação de Desativação
  const [deactivatingUserId, setDeactivatingUserId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    plan: string;
    status: "Ativo" | "Suspenso" | "Pendente";
    instagramHandle: string;
    role: "user" | "admin";
    initialPassword?: string;
  }>({
    name: "",
    email: "",
    plan: "Pro",
    status: "Ativo",
    instagramHandle: "",
    role: "user",
    initialPassword: "",
  });

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, initialPassword: pass }));
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (u.name?.toLowerCase() ?? "").includes(term) ||
      (u.email?.toLowerCase() ?? "").includes(term) ||
      (u.instagramHandle?.toLowerCase() ?? "").includes(term);
    const matchesPlan = filterPlan === "todos" || u.plan.toLowerCase() === filterPlan.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      plan: availablePlans[0]?.name || "Pro",
      status: "Ativo",
      instagramHandle: "",
      role: "user",
      initialPassword: "",
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
      role: user.role,
      initialPassword: "",
    });
    setIsModalOpen(true);
  };

  // Alternar Status entre Ativo e Suspenso
  const handleToggleStatus = async (userId: string, targetStatus: "Ativo" | "Suspenso") => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: targetStatus } : u))
    );

    try {
      await supabase
        .from("profiles")
        .update({ status: targetStatus })
        .eq("id", userId);
    } catch (e) {
      console.error("Erro ao alterar status no Supabase:", e);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingUserId) return;
    await handleToggleStatus(deactivatingUserId, "Suspenso");
    setDeactivatingUserId(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingUser) {
        // Atualização em profiles no Supabase
        await supabase
          .from("profiles")
          .update({
            name: formData.name,
            email: formData.email,
            plan: formData.plan,
            status: formData.status,
            instagram_handle: formData.instagramHandle,
            role: formData.role
          })
          .eq("id", editingUser.id);

        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u))
        );
      } else {
        // Criação/Upsert no Supabase
        const newId = crypto.randomUUID();
        const newUser: UserItem = {
          id: newId,
          name: formData.name,
          email: formData.email,
          plan: formData.plan,
          status: formData.status,
          instagramHandle: formData.instagramHandle,
          role: formData.role,
          createdAt: new Date().toLocaleDateString("pt-BR"),
        };

        await supabase.from("profiles").upsert({
          id: newId,
          name: formData.name,
          email: formData.email,
          plan: formData.plan,
          status: formData.status,
          instagram_handle: formData.instagramHandle,
          role: formData.role
        });

        setUsers((prev) => [newUser, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar cliente no Supabase:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-upPink" />
            Gestão de Clientes Assinantes
          </h1>
          <p className="text-sm text-upGray mt-1">
            Cadastre novos assinantes, altere planos, gerencie o status das contas e monitore a base de clientes.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-upPink hover:bg-upPinkDark text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(255,83,104,0.3)] hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Assinante
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
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Contas Suspensas</p>
            <p className="text-2xl font-black text-upPink mt-1">
              {users.filter((u) => u.status === "Suspenso").length}
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
            {availablePlans.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-upCard/60 border border-upBorder/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-upLightGray">
            <thead className="bg-upDark/90 border-b border-upBorder/60 text-upGray uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Cliente Assinante</th>
                <th className="px-6 py-4">Instagram</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Cadastro</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-upBorder/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-upGray">
                    Carregando assinantes do Supabase...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-upGray">
                    Nenhum cliente assinante encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-upCard/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-upPink to-purple-600 p-[1.5px] shrink-0">
                          <div className="w-full h-full rounded-full bg-upDark flex items-center justify-center font-bold text-white text-xs">
                            {user.name[0]?.toUpperCase() || "U"}
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
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === "Ativo" ? "bg-emerald-400" : "bg-rose-400"
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
                          <span>📊 Sugerir</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 rounded-xl bg-upDark hover:bg-upPink/20 hover:text-upPink border border-upBorder/60 transition-all text-upGray"
                          title="Editar Assinante"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {user.status === "Ativo" ? (
                          <button
                            onClick={() => setDeactivatingUserId(user.id)}
                            className="p-2 rounded-xl bg-upDark hover:bg-rose-500/20 hover:text-rose-400 border border-upBorder/60 transition-all text-upGray flex items-center gap-1"
                            title="Desativar / Suspender Conta"
                          >
                            <UserX className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(user.id, "Ativo")}
                            className="p-2 rounded-xl bg-upDark hover:bg-emerald-500/20 hover:text-emerald-400 border border-upBorder/60 transition-all text-upGray flex items-center gap-1"
                            title="Reativar Conta"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          </button>
                        )}
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

      {/* Modal de Criação / Edição de Cliente Assinante */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0e0e14] border border-upBorder/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-upBorder/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-upPink/20 text-upPink border border-upPink/30 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingUser ? "Editar Assinante" : "Cadastrar Novo Assinante"}
                  </h3>
                  <p className="text-xs text-upGray">
                    {editingUser ? "Atualize os dados e o plano contratado pelo cliente." : "Defina os dados de acesso e o plano de assinatura do cliente."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-upGray hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {/* Nome Completo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-upGray flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-upPink" /> Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: João da Silva"
                  className="w-full px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              {/* E-mail */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-upGray flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-upPink" /> E-mail de Acesso
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@email.com"
                  className="w-full px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              {/* Instagram */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-upGray flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-upPink" /> Handle do Instagram (@)
                </label>
                <input
                  type="text"
                  value={formData.instagramHandle}
                  onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                  placeholder="@seuusuario"
                  className="w-full px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all font-mono"
                />
              </div>

              {/* Senha Inicial (Apenas na Criação) */}
              {!editingUser && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-upGray flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-upPink" /> Senha Inicial
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[10px] text-upPink hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Gerar Senha Segura
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.initialPassword || ""}
                    onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                    placeholder="Defina ou gere uma senha..."
                    className="w-full px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all font-mono"
                  />
                </div>
              )}

              {/* Plano e Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-upPink" /> Plano
                  </label>
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
                  <label className="text-xs font-semibold text-upGray flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-upPink" /> Status da Conta
                  </label>
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
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-upPink hover:bg-upPinkDark text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(255,83,104,0.3)] disabled:opacity-50"
                >
                  {saving ? "Salavando..." : editingUser ? "Salvar Alterações" : "Cadastrar Assinante"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Customizado de Confirmação de Desativação */}
      <ConfirmModal
        isOpen={!!deactivatingUserId}
        title="Desativar Conta de Assinante"
        description="Tem certeza que deseja desativar este assinante? A conta será suspensa e o acesso à plataforma será temporariamente bloqueado."
        confirmText="Sim, Desativar Conta"
        cancelText="Cancelar"
        onConfirm={handleConfirmDeactivate}
        onClose={() => setDeactivatingUserId(null)}
      />
    </div>
  );
}
