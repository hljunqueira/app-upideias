"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  QrCode, 
  Link as LinkIcon, 
  ExternalLink, 
  ShieldCheck, 
  Zap,
  Sparkles,
  X,
  FileText
} from "lucide-react";
import { getActiveUserPlan, getStoredPlans, setActiveUserPlan } from "@/lib/plansStore";

export default function BillingPage() {
  const [activePlanName, setActivePlanName] = useState<string>("Pro");
  const [plans, setPlans] = useState<any[]>([]);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  // Form de Geração de Link
  const [selectedPlanForLink, setSelectedPlanForLink] = useState("Pro");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "boleto">("pix");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const mockPixCode = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-4266141740005204000053039865405129.005802BR5913UP ANALYTICS6009SAO PAULO62070503***6304E2CA";

  useEffect(() => {
    setActivePlanName(getActiveUserPlan());
    setPlans(getStoredPlans());
  }, []);

  const currentPlanObj = plans.find((p) => p.name === activePlanName) || {
    name: "Pro",
    priceMonthly: 129,
    aiCreditsMonthly: 500
  };

  const invoices = [
    { id: "inv-001", date: "2026-07-04", amount: "R$ 129,00", status: "pago", link: "https://pay.upideias.com/inv-001" },
    { id: "inv-002", date: "2026-06-04", amount: "R$ 129,00", status: "pago", link: "https://pay.upideias.com/inv-002" },
    { id: "inv-003", date: "2026-08-04", amount: "R$ 129,00", status: "pendente", link: "https://pay.upideias.com/inv-003" }
  ];

  const handleGeneratePaymentLink = (e: React.FormEvent) => {
    e.preventDefault();
    const linkId = `inv-${Math.floor(100000 + Math.random() * 900000)}`;
    const linkUrl = `https://pay.upideias.com/checkout/${linkId}?plan=${selectedPlanForLink.toLowerCase()}&method=${paymentMethod}`;
    setGeneratedLink(linkUrl);
  };

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(mockPixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
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
            Gerencie sua assinatura, histórico de pagamentos e gere links de pagamento seguros via PIX ou Cartão.
          </p>
        </div>

        <button
          onClick={() => {
            setGeneratedLink(null);
            setIsGenerateModalOpen(true);
          }}
          className="px-5 py-2.5 bg-upPink hover:bg-upPink/90 text-white rounded-2xl text-xs font-extrabold transition-all shadow-[0_0_20px_rgba(255,83,104,0.3)] flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <LinkIcon className="w-4 h-4" />
          <span>Gerar Link de Pagamento</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Lado Esquerdo: Card do Plano Atual */}
        <div className="md:col-span-1 bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-upPink bg-upPink/15 border border-upPink/30 px-3 py-1 rounded-md">
                Plano Atual
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
              <span>Assinatura Ativa & Renovação Automática</span>
            </div>
          </div>

          <div className="border-t border-upBorder/40 pt-4 flex flex-col gap-2">
            <span className="text-[10px] text-upGray uppercase font-bold">Próxima Fatura:</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">04 de Agosto, 2026</span>
              <span className="text-xs font-extrabold text-upPink">R$ {currentPlanObj.priceMonthly},00</span>
            </div>
          </div>
        </div>

        {/* Lado Direito: Histórico de Faturas com Links de Pagamento */}
        <div className="md:col-span-2 bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-upWhite uppercase tracking-wider">Histórico de Cobranças & Faturas</h3>
            <span className="text-xs text-upGray font-medium">3 Registros</span>
          </div>

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
                      Vencimento: {new Date(inv.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  <span className="text-xs font-extrabold text-white">{inv.amount}</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase border ${
                    inv.status === "pago"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                  }`}>
                    {inv.status === "pago" ? "Pago" : "Aguardando PIX"}
                  </span>

                  <button
                    onClick={() => handleCopyLink(inv.link)}
                    className="p-2 bg-upDark hover:bg-upPink/20 text-upGray hover:text-upPink border border-upBorder/60 rounded-xl text-xs font-bold transition"
                    title="Copiar Link de Pagamento da Fatura"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Geração de Link de Pagamento */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0b0f] border border-upBorder/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative text-upLightGray">
            
            <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-upPink" />
                <h3 className="text-sm font-bold text-white">Gerador de Link de Pagamento</h3>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1.5 text-upGray hover:text-white bg-white/5 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {!generatedLink ? (
                <form onSubmit={handleGeneratePaymentLink} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                      Selecione o Plano da Fatura
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

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-upGray mb-1.5 block">
                      Forma de Pagamento Preferencial
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "pix", label: "PIX Instantâneo" },
                        { id: "card", label: "Cartão de Crédito" },
                        { id: "boleto", label: "Boleto Bancário" }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                            paymentMethod === m.id
                              ? "bg-upPink text-white border-upPink shadow-md"
                              : "bg-upDark/60 text-upGray border-upBorder/50 hover:text-white"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-upPink hover:bg-upPink/90 text-white rounded-2xl text-xs font-extrabold shadow-[0_0_25px_rgba(255,83,104,0.3)] transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Gerar Link & QR Code de Pagamento</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5 animate-fadeIn">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">Link de Pagamento Gerado com Sucesso!</h4>
                    <p className="text-[10px] text-upGray">
                      Fatura de <strong className="text-white">Plano {selectedPlanForLink}</strong> via <strong className="text-white uppercase">{paymentMethod}</strong>.
                    </p>
                  </div>

                  {/* Campo de Copiar Link de Checkout */}
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-upGray block mb-1.5">
                      Link Direto de Checkout
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="w-full bg-upDark border border-upBorder/80 rounded-xl px-3 py-2 text-xs text-upPink font-mono focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyLink(generatedLink)}
                        className="px-4 py-2 bg-upPink hover:bg-upPink/90 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0"
                      >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedLink ? "Copiado!" : "Copiar"}</span>
                      </button>
                    </div>
                  </div>

                  {/* QR Code PIX Copia e Cola */}
                  {paymentMethod === "pix" && (
                    <div className="p-4 bg-upDark/80 border border-upBorder/50 rounded-2xl space-y-3 text-center">
                      <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto flex items-center justify-center">
                        <QrCode className="w-28 h-28 text-black" />
                      </div>

                      <div>
                        <span className="text-[10px] text-upGray font-extrabold uppercase block mb-1">
                          Código PIX Copia e Cola
                        </span>
                        <button
                          onClick={handleCopyPix}
                          className="w-full py-2 bg-upDark hover:bg-white/5 border border-upBorder text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          {copiedPix ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedPix ? "PIX Copiado!" : "Copiar Código PIX"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-upBorder/40">
                    <button
                      onClick={() => setIsGenerateModalOpen(false)}
                      className="px-5 py-2.5 bg-upPink text-white rounded-xl text-xs font-bold transition"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
