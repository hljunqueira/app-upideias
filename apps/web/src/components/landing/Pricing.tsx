"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { PlanConfig, getStoredPlans } from "@/lib/plansStore";

const DEFAULT_BENEFITS_MAP: Record<string, string[]> = {
  iniciante: [
    "1 conta de Instagram · 1 usuário",
    "Gerador de conteúdos e roteiros estratégicos",
    "Métricas essenciais + 30 dias de histórico",
    "UP Creator: trilha Fundamentos",
    "Suporte por e-mail"
  ],
  pro: [
    "3 contas de Instagram · 3 usuários",
    "Gerador ilimitado + Diagnóstico estratégico",
    "Métricas avançadas + 90 dias de histórico",
    "Calendário editorial completo",
    "Relatórios semanais no WhatsApp",
    "UP Creator completo + certificados",
    "Suporte prioritário"
  ],
  agencia: [
    "10 contas de Instagram · 10 usuários",
    "Gerações de conteúdo ilimitadas",
    "Até 5 marcas com Área do Cliente exclusiva",
    "Fluxo de aprovação de conteúdo",
    "Relatórios PDF + alertas diários WhatsApp",
    "UP Creator completo para a equipe",
    "Onboarding guiado + suporte VIP"
  ],
  enterprise: [
    "Contas de Instagram e usuários ILIMITADOS",
    "Créditos de IA totalmente ILIMITADOS",
    "Marcas e clientes ILIMITADOS",
    "Infraestrutura dedicada & SLA garantido",
    "Gerente de conta exclusivo 24/7",
    "Treinamentos ao vivo para a equipe",
    "Desenvolvimento de recursos sob medida"
  ]
};

function SpotlightCard({ p, i, annual }: { p: PlanConfig; i: number; annual: boolean }) {
  const [pos, setPos] = useState({ x: -300, y: -300 });
  const isProFeatured = p.featured || p.id === "pro" || p.name.toLowerCase() === "pro";
  const isEnterprise = p.id === "enterprise" || p.name.toLowerCase() === "enterprise" || p.isCustomPrice;

  const priceMonthlyNum = typeof p.priceMonthly === "number" ? p.priceMonthly : 0;
  const priceAnnualCalc = p.priceAnnual || priceMonthlyNum * 10;

  const benefits = (p.featuresList && p.featuresList.length > 0)
    ? p.featuresList
    : (DEFAULT_BENEFITS_MAP[p.id] || DEFAULT_BENEFITS_MAP.pro);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: i * 0.12 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseLeave={() => setPos({ x: -300, y: -300 })}
      className={`relative flex flex-col rounded-3xl border p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 overflow-visible ${
        isProFeatured
          ? "bg-[#111019] border-upPink shadow-[0_0_50px_rgba(255,83,104,0.3)] scale-[1.03] z-10"
          : "bg-upCard/60 border-upBorder hover:border-upPink/40"
      }`}
      data-testid={`pricing-card-${p.id}`}
    >
      {isProFeatured && <span className="conic-border pointer-events-none opacity-80 rounded-3xl" />}
      <span className={`absolute inset-[1px] rounded-3xl pointer-events-none ${isProFeatured ? "bg-[#111019]" : ""}`} />
      
      {/* Spotlight */}
      <span
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{ background: `radial-gradient(320px circle at ${pos.x}px ${pos.y}px, rgba(255,83,104,0.15), transparent 70%)` }}
      />

      <div className="relative pt-2 flex flex-col h-full justify-between z-10">
        <div>
          {/* Badge de Destaque "MAIS POPULAR" (Sem ícone) */}
          {isProFeatured && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-upPink text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-[0_0_25px_rgba(255,83,104,0.7)] z-20 whitespace-nowrap border border-white/20">
              MAIS POPULAR
            </span>
          )}

          {/* Header do Card */}
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-display text-2xl font-extrabold text-white mt-1">{p.name}</h3>
              <p className="text-upGray text-xs mt-1.5 leading-relaxed min-h-[36px]">{p.description}</p>
            </div>
          </div>

          {/* Badge de Créditos IA (Sem Ícone e Cor Rosa Tema) */}
          <div className="mt-3 inline-block px-3 py-1 rounded-full text-[11px] font-extrabold bg-upPink/15 text-upPink border border-upPink/30">
            <span>
              {p.aiCreditsMonthly === -1 ? "Créditos IA Ilimitados" : `${p.aiCreditsMonthly} Créditos IA /mês`}
            </span>
          </div>

          {/* Área de Valor Alinhada (h-14) */}
          <div className="mt-4 flex items-center h-14">
            {isEnterprise ? (
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-white whitespace-nowrap">
                Sob consulta
              </span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl sm:text-5xl font-black text-white">
                  R$ {annual ? Math.round(priceAnnualCalc / 12) : priceMonthlyNum}
                </span>
                <span className="text-upGray text-xs font-semibold">/mês</span>
              </div>
            )}
          </div>

          <p className="text-[10px] text-upGray mt-0.5 h-4 font-medium">
            {isEnterprise
              ? "projeto personalizado"
              : annual
              ? `R$ ${priceAnnualCalc.toLocaleString("pt-BR")} cobrados anualmente`
              : "cobrança mensal"}
          </p>

          {/* Lista Completa de Benefícios Detalhados Alinhada */}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-upPink block">
              BENEFÍCIOS INCLUÍDOS
            </span>
            <ul className="space-y-2.5">
              {benefits.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-upLightGray leading-relaxed">
                  <Check className="w-4 h-4 text-upPink shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Botão de Ação */}
        <Link
          href={isEnterprise ? "https://wa.me/5511999999999?text=Ol%C3%A1,%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20o%20Plano%20Enterprise" : "/register"}
          data-testid={`pricing-${p.id}-cta`}
          className={`relative mt-8 text-center font-extrabold text-xs px-5 py-3.5 rounded-full transition-all duration-300 cursor-pointer ${
            isProFeatured
              ? "bg-upPink hover:bg-upPinkDark text-white shadow-[0_0_30px_rgba(255,83,104,0.5)] hover:shadow-[0_0_40px_rgba(255,83,104,0.8)] scale-105"
              : "border border-upBorder text-white hover:border-upPink hover:bg-upPink/10"
          }`}
        >
          {isEnterprise ? "Falar com Consultor" : `Assinar ${p.name}`}
        </Link>
      </div>
    </motion.div>
  );
}

