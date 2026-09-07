"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  Crown, 
  Lock, 
  Search, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  Instagram, 
  Briefcase,
  X,
  Loader2,
  ArrowUpRight,
  Check
} from "lucide-react";
import Link from "next/link";
import { PlanGate } from "@/components/common/PlanGate";
import { getActiveUserPlan } from "@/lib/plansStore";
import { supabase } from "@up-analytics/lib";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface ClientRecord {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
  instagram_handle?: string;
  followers_count?: number;
}

export default function ClientAreaPage() {
  const [userPlan, setUserPlan] = useState<string>("Pro");
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLimitWarningOpen, setIsLimitWarningOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientRecord | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formHandle, setFormHandle] = useState("");
  const [savingClient, setSavingClient] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("plan")
            .eq("id", user.id)
            .single();

          if (profile?.plan) {
            const rawPlan = profile.plan.toLowerCase();
            if (rawPlan.includes("enter") || rawPlan.includes("ilimit")) {
              setUserPlan("Enterprise");
            } else if (rawPlan.includes("agên") || rawPlan.includes("agen")) {
              setUserPlan("Agência");
            } else {
              setUserPlan("Pro");
            }
          } else {
            setUserPlan(getActiveUserPlan());
          }
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        setUserPlan(getActiveUserPlan());
      }
      loadClients();
    }

    init();
  }, []);

  async function loadClients() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Buscar marcas cadastradas em clients
      const { data: clientsData, error } = await supabase
        .from("clients")
        .select("*")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Tabela clients retornou erro, buscando em instagram_accounts:", error);
      }

      if (clientsData && clientsData.length > 0) {
        setClients(clientsData);
      } else {
        // Fallback para contas de instagram com client_id vinculado
        const { data: accs } = await supabase
          .from("social_accounts")
          .select("*")
          .eq("user_id", user.id);

        if (accs && accs.length > 0) {
          const mapped = accs.map((acc: any) => ({
            id: acc.id,
            name: acc.name || acc.username || "Marca Cliente",
            company: null,
            email: "contato@" + (acc.username || "empresa.com"),
            phone: null,
            status: acc.status === "connected" ? "Ativo" : "Pendente",
            created_at: acc.created_at,
            instagram_handle: `@${acc.username}`,
            followers_count: acc.followers_count || 0
          }));
          setClients(mapped);
        } else {
          setClients([]);
        }
      }
    } catch (err) {
      console.error("Erro ao listar clientes:", err);
    } finally {
      setLoading(false);
    }
  }

  const maxClientsForAgency = 5;
  const isAgencyLocked = userPlan === "Agência" && clients.length >= maxClientsForAgency;

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    setSavingClient(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("clients")
        .insert({
          owner_user_id: user.id,
          name: formName.trim(),
          company: formCompany.trim() || null,
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim() || null,
          status: "active"
        })
        .select()
        .single();

      if (error) throw error;

      setIsAddModalOpen(false);
      setFormName("");
      setFormCompany("");
      setFormEmail("");
      setFormPhone("");
      setFormHandle("");
      await loadClients();
    } catch (err: any) {
      console.error("Erro ao cadastrar cliente:", err);
      alert(err.message || "Erro ao cadastrar cliente.");
    } finally {
      setSavingClient(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      await supabase.from("clients").delete().eq("id", clientToDelete.id);
      setClientToDelete(null);
      await loadClients();
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
    }
  };

  return (
    <PlanGate featureKey="clientArea" featureTitle="Gestão de Clientes">
      <div className="flex flex-col gap-8 max-w-5xl mx-auto animate-fadeIn text-upLightGray">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-3">
              <Building2 className="w-8 h-8 text-upPink" />
              Gestão de Clientes & Marcas
            </h1>
            <p className="text-sm text-upGray mt-1">
              Cadastre as marcas dos seus clientes, acompanhe aprovações e gerencie múltiplos perfis corporativos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-upCard border border-upBorder text-xs font-semibold text-upLightGray flex items-center gap-2">
              <Crown className="w-4 h-4 text-upPink" />
              Plano Vigente: <strong className="text-upWhite">{userPlan}</strong>
            </span>
          </div>
        </div>

        {/* Condicional Por Plano */}
        {userPlan === "Pro" ? (
          /* Caso: Plano Pro/Individual (Bloqueado) */
          <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-3xl bg-upPink/10 text-upPink border border-upPink/30 flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-extrabold text-white">Recurso Exclusivo para Gestores & Agências</h3>
              <p className="text-xs text-upGray leading-relaxed">
                A Gestão Multi-Marcas permite cadastrar múltiplos clientes, delegar aprovações e centralizar relatórios de performance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2 text-left">
              <div className="bg-upDark/60 border border-upBorder/50 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-400">Plano Agência</span>
                <p className="text-xs font-bold text-white">Até 5 Marcas Gerenciadas</p>
                <p className="text-[10px] text-upGray">Ideal para freelancers e agências em expansão.</p>
              </div>

              <div className="bg-upDark/80 border border-upPink/40 p-4 rounded-2xl space-y-1 relative overflow-hidden">
                <span className="text-[10px] font-extrabold uppercase text-upPink">Plano Enterprise</span>
                <p className="text-xs font-bold text-white">Marcas & Clientes Ilimitados</p>
                <p className="text-[10px] text-upGray">Infraestrutura corporativa sem restrições de escala.</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/app/billing"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-upPink hover:bg-upPink/90 text-white rounded-2xl text-xs font-extrabold shadow-[0_0_25px_rgba(255,83,104,0.4)] transition"
              >
                Fazer Upgrade de Plano
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Caso: Plano Agência ou Enterprise */
          <div className="space-y-6">
            
            {/* Banner de Status do Plano */}
            <div className="bg-upCard border border-upBorder/60 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-upPink/10 text-upPink rounded-2xl border border-upPink/20">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Plano Ativo: <span className="text-upPink font-extrabold">{userPlan}</span>
                  </h3>
                  <p className="text-xs text-upGray mt-0.5">
                    {userPlan === "Agência"
                      ? `${clients.length} de ${maxClientsForAgency} marcas cadastradas no plano vigente.`
                      : `Gestão Ilimitada de Marcas & Clientes habilitada.`}
                  </p>
                </div>
              </div>

              {userPlan === "Agência" && (
                <Link
                  href="/app/billing"
                  className="px-4 py-2 bg-upPink/20 hover:bg-upPink/30 text-upPink border border-upPink/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Desbloquear Marcas Ilimitadas (Enterprise)</span>
                </Link>
              )}
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-upGray" />
                <input
                  type="text"
                  placeholder="Buscar marca ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-upCard border border-upBorder rounded-2xl text-xs text-upWhite placeholder-upGray outline-none focus:border-upPink/50 transition-all"
                />
              </div>

              <button
                onClick={() => {
                  if (isAgencyLocked) {
                    setIsLimitWarningOpen(true);
                  } else {
                    setIsAddModalOpen(true);
                  }
                }}
                className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
                  isAgencyLocked
                    ? "bg-upDark text-upGray border border-upBorder cursor-not-allowed"
                    : "bg-upPink hover:bg-upPinkDark text-white shadow-[0_0_20px_rgba(255,83,104,0.3)] cursor-pointer"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Nova Marca</span>
              </button>
            </div>

            <ConfirmModal
              isOpen={isLimitWarningOpen}
              title="Limite de Marcas Atingido"
              description="Você atingiu o limite de 5 marcas do Plano Agência. Desbloqueie o Plano Enterprise para gerenciar marcas e perfis ilimitados."
              confirmText="Ver Planos"
              cancelText="Fechar"
              variant="warning"
              onConfirm={() => {
                setIsLimitWarningOpen(false);
                window.location.href = "/app/billing";
              }}
              onClose={() => setIsLimitWarningOpen(false)}
            />

            {/* Modal de Cadastro Real */}
            {isAddModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-upCard border border-upBorder rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative animate-scaleIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-upPink/10 text-upPink rounded-xl border border-upPink/20">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-upWhite">Cadastrar Nova Marca</h3>
                    </div>
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="text-upGray hover:text-upWhite transition p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateClient} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-upGray uppercase mb-1.5">
                        Nome do Responsável / Contato *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Ex: Carlos Mendes"
                        className="w-full px-4 py-2.5 bg-upDark border border-upBorder rounded-xl text-sm text-upWhite placeholder-upGray outline-none focus:border-upPink/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-upGray uppercase mb-1.5">
                        Nome da Empresa / Marca
                      </label>
                      <input
                        type="text"
                        value={formCompany}
                        onChange={(e) => setFormCompany(e.target.value)}
                        placeholder="Ex: Studio Alpha"
                        className="w-full px-4 py-2.5 bg-upDark border border-upBorder rounded-xl text-sm text-upWhite placeholder-upGray outline-none focus:border-upPink/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-upGray uppercase mb-1.5">
                        E-mail de Contato *
                      </label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="contato@marca.com.br"
                        className="w-full px-4 py-2.5 bg-upDark border border-upBorder rounded-xl text-sm text-upWhite placeholder-upGray outline-none focus:border-upPink/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-upGray uppercase mb-1.5">
                        Telefone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="(11) 98765-4321"
                        className="w-full px-4 py-2.5 bg-upDark border border-upBorder rounded-xl text-sm text-upWhite placeholder-upGray outline-none focus:border-upPink/50"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-upBorder/40">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl border border-upBorder text-xs font-semibold text-upLightGray hover:bg-upDark transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={savingClient}
                        className="px-5 py-2.5 rounded-xl bg-upPink hover:bg-upPinkDark text-xs font-bold text-upWhite transition flex items-center gap-2 shadow-lg shadow-upPink/20 disabled:opacity-50"
                      >
                        {savingClient ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Cadastrar Marca
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Confirmação de Exclusão */}
            <ConfirmModal
              isOpen={!!clientToDelete}
              title="Excluir Marca"
              description={`Deseja realmente remover a marca "${clientToDelete?.name}"? Esta ação não pode ser desfeita.`}
              confirmText="Confirmar Exclusão"
              cancelText="Cancelar"
              variant="danger"
              onConfirm={handleDeleteClient}
              onClose={() => setClientToDelete(null)}
            />

            {/* Grid de Clientes Cadastrados */}
            {loading ? (
              <div className="py-16 text-center text-upGray flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-upPink" />
                <p className="text-xs">Carregando marcas cadastradas...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-upPink/10 text-upPink border border-upPink/20 flex items-center justify-center mx-auto">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-upWhite">Nenhuma Marca Cadastrada</h3>
                  <p className="text-xs text-upGray mt-1 max-w-sm mx-auto">
                    Você ainda não cadastrou marcas de clientes. Clique no botão acima para adicionar sua primeira marca.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clients
                  .filter((c) => 
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    c.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((client) => (
                    <div
                      key={client.id}
                      className="bg-[#0e0e14] border border-upBorder/60 hover:border-upPink/40 rounded-3xl p-6 shadow-xl space-y-4 transition group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-bold text-white">{client.name}</h4>
                          {client.company && (
                            <p className="text-xs text-upLightGray font-medium mt-0.5 flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-upPink" />
                              {client.company}
                            </p>
                          )}
                          {client.instagram_handle && (
                            <p className="text-xs font-mono text-upPink mt-1 flex items-center gap-1.5">
                              <Instagram className="w-3.5 h-3.5" />
                              {client.instagram_handle}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            {client.status === "active" ? "Ativo" : client.status}
                          </span>
                          <button
                            onClick={() => setClientToDelete(client)}
                            className="p-1.5 text-upGray hover:text-red-400 rounded-lg hover:bg-upDark transition"
                            title="Remover Marca"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-upBorder/30 text-xs text-upGray">
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-upGray shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-upGray shrink-0" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PlanGate>
  );
}
