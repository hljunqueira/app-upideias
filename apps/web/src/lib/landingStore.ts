"use client";

export interface LandingData {
  // Hero
  heroTagline: string;
  heroTitle1: string;
  heroTitle2: string;
  heroTitle3: string;
  heroSubtitle: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  heroVideoUrl: string;
  heroStats: Array<{ value: string; label: string }>;

  // World
  worldBadge: string;
  worldTitle: string;
  worldSubtitle: string;

  // Analytics
  analyticsTitle: string;
  analyticsSubtitle: string;
  analyticsImageUrl: string;

  // Marquee
  marqueeWords: string[];

  // Creator
  creatorTitle: string;
  creatorSubtitle: string;
  creatorVideoUrl: string;

  // Cycle
  cycleSteps: Array<{ step: string; title: string; desc: string }>;

  // Pricing & Final CTA
  pricingTitle: string;
  finalCtaTitle: string;
  finalCtaButtonText: string;

  // Footer
  footerCopyText: string;
  footerContactEmail: string;
}

const STORAGE_KEY_LANDING = "up_landing_page_config";

export const DEFAULT_LANDING_DATA: LandingData = {
  heroTagline: "feito para quem cria",
  heroTitle1: "IDEIAS QUE",
  heroTitle2: "SOBEM DE",
  heroTitle3: "NÍVEL",
  heroSubtitle: "Análise de métricas do Instagram, gerador de conteúdo e uma plataforma de cursos estilo streaming. Transforme métricas em estratégia.",
  primaryCtaText: "Criar conta",
  secondaryCtaText: "Entrar no mundo UP",
  heroVideoUrl: "https://assets.mixkit.co/videos/18140/18140-720.mp4",
  heroStats: [
    { value: "Instagram", label: "métricas em tempo real" },
    { value: "30 dias", label: "de métricas analisadas" },
    { value: "6+ trilhas", label: "no UP Creator" },
    { value: "100%", label: "plataforma online" }
  ],

  worldBadge: "O MUNDO UP",
  worldTitle: "TUDO O QUE VOCÊ PRECISA EM UM SÓ LUGAR",
  worldSubtitle: "Uma experiência visual envolvente projetada para impulsionar a presença digital de criadores e marcas.",

  analyticsTitle: "Inteligência e Métricas em Tempo Real",
  analyticsSubtitle: "Acompanhe o crescimento dos seus seguidores, alcance de mídias e taxa de engajamento com gráficos detalhados.",
  analyticsImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",

  marqueeWords: ["ESTRATÉGIA", "MÉTRICAS", "DESEMPENHO", "CONTEÚDO", "INSTAGRAM", "CURSOS", "CRESCIMENTO"],

  creatorTitle: "Cursos e Trilhas no Estilo Streaming",
  creatorSubtitle: "Aprenda com aulas práticas de roteiro, edição, inteligência artificial e estratégias avançadas de engajamento.",
  creatorVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-41400-large.mp4",

  cycleSteps: [
    { step: "01", title: "Inspiração & Ideia", desc: "IA analisa seu nicho e sugere os temas com maior potencial de viralização." },
    { step: "02", title: "Criação de Conteúdo", desc: "Roteiros, legendas e ganchos gerados em segundos." },
    { step: "03", title: "Publicação & Validação", desc: "Acompanhe métricas reais de alcance e retenção." },
    { step: "04", title: "Evolução Contínua", desc: "Aprenda nas aulas do UP Creator para aperfeiçoar cada novo post." }
  ],

  pricingTitle: "Escolha o Plano Ideal para o Seu Momento",
  finalCtaTitle: "Pronto para Subir o Nível do Seu Instagram?",
  finalCtaButtonText: "Criar Minha Conta Grátis",

  footerCopyText: "© 2026 UP Ideias. Todos os direitos reservados.",
  footerContactEmail: "contato@upideias.com"
};

export function getStoredLandingData(): LandingData {
  if (typeof window === "undefined") return DEFAULT_LANDING_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LANDING);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LANDING, JSON.stringify(DEFAULT_LANDING_DATA));
      return DEFAULT_LANDING_DATA;
    }
    return { ...DEFAULT_LANDING_DATA, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_LANDING_DATA;
  }
}

export function saveLandingData(data: LandingData): LandingData {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_LANDING, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("up_landing_updated"));
  }
  return data;
}
