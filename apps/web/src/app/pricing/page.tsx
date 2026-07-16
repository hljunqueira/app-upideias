import Link from "next/link";

export default function Pricing() {
  const plans = [
    {
      name: "Iniciante",
      price: "R$ 29",
      period: "mês",
      description: "Ideal para criadores e marcas iniciando no Instagram.",
      features: [
        "1 conta do Instagram",
        "1 usuário",
        "15 requisições de IA por mês",
        "15 dias de histórico",
        "Métricas de perfil básicas",
        "Acesso ao UP Creator Básico",
      ],
      cta: "Começar Agora",
      isFeatured: false,
    },
    {
      name: "Pro",
      price: "R$ 79",
      period: "mês",
      description: "O plano completo para crescer com análise estratégica de IA e relatórios.",
      features: [
        "3 contas do Instagram",
        "2 usuários",
        "100 requisições de IA por mês",
        "90 dias de histórico",
        "Métricas detalhadas de posts",
        "Diagnósticos e Insights de IA",
        "Gerador de Conteúdo com IA",
        "Calendário Editorial",
        "Relatórios semanais no WhatsApp",
        "Acesso ao UP Creator Pro",
      ],
      cta: "Experimentar Pro",
      isFeatured: true,
    },
    {
      name: "Agência",
      price: "R$ 199",
      period: "mês",
      description: "Para agências e gestores que atendem múltiplos clientes e precisam de aprovação.",
      features: [
        "10 contas do Instagram",
        "5 usuários",
        "500 requisições de IA por mês",
        "180 dias de histórico",
        "Até 10 clientes integrados",
        "Área do Cliente Exclusiva",
        "Fluxo de Aprovação",
        "Dicas diárias por WhatsApp",
        "Exportação de Relatórios PDF",
        "Acesso completo ao UP Creator",
      ],
      cta: "Assinar Agência",
      isFeatured: false,
    },
  ];

  return (
    <div className="bg-upBlack min-h-screen text-upLightGray py-20 px-6 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full flex-grow">
        <div className="text-center mb-16">
          <Link href="/" className="text-2xl font-extrabold text-upWhite">
            UP <span className="text-upPink">Analytics</span>
          </Link>
          <p className="text-xs text-upGray mt-1">by UpIdeias</p>
          <h1 className="text-3xl md:text-5xl font-bold text-upWhite mt-8">Nossos Planos</h1>
          <p className="text-sm text-upGray mt-2 max-w-lg mx-auto">
            Escolha a assinatura perfeita para você, sua marca ou sua agência de Social Media.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-2xl bg-upCard border relative flex flex-col justify-between ${
                plan.isFeatured ? "border-upPink shadow-xl shadow-upPink/10" : "border-upBorder"
              }`}
            >
              {plan.isFeatured && (
                <span className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-upPink text-[10px] uppercase font-bold text-upWhite tracking-wider">
                  Mais Popular
                </span>
              )}
              <div>
                <h3 className="text-xl font-bold text-upWhite">{plan.name}</h3>
                <p className="text-sm text-upGray mt-2">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-upWhite">{plan.price}</span>
                  <span className="text-sm text-upGray">/{plan.period}</span>
                </div>

                <ul className="mt-8 flex flex-col gap-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm text-upGray flex items-center gap-3">
                      <span className="text-upPink">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/register"
                className={`mt-10 w-full py-3.5 text-center rounded-xl font-bold text-sm transition-all ${
                  plan.isFeatured
                    ? "bg-upPink hover:bg-upPinkDark text-upWhite hover:shadow-lg hover:shadow-upPink/20"
                    : "bg-upDark hover:bg-upBlack text-upWhite border border-upBorder"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-20 text-xs text-upGray">
        <Link href="/" className="hover:underline">Voltar para a Home</Link>
      </div>
    </div>
  );
}
