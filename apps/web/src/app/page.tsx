import Link from "next/link";

export default function Home() {
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
    <div className="bg-[#1d1010] text-[#f8dcdc] min-h-screen flex flex-col font-sans overflow-x-hidden antialiased selection:bg-[#ff5368]/30 selection:text-white">
      {/* Header / Nav */}
      <header className="fixed top-0 w-full z-50 bg-[#111116]/80 backdrop-blur-md border-b border-[#26262D]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="#" className="flex items-center gap-2 group">
            <img
              alt="UP Logo"
              className="h-16 w-auto object-contain group-hover:opacity-80 transition-opacity"
              src="/UP-Logo-removebg-preview.png"
            />
            <span className="text-3xl font-extrabold tracking-tight text-white">Analytics</span>
            <span className="text-[10px] text-[#6b7280] border-l border-[#26262D] pl-2 hidden sm:inline">by UpIdeias</span>
          </Link>
          <nav className="hidden md:flex gap-8">
            <a href="#beneficios" className="text-sm text-[#e2bebe] hover:text-white transition-colors">Benefícios</a>
            <a href="#planos" className="text-sm text-[#e2bebe] hover:text-white transition-colors">Planos</a>
            <a href="#up-creator" className="text-sm text-[#e2bebe] hover:text-white transition-colors">UP Creator</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[#e2bebe] hover:text-white transition-colors">
              Entrar
            </Link>
            <Link
              className="bg-[#ff5368] text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-[#E64058] transition-colors shadow-lg shadow-[#ff5368]/20"
              href="/register"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-[100px]">
        {/* Hero Section */}
        <section className="relative pt-12 pb-32 px-6 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#ff5368]/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            {/* Hero Copy */}
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#ff5368]/30 bg-[#ff5368]/10 w-fit mx-auto lg:mx-0">
                <svg className="w-4 h-4 text-[#ff5368]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                <span className="text-xs font-semibold text-[#ff5368]">Nova versão 2.0 disponível</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white max-w-2xl leading-tight mx-auto lg:mx-0">
                Transforme métricas em <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff5368] to-white">estratégia.</span>
              </h1>
              
              <p className="text-base md:text-lg text-[#e2bebe] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Tenha controle absoluto sobre seus dados. Uma plataforma SaaS de alta performance projetada para clareza, precisão e decisões baseadas em insights visuais atraentes.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 justify-center lg:justify-start">
                <Link
                  className="w-full sm:w-auto bg-[#ff5368] text-white text-sm font-semibold px-8 py-3.5 rounded-lg hover:bg-[#E64058] transition-colors shadow-lg shadow-[#ff5368]/20 text-center"
                  href="/register"
                >
                  Começar Teste Grátis
                </Link>
                <Link
                  className="w-full sm:w-auto border border-[#26262D] text-white text-sm font-semibold px-8 py-3.5 rounded-lg hover:bg-[#111116] transition-colors text-center"
                  href="/login"
                >
                  Já tenho uma conta
                </Link>
              </div></div>

            {/* Hero Visual (Bento/Floating Cards) */}
            <div className="relative h-[300px] sm:h-[400px] md:h-[500px] w-full mt-12 lg:mt-0 flex items-center justify-center">
              {/* Main Dashboard Preview Card */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl bg-[#0B0B0F] border border-[#26262D] shadow-2xl transition-all duration-700 hover:scale-[1.02]">
                <img
                  alt="Premium mobile app analytics dashboard mockup"
                  className="h-full w-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHc7PyYN-u_sFmzUAQCh3cmgY1Ku5v4pVdGlV74ww2ItnIx6dgBuS-xmGjidlPrZPjYbx1vFijTNJU1YsViHGgtwtxzSItsdK_dj18s7Q81JKuwupMwSk3Rwfp84nmmNP4k45AUgS_u-aBLspIjnxRkkqx1JLzgBu27aMFTq2qMrmc1_jEITzxwwQawarnvWWZSZUv6CT-Gbnj4d1UNQAwHJ2ZEkyYPVJu6g36SvR_Q5r_XeCbffSOfOrPRr3pIs4BykhUkMtpvruj"
                />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-2 sm:-right-6 bg-[#111116]/90 backdrop-blur-md border border-[#26262D] rounded-full px-6 py-2.5 flex items-center gap-3 shadow-2xl animate-bounce">
                <div className="w-8 h-8 rounded-full bg-[#ff5368]/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#ff5368]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[9px] text-[#e2bebe] uppercase font-bold tracking-wider">Sincronização</div>
                  <div className="text-xs text-white font-bold">Tempo Real</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefícios Section */}
        <section className="py-24 px-6 bg-[#0B0B0F] relative border-t border-[#26262D]" id="beneficios">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Insights claros, decisões rápidas.</h2>
              <p className="text-base text-[#e2bebe]">Nossa arquitetura de dados prioriza a clareza, eliminando ruídos visuais para focar no que realmente importa para o seu negócio.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-[#111116] border border-[#26262D] rounded-2xl p-8 hover:border-[#ff5368]/50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-[#1d1010] flex items-center justify-center mb-6 group-hover:bg-[#ff5368]/20 transition-colors">
                  <svg className="w-6 h-6 text-[#e2bebe] group-hover:text-[#ff5368]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Visibilidade Total</h3>
                <p className="text-sm text-[#e2bebe] leading-relaxed">Painéis minimalistas de alto contraste garantem que as métricas vitais se destaquem instantaneamente.</p>
              </div>

              {/* Card 2 */}
              <div className="bg-[#111116] border border-[#26262D] rounded-2xl p-8 hover:border-[#ff5368]/50 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff5368]/5 rounded-bl-full pointer-events-none group-hover:bg-[#ff5368]/10 transition-colors"></div>
                <div className="w-12 h-12 rounded-xl bg-[#1d1010] flex items-center justify-center mb-6 group-hover:bg-[#ff5368]/20 transition-colors">
                  <svg className="w-6 h-6 text-[#e2bebe] group-hover:text-[#ff5368]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Alta Performance</h3>
                <p className="text-sm text-[#e2bebe] leading-relaxed">Processamento em tempo real sem engasgos. Uma experiência fluida construída para operações ágeis.</p>
              </div>

              {/* Card 3 */}
              <div className="bg-[#111116] border border-[#26262D] rounded-2xl p-8 hover:border-[#ff5368]/50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-[#1d1010] flex items-center justify-center mb-6 group-hover:bg-[#ff5368]/20 transition-colors">
                  <svg className="w-6 h-6 text-[#e2bebe] group-hover:text-[#ff5368]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Estrutura Precisa</h3>
                <p className="text-sm text-[#e2bebe] leading-relaxed">Camadas tonais sutis criam profundidade sem distrações, mantendo o foco exclusivo nos seus dados.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Planos Section */}
        <section id="planos" className="py-24 px-6 bg-[#1d1010] relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Escolha o plano ideal para você</h2>
              <p className="text-base text-[#e2bebe]">Preços transparentes com períodos de teste gratuito. Cancele quando quiser.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-8 rounded-2xl bg-[#111116] border relative flex flex-col justify-between ${
                    plan.isFeatured ? "border-[#ff5368] shadow-xl shadow-[#ff5368]/10" : "border-[#26262D]"
                  }`}
                >
                  {plan.isFeatured && (
                    <span className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-[#ff5368] text-[10px] uppercase font-bold text-white tracking-wider">
                      Mais Popular
                    </span>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-[#6b7280] mt-2">{plan.description}</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                      <span className="text-sm text-[#6b7280]">/{plan.period}</span>
                    </div>

                    <ul className="mt-8 flex flex-col gap-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="text-sm text-[#e2bebe] flex items-center gap-3">
                          <span className="text-[#ff5368]">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href="/register"
                    className={`mt-10 w-full py-3.5 text-center rounded-xl font-bold text-sm transition-all ${
                      plan.isFeatured
                        ? "bg-[#ff5368] hover:bg-[#E64058] text-white hover:shadow-lg hover:shadow-[#ff5368]/20"
                        : "bg-[#0B0B0F] hover:bg-[#111116] text-white border border-[#26262D]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-[#26262D] pt-16 pb-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <img
                alt="UP Logo"
                className="h-10 w-auto object-contain"
                src="/UP-Logo-removebg-preview.png"
              />
              <span className="font-bold text-white text-2xl">Analytics</span>
            </div>
            <span className="text-xs text-[#6b7280]">by UpIdeias • Todos os direitos reservados.</span>
          </div>

          <div className="flex gap-8 text-sm text-[#6b7280]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="/data-deletion" className="hover:text-white transition-colors">Exclusão de Dados</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
