"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  Headphones, 
  DollarSign, 
  TrendingUp, 
  Palette, 
  X, 
  Trash2, 
  Lock,
  Check,
  Eye,
  Edit,
  Plus
} from "lucide-react";
import { 
  TeamMember, 
  TeamRole, 
  PermissionSettings, 
  DEFAULT_PERMISSIONS, 
  getStoredTeam, 
  saveTeamMember, 
  deleteTeamMember 
} from "@/lib/teamStore";

import { supabase } from "@up-analytics/lib";

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"all" | TeamRole>("all");
  
  // Invite/Edit Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Permissions & Multi-role Modal State
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [permissionMember, setPermissionMember] = useState<TeamMember | null>(null);
  const [tempMainRole, setTempMainRole] = useState<TeamRole>("vendas");
  const [tempSecondaryRoles, setTempSecondaryRoles] = useState<TeamRole[]>([]);
  const [tempPermissions, setTempPermissions] = useState<PermissionSettings>(DEFAULT_PERMISSIONS);

  // Form State (Novo Membro)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("vendas");

  const loadTeam = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["admin", "vendas", "suporte", "cs", "criacao"]);
      
      if (data && data.length > 0) {
        const mapped: TeamMember[] = data.map((p: any) => ({
          id: p.id,
          name: p.name || p.full_name || "Membro da Equipe",
          email: p.email || "equipe@upideias.com",
          role: (p.role as TeamRole) || "vendas",
          roleTitle: p.role_title || `Especialista em ${p.role || "Vendas"}`,
          status: "ativo",
          assignedAccountsCount: 0,
          permissions: DEFAULT_PERMISSIONS,
          createdAt: p.created_at || new Date().toISOString()
        }));
        setTeam(mapped);
      } else {
        setTeam(getStoredTeam());
      }
    } catch {
      setTeam(getStoredTeam());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
    const handleUpdate = () => loadTeam();
    window.addEventListener("up_team_updated", handleUpdate);
    return () => window.removeEventListener("up_team_updated", handleUpdate);
  }, []);

  const handleOpenInvite = () => {
    setEditingMember(null);
    setName("");
    setEmail("");
    setRole("vendas");
    setIsInviteModalOpen(true);
  };

  const handleOpenPermissions = (member: TeamMember) => {
    setPermissionMember(member);
    setTempMainRole(member.role);
    setTempSecondaryRoles(member.secondaryRoles || []);
    setTempPermissions(member.permissions || DEFAULT_PERMISSIONS);
    setIsPermissionsModalOpen(true);
  };

  const handleSavePermissions = () => {
    if (!permissionMember) return;
    
    const roleTitles: Record<TeamRole, string> = {
      vendas: "Executivo de Vendas & Expansion",
      suporte: "Especialista em Suporte Técnico",
      cs: "Gestor de Contas & CS",
      criacao: "Designer & Roteirista de Conteúdo"
    };

    // Remove tempMainRole from secondaryRoles if present
    const cleanSecondary = tempSecondaryRoles.filter((r) => r !== tempMainRole);

    const updatedMember: TeamMember = {
      ...permissionMember,
      role: tempMainRole,
      roleTitle: roleTitles[tempMainRole],
      secondaryRoles: cleanSecondary,
      permissions: tempPermissions
    };

    saveTeamMember(updatedMember);
    setIsPermissionsModalOpen(false);
  };

  const handleToggleSecondaryRole = (r: TeamRole) => {
    if (r === tempMainRole) return;
    if (tempSecondaryRoles.includes(r)) {
      setTempSecondaryRoles(tempSecondaryRoles.filter((role) => role !== r));
    } else {
      setTempSecondaryRoles([...tempSecondaryRoles, r]);
    }
  };

  const handleChangeMainRole = (newRole: TeamRole) => {
    setTempMainRole(newRole);
    // Automatically strip new main role from secondary roles
    setTempSecondaryRoles((prev) => prev.filter((r) => r !== newRole));
  };

  const handleTogglePermission = (
    moduleKey: keyof PermissionSettings,
    action: "view" | "edit" | "delete"
  ) => {
    setTempPermissions((prev) => {
      const currentModule = prev[moduleKey] || { view: true, edit: false, delete: false };
      return {
        ...prev,
        [moduleKey]: {
          ...currentModule,
          [action]: !currentModule[action]
        }
      };
    });
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const roleTitles: Record<TeamRole, string> = {
      vendas: "Executivo de Vendas & Expansion",
      suporte: "Especialista em Suporte Técnico",
      cs: "Gestor de Contas & CS",
      criacao: "Designer & Roteirista de Conteúdo"
    };

    const newMember: TeamMember = {
      id: editingMember?.id || `tm-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: role,
      secondaryRoles: editingMember?.secondaryRoles || [],
      roleTitle: roleTitles[role],
      status: "ativo",
      assignedAccountsCount: editingMember?.assignedAccountsCount || 0,
      avatarUrl: editingMember?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
      permissions: editingMember?.permissions || DEFAULT_PERMISSIONS,
      createdAt: editingMember?.createdAt || new Date().toISOString()
    };

    saveTeamMember(newMember);
    setIsInviteModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este membro da equipe interna?")) {
      deleteTeamMember(id);
    }
  };

  const filteredMembers = team.filter((m) => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = 
      selectedRoleFilter === "all" || 
      m.role === selectedRoleFilter ||
      (m.secondaryRoles && m.secondaryRoles.includes(selectedRoleFilter));
    return matchesSearch && matchesRole;
  });

  const countByRole = (r: TeamRole) => 
    team.filter((m) => m.role === r || (m.secondaryRoles && m.secondaryRoles.includes(r))).length;

  return (
    <div className="flex flex-col gap-8 animate-fadeIn text-upLightGray">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
            <Users className="w-8 h-8 text-upPink" />
            Gestão da Equipe Interna
          </h1>
          <p className="text-sm text-upGray mt-1">
            Gerencie acessos, multifunções e permissões granulares dos times de Vendas, Suporte, CS e Criação.
          </p>
        </div>

        <button
          onClick={handleOpenInvite}
          className="px-5 py-2.5 bg-upPink hover:bg-upPink/90 text-white rounded-2xl text-xs font-extrabold transition-all shadow-[0_0_20px_rgba(255,83,104,0.3)] flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Convidar Novo Membro</span>
        </button>
      </div>

      {/* 4 Cards de Resumo por Setor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-5 flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-upGray font-extrabold uppercase">Time de Vendas</span>
            <p className="text-xl font-black text-white mt-0.5">{countByRole("vendas")} Membros</p>
          </div>
        </div>

        <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-5 flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-upGray font-extrabold uppercase">Time de Suporte</span>
            <p className="text-xl font-black text-white mt-0.5">{countByRole("suporte")} Membros</p>
          </div>
        </div>

        <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-5 flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-upGray font-extrabold uppercase">Gestão de Contas (CS)</span>
            <p className="text-xl font-black text-white mt-0.5">{countByRole("cs")} Membros</p>
          </div>
        </div>

        <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-5 flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-upPink/10 text-upPink rounded-2xl border border-upPink/20">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-upGray font-extrabold uppercase">Time de Criação</span>
            <p className="text-xl font-black text-white mt-0.5">{countByRole("criacao")} Membros</p>
          </div>
        </div>
      </div>

      {/* Controls & Role Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-upGray" />
          <input
            type="text"
            placeholder="Buscar membro pelo nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#0e0e14] border border-upBorder rounded-2xl text-xs text-upWhite placeholder-upGray outline-none focus:border-upPink/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#0e0e14] p-1.5 rounded-2xl border border-upBorder w-full sm:w-auto overflow-x-auto">
          {[
            { id: "all", label: "Todos os Times" },
            { id: "vendas", label: "Vendas" },
            { id: "suporte", label: "Suporte" },
            { id: "cs", label: "Gestão de Contas" },
            { id: "criacao", label: "Criação" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRoleFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedRoleFilter === tab.id
                  ? "bg-upPink text-white shadow-md"
                  : "text-upGray hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Cards dos Membros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-4 hover:border-upPink/40 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-upBorder/80 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-base font-bold text-white">{member.name}</h3>
                    
                    {/* Role Principal */}
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      member.role === "vendas"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : member.role === "suporte"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : member.role === "cs"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-upPink/10 text-upPink border-upPink/20"
                    }`}>
                      {member.role.toUpperCase()} (PRINCIPAL)
                    </span>

                    {/* Secondary Roles (Multifunção) */}
                    {member.secondaryRoles?.map((sr) => (
                      <span key={sr} className="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase border bg-white/5 text-upLightGray border-white/10">
                        +{sr.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-upGray font-medium">{member.roleTitle}</p>
                  <p className="text-xs text-upLightGray font-mono">{member.email}</p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(member.id)}
                className="p-2 text-upGray hover:text-rose-400 bg-upDark hover:bg-rose-500/10 border border-upBorder/60 rounded-xl transition shrink-0 cursor-pointer"
                title="Remover da Equipe"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Actions Bar: Permissões Granulares & Multifunção */}
            <div className="flex items-center justify-between border-t border-upBorder/40 pt-3">
              <span className="text-[10px] text-upGray font-mono">
                Criado em {new Date(member.createdAt).toLocaleDateString("pt-BR")}
              </span>

              <button
                onClick={() => handleOpenPermissions(member)}
                className="px-3.5 py-1.5 bg-upDark hover:bg-upPink/20 text-upPink hover:text-white border border-upPink/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Editar Função & Permissões</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDICAO DE FUNÇÃO PRINCIPAL, MULTIFUNÇÃO E PERMISSÕES */}
      {isPermissionsModalOpen && permissionMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0b0f] border border-upBorder/60 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative text-upLightGray flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60 shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-upPink" />
                <div>
                  <h3 className="text-sm font-bold text-white">Editar Função & Permissões Granulares</h3>
                  <p className="text-[10px] text-upGray">{permissionMember.name} • {permissionMember.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPermissionsModalOpen(false)}
                className="p-1.5 text-upGray hover:text-white bg-white/5 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
              
              {/* 1. SELEÇÃO DA FUNÇÃO PRINCIPAL */}
              <div className="space-y-2 border-b border-upBorder/40 pb-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white block">
                  1. Função Principal do Membro
                </label>
                <p className="text-xs text-upGray">
                  Altere a área primária de atuação deste membro no sistema:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: "vendas", label: "💼 Vendas" },
                    { id: "suporte", label: "🎧 Suporte" },
                    { id: "cs", label: "📈 Gestão CS" },
                    { id: "criacao", label: "🎨 Criação" }
                  ].map((r) => {
                    const isMain = r.id === tempMainRole;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleChangeMainRole(r.id as TeamRole)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition text-center border cursor-pointer ${
                          isMain
                            ? "bg-upPink text-white border-upPink shadow-lg shadow-upPink/20"
                            : "bg-upDark/60 text-upGray border-upBorder/50 hover:text-white"
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. SELEÇÃO DE MULTIFUNÇÃO (TIMES SECUNDÁRIOS) */}
              <div className="space-y-2 border-b border-upBorder/40 pb-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white block">
                  2. Configuração de Multifunção (Outros Times Atribuídos)
                </label>
                <p className="text-xs text-upGray">
                  Marque se este membro também atua em outros setores além de <strong>{tempMainRole.toUpperCase()}</strong>:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: "vendas", label: "💼 Vendas" },
                    { id: "suporte", label: "🎧 Suporte" },
                    { id: "cs", label: "📈 Gestão CS" },
                    { id: "criacao", label: "🎨 Criação" }
                  ].map((r) => {
                    const isMain = r.id === tempMainRole;
                    const isSelected = isMain || tempSecondaryRoles.includes(r.id as TeamRole);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        disabled={isMain}
                        onClick={() => handleToggleSecondaryRole(r.id as TeamRole)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition text-center border cursor-pointer ${
                          isMain
                            ? "bg-upPink/20 text-upPink border-upPink/40 opacity-75 cursor-not-allowed"
                            : isSelected
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-upDark/60 text-upGray border-upBorder/50 hover:text-white"
                        }`}
                      >
                        {r.label} {isMain && "(Principal)"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. MATRIZ DE PERMISSÕES GRANULARES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-upBorder/40 pb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white block">
                    3. Permissões de Visualizar, Editar e Excluir por Página
                  </label>
                  <span className="text-[10px] text-upGray font-mono">Visualizar • Editar • Excluir</span>
                </div>

                <div className="space-y-2">
                  {[
                    { key: "dashboard", label: "Painel Geral & Métricas (/admin)" },
                    { key: "users", label: "Gestão de Usuários e Clientes (/admin/users)" },
                    { key: "team", label: "Gestão da Equipe Interna (/admin/team)" },
                    { key: "instagram", label: "Contas Instagram Conectadas (/admin/instagram)" },
                    { key: "creator", label: "UP Creator & Cursos (/admin/up-creator)" },
                    { key: "landingPage", label: "Editor da Landing Page & Marca (/admin/settings)" },
                    { key: "billing", label: "Planos & Assinaturas (/admin/plans)" },
                    { key: "whatsappLogs", label: "Histórico de WhatsApp (/admin/whatsapp)" },
                    { key: "aiBilling", label: "Faturamento de IA & Servidor (/admin/ai-billing)" }
                  ].map((mod) => {
                    const modPerms = (tempPermissions as any)[mod.key] || { view: true, edit: false, delete: false };
                    return (
                      <div key={mod.key} className="bg-upDark/60 p-3 rounded-2xl border border-upBorder/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">{mod.label}</span>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Visualizar */}
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(mod.key as any, "view")}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                              modPerms.view
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                : "bg-upDark text-upGray border-upBorder/60 opacity-40"
                            }`}
                          >
                            <Eye className="w-3 h-3" /> Visualizar
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(mod.key as any, "edit")}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                              modPerms.edit
                                ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                                : "bg-upDark text-upGray border-upBorder/60 opacity-40"
                            }`}
                          >
                            <Edit className="w-3 h-3" /> Editar
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(mod.key as any, "delete")}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                              modPerms.delete
                                ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                                : "bg-upDark text-upGray border-upBorder/60 opacity-40"
                            }`}
                          >
                            <Trash2 className="w-3 h-3" /> Excluir
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="px-6 py-4 border-t border-upBorder/40 flex items-center justify-end gap-3 bg-upDark/60 shrink-0">
              <button
                type="button"
                onClick={() => setIsPermissionsModalOpen(false)}
                className="px-4 py-2.5 bg-upDark border border-upBorder/60 text-upGray hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-5 py-2.5 bg-upPink hover:bg-upPink/90 text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(255,83,104,0.3)] transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Convidar Novo Membro */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0b0f] border border-upBorder/60 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative text-upLightGray">
            <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-upPink" />
                <h3 className="text-sm font-bold text-white">Convidar Membro da Equipe</h3>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 text-upGray hover:text-white bg-white/5 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roberto Alves"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Endereço de E-mail Corporativo
                </label>
                <input
                  type="email"
                  required
                  placeholder="roberto@upideias.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-upDark border border-upBorder/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-upGray focus:outline-none focus:border-upPink transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                  Time / Função Principal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "vendas", label: "💼 Vendas" },
                    { id: "suporte", label: "🎧 Suporte" },
                    { id: "cs", label: "📈 Gestão de Contas" },
                    { id: "criacao", label: "🎨 Criação & Copy" }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition text-left border cursor-pointer ${
                        role === r.id
                          ? "bg-upPink text-white border-upPink shadow-md"
                          : "bg-upDark/60 text-upGray border-upBorder/50 hover:text-white"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-upBorder/40">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2.5 bg-upDark border border-upBorder/60 text-upGray hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-upPink hover:bg-upPink/90 text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(255,83,104,0.3)] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enviar Convite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
