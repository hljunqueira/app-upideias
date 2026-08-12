"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { ArrowLeft, Check, ShieldCheck, Lock, CreditCard, QrCode, Barcode } from "lucide-react";
import { PlanConfig, getStoredPlans, setActiveUserPlan } from "@/lib/plansStore";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planSlug = searchParams.get("plan") || "pro";

  const [storedPlans, setStoredPlans] = useState<PlanConfig[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix" | "boleto">("card");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStoredPlans(getStoredPlans());
  }, []);

  const foundPlan = storedPlans.find(
    (p) => p.id.toLowerCase() === planSlug.toLowerCase() || p.name.toLowerCase() === planSlug.toLowerCase()
  ) || storedPlans.find((p) => p.id === "pro") || getStoredPlans()[1];

  const plan = {
    name: foundPlan ? foundPlan.name : "Pro",
    price: foundPlan
      ? (typeof foundPlan.priceMonthly === "number" ? `R$ ${foundPlan.priceMonthly}` : foundPlan.priceMonthly)
      : "R$ 129",
    period: foundPlan?.isCustomPrice ? "" : "/mês",
    features: foundPlan?.featuresList && foundPlan.featuresList.length > 0
      ? foundPlan.featuresList
      : [
          "Acesso à plataforma UP Analytics",
          "Acompanhamento de métricas e diagnósticos",
          "Acesso ao módulo UP Creator",
          "Suporte especializado"
        ],
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (foundPlan) {
      setActiveUserPlan(foundPlan.name);
    }
    setTimeout(() => {
      router.push("/app/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-upBlack text-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-upBorder">
          <Link href="/" className="inline-flex items-center gap-0.5">
            <img src="/UP-Logo-removebg-preview.png" alt="UP" className="h-9 w-auto object-contain" />
            <span className="font-script text-2xl text-white font-normal -ml-2.5">ideias</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-upGray bg-upCard px-3 py-1.5 rounded-full border border-upBorder">
            <Lock className="w-3.5 h-3.5 text-upPink" />
            Ambiente 100% Seguro
          </div>
        </div>

        <Link href="/register" className="inline-flex items-center gap-2 text-xs text-upGray hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para seleção
        </Link>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Form Checkout */}
          <div className="lg:col-span-7 bg-upCard/60 border border-upBorder rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
            <h1 className="font-display text-2xl font-bold mb-1">Finalizar Assinatura</h1>
            <p className="text-xs text-upGray mb-8">Preencha seus dados de pagamento para ativar o acesso imediato</p>

            <form onSubmit={handleFinish} className="space-y-6">
              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-upLightGray uppercase tracking-wider">Forma de Pagamento</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-semibold transition-all ${
                      paymentMethod === "card"
                        ? "border-upPink bg-upPink/10 text-white shadow-[0_0_15px_rgba(255,83,104,0.2)]"
                        : "border-upBorder bg-upBlack/40 text-upGray hover:border-upPink/40"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-upPink" />
                    Cartão
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-semibold transition-all ${
                      paymentMethod === "pix"
                        ? "border-upPink bg-upPink/10 text-white shadow-[0_0_15px_rgba(255,83,104,0.2)]"
                        : "border-upBorder bg-upBlack/40 text-upGray hover:border-upPink/40"
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-upPink" />
                    PIX
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("boleto")}
                    className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-semibold transition-all ${
                      paymentMethod === "boleto"
                        ? "border-upPink bg-upPink/10 text-white shadow-[0_0_15px_rgba(255,83,104,0.2)]"
                        : "border-upBorder bg-upBlack/40 text-upGray hover:border-upPink/40"
                    }`}
                  >
                    <Barcode className="w-5 h-5 text-upPink" />
                    Boleto
                  </button>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-upLightGray uppercase tracking-wider block mb-1">Número do Cartão</label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      required
                      className="w-full px-4 py-3 bg-upBlack/60 border border-upBorder rounded-xl text-sm focus:outline-none focus:border-upPink transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-upLightGray uppercase tracking-wider block mb-1">Validade</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        required
                        className="w-full px-4 py-3 bg-upBlack/60 border border-upBorder rounded-xl text-sm focus:outline-none focus:border-upPink transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-upLightGray uppercase tracking-wider block mb-1">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        required
                        className="w-full px-4 py-3 bg-upBlack/60 border border-upBorder rounded-xl text-sm focus:outline-none focus:border-upPink transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-upLightGray uppercase tracking-wider block mb-1">Nome no Cartão</label>
                    <input
                      type="text"
                      placeholder="Como impresso no cartão"
                      required
                      className="w-full px-4 py-3 bg-upBlack/60 border border-upBorder rounded-xl text-sm focus:outline-none focus:border-upPink transition-all"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "pix" && (
                <div className="bg-upBlack/50 p-6 rounded-2xl border border-upBorder text-center space-y-3">
                  <QrCode className="w-12 h-12 text-upPink mx-auto" />
                  <p className="text-sm font-semibold text-white">Aprovação Imediata no PIX</p>
                  <p className="text-xs text-upGray">O código QR Code será gerado assim que você clicar no botão abaixo.</p>
                </div>
              )}

              {paymentMethod === "boleto" && (
                <div className="bg-upBlack/50 p-6 rounded-2xl border border-upBorder text-center space-y-3">
                  <Barcode className="w-12 h-12 text-upPink mx-auto" />
                  <p className="text-sm font-semibold text-white">Pagamento por Boleto Bancário</p>
                  <p className="text-xs text-upGray">Vencimento em 3 dias úteis. A liberação ocorre após a compensação bancária.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-upPink hover:bg-upPinkDark text-white font-bold rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(255,83,104,0.4)] text-sm flex items-center justify-center gap-2"
              >
                {loading ? "Processando Pagamento..." : `Confirmar Assinatura (${plan.price}${plan.period})`}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-upGray pt-2">
                <ShieldCheck className="w-4 h-4 text-upPink" />
                Garantia incondicional de 7 dias para reembolso (Código do Consumidor)
              </div>
            </form>
          </div>

          {/* Plan Summary Sidebar */}
          <div className="lg:col-span-5 bg-upCard border border-upPink/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(255,83,104,0.1)]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-upPink/20 text-upPink border border-upPink/40 px-3 py-1 rounded-full">
                Plano Selecionado
              </span>
              <h2 className="font-display text-3xl font-bold text-white mt-4">{plan.name}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-upPink">{plan.price}</span>
                <span className="text-upGray text-sm">{plan.period}</span>
              </div>

              <div className="my-6 border-t border-upBorder/60" />

              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">O que está incluído:</h4>
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-upLightGray">
                    <Check className="w-4 h-4 text-upPink shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-upBorder/60 text-center">
              <p className="text-xs text-upGray">
                Precisa de ajuda ou tirou dúvidas? <br />
                <a href="https://hljdev.com.br" target="_blank" rel="noopener noreferrer" className="text-upPink font-semibold hover:underline">
                  Suporte HLJDEV
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-upBlack flex items-center justify-center text-upPink">Carregando Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
