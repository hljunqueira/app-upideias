"use client";

export type TeamRole = "vendas" | "suporte" | "cs" | "criacao";

export interface PagePermission {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export interface PermissionSettings {
  dashboard: PagePermission;
  users: PagePermission;
  team: PagePermission;
  instagram: PagePermission;
  creator: PagePermission;
  landingPage: PagePermission;
  billing: PagePermission;
  whatsappLogs: PagePermission;
  aiBilling: PagePermission;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  secondaryRoles?: TeamRole[];
  roleTitle: string;
  status: "ativo" | "pendente" | "inativo";
  avatarUrl?: string;
  assignedAccountsCount?: number;
  permissions?: PermissionSettings;
  createdAt: string;
}

const STORAGE_KEY_TEAM = "up_admin_team_members";

export const DEFAULT_PERMISSIONS: PermissionSettings = {
  dashboard: { view: true, edit: true, delete: false },
  users: { view: true, edit: true, delete: false },
  team: { view: true, edit: false, delete: false },
  instagram: { view: true, edit: true, delete: false },
  creator: { view: true, edit: true, delete: false },
  landingPage: { view: true, edit: false, delete: false },
  billing: { view: true, edit: false, delete: false },
  whatsappLogs: { view: true, edit: false, delete: false },
  aiBilling: { view: true, edit: false, delete: false }
};

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: "tm-1",
    name: "Gabriel Santos",
    email: "gabriel.vendas@upideias.com",
    role: "vendas",
    secondaryRoles: ["cs"],
    roleTitle: "Executivo de Vendas & Expansion",
    status: "ativo",
    assignedAccountsCount: 42,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    permissions: DEFAULT_PERMISSIONS,
    createdAt: "2026-05-10T10:00:00Z"
  },
  {
    id: "tm-2",
    name: "Juliana Mendes",
    email: "juliana.suporte@upideias.com",
    role: "suporte",
    secondaryRoles: ["vendas"],
    roleTitle: "Especialista em Suporte Técnico",
    status: "ativo",
    assignedAccountsCount: 120,
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop",
    permissions: DEFAULT_PERMISSIONS,
    createdAt: "2026-06-01T14:30:00Z"
  },
  {
    id: "tm-3",
    name: "Lucas Ferreira",
    email: "lucas.cs@upideias.com",
    role: "cs",
    secondaryRoles: ["suporte"],
    roleTitle: "Gestor de Contas & CS",
    status: "ativo",
    assignedAccountsCount: 15,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    permissions: DEFAULT_PERMISSIONS,
    createdAt: "2026-06-15T09:00:00Z"
  },
  {
    id: "tm-4",
    name: "Beatriz Lima",
    email: "beatriz.design@upideias.com",
    role: "criacao",
    secondaryRoles: ["cs"],
    roleTitle: "Designer & Roteirista de Conteúdo",
    status: "ativo",
    assignedAccountsCount: 8,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
    permissions: DEFAULT_PERMISSIONS,
    createdAt: "2026-07-02T16:00:00Z"
  }
];

export function getStoredTeam(): TeamMember[] {
  if (typeof window === "undefined") return INITIAL_TEAM;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEAM);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(INITIAL_TEAM));
      return INITIAL_TEAM;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TEAM;
  }
}

export function saveTeamMember(member: TeamMember): TeamMember[] {
  const current = getStoredTeam();
  const index = current.findIndex((m) => m.id === member.id);
  let updated: TeamMember[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = member;
  } else {
    updated = [member, ...current];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("up_team_updated"));
  }
  return updated;
}

export function deleteTeamMember(id: string): TeamMember[] {
  const current = getStoredTeam();
  const filtered = current.filter((m) => m.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent("up_team_updated"));
  }
  return filtered;
}
