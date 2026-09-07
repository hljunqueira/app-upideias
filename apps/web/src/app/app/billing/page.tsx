"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, 
  ArrowUpRight, 
  Clock, 
  Copy, 
  Check, 
  Link as LinkIcon, 
  ExternalLink, 
  ShieldCheck, 
  X,
  FileText,
  Loader2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { getActiveUserPlan, getStoredPlans, fetchPlansFromDb } from "@/lib/plansStore";
import { supabase } from "@up-analytics/lib";

interface SubscriptionRecord {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  payment_provider?: string;
  created_at: string;
  amount_cents?: number;
}

export default function BillingPage() {
  const [activePlanName, setActivePlanName] = useState<string>("Pro");
  const [plans, setPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de Upgrade / Checkout
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlanForLink, setSelectedPlanForLink] = useState("Pro");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadBillingData() {
      setLoading(true);
      try {
        const dbPlans = await fetchPlansFromDb();
        setPlans(dbPlans.length > 0 ? dbPlans : getStoredPlans());

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // 1. Carregar perfil para identificar plano
          const { data: profile } = await supabase
            .from("profiles")
            .select("plan")
            .eq("id", user.id)
            .single();

          if (profile?.plan) {
            const raw = profile.plan.toLowerCase();
            if (raw.includes("enter")) setActivePlanName("Enterprise");
            else if (raw.includes("agen") || raw.includes("agên")) setActivePlanName("Agência");
            else setActivePlanName("Pro");
          } else {
            setActivePlanName(getActiveUserPlan());
          }

          // 2. Carregar assinatura real do usuário
          const { data: subsData } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (subsData && subsData.length > 0) {
            setSubscription(subsData[0]);
            
            const mappedInvoices = subsData.map((sub: any) => ({
              id: sub.id.substring(0, 8),
              date: sub.created_at,
              amount: sub.amount_cents 
                ? `R$ ${(sub.amount_cents / 100).toFixed(2).replace(".", ",")}`
                : (sub.amount ? `R$ ${sub.amount}` : "R$ 0,00"),
              status: sub.status === "active" ? "pago" : sub.status === "canceled" ? "cancelado" : "pendente",
              link: `/checkout?plan=${(sub.plan_name || "pro").toLowerCase()}`
            }));
            setInvoices(mappedInvoices);
          } else {
            setSubscription(null);
            setInvoices([]);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados de faturamento:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBillingData();
  }, []);

  const currentPlanObj = plans.find((p) => p.name.toLowerCase() === activePlanName.toLowerCase()) || {
    name: activePlanName,
    priceMonthly: activePlanName === "Enterprise" ? 699 : activePlanName === "Agência" ? 299 : 129,
    aiCreditsMonthly: activePlanName === "Enterprise" ? 2500 : activePlanName === "Agência" ? 1200 : 500
  };

  const getNextBillingDate = () => {
    if (subscription?.current_period_end) {
      return new Date(subscription.current_period_end).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    }
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    return nextMonth.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const getCheckoutUrl = (planName: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/checkout?plan=${planName.toLowerCase()}`;
  };

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto animate-fadeIn text-upLightGray">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-upPink" />
            Faturamento & Assinatura
          </h1>
          <p className="text-sm text-upGray mt-1">
            Gerencie seu plano corporativo, histórico de faturas e renove acessos de forma transparente.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedPlanForLink(activePlanName);
            setIsCheckoutModalOpen(true);
          }}
          className="px-5 py-2.5 bg-upPink hover:bg-upPinkDark text-white rounded-2xl text-xs font-extrabold transition-all shadow-[0_0_20px_rgba(255,83,104,0.3)] flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <LinkIcon className="w-4 h-4" />
          <span>Alterar Plano / Assinar</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-upGray flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-upPink" />
          <p className="text-xs">Carregando informações de faturamento...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Lado Esquerdo: Card do Plano Atual */}
          <div className="md:col-span-1 bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-upPink bg-upPink/15 border border-upPink/30 px-3 py-1 rounded-md">
                  Plano Ativo
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-upWhite">{currentPlanObj.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-upWhite">R$ {currentPlanObj.priceMonthly}</span>
                  <span className="text-xs text-upGray font-medium">/mês</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  {subscription?.status === "active" 
                    ? "Assinatura Regular Ativa" 
                    : "Plano Vigente Habilitado"}
                </span>
              </div>
            </div>

            <div className="border-t border-upBorder/40 pt-4 flex flex-col gap-2">
              <span className="text-[10px] text-upGray uppercase font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-upPink" />
                Próxima Renovação:
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{getNextBillingDate()}</span>
                <span className="text-xs font-extrabold text-upPink">R$ {currentPlanObj.priceMonthly},00</span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Histórico de Faturas */}
          <div className="md:col-span-2 bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-upWhite uppercase tracking-wider">Histórico de Faturas & Cobranças</h3>
              <span className="text-xs text-upGray font-medium">{invoices.length} {invoices.length === 1 ? "Registro" : "Registros"}</span>
            </div>

            {invoices.length === 0 ? (
              <div className="py-12 text-center text-upGray flex flex-col items-center justify-center gap-2 border border-dashed border-upBorder/40 rounded-2xl p-6">
                <FileText className="w-8 h-8 text-upGray/60" />
                <p className="text-xs font-semibold text-upWhite">Nenhuma fatura anterior registrada</p>
                <p className="text-[11px] text-upGray max-w-sm">
                  As faturas geradas nas renovações automáticas ou contratações de planos ficarão listadas aqui para download e conciliação.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-upDark/60 p-4 rounded-2xl border border-upBorder/40 hover:border-upPink/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        inv.status === "pago" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Fatura #{inv.id}</h4>
                        <p className="text-[10px] text-upGray mt-0.5">
                          Emissão: {new Date(inv.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                      <span className="text-xs font-extrabold text-white">{inv.amount}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase border ${
                        inv.status === "pago"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {inv.status === "pago" ? "Pago" : inv.status}
                      </span>

                      <a
                        href={inv.link}
                        className="p-2 bg-upDark hover:bg-upPink/20 text-upGray hover:text-upPink border border-upBorder/60 rounded-xl text-xs font-bold transition"
                        title="Ver Detalhes do Checkout"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Upgrade / Checkout Oficial */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0b0f] border border-upBorder/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative text-upLightGray">
            
            <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-upPink" />
                <h3 className="text-sm font-bold text-white">Checkout Oficial de Assinatura</h3>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-1.5 text-upGray hover:text-white bg-white/5 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-2 block">
                  Selecione o Plano Desejado
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Pro", price: "R$ 129" },
                    { id: "Agência", price: "R$ 299" },
                    { id: "Enterprise", price: "R$ 699" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlanForLink(p.id)}
                      className={`p-3 rounded-2xl text-left transition border ${
                        selectedPlanForLink === p.id
                          ? "bg-upPink/20 text-white border-upPink shadow-md"
                          : "bg-upDark/60 text-upGray border-upBorder/50 hover:text-white"
                      }`}
                    >
                      <p className="text-xs font-bold">{p.id}</p>
                      <p className="text-[10px] text-upPink font-extrabold mt-0.5">{p.price}/mês</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Link de Checkout Seguro */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-upGray block mb-1.5">
                  Link Direto de Pagamento Seguro
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getCheckoutUrl(selectedPlanForLink)}
                    className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2 text-xs text-upPink font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopyLink(getCheckoutUrl(selectedPlanForLink))}
                    className="px-4 py-2 bg-upPink hover:bg-upPinkDark text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-upBorder/40">
                <button
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-4 py-2 text-xs text-upGray hover:text-upWhite transition"
                >
                  Fechar
                </button>
                <a
                  href={`/checkout?plan=${selectedPlanForLink.toLowerCase()}`}
                  className="px-5 py-2.5 bg-upPink hover:bg-upPinkDark text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-upPink/20"
                >
                  <span>Ir para o Checkout</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
