import Link from "next/link";

export default function Terms() {
  return (
    <div className="bg-upBlack min-h-screen text-upLightGray py-16 px-6">
      <div className="max-w-3xl mx-auto bg-upCard border border-upBorder rounded-2xl p-8 md:p-12">
        <Link href="/" className="text-upPink hover:underline text-sm font-semibold mb-6 inline-block">
          ← Voltar para a Home
        </Link>
        <h1 className="text-3xl font-bold text-upWhite mb-6">Termos de Uso</h1>
        <p className="text-xs text-upGray mb-8">Última atualização: 04 de julho de 2026</p>

        <div className="flex flex-col gap-6 text-sm text-upGray leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-upWhite mb-3">1. Uso Aceitável</h2>
            <p>
              Ao utilizar a plataforma UP Analytics, você concorda em não tentar extrair dados através de robôs ou métodos automatizados invasivos e em utilizar a ferramenta apenas para fins de gestão de suas próprias marcas ou de clientes associados com permissão explícita.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-upWhite mb-3">2. Conexão com Redes Sociais</h2>
            <p>
              Para acessar as métricas, você concorda em vincular sua conta do Instagram Business ou Creator por meio do fluxo de autenticação oficial da Meta. É de sua inteira responsabilidade manter sua conta com credenciais ativas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-upWhite mb-3">3. Assinatura e Cancelamento</h2>
            <p>
              Os planos são cobrados mensalmente ou anualmente de forma recorrente. A alteração de limites e configurações de features obedece estritamente às regras de cada plano de forma dinâmica, e o cancelamento interrompe a renovação automática para o ciclo seguinte.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-upWhite mb-3">4. Limitação de Responsabilidade</h2>
            <p>
              Nós não garantimos taxas de crescimento de seguidores ou alcance no Instagram. O UP Analytics fornece diagnósticos e insights estratégicos baseados em algoritmos inteligentes e históricos, mas a execução final e os resultados comerciais competem à sua marca.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
