"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Check } from "lucide-react";

const plans = [
  {
    slug: "start",
    name: "UP Start",
    monthly: 97,
    annual: 970,
    description: "Para criadores e pequenos negócios começando com estratégia.",
    features: [
      "1 conta de Instagram · 1 usuário",
      "30 gerações de IA por mês",
      "Métricas essenciais + 30 dias de histórico",
      "UP Creator: trilha Fundamentos",
      "Suporte por e-mail",
    ],
    cta: "Começar com Start",
    featured: false,
  },
  {
    slug: "pro",
    name: "UP Pro",
    monthly: 197,
    annual: 1970,
    description: "Para quem vive de conteúdo e quer escalar de verdade.",
    features: [
      "3 contas de Instagram · 3 usuários",
      "150 gerações de IA + Diagnóstico estratégico",
      "Métricas avançadas + 90 dias de histórico",
      "Calendário editorial completo",
      "Relatórios semanais no WhatsApp",
      "UP Creator completo + certificados",
      "Suporte prioritário",
    ],
    cta: "Experimentar o Pro",
    featured: true,
  },
  {
    slug: "agencia",
    name: "UP Agência",
    monthly: 497,
    annual: 4970,
    description: "Para agências e gestores com múltiplos clientes.",
    features: [
      "10 contas de Instagram · 10 usuários",
      "500 gerações de IA por mês",
      "Até 10 clientes com Área do Cliente",
      "Fluxo de aprovação de conteúdo",
      "Relatórios PDF + alertas diários WhatsApp",
      "UP Creator completo para a equipe",
      "Onboarding guiado + suporte VIP",
    ],
    cta: "Assinar Agência",
    featured: false,
  },
];

function SpotlightCard({ p, i, annual }: { p: (typeof plans)[0]; i: number; annual: boolean }) {
  const [pos, setPos] = useState({ x: -300, y: -300 });

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
      className={`relative flex flex-col rounded-3xl border p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden ${
        p.featured
          ? "bg-upCard border-upPink/40 lg:scale-[1.05] shadow-[0_0_60px_rgba(255,83,104,0.18)]"
          : "bg-upCard/60 border-upBorder hover:border-upPink/40"
      }`}
      data-testid={`pricing-card-${p.slug}`}
    >
      {p.featured && <span className="conic-border pointer-events-none opacity-70" />}
      <span className={`absolute inset-[1px] rounded-3xl pointer-events-none ${p.featured ? "bg-upCard" : ""}`} />
      {/* Spotlight */}
      <span
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{ background: `radial-gradient(320px circle at ${pos.x}px ${pos.y}px, rgba(255,83,104,0.12), transparent 70%)` }}
      />

      <div className="relative">
        {p.featured && (
          <span className="absolute -top-11 left-1/2 -translate-x-1/2 bg-upPink text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(255,83,104,0.5)]">
            Mais popular
          </span>
        )}
        <h3 className="font-display text-2xl font-bold text-white">{p.name}</h3>
        <p className="text-upGray text-sm mt-2 leading-relaxed">{p.description}</p>
        <div className="mt-6 flex items-baseline gap-1.5">
          <span className="font-display text-5xl font-bold text-white">
            R$ {annual ? Math.round(p.annual / 12) : p.monthly}
          </span>
          <span className="text-upGray text-sm">/mês</span>
        </div>
        <p className="text-xs text-upGray mt-1.5 h-4">
          {annual ? `R$ ${p.annual.toLocaleString("pt-BR")} cobrados anualmente` : "cobrança mensal"}
        </p>
        <ul className="mt-8 space-y-3.5">
          {p.features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-upLightGray">
              <Check className="w-4 h-4 text-upPink shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative flex-1" />
      <Link
        href="/register"
        data-testid={`pricing-${p.slug}-cta`}
        className={`relative mt-10 text-center font-semibold px-6 py-3.5 rounded-full transition-all duration-300 ${
          p.featured
            ? "bg-upPink hover:bg-upPinkDark text-white hover:shadow-[0_0_32px_rgba(255,83,104,0.5)]"
            : "border border-upBorder text-white hover:border-upPink hover:bg-upPink/10"
        }`}
      >
        {p.cta}
      </Link>
    </motion.div>
  );
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="planos" className="relative py-32 lg:py-40 bg-upBlack overflow-hidden noise" data-testid="pricing-section">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-upPink/[0.05] blur-[130px] rounded-full pointer-events-none" />
      <span className="absolute top-16 right-8 font-script text-upPink/20 text-7xl lg:text-9xl select-none rotate-[5deg]">invista</span>
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <motion.p
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="uppercase tracking-[0.3em] text-upPink text-sm font-semibold mb-5"
          >
            Planos
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display text-4xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]"
          >
            Invista no seu crescimento.
            <br />
            <span className="font-script text-upPink text-6xl lg:text-8xl drop-shadow-[0_0_25px_rgba(255,83,104,0.35)]">7 dias grátis.</span>
          </motion.h2>
        </div>

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
            className={`text-sm px-5 py-2 rounded-full transition-all duration-300 ${!annual ? "bg-upPink text-white font-semibold" : "text-upGray hover:text-white"}`}
          >
            Mensal
          </button>
          <button
            onClick={() => setAnnual(true)}
            data-testid="billing-annual-btn"
            className={`text-sm px-5 py-2 rounded-full transition-all duration-300 ${annual ? "bg-upPink text-white font-semibold" : "text-upGray hover:text-white"}`}
          >
            Anual <span className={annual ? "text-white/80" : "text-upPink"}>(2 meses grátis)</span>
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((p, i) => (
            <SpotlightCard key={p.slug} p={p} i={i} annual={annual} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-upGray mt-12"
        >
          Todos os planos incluem 7 dias de teste grátis · Sem fidelidade · Cancele quando quiser
        </motion.p>
      </div>
    </section>
  );
}
