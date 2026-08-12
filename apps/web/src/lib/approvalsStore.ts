"use client";

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

const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: "app-1",
    userId: "u-1",
    userName: "Criador UP",
    title: "Funil de Conteúdo Inteligente no Instagram",
    format: "Reels",
    targetDate: "04/07/2026",
    caption: "Aprenda a guiar seu seguidor desde a descoberta até a conversão utilizando formatos corretos de posts.",
    visualIdea: "Fundo com paleta escura, realces em coral (#FF5368), textos explicativos simples nos primeiros 3 segundos.",
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop",
    status: "pending",
    createdAt: new Date().toISOString()
  },
  {
    id: "app-2",
    userId: "u-1",
    userName: "Criador UP",
    title: "3 Erros Graves que Matam o Engajamento no Feed",
    format: "Carrossel",
    targetDate: "08/07/2026",
    caption: "Se o seu perfil estagnou, você pode estar cometendo um desses 3 erros nas suas capas.",
    visualIdea: "Carrossel de 5 slides com fundo escuro pré-estilizado, contraste alto e ícone de seta indicando arrastar.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    status: "pending",
    createdAt: new Date().toISOString()
  }
];

export function getStoredApprovals(): ApprovalItem[] {
  if (typeof window === "undefined") return INITIAL_APPROVALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPROVALS));
      return INITIAL_APPROVALS;
    }
    const parsed = JSON.parse(raw);
    // Garantir que todos os itens tenham imageUrl mesmo se criados antes
    const migrated = parsed.map((item: ApprovalItem, index: number) => ({
      ...item,
      imageUrl: item.imageUrl || (index % 2 === 0 
        ? "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop" 
        : "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop")
    }));
    return migrated;
  } catch {
    return INITIAL_APPROVALS;
  }
}

export function saveApprovalItem(item: ApprovalItem): ApprovalItem[] {
  const items = getStoredApprovals();
  const index = items.findIndex((i) => i.id === item.id);
  let updated: ApprovalItem[];
  if (index >= 0) {
    updated = [...items];
    updated[index] = item;
  } else {
    updated = [item, ...items];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("up_approvals_updated"));
  }
  return updated;
}

export function updateApprovalStatus(id: string, status: "approved" | "rejected", feedbackNote?: string): ApprovalItem[] {
  const items = getStoredApprovals();
  const updated = items.map((item) => {
    if (item.id === id) {
      return { ...item, status, feedbackNote };
    }
    return item;
  });
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("up_approvals_updated"));
  }
  return updated;
}