export default function Pricing() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    setPlans(getStoredPlans());

    const handleUpdate = () => {
      setPlans(getStoredPlans());
    };

    window.addEventListener("up_plans_updated", handleUpdate);
    return () => window.removeEventListener("up_plans_updated", handleUpdate);
  }, []);

  return (
    <section id="planos" className="relative py-32 lg:py-40 bg-upBlack overflow-hidden noise" data-testid="pricing-section">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-upPink/[0.05] blur-[130px] rounded-full pointer-events-none" />
      <span className="absolute top-16 right-8 font-script text-upPink/20 text-7xl lg:text-9xl select-none rotate-[5deg]">invista</span>
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <motion.p
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="uppercase tracking-[0.3em] text-upPink text-sm font-semibold mb-4"
          >
            Planos & Assinaturas
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display text-4xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]"
          >
            Invista no seu crescimento.
          </motion.h2>
        </div>

        {/* Toggle Mensal / Anual */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1 bg-upCard border border-upBorder rounded-full p-1 mb-14"
          data-testid="billing-toggle"
        >
          <button
            onClick={() => setAnnual(false)}
            data-testid="billing-monthly-btn"
            className={`text-xs font-bold px-5 py-2 rounded-full transition-all duration-300 cursor-pointer ${!annual ? "bg-upPink text-white shadow-md" : "text-upGray hover:text-white"}`}
          >
            Mensal
          </button>
          <button
            onClick={() => setAnnual(true)}
            data-testid="billing-annual-btn"
            className={`text-xs font-bold px-5 py-2 rounded-full transition-all duration-300 cursor-pointer ${annual ? "bg-upPink text-white shadow-md" : "text-upGray hover:text-white"}`}
          >
            Anual <span className={annual ? "text-white/80" : "text-upPink"}>(2 meses grátis)</span>
          </button>
        </motion.div>

        {/* GRID COM OS 4 CARDS LADO A LADO E DESTAQUE NO PRO */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch pt-4">
          {plans.map((p, i) => (
            <SpotlightCard key={p.id} p={p} i={i} annual={annual} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-upGray mt-12"
        >
          Garantia incondicional de 7 dias para reembolso · Sem fidelidade · Cancele quando quiser
        </motion.p>
      </div>
    </section>
  );
}
