"use client";

import { supabase } from "@up-analytics/lib";

export interface ApprovalItem {
  id: string;
  userId: string;
  userName: string;
  title: string;
  format: "Reels" | "Carrossel" | "Imagem" | "Story";
  targetDate: string;
  caption: string;
  visualIdea: string;
  imageUrl?: string;
  status: "pending" | "approved" | "rejected";
  feedbackNote?: string;
  createdAt: string;
}

const STORAGE_KEY = "up_approvals_items";

export function getStoredApprovals(): ApprovalItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveApprovalsToStorage(items: ApprovalItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("up_approvals_updated"));
  } catch (e) {
    console.error("Erro ao salvar aprovações no localStorage", e);
  }
}

export async function fetchApprovalsFromDb(): Promise<ApprovalItem[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    let query = supabase.from("content_approvals").select("*").order("created_at", { ascending: false });
    if (user) {
      query = query.eq("user_id", user.id);
    }
    const { data, error } = await query;
    if (error || !data) {
      return getStoredApprovals();
    }

    const mapped: ApprovalItem[] = data.map((item: any) => ({
      id: item.id,
      userId: item.user_id || "",
      userName: item.user_name || "Cliente",
      title: item.title || "Sugestão de Conteúdo",
      format: item.format || "Reels",
      targetDate: item.target_date || new Date().toLocaleDateString("pt-BR"),
      caption: item.caption || "",
      visualIdea: item.visual_idea || item.client_comment || "",
      imageUrl: item.image_url || undefined,
      status: item.status || "pending",
      feedbackNote: item.client_comment || undefined,
      createdAt: item.created_at || new Date().toISOString()
    }));

    saveApprovalsToStorage(mapped);
    return mapped;
  } catch {
    return getStoredApprovals();
  }
}

export async function saveApprovalItem(item: ApprovalItem): Promise<ApprovalItem[]> {
  const current = getStoredApprovals();
  const index = current.findIndex((i) => i.id === item.id);
  const updated = index >= 0 ? current.map((i, idx) => idx === index ? item : i) : [item, ...current];
  saveApprovalsToStorage(updated);

  try {
    await supabase.from("content_approvals").upsert({
      id: item.id,
      user_id: item.userId,
      user_name: item.userName,
      title: item.title,
      format: item.format,
      target_date: item.targetDate,
      caption: item.caption,
      visual_idea: item.visualIdea,
      image_url: item.imageUrl,
      status: item.status,
      client_comment: item.feedbackNote
    });
  } catch (e) {
    console.error("Erro ao salvar aprovação no Supabase", e);
  }

  return updated;
}

export async function updateApprovalStatus(id: string, status: "approved" | "rejected", feedbackNote?: string): Promise<ApprovalItem[]> {
  const current = getStoredApprovals();
  const updated = current.map((item) => {
    if (item.id === id) {
      return { ...item, status, feedbackNote };
    }
    return item;
  });
  saveApprovalsToStorage(updated);

  try {
    await supabase
      .from("content_approvals")
      .update({
        status,
        client_comment: feedbackNote,
        approved_at: status === "approved" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);
  } catch (e) {
    console.error("Erro ao atualizar status de aprovação no Supabase", e);
  }

  return updated;
}

