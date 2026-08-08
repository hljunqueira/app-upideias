"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Globe, 
  Server, 
  Save, 
  Check, 
  Layout, 
  Video, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Sparkles,
  Upload,
  Layers,
  Award,
  CreditCard,
  Compass,
  Eye,
  Rocket,
  ArrowRight,
  BarChart3,
  MessageSquare,
  Instagram,
  Youtube
} from "lucide-react";
import { getStoredLandingData, saveLandingData, LandingData } from "@/lib/landingStore";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"landing" | "system">("landing");
  const [activeLandingSection, setActiveLandingSection] = useState<
    "hero" | "world" | "analytics" | "marquee" | "creator" | "cycle" | "pricing" | "footer"
  >("hero");
  const [showLivePreview, setShowLivePreview] = useState(true);

  // System Settings State
  const [platformName, setPlatformName] = useState("UP Ideias");
  const [supportEmail, setSupportEmail] = useState("suporte@upideias.com");
  const [aiModelDefault, setAiModelDefault] = useState("gemini-1.5-pro");
  const [whatsappInstanceKey, setWhatsappInstanceKey] = useState("UP_ANALYTICS_PRO_KEY_8492");

  // === LANDING PAGE FULL SECTIONS STATE (TUDO DA LANDING PAGE DO NAV AO FOOTER) ===
  
  // NAV & HEADER
  const [navLoginText, setNavLoginText] = useState("Entrar");
  const [navRegisterText, setNavRegisterText] = useState("Criar conta");
  const [navLinks, setNavLinks] = useState([
    { label: "Analytics", href: "#analytics" },
    { label: "Creator", href: "#creator" },
    { label: "Como funciona", href: "#ciclo" },
    { label: "Planos", href: "#planos" }
  ]);

  // 1. HERO SECTION
  const [heroTagline, setHeroTagline] = useState("feito para quem cria");
  const [heroTitle1, setHeroTitle1] = useState("IDEIAS QUE");
  const [heroTitle2, setHeroTitle2] = useState("SOBEM DE");
  const [heroTitle3, setHeroTitle3] = useState("NÍVEL");
  const [heroSubtitle, setHeroSubtitle] = useState("Análise de métricas do Instagram, gerador de conteúdo e uma plataforma de cursos estilo streaming. Transforme métricas em estratégia.");
  const [primaryCtaText, setPrimaryCtaText] = useState("Criar conta");
  const [secondaryCtaText, setSecondaryCtaText] = useState("Entrar no mundo UP");
  const [heroVideoUrl, setHeroVideoUrl] = useState("https://assets.mixkit.co/videos/18140/18140-720.mp4");
  const [heroStats, setHeroStats] = useState([
    { value: "Instagram", label: "métricas em tempo real" },
    { value: "30 dias", label: "de métricas analisadas" },
    { value: "6+ trilhas", label: "no UP Creator" },
    { value: "100%", label: "plataforma online" }
  ]);

  // 2. MUNDO UP (3 PAINÉIS)
  const [worldBadge, setWorldBadge] = useState("O MUNDO UP");
  const [worldTitle, setWorldTitle] = useState("TUDO O QUE VOCÊ PRECISA EM UM SÓ LUGAR");
  const [worldSubtitle, setWorldSubtitle] = useState("Uma experiência visual envolvente projetada para impulsionar a presença digital de criadores e marcas.");
  // Painel 1 (Problema)
  const [panel1Badge, setPanel1Badge] = useState("O problema");
  const [panel1Title1, setPanel1Title1] = useState("POSTS ALEATÓRIOS");
  const [panel1Title2, setPanel1Title2] = useState("NÃO CONSTROEM");
  const [panel1Title3, setPanel1Title3] = useState("IMPÉRIOS.");
  const [panel1Subtitle, setPanel1Subtitle] = useState("Sua empresa não precisa apenas de mais posts. Precisa de estratégia.");
  const [panel1VideoUrl, setPanel1VideoUrl] = useState("https://assets.mixkit.co/videos/44820/44820-720.mp4");
  // Painel 2 (UP Analytics)
  const [panel2Title, setPanel2Title] = useState("UP ANALYTICS");
  const [panel2Subtitle, setPanel2Subtitle] = useState("Métricas reais do Instagram, organização estratégica de dados e relatórios no WhatsApp.");
  const [panel2Bullets, setPanel2Bullets] = useState([
    "Análise de 30 dias de métricas e relatório de desempenho",
    "Ideias de post com gancho, roteiro e hashtags",
    "Resumo semanal direto no seu WhatsApp"
  ]);
  // Painel 3 (UP Creator)
  const [panel3Title, setPanel3Title] = useState("UP CREATOR");
  const [panel3Subtitle, setPanel3Subtitle] = useState("Sua plataforma de cursos estilo streaming: trilhas, aulas novas todo mês e certificados.");
  const [panel3VideoUrl, setPanel3VideoUrl] = useState("https://assets.mixkit.co/videos/44074/44074-720.mp4");

  // 3. ANALYTICS SHOWCASE
  const [analyticsTitle, setAnalyticsTitle] = useState("Inteligência e Métricas em Tempo Real");
  const [analyticsSubtitle, setAnalyticsSubtitle] = useState("Acompanhe o crescimento dos seus seguidores, alcance de mídias e taxa de engajamento com gráficos detalhados.");
  const [analyticsImageUrl, setAnalyticsImageUrl] = useState("https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop");
  const [analyticsHighlights, setAnalyticsHighlights] = useState([
    { title: "Dashboard em Tempo Real", desc: "Monitore impressões, alcance e novos seguidores em um só lugar." },
    { title: "Relatórios Inteligentes", desc: "Resumos resumidos com sugestões práticas enviadas para seu WhatsApp." },
    { title: "Análise de Retenção de Vídeos", desc: "Descubra os primeiros 3 segundos que mais prendem a atenção do público." }
  ]);

  // 4. GIANT MARQUEE
  const [marqueeWords, setMarqueeWords] = useState([
    "ESTRATÉGIA", "MÉTRICAS", "DESEMPENHO", "CONTEÚDO", "INSTAGRAM", "CURSOS", "CRESCIMENTO"
  ]);
  const [newMarqueeWord, setNewMarqueeWord] = useState("");

  // 5. CREATOR SHOWCASE (UP CREATOR STREAMING)
  const [creatorTitle, setCreatorTitle] = useState("Sua plataforma de cursos, estilo streaming.");
  const [creatorSubtitle, setCreatorSubtitle] = useState("Trilhas de aprendizado guiadas, aulas novas todo mês e certificados. Explore o catálogo no formato maratona de série.");
  const [creatorVideoUrl, setCreatorVideoUrl] = useState("https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-41400-large.mp4");

  // 6. CICLO DE CRESCIMENTO
  const [cycleSteps, setCycleSteps] = useState([
    { step: "01", title: "Inspiração & Ideia", desc: "IA analisa seu nicho e sugere os temas com maior potencial de viralização." },
    { step: "02", title: "Criação de Conteúdo", desc: "Roteiros, legendas e ganchos gerados em segundos." },
    { step: "03", title: "Publicação & Validação", desc: "Acompanhe métricas reais de alcance e retenção." },
    { step: "04", title: "Evolução Contínua", desc: "Aprenda nas aulas do UP Creator para aperfeiçoar cada novo post." }
  ]);

  // 7. PRICING & FINAL CTA
  const [pricingTitle, setPricingTitle] = useState("Escolha o Plano Ideal para o Seu Momento");
  const [finalCtaTitle, setFinalCtaTitle] = useState("Pronto para Subir o Nível do Seu Instagram?");
  const [finalCtaSubtitle, setFinalCtaSubtitle] = useState("Junte-se aos criadores que transformaram métricas em crescimento real.");
  const [finalCtaButtonText, setFinalCtaButtonText] = useState("Criar Minha Conta Grátis");

  // 8. FOOTER
  const [footerCopyText, setFooterCopyText] = useState("© 2026 UP Ideias. Todos os direitos reservados.");
  const [footerContactEmail, setFooterContactEmail] = useState("contato@upideias.com");
  const [socialInstagram, setSocialInstagram] = useState("@upideias.oficial");
  const [socialYoutube, setSocialYoutube] = useState("UP Ideias TV");

  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    const data = getStoredLandingData();
    setHeroTagline(data.heroTagline);
    setHeroTitle1(data.heroTitle1);
    setHeroTitle2(data.heroTitle2);
    setHeroTitle3(data.heroTitle3);
    setHeroSubtitle(data.heroSubtitle);
    setPrimaryCtaText(data.primaryCtaText);
    setSecondaryCtaText(data.secondaryCtaText);
    setHeroVideoUrl(data.heroVideoUrl);
    if (data.heroStats) setHeroStats(data.heroStats);

    setWorldBadge(data.worldBadge);
    setWorldTitle(data.worldTitle);
    setWorldSubtitle(data.worldSubtitle);

    setAnalyticsTitle(data.analyticsTitle);
    setAnalyticsSubtitle(data.analyticsSubtitle);
    setAnalyticsImageUrl(data.analyticsImageUrl);

    setMarqueeWords(data.marqueeWords);

    setCreatorTitle(data.creatorTitle);
    setCreatorSubtitle(data.creatorSubtitle);
    setCreatorVideoUrl(data.creatorVideoUrl);

    setCycleSteps(data.cycleSteps);

    setPricingTitle(data.pricingTitle);
    setFinalCtaTitle(data.finalCtaTitle);
    setFinalCtaButtonText(data.finalCtaButtonText);

    setFooterCopyText(data.footerCopyText);
    setFooterContactEmail(data.footerContactEmail);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const fullData: LandingData = {
      heroTagline,
      heroTitle1,
      heroTitle2,
      heroTitle3,
      heroSubtitle,
      primaryCtaText,
      secondaryCtaText,
      heroVideoUrl,
      heroStats,
      worldBadge,
      worldTitle,
      worldSubtitle,
      analyticsTitle,
      analyticsSubtitle,
      analyticsImageUrl,
      marqueeWords,
      creatorTitle,
      creatorSubtitle,
      creatorVideoUrl,
      cycleSteps,
      pricingTitle,
      finalCtaTitle,
      finalCtaButtonText,
      footerCopyText,
      footerContactEmail
    };

    saveLandingData(fullData);
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMarqueeWord = () => {
    if (!newMarqueeWord.trim()) return;
    setMarqueeWords([...marqueeWords, newMarqueeWord.trim().toUpperCase()]);
    setNewMarqueeWord("");
  };

  const handleRemoveMarqueeWord = (index: number) => {
    setMarqueeWords(marqueeWords.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto animate-fadeIn text-upLightGray">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
            <Settings className="w-8 h-8 text-upPink" />
            Configurações & Editor da Marca
          </h1>
          <p className="text-sm text-upGray mt-1">
            Controle total de cada campo, texto e mídia da Landing Page (do Nav ao Rodapé) com prévia ao vivo.
          </p>
        </div>

        {/* Tab Switcher & Preview Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              showLivePreview
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-upDark text-upGray border-upBorder"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{showLivePreview ? "Prévia Ao Vivo Ativa" : "Ativar Prévia"}</span>
          </button>

          <div className="flex items-center gap-1 bg-[#0e0e14] p-1.5 rounded-2xl border border-upBorder/60 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("landing")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "landing"
                  ? "bg-upPink text-white shadow-[0_0_15px_rgba(255,83,104,0.3)]"
                  : "text-upGray hover:text-white"
              }`}
            >
              Editor Landing Page
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("system")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "system"
                  ? "bg-upPink text-white shadow-[0_0_15px_rgba(255,83,104,0.3)]"
                  : "text-upGray hover:text-white"
              }`}
            >
              Geral do Sistema
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* TAB 1: EDITOR DA LANDING PAGE */}
        {activeTab === "landing" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Sub-navegação pelas 8 Seções */}
            <div className="flex items-center gap-2 bg-[#0e0e14] p-2 rounded-2xl border border-upBorder/60 overflow-x-auto">
              {[
                { id: "hero", label: "1. Header Nav & Hero" },
                { id: "world", label: "2. Mundo UP (3 Painéis)" },
                { id: "analytics", label: "3. Métricas & Bullets" },
                { id: "marquee", label: "4. Esteira Marquee" },
                { id: "creator", label: "5. UP Creator & Trilhas" },
                { id: "cycle", label: "6. Ciclo de Crescimento" },
                { id: "pricing", label: "7. Planos & CTA Final" },
                { id: "footer", label: "8. Rodapé & Redes Sociais" }
              ].map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveLandingSection(sec.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activeLandingSection === sec.id
                      ? "bg-upPink/20 text-upPink border border-upPink/40 shadow-sm"
                      : "text-upGray hover:text-white hover:bg-upDark/50"
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            {/* SEÇÃO 1: HEADER NAV & HERO */}
            {activeLandingSection === "hero" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                <div className="space-y-4">
                  {/* Header Nav Links */}
                  <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 shadow-xl space-y-3">
                    <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-2">
                      <Globe className="w-4 h-4 text-upPink" /> Header Nav Superior
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-upGray mb-1 block">Botão Entrar</label>
                        <input
                          type="text"
                          value={navLoginText}
                          onChange={(e) => setNavLoginText(e.target.value)}
                          className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-upGray mb-1 block">Botão Criar Conta</label>
                        <input
                          type="text"
                          value={navRegisterText}
                          onChange={(e) => setNavRegisterText(e.target.value)}
                          className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hero Principal Form */}
                  <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 shadow-xl space-y-4">
                    <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-3">
                      <Layout className="w-4 h-4 text-upPink" /> Editar Hero Principal
                    </h2>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">Tagline Cursiva</label>
                      <input
                        type="text"
                        value={heroTagline}
                        onChange={(e) => setHeroTagline(e.target.value)}
                        className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2 text-upPink font-script text-base font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-upGray mb-1 block">Linha 1</label>
                        <input
                          type="text"
                          value={heroTitle1}
                          onChange={(e) => setHeroTitle1(e.target.value)}
                          className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2 text-xs text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-upGray mb-1 block">Linha 2</label>
                        <input
                          type="text"
                          value={heroTitle2}
                          onChange={(e) => setHeroTitle2(e.target.value)}
                          className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2 text-xs text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-upGray mb-1 block">Linha 3 (Rosa)</label>
                        <input
                          type="text"
                          value={heroTitle3}
                          onChange={(e) => setHeroTitle3(e.target.value)}
                          className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2 text-xs text-upPink font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">Subtítulo</label>
                      <textarea
                        rows={2}
                        value={heroSubtitle}
                        onChange={(e) => setHeroSubtitle(e.target.value)}
                        className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2 text-xs text-white resize-none"
                      />
                    </div>

                    {/* Faixa de 4 Estatísticas / Métricas */}
                    <div className="space-y-2 border-t border-upBorder/40 pt-3">
                      <label className="text-[11px] font-bold uppercase text-upGray block">Faixa de 4 Métricas do Hero</label>
                      <div className="grid grid-cols-2 gap-2">
                        {heroStats.map((stat, idx) => (
                          <div key={idx} className="bg-upDark/60 p-2.5 rounded-xl border border-upBorder/40 space-y-1">
                            <input
                              type="text"
                              value={stat.value}
                              onChange={(e) => {
                                const updated = [...heroStats];
                                updated[idx].value = e.target.value;
                                setHeroStats(updated);
                              }}
                              className="w-full bg-upDark border border-upBorder/80 rounded-lg px-2 py-1 text-xs text-upPink font-extrabold"
                            />
                            <input
                              type="text"
                              value={stat.label}
                              onChange={(e) => {
                                const updated = [...heroStats];
                                updated[idx].label = e.target.value;
                                setHeroStats(updated);
                              }}
                              className="w-full bg-upDark border border-upBorder/80 rounded-lg px-2 py-1 text-[10px] text-upGray"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">Vídeo de Fundo MP4</label>
                      <div className="border-2 border-dashed border-upBorder/80 p-4 rounded-2xl bg-upDark/40 text-center relative group">
                        <Upload className="w-6 h-6 text-upPink mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-white">Arraste ou selecione o vídeo MP4</p>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileUpload(e, setHeroVideoUrl)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prévia Hero */}
                {showLivePreview && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20 inline-flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Prévia em Tempo Real (Header & Hero)
                    </span>
                    <div className="bg-upBlack border border-upBorder rounded-3xl p-6 relative overflow-hidden min-h-[420px] flex flex-col justify-between shadow-2xl">
                      <video autoPlay loop muted src={heroVideoUrl} className="absolute inset-0 w-full h-full object-cover opacity-20" />
                      <div className="absolute inset-0 bg-gradient-to-r from-upBlack via-upBlack/80 to-transparent" />

                      {/* Header bar preview */}
                      <div className="relative z-10 flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="font-script text-white text-xl">up ideias</span>
                        <div className="flex gap-2 text-[10px]">
                          <span className="text-upGray">{navLoginText}</span>
                          <span className="bg-upPink text-white px-2.5 py-0.5 rounded-full font-bold">{navRegisterText}</span>
                        </div>
                      </div>

                      <div className="relative z-10 space-y-3 py-4">
                        <p className="font-script text-upPink text-2xl">{heroTagline}</p>
                        <h2 className="font-extrabold text-white text-3xl leading-none">
                          <span className="block">{heroTitle1}</span>
                          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-upGray">{heroTitle2}</span>
                          <span className="text-upPink flex items-center gap-2">
                            {heroTitle3} <Rocket className="w-6 h-6 text-upPink inline" />
                          </span>
                        </h2>
                        <p className="text-xs text-upLightGray/80 max-w-sm">{heroSubtitle}</p>
                      </div>

                      {/* Stats strip preview */}
                      <div className="relative z-10 grid grid-cols-4 gap-1 bg-white/5 p-2 rounded-xl border border-white/10 text-center">
                        {heroStats.map((s, i) => (
                          <div key={i}>
                            <p className="text-[10px] font-black text-upPink">{s.value}</p>
                            <p className="text-[8px] text-upGray truncate">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 2: MUNDO UP (3 PAINÉIS DA SEÇÃO HORIZONTAL) */}
            {activeLandingSection === "world" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                <div className="space-y-4">
                  {/* Painel 1: O Problema */}
                  <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 shadow-xl space-y-3">
                    <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-2">
                      <Globe className="w-4 h-4 text-upPink" /> Painel 1: O Problema
                    </h2>
                    <input
                      type="text"
                      value={panel1Title1}
                      onChange={(e) => setPanel1Title1(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                    />
                    <input
                      type="text"
                      value={panel1Title2}
                      onChange={(e) => setPanel1Title2(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                    />
                    <input
                      type="text"
                      value={panel1Title3}
                      onChange={(e) => setPanel1Title3(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-1.5 text-xs text-upPink font-bold"
                    />
                    <textarea
                      rows={2}
                      value={panel1Subtitle}
                      onChange={(e) => setPanel1Subtitle(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-1.5 text-xs text-upGray resize-none"
                    />
                  </div>

                  {/* Painel 2: UP Analytics */}
                  <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 shadow-xl space-y-3">
                    <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" /> Painel 2: UP Analytics
                    </h2>
                    <input
                      type="text"
                      value={panel2Title}
                      onChange={(e) => setPanel2Title(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                    />
                    <textarea
                      rows={2}
                      value={panel2Subtitle}
                      onChange={(e) => setPanel2Subtitle(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-1.5 text-xs text-upGray resize-none"
                    />
                  </div>
                </div>

                {/* Prévia Mundo UP */}
                {showLivePreview && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-upPink bg-upPink/10 px-3 py-1 rounded-md border border-upPink/20 inline-flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Prévia em Tempo Real (Mundo UP)
                    </span>
                    <div className="bg-[#0b0b0f] border border-upBorder rounded-3xl p-6 space-y-4 shadow-2xl flex flex-col justify-center min-h-[340px]">
                      <span className="text-xs font-black text-upPink uppercase tracking-widest">{panel1Badge}</span>
                      <h3 className="text-2xl font-black text-white leading-tight">
                        {panel1Title1} <br />
                        {panel1Title2} <br />
                        <span className="text-upPink">{panel1Title3}</span>
                      </h3>
                      <p className="text-xs text-upGray">{panel1Subtitle}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 3: ANALYTICS SHOWCASE & BULLETS */}
            {activeLandingSection === "analytics" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 shadow-xl space-y-4">
                  <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-3">
                    <ImageIcon className="w-4 h-4 text-purple-400" /> Editar Seção de Métricas & Bullets
                  </h2>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">Título</label>
                    <input
                      type="text"
                      value={analyticsTitle}
                      onChange={(e) => setAnalyticsTitle(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2 text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">Descrição</label>
                    <textarea
                      rows={2}
                      value={analyticsSubtitle}
                      onChange={(e) => setAnalyticsSubtitle(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2 text-xs text-white resize-none"
                    />
                  </div>

                  {/* 3 Bullets */}
                  <div className="space-y-2 border-t border-upBorder/40 pt-3">
                    <label className="text-[11px] font-bold uppercase text-upGray block">3 Bullets de Destaque</label>
                    {analyticsHighlights.map((b, idx) => (
                      <div key={idx} className="bg-upDark/60 p-2.5 rounded-xl border border-upBorder/40 space-y-1">
                        <input
                          type="text"
                          value={b.title}
                          onChange={(e) => {
                            const updated = [...analyticsHighlights];
                            updated[idx].title = e.target.value;
                            setAnalyticsHighlights(updated);
                          }}
                          className="w-full bg-upDark border border-upBorder/80 rounded-lg px-2 py-1 text-xs text-white font-bold"
                        />
                        <input
                          type="text"
                          value={b.desc}
                          onChange={(e) => {
                            const updated = [...analyticsHighlights];
                            updated[idx].desc = e.target.value;
                            setAnalyticsHighlights(updated);
                          }}
                          className="w-full bg-upDark border border-upBorder/80 rounded-lg px-2 py-1 text-[10px] text-upGray"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">Upload de Imagem</label>
                    <div className="border-2 border-dashed border-upBorder/80 p-4 rounded-2xl bg-upDark/40 text-center relative group">
                      <Upload className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                      <p className="text-[10px] font-bold text-white">Arraste ou selecione a imagem do painel</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setAnalyticsImageUrl)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* PRÉVIA AO VIVO ANALYTICS */}
                {showLivePreview && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-md border border-purple-500/20 inline-flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Prévia em Tempo Real (Analytics & Bullets)
                    </span>
                    <div className="bg-[#0b0b0f] border border-upBorder rounded-3xl p-6 space-y-4 shadow-2xl">
                      <h3 className="text-lg font-bold text-white">{analyticsTitle}</h3>
                      <p className="text-xs text-upGray">{analyticsSubtitle}</p>
                      <div className="rounded-2xl overflow-hidden border border-upBorder/60 shadow-lg max-h-40">
                        <img src={analyticsImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1.5 pt-2">
                        {analyticsHighlights.map((h, i) => (
                          <div key={i} className="text-xs text-white flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-upPink shrink-0" />
                            <span><strong>{h.title}:</strong> {h.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 4: GIANT MARQUEE */}
            {activeLandingSection === "marquee" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-upBorder/40 pb-3">
                    <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" /> Editar Esteira Marquee
                    </h2>
                    <span className="text-[10px] text-upGray font-extrabold uppercase">
                      {marqueeWords.length} Palavras
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nova Palavra"
                      value={newMarqueeWord}
                      onChange={(e) => setNewMarqueeWord(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2 text-xs text-white uppercase font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleAddMarqueeWord}
                      className="px-4 py-2 bg-upPink text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {marqueeWords.map((w, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-upDark rounded-xl text-xs font-extrabold text-white">
                        <span>{w}</span>
                        <button type="button" onClick={() => handleRemoveMarqueeWord(idx)} className="text-upGray hover:text-rose-400 cursor-pointer">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PRÉVIA AO VIVO MARQUEE */}
                {showLivePreview && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20 inline-flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Prévia em Tempo Real (Esteira)
                    </span>
                    <div className="bg-upBlack border border-upBorder rounded-3xl p-6 overflow-hidden shadow-2xl flex items-center min-h-[140px]">
                      <div className="flex items-center gap-4 animate-pulse overflow-x-auto whitespace-nowrap">
                        {marqueeWords.map((w, i) => (
                          <span key={i} className={`text-xl font-black ${i % 2 === 0 ? "text-white" : "text-upPink"}`}>
                            {w} •
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 5: UP CREATOR */}
            {activeLandingSection === "creator" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 shadow-xl space-y-4">
                  <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-3">
                    <Award className="w-4 h-4 text-upPink" /> Editar Seção UP Creator & Cursos
                  </h2>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">Título Principal</label>
                    <input
                      type="text"
                      value={creatorTitle}
                      onChange={(e) => setCreatorTitle(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2 text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">Descrição do Catálogo</label>
                    <textarea
                      rows={2}
                      value={creatorSubtitle}
                      onChange={(e) => setCreatorSubtitle(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2 text-xs text-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">Upload de Vídeo (Trailer/Preview)</label>
                    <div className="border-2 border-dashed border-upBorder/80 p-4 rounded-2xl bg-upDark/40 text-center relative group">
                      <Video className="w-6 h-6 text-upPink mx-auto mb-1" />
                      <p className="text-[10px] font-bold text-white">Arraste ou envie o vídeo promocional MP4</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, setCreatorVideoUrl)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Prévia UP Creator */}
                {showLivePreview && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-upPink bg-upPink/10 px-3 py-1 rounded-md border border-upPink/20 inline-flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Prévia em Tempo Real (UP Creator)
                    </span>
                    <div className="bg-[#0b0b0f] border border-upBorder rounded-3xl p-6 space-y-3 shadow-2xl">
                      <h3 className="text-lg font-bold text-white">{creatorTitle}</h3>
                      <p className="text-xs text-upGray">{creatorSubtitle}</p>
                      <div className="rounded-2xl overflow-hidden border border-upBorder/60 relative h-40">
                        <video autoPlay loop muted src={creatorVideoUrl} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 6: CICLO DE CRESCIMENTO */}
            {activeLandingSection === "cycle" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 shadow-xl space-y-4">
                  <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-3">
                    <Layers className="w-4 h-4 text-blue-400" /> Editar os 4 Passos do Ciclo
                  </h2>

                  <div className="grid grid-cols-1 gap-3">
                    {cycleSteps.map((step, idx) => (
                      <div key={idx} className="bg-upDark/60 p-3 rounded-2xl border border-upBorder/40 space-y-1.5">
                        <span className="text-[10px] font-black text-upPink">PASSO {step.step}</span>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const updated = [...cycleSteps];
                            updated[idx].title = e.target.value;
                            setCycleSteps(updated);
                          }}
                          className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                        />
                        <textarea
                          rows={2}
                          value={step.desc}
                          onChange={(e) => {
                            const updated = [...cycleSteps];
                            updated[idx].desc = e.target.value;
                            setCycleSteps(updated);
                          }}
                          className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-1.5 text-xs text-upLightGray resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prévia Ciclo */}
                {showLivePreview && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/20 inline-flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Prévia em Tempo Real (Ciclo)
                    </span>
                    <div className="bg-[#0b0b0f] border border-upBorder rounded-3xl p-6 space-y-3 shadow-2xl">
                      <h3 className="text-base font-bold text-white border-b border-upBorder/40 pb-2">Ciclo Contínuo de Evolução</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {cycleSteps.map((s, i) => (
                          <div key={i} className="p-3 bg-upDark rounded-xl border border-upBorder/40 space-y-1">
                            <span className="text-[9px] font-black text-upPink">PASSO {s.step}</span>
                            <p className="text-xs font-bold text-white">{s.title}</p>
                            <p className="text-[10px] text-upGray line-clamp-2">{s.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 7: PLANOS & CTA FINAL */}
            {activeLandingSection === "pricing" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 shadow-xl space-y-4">
                  <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-3">
                    <CreditCard className="w-4 h-4 text-emerald-400" /> Editar Títulos de Planos & CTA Final
                  </h2>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">Título da Seção de Preços</label>
                    <input
                      type="text"
                      value={pricingTitle}
                      onChange={(e) => setPricingTitle(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2 text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">Título da Chamada Final (CTA)</label>
                    <input
                      type="text"
                      value={finalCtaTitle}
                      onChange={(e) => setFinalCtaTitle(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2 text-xs text-white font-extrabold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">Subtítulo da Chamada Final</label>
                    <textarea
                      rows={2}
                      value={finalCtaSubtitle}
                      onChange={(e) => setFinalCtaSubtitle(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2 text-xs text-upGray resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">Texto do Botão Final</label>
                    <input
                      type="text"
                      value={finalCtaButtonText}
                      onChange={(e) => setFinalCtaButtonText(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2 text-xs text-white font-bold"
                    />
                  </div>
                </div>

                {/* Prévia Planos & CTA */}
                {showLivePreview && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20 inline-flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Prévia em Tempo Real (Planos & CTA)
                    </span>
                    <div className="bg-[#0b0b0f] border border-upBorder rounded-3xl p-6 space-y-4 shadow-2xl text-center">
                      <h3 className="text-base font-bold text-white">{pricingTitle}</h3>
                      <div className="p-4 bg-upPink/10 border border-upPink/30 rounded-2xl space-y-2">
                        <h4 className="text-lg font-black text-white">{finalCtaTitle}</h4>
                        <p className="text-xs text-upGray">{finalCtaSubtitle}</p>
                        <span className="px-5 py-2 bg-upPink text-white rounded-full text-xs font-bold inline-block shadow-md">
                          {finalCtaButtonText}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 8: RODAPÉ & REDES SOCIAIS */}
            {activeLandingSection === "footer" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 shadow-xl space-y-4">
                  <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-3">
                    <Compass className="w-4 h-4 text-upPink" /> Editar Rodapé (Footer) & Redes Sociais
                  </h2>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">Copyright</label>
                    <input
                      type="text"
                      value={footerCopyText}
                      onChange={(e) => setFooterCopyText(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-upGray mb-1 block">E-mail de Contato Exibido</label>
                    <input
                      type="email"
                      value={footerContactEmail}
                      onChange={(e) => setFooterContactEmail(e.target.value)}
                      className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-upBorder/40 pt-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-upGray mb-1 flex items-center gap-1">
                        <Instagram className="w-3 h-3 text-upPink" /> Instagram
                      </label>
                      <input
                        type="text"
                        value={socialInstagram}
                        onChange={(e) => setSocialInstagram(e.target.value)}
                        className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-upGray mb-1 flex items-center gap-1">
                        <Youtube className="w-3 h-3 text-red-400" /> YouTube
                      </label>
                      <input
                        type="text"
                        value={socialYoutube}
                        onChange={(e) => setSocialYoutube(e.target.value)}
                        className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Prévia Rodapé */}
                {showLivePreview && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-upPink bg-upPink/10 px-3 py-1 rounded-md border border-upPink/20 inline-flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Prévia em Tempo Real (Rodapé)
                    </span>
                    <div className="bg-upBlack border border-upBorder rounded-3xl p-6 shadow-2xl flex flex-col justify-center gap-3 min-h-[200px] text-center">
                      <p className="text-xs font-bold text-white">{footerCopyText}</p>
                      <p className="text-xs text-upPink font-mono">{footerContactEmail}</p>
                      <div className="flex justify-center gap-3 text-xs text-upGray">
                        <span>{socialInstagram}</span>
                        <span>•</span>
                        <span>{socialYoutube}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONFIGURAÇÕES GERAIS DO SISTEMA */}
        {activeTab === "system" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-3">
                <Globe className="w-4 h-4 text-upPink" /> Dados Globais da Marca
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                    Nome da Plataforma
                  </label>
                  <input
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                    E-mail Oficial de Suporte
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider flex items-center gap-2 border-b border-upBorder/40 pb-3">
                <Server className="w-4 h-4 text-amber-400" /> Configuração do Servidor de IA
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                    Modelo Padrão da IA
                  </label>
                  <select
                    value={aiModelDefault}
                    onChange={(e) => setAiModelDefault(e.target.value)}
                    className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-upPink transition"
                  >
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recomendado)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Rápido)</option>
                    <option value="gpt-4o">GPT-4o</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                    Chave da Instância de WhatsApp
                  </label>
                  <input
                    type="text"
                    value={whatsappInstanceKey}
                    onChange={(e) => setWhatsappInstanceKey(e.target.value)}
                    className="w-full bg-upDark border border-upBorder/80 rounded-2xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-upPink transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botão de Salvar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3.5 bg-upPink hover:bg-upPink/90 text-white rounded-2xl text-xs font-extrabold shadow-[0_0_20px_rgba(255,83,104,0.3)] transition flex items-center gap-2 cursor-pointer"
          >
            {savedStatus ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{savedStatus ? "Alterações Salvas com Sucesso!" : "Salvar Configurações da Página"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
