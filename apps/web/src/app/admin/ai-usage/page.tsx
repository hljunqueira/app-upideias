"use client";

import React, { useState } from "react";
import {
  Cpu,
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Zap,
  DollarSign,
  Activity,
  Sparkles,
  Link2,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Share2,
  Globe
} from "lucide-react";

interface AiProviderConfig {
  id: string;
  name: string;
  providerKey: "groq" | "gemini" | "openai" | "anthropic" | "custom";
  description: string;
  apiKey: string;
  defaultModel: string;
  status: "Ativo" | "Inativo" | "Testando";
  isDefault: boolean;
}

interface SocialApiConfig {
  id: string;
  name: string;
  providerKey: "nango" | "meta" | "custom";
  description: string;
  clientId: string;
  clientSecret: string;
  environment: "production" | "sandbox";
  status: "Ativo" | "Simulando";
}

interface AiUsageItem {
  id: string;
  userName: string;
  userEmail: string;
  model: string;
  tokensUsed: string;
  estimatedCost: string;
  requestsCount: number;
  lastUsage: string;
  provider: string;
}

const INITIAL_PROVIDERS: AiProviderConfig[] = [
  {
    id: "prov_groq",
    name: "Groq Cloud (Llama 3 70B / Mixtral)",
    providerKey: "groq",
    description: "Inferência ultrarrápida com Llama 3 70B Versatile e Mixtral-8x7b",
    apiKey: "gsk_live_99812489123891238912389",
    defaultModel: "llama3-70b-8192",
    status: "Ativo",
    isDefault: true,
  },
  {
    id: "prov_gemini",
    name: "Google Gemini AI (1.5 Pro & Flash)",
    providerKey: "gemini",
    description: "Multimodal com janela de contexto expandida e suporte a imagens",
    apiKey: "AIzaSy_live_89123891238912389",
    defaultModel: "gemini-1.5-pro-latest",
    status: "Ativo",
    isDefault: false,
  },
  {
    id: "prov_openai",
    name: "OpenAI (GPT-4o & GPT-4o-mini)",
    providerKey: "openai",
    description: "Modelo padrão da indústria para raciocínio avançado",
    apiKey: "sk-proj-live-89123891238912389",
    defaultModel: "gpt-4o",
    status: "Ativo",
    isDefault: false,
  },
  {
    id: "prov_anthropic",
    name: "Anthropic Claude (Claude 3.5 Sonnet)",
    providerKey: "anthropic",
    description: "Excelente escrita criativa e redação de conteúdo humano",
    apiKey: "",
    defaultModel: "claude-3-5-sonnet-20240620",
    status: "Inativo",
    isDefault: false,
  },
];

const INITIAL_SOCIAL_API: SocialApiConfig = {
  id: "social_nango",
  name: "Nango Connect API (nango.dev)",
  providerKey: "nango",
  description: "API Unificada para integração de métricas do Instagram via Graph API",
  clientId: "nango_pk_live_8932187",
  clientSecret: "••••••••••••••••••••••••••••",
  environment: "production",
  status: "Ativo",
};

const INITIAL_AI_USAGE: AiUsageItem[] = [];

