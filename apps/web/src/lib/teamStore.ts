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

export const INITIAL_TEAM: TeamMember[] = [];

export function getStoredTeam(): TeamMember[] {
  if (typeof window === "undefined") return INITIAL_TEAM;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEAM);
    if (!raw) {
      return INITIAL_TEAM;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filtrar membros fictícios antigos de teste
      const cleaned = parsed.filter(
        (m: TeamMember) => 
          !["tm-1", "tm-2", "tm-3", "tm-4"].includes(m.id) &&
          !["Gabriel Santos", "Juliana Mendes", "Lucas Ferreira", "Beatriz Lima"].includes(m.name)
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return INITIAL_TEAM;
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
