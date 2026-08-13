"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Eye,
  Users,
  Percent,
  CheckCircle,
  AlertTriangle,
  Brain,
  ArrowUpRight,
  Sparkles,
  DollarSign,
  MousePointerClick,
  RefreshCw,
  Facebook,
  Instagram,
  Layers,
  Upload,
  Image as ImageIcon,
  Info
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { 
  getInstagramAccounts, 
  getDashboardMetrics, 
  getInstagramPosts,
  mockSyncInstagramMetrics
} from "@up-analytics/lib";

import { MetricCardPremium } from "../../../components/ui/MetricCardPremium";
import { PhoneMockupPreview } from "../../../components/ui/PhoneMockupPreview";
import { cn } from "../../../utils/cn";
import { ExportButton } from "../../../components/ui/ExportButton";
import { DashboardSkeleton } from "../../../components/ui/SkeletonLoader";

import { OnboardingConnectModal } from "../../../components/common/OnboardingConnectModal";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [period, setPeriod] = useState("24h");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [postImages, setPostImages] = useState<Record<string, string>>({});
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Real data state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [metrics, setMetrics] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const loadAccountData = async (accId: string) => {
    const fetchedMetrics = await getDashboardMetrics(accId);
    const fetchedPosts = await getInstagramPosts(accId);
    setMetrics(fetchedMetrics);
    setPosts(fetchedPosts);
    if (fetchedPosts.length > 0) {
      setSelectedPost(fetchedPosts[0]);
    }
  };

  // Fetch real data on mount
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const fetchedAccounts = await getInstagramAccounts();
      setAccounts(fetchedAccounts);

      if (fetchedAccounts.length > 0) {
        const activeId = selectedAccountId && fetchedAccounts.some((a) => a.id === selectedAccountId)
          ? selectedAccountId
          : fetchedAccounts[0].id;
        setSelectedAccountId(activeId);
        await loadAccountData(activeId);
      } else {
        if (typeof window !== "undefined" && !localStorage.getItem("up_onboarding_completed")) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAccountChange = async (accId: string) => {
    setSelectedAccountId(accId);
    setLoading(true);
    await loadAccountData(accId);
    setLoading(false);
  };

  const handleSync = async () => {
    const targetAcc = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
    if (!targetAcc) return;

    const extAccountId = targetAcc.external_account_id || targetAcc.id;
    setSyncing(true);

    try {
      // 1. Call sync-account route to fetch fresh live data from Phyllo API
      await fetch("/api/integrations/phyllo/sync-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: extAccountId, forceRefresh: true }),
      });

      // 2. Reload account data in memory
      await loadDashboardData();
    } catch (e) {
      console.warn("[Dashboard] Sync error:", e);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const displayMetrics = metrics;
  const displayPosts = posts;

  // Filtragem dinâmica de métricas com base no período (24h, 7D, 15D, 30D)
  const filteredMetrics = (period === "24h" || period === "Hoje")
    ? displayMetrics.slice(-1)
    : period === "7D" 
    ? displayMetrics.slice(-7) 
    : period === "15D" 
    ? displayMetrics.slice(-15) 
    : displayMetrics;

  const totalPeriodReach = filteredMetrics.reduce((sum, m) => sum + (m.reach || 0), 0);

  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const previewPost = selectedPost || displayPosts[0] || null;

  // Combined Chart Data (Instagram Organic Reach vs Facebook Ads Paid Reach)
  const chartData = filteredMetrics.map((m) => {
    return {
      name: m.metric_date,
      organicReach: m.reach || 0,
      paidReach: m.paid_reach || 0,
    };
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Title Header with Sync Indicator & Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-upBorder/40 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite">Visão Geral UP Ideias</h1>
            <div className="relative group inline-flex items-center">
              <button
                onClick={handleSync}
                disabled={syncing}
                title="Clique para sincronizar os dados com a API oficial da rede social"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-upPink/10 hover:bg-upPink/20 text-upPink transition-all border border-upPink/30 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Atualizando..." : "Atualizar dados"}
              </button>
              <div className="ml-2 p-1 rounded-full bg-upCard hover:bg-upBorder/80 text-upGray hover:text-white cursor-help transition-all relative">
                <Info className="w-3.5 h-3.5" />
                <div className="absolute left-0 sm:left-auto sm:right-0 top-7 w-72 p-3 rounded-xl bg-upDark/95 backdrop-blur-md border border-upBorder/80 text-[11px] text-upLightGray font-medium shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 leading-relaxed">
                  ℹ️ Os dados de reputação (seguidores/seguindo) são sincronizados em ciclos automáticos a cada 24 horas pela API da rede social.
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-upGray mt-1">Análise unificada de performance orgânica (Instagram) e tráfego pago (Facebook Ads).</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de Conta Social */}
          {accounts.length > 0 && (
            <div className="flex items-center gap-2 bg-upCard px-3 py-1.5 rounded-xl border border-upBorder/80 shadow-sm">
              <Instagram className="w-4 h-4 text-upPink shrink-0" />
              <select
                value={selectedAccountId}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-upDark text-white">
                    @{acc.username || acc.account_name || "Perfil Conectado"}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="inline-flex bg-upCard rounded-xl p-1 border border-upBorder">
            {["24h", "7D", "15D", "30D"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  period === p ? "bg-upPink text-upWhite shadow-md" : "text-upGray hover:text-upWhite"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <ExportButton />
        </div>
      </div>

      {/* Profile Overview Banner Card when account is active */}
      {activeAccount && (
        <div className="bg-gradient-to-r from-upCard via-upCard/80 to-purple-900/10 border border-upBorder/80 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2.5px] shrink-0 shadow-md">
              {activeAccount.profile_picture_url ? (
                <img src={activeAccount.profile_picture_url} alt={activeAccount.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold text-white text-base">
                  {(activeAccount.username || "IG").substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">@{activeAccount.username || "perfil"}</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CONECTADO
                </span>
              </div>
              <p className="text-xs font-semibold text-white mt-0.5">{activeAccount.account_name || activeAccount.name || "Perfil Profissional no Instagram"}</p>
              {activeAccount.bio && (
                <p className="text-[11px] text-upLightGray mt-1.5 whitespace-pre-line leading-relaxed max-w-xl bg-upDark/40 px-3 py-2 rounded-xl border border-upBorder/40 shadow-inner">
                  {activeAccount.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-upDark/60 border border-upBorder/60 rounded-xl px-3 py-2 text-center min-w-[100px]">
              <p className="text-[10px] text-upGray font-semibold uppercase">Seguidores</p>
              <p className="text-sm font-extrabold text-white mt-0.5">{(activeAccount.followers_count || 0).toLocaleString("pt-BR")}</p>
            </div>
            <div className="bg-upDark/60 border border-upBorder/60 rounded-xl px-3 py-2 text-center min-w-[100px]">
              <p className="text-[10px] text-upGray font-semibold uppercase">Seguindo</p>
              <p className="text-sm font-extrabold text-white mt-0.5">{(activeAccount.following_count || 0).toLocaleString("pt-BR")}</p>
            </div>
            <div className="bg-upDark/60 border border-upBorder/60 rounded-xl px-3 py-2 text-center min-w-[100px]">
              <p className="text-[10px] text-upGray font-semibold uppercase">Publicações</p>
              <p className="text-sm font-extrabold text-white mt-0.5">{(activeAccount.media_count || posts.length || 0).toLocaleString("pt-BR")}</p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Bento Grid com Filtragem Reativa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Instagram KPIs */}
        <MetricCardPremium
          name="Engajamento Médio"
          value="4,8%"
          change="+1,2%"
          icon={TrendingUp}
          status="up"
          type="instagram"
        />
        <MetricCardPremium
          name="Alcance do Perfil"
          value={totalPeriodReach > 0 ? totalPeriodReach.toLocaleString("pt-BR") : (filteredMetrics[filteredMetrics.length - 1]?.reach || 0).toLocaleString("pt-BR")}
          change={activeAccount?.reach_growth_rate ? `${activeAccount.reach_growth_rate >= 0 ? "+" : ""}${activeAccount.reach_growth_rate.toFixed(1)}%` : "+0,0%"}
          icon={Eye}
          status={totalPeriodReach > 0 ? "up" : "neutral"}
          type="instagram"
        />

        {/* Facebook Ads KPIs */}
        <MetricCardPremium
          name="Investimento (Ads)"
          value={`R$ ${(accounts[0]?.ad_spend || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          change="+0,0%"
          icon={DollarSign}
          status="neutral"
          type="facebook"
        />
        <MetricCardPremium
          name="ROAS Médio"
          value={`${(accounts[0]?.roas || 0).toFixed(2)}x`}
          change="+0,0%"
          icon={TrendingUp}
          status={(accounts[0]?.roas || 0) > 0 ? "up" : "neutral"}
          type="facebook"
        />
      </div>

      {/* Advanced Chart comparing Orgânico vs Pago */}
      <div className="bg-upCard border border-upBorder rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-upWhite uppercase tracking-wider">Tráfego de Audiência: Orgânico vs Patrocinado</h3>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-upPink"><Instagram className="w-3.5 h-3.5" /> Orgânico</span>
            <span className="flex items-center gap-1.5 text-blue-400"><Facebook className="w-3.5 h-3.5" /> Patrocinado</span>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5368" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#FF5368" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#26262D" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
              <YAxis stroke="#6B7280" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#111116", borderColor: "#26262D", borderRadius: "12px", color: "#fff" }} />
              <Area type="monotone" dataKey="organicReach" stroke="#FF5368" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOrganic)" name="Alcance Orgânico" />
              <Area type="monotone" dataKey="paidReach" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPaid)" name="Alcance Pago (Ads)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Section: Interactive Posts Feed and Live Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left/Middle: Post & Ads List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Diagnostic Panel */}
          <div className="bg-upCard border border-upBorder rounded-2xl p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-upPink" />
                <h3 className="text-sm font-bold text-upWhite uppercase tracking-wider">Diagnóstico de Inteligência Artificial</h3>
              </div>
              <p className="text-sm text-upGray leading-relaxed">
                Analisando os dados integrados da VPS, identificamos que campanhas de tráfego pago direcionadas a criativos de **Reels curtos** obtiveram um CTR 32% acima da média. Recomendamos impulsionar a publicação selecionada com orçamento diário otimizado.
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-upDark border border-upBorder/60 flex justify-between items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-upWhite">Ideia estratégica recomendada</span>
                  <span className="text-[11px] text-upGray">Replicar o gancho do criativo mais curtido e investir R$ 50/dia</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-upPink hover:bg-upPinkDark text-upWhite rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                Aplicar Dica <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-upCard border border-upBorder rounded-2xl p-6">
            <h3 className="text-sm font-bold text-upWhite uppercase tracking-wider mb-6">Desempenho de Publicações & Anúncios</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-upGray">
                <thead>
                  <tr className="border-b border-upBorder/60 text-[10px] font-bold uppercase text-upLightGray">
                    <th className="pb-3">Publicação / Criativo</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3 text-center">Alcance</th>
                    <th className="pb-3 text-center">Cliques / Likes</th>
                    <th className="pb-3 text-center">Engajamento</th>
                    <th className="pb-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {displayPosts.map((post) => (
                    <tr 
                      key={post.id} 
                      onClick={() => setSelectedPost(post)}
                      className={cn(
                        "border-b border-upBorder/40 hover:bg-upDark/50 transition-colors cursor-pointer",
                        previewPost?.id === post.id && "bg-upDark/70 border-l-2 border-l-upPink"
                      )}
                    >
                      <td className="py-4 font-semibold text-upWhite max-w-[200px] truncate pl-2">{post.caption}</td>
                      <td className="py-4 text-xs font-bold">{post.media_product_type || "ADS"}</td>
                      <td className="py-4 text-center">{post.reach ? post.reach.toLocaleString("pt-BR") : "0"}</td>
                      <td className="py-4 text-center">{post.like_count ? post.like_count.toLocaleString("pt-BR") : "0"}</td>
                      <td className="py-4 text-center text-green-400 font-bold">{post.engagement || "0.0%"}</td>
                      <td className="py-4 text-right">
                        <button className="text-xs text-upPink hover:underline font-bold bg-transparent border-none cursor-pointer">
                          Ver no Celular
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

          {/* Right Side: Live iPhone Mockup Preview */}
        <div className="flex flex-col gap-3 items-center">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-xs font-extrabold text-upWhite uppercase tracking-widest">
              Simulador de Postagem (Live)
            </h3>
            
            {/* Botão para Upload/Alteração de Foto */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-upPink/15 hover:bg-upPink/25 border border-upPink/30 text-upPink rounded-xl text-xs font-bold cursor-pointer transition">
              <Upload className="w-3.5 h-3.5" />
              <span>Alterar Foto</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && previewPost?.id) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPostImages((prev) => ({
                        ...prev,
                        [previewPost.id]: reader.result as string
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          <PhoneMockupPreview
            username={accounts[0]?.username ? accounts[0].username : "creator_upideias"}
            profilePictureUrl={accounts[0]?.profile_picture_url || undefined}
            caption={previewPost?.caption || "Seu perfil conectado no UP Analytics está pronto para receber publicações estratégicas."}
            reach={previewPost?.reach ? previewPost.reach.toLocaleString("pt-BR") : "0"}
            likes={previewPost?.like_count ? previewPost.like_count.toLocaleString("pt-BR") : "0"}
            comments={previewPost?.comments_count ? previewPost.comments_count.toString() : "0"}
            engagement={previewPost?.engagement || "0.0%"}
            type={previewPost?.media_product_type || "REELS"}
            imageUrl={previewPost?.id ? postImages[previewPost.id] : undefined}
          />
        </div>
      </div>

      {/* Modal de Onboarding de Boas-Vindas e Conexão de Primeiro Acesso */}
      <OnboardingConnectModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
}