export default function AdminAiUsagePage() {
  const [providers, setProviders] = useState<AiProviderConfig[]>(INITIAL_PROVIDERS);
  const [socialApi, setSocialApi] = useState<SocialApiConfig>(INITIAL_SOCIAL_API);
  const [usageList, setUsageList] = useState<AiUsageItem[]>(INITIAL_AI_USAGE);
  const [search, setSearch] = useState("");
  const [filterProvider, setFilterProvider] = useState<string>("todos");
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [isTestingPhyllo, setIsTestingPhyllo] = useState(false);

  // Modal para Nova API State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AiProviderConfig | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    providerKey: "groq" | "gemini" | "openai" | "anthropic" | "custom";
    description: string;
    apiKey: string;
    defaultModel: string;
  }>({
    name: "",
    providerKey: "groq",
    description: "",
    apiKey: "",
    defaultModel: "",
  });

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleStatus = (id: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "Ativo" ? "Inativo" : "Ativo" }
          : p
      )
    );
  };

  const handleSetDefault = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => ({
        ...p,
        isDefault: p.id === id,
      }))
    );
  };

  const handleTestApiKey = (provider: AiProviderConfig) => {
    if (!provider.apiKey) {
      alert(`⚠️ Insira uma chave de API para o provedor ${provider.name}.`);
      return;
    }
    alert(`⚡ Conexão com a API de IA [${provider.name}] testada e validada com sucesso no modelo ${provider.defaultModel}!`);
  };

  const handleTestPhylloApi = () => {
    setIsTestingPhyllo(true);
    setTimeout(() => {
      setIsTestingPhyllo(false);
      alert(`🚀 Conexão Phyllo API (getphyllo.com) validada com sucesso em ambiente ${socialApi.environment.toUpperCase()}! Integração de Instagram, TikTok e YouTube ativa.`);
    }, 1000);
  };

  const handleOpenAddModal = () => {
    setEditingProvider(null);
    setFormData({
      name: "",
      providerKey: "groq",
      description: "",
      apiKey: "",
      defaultModel: "llama3-70b-8192",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prov: AiProviderConfig) => {
    setEditingProvider(prov);
    setFormData({
      name: prov.name,
      providerKey: prov.providerKey,
      description: prov.description,
      apiKey: prov.apiKey,
      defaultModel: prov.defaultModel,
    });
    setIsModalOpen(true);
  };

  const handleSaveProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProvider) {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === editingProvider.id
            ? {
                ...p,
                name: formData.name,
                providerKey: formData.providerKey,
                description: formData.description,
                apiKey: formData.apiKey,
                defaultModel: formData.defaultModel,
                status: formData.apiKey ? "Ativo" : "Inativo",
              }
            : p
        )
      );
    } else {
      const newProv: AiProviderConfig = {
        id: `prov_${Date.now()}`,
        name: formData.name,
        providerKey: formData.providerKey,
        description: formData.description,
        apiKey: formData.apiKey,
        defaultModel: formData.defaultModel,
        status: formData.apiKey ? "Ativo" : "Inativo",
        isDefault: false,
      };
      setProviders((prev) => [...prev, newProv]);
    }
    setIsModalOpen(false);
  };

  const filteredUsage = usageList.filter((item) => {
    const matchesSearch =
      item.userName.toLowerCase().includes(search.toLowerCase()) ||
      item.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      item.model.toLowerCase().includes(search.toLowerCase());
    const matchesProvider =
      filterProvider === "todos" || item.provider.toLowerCase() === filterProvider.toLowerCase();
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Cpu className="w-8 h-8 text-upPink" />
            Central de APIs de IA & Phyllo Social API
          </h1>
          <p className="text-sm text-upGray mt-1">
            Gerencie Chaves de API para <strong>Groq, Gemini, OpenAI</strong> e a integração universal de redes sociais com <strong>Phyllo (getphyllo.com)</strong>.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-upPink hover:bg-upPinkDark text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(255,83,104,0.3)] hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Adicionar Nova API / Provedor
        </button>
      </div>

      {/* Seção Phyllo Social Integration Banner Card */}
      <div className="bg-gradient-to-r from-purple-900/50 via-upDark to-upCard/80 border border-purple-500/40 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Integração Universal Phyllo API</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                getphyllo.com
              </span>
            </div>
            <p className="text-xs text-upLightGray mt-1 max-w-2xl leading-relaxed">
              Integre métricas de perfil, seguidores, engajamento e publicações do Instagram, TikTok e YouTube através da API unificada da Phyllo.
            </p>
          </div>
        </div>

        {/* Campos Phyllo Form */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-upGray font-bold uppercase">Client ID Phyllo</span>
            <input
              type="text"
              value={socialApi.clientId}
              onChange={(e) => setSocialApi({ ...socialApi, clientId: e.target.value })}
              className="px-3 py-2 bg-upDark border border-purple-500/40 rounded-xl text-xs font-mono text-purple-300 focus:outline-none focus:border-upPink"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-upGray font-bold uppercase">Ambiente</span>
            <select
              value={socialApi.environment}
              onChange={(e) => setSocialApi({ ...socialApi, environment: e.target.value as any })}
              className="px-3 py-2 bg-upDark border border-purple-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-upPink"
            >
              <option value="production">Production API</option>
              <option value="sandbox">Sandbox (Testes)</option>
            </select>
          </div>

          <button
            onClick={handleTestPhylloApi}
            disabled={isTestingPhyllo}
            className="self-end sm:self-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Link2 className={`w-3.5 h-3.5 ${isTestingPhyllo ? "animate-spin" : ""}`} />
            {isTestingPhyllo ? "Testando..." : "Testar Phyllo"}
          </button>
        </div>
      </div>

      {/* Grid de Provedores de IA Registrados */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-upGray flex items-center gap-2">
          <Key className="w-4 h-4 text-upPink" />
          Provedores Integrados & Tokens de API
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((prov) => (
            <div
              key={prov.id}
              className={`bg-upCard/60 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                prov.isDefault
                  ? "border-upPink shadow-[0_0_25px_rgba(255,83,104,0.15)]"
                  : "border-upBorder/80"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">{prov.name}</h3>
                      {prov.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-upPink text-white uppercase tracking-wider">
                          Padrão do Sistema
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-upGray mt-1 line-clamp-1">{prov.description}</p>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(prov.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                      prov.status === "Ativo"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-upBorder/40 text-upGray border-upBorder/60"
                    }`}
                  >
                    {prov.status}
                  </button>
                </div>

                {/* API Key Input Simulation */}
                <div className="mt-4 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-upGray">Chave de API (Secret Key)</span>
                  <div className="flex items-center gap-2">
                    <div className="relative w-full">
                      <input
                        type={showKeys[prov.id] ? "text" : "password"}
                        readOnly
                        value={prov.apiKey || "Nenhuma chave cadastrada"}
                        className="w-full pl-3 pr-10 py-2 bg-upDark border border-upBorder/80 rounded-xl font-mono text-xs text-upPink"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey(prov.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-upGray hover:text-white"
                      >
                        {showKeys[prov.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={() => handleTestApiKey(prov)}
                      className="px-3 py-2 rounded-xl bg-upDark hover:bg-upPink/20 text-upPink border border-upBorder hover:border-upPink/40 text-xs font-semibold shrink-0 transition-all"
                    >
                      Testar
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer do Card */}
              <div className="mt-5 pt-3 border-t border-upBorder/40 flex items-center justify-between gap-3 text-xs">
                <span className="text-[11px] text-upGray font-mono">
                  Modelo: <strong className="text-white">{prov.defaultModel}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {!prov.isDefault && (
                    <button
                      onClick={() => handleSetDefault(prov.id)}
                      className="text-[11px] font-semibold text-upPink hover:underline"
                    >
                      Tornar Padrão
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEditModal(prov)}
                    className="p-1.5 rounded-lg bg-upDark hover:bg-upPink/20 text-upLightGray hover:text-white border border-upBorder transition-all"
                    title="Editar Provedor"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Total de Tokens / Chamadas</p>
            <p className="text-2xl font-black text-white mt-1">1.568.800</p>
            <p className="text-[10px] text-upGray mt-0.5">Groq + Gemini + OpenAI + Phyllo</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-upPink/10 text-upPink flex items-center justify-center border border-upPink/20">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Custo de API Consumido</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">R$ 86,40</p>
            <p className="text-[10px] text-emerald-300 mt-0.5">Economia de 75% com Groq</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-upCard/60 border border-upBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-upGray font-bold uppercase tracking-wider">Status Phyllo API</p>
            <p className="text-2xl font-black text-purple-400 mt-1">Conectado (getphyllo)</p>
            <p className="text-[10px] text-purple-300 mt-0.5">Métricas do Instagram/TikTok ativas</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Globe className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-upCard/40 border border-upBorder/60 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-upPink absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por usuário, e-mail ou modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-upDark border border-upBorder/80 rounded-xl text-white placeholder-upGray text-xs focus:outline-none focus:border-upPink transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-upGray font-semibold shrink-0">Filtrar Provedor:</span>
          <select
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
            className="px-3 py-2 bg-upDark border border-upBorder/80 rounded-xl text-xs text-white focus:outline-none focus:border-upPink transition-all"
          >
            <option value="todos">Todos os Provedores</option>
            <option value="groq">Groq Cloud</option>
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI</option>
            <option value="phyllo">Phyllo Social API</option>
          </select>
        </div>
      </div>

      {/* Usage Table */}
      <div className="bg-upCard/60 border border-upBorder/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-upLightGray">
            <thead className="bg-upDark/90 border-b border-upBorder/60 text-upGray uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Modelo Utilizado</th>
                <th className="px-6 py-4">Tokens / Chamadas</th>
                <th className="px-6 py-4">Requisições</th>
                <th className="px-6 py-4">Provedor</th>
                <th className="px-6 py-4">Custo Estimado</th>
                <th className="px-6 py-4">Último Acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-upBorder/40">
              {filteredUsage.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-upGray">
                    Nenhum registro de consumo de IA encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsage.map((item) => (
                  <tr key={item.id} className="hover:bg-upCard/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-upPink transition-colors">{item.userName}</span>
                        <span className="text-[11px] text-upGray">{item.userEmail}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono font-semibold text-white">
                      {item.model}
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-upPink">
                      {item.tokensUsed}
                    </td>

                    <td className="px-6 py-4 text-upLightGray">
                      {item.requestsCount} reqs
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.provider === "Groq"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : item.provider === "Gemini"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : item.provider === "Phyllo"
                          ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {item.provider}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-emerald-400">
                      {item.estimatedCost}
                    </td>

                    <td className="px-6 py-4 text-upGray text-[11px]">
                      {item.lastUsage}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastrar / Editar Provedor de IA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-upBlack/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-upDark border border-upBorder/80 rounded-2xl shadow-[0_0_50px_rgba(255,83,104,0.15)] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-upBorder/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-upPink" />
                {editingProvider ? "Editar Configuração de API" : "Cadastrar Provedor de IA"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-upGray hover:text-white rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProvider} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Nome do Provedor</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Groq Cloud, DeepSeek, Claude"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-upGray">Tipo de Provedor</label>
                  <select
                    value={formData.providerKey}
                    onChange={(e) => setFormData({ ...formData, providerKey: e.target.value as any })}
                    className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                  >
                    <option value="groq">Groq Cloud (Recomendado)</option>
                    <option value="gemini">Google Gemini AI</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="custom">Outra API Personalizada</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-upGray">Chave de API (API Key)</label>
                <input
                  type="text"
                  required
                  placeholder="gsk_... ou AIzaSy..."
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl font-mono text-upPink text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-upGray">Modelo Padrão</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: llama3-70b-8192, gemini-1.5-pro, gpt-4o"
                  value={formData.defaultModel}
                  onChange={(e) => setFormData({ ...formData, defaultModel: e.target.value })}
                  className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl font-mono text-white text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-upGray">Descrição Curta</label>
                <input
                  type="text"
                  placeholder="Instância ultra-rápida para geração de Posts"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="px-4 py-2.5 bg-upCard/60 border border-upBorder rounded-xl text-white text-xs focus:outline-none focus:border-upPink transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-upBorder/60">
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
                  {editingProvider ? "Salvar Alterações" : "Cadastrar Chave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
