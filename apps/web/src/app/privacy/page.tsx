import Link from "next/link";

export default function Privacy() {
  return (
    <div className="bg-upBlack min-h-screen text-upLightGray py-16 px-6">
      <div className="max-w-3xl mx-auto bg-upCard border border-upBorder rounded-2xl p-8 md:p-12">
        <Link href="/" className="text-upPink hover:underline text-sm font-semibold mb-6 inline-block">
          ← Voltar para a Home
        </Link>
        <h1 className="text-3xl font-bold text-upWhite mb-6">Política de Privacidade</h1>
        <p className="text-xs text-upGray mb-8">Última atualização: 04 de julho de 2026</p>

        <div className="flex flex-col gap-6 text-sm text-upGray leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-upWhite mb-3">1. Coleta de Informações</h2>
            <p>
              Ao utilizar o UP Analytics, coletamos dados de perfil necessários para a prestação do serviço (como nome, e-mail e telefone) e dados de performance de redes sociais através da integração oficial com a API do Instagram Graph da Meta, sempre após autorização explícita do usuário.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-upWhite mb-3">2. Uso de APIs e Sem Scraping</h2>
            <p>
              Nós não utilizamos técnicas de raspagem de dados (scraping) sob nenhuma hipótese. Todos os dados exibidos no painel do usuário originam-se exclusivamente de APIs oficiais. Não salvamos senhas de perfis do Instagram.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-upWhite mb-3">3. Integração com WhatsApp</h2>
            <p>
              As mensagens automáticas e relatórios são enviados ao usuário por canais de mensageria com base na autorização (opt-in) que pode ser desabilitada a qualquer momento através do painel de configurações de automações.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-upWhite mb-3">4. Segurança de Dados</h2>
            <p>
              Seus dados pessoais e credenciais de acesso às APIs oficiais são encriptados de ponta a ponta e armazenados de forma isolada e segura usando o Supabase no nosso cluster de servidores Docker.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-upWhite mb-3">5. Seus Direitos</h2>
            <p>
              Você pode solicitar a qualquer momento a remoção completa dos seus dados de acesso do Instagram e exclusão permanente de sua conta através de nossa página dedicada de exclusão de dados.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
