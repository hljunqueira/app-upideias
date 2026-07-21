import Link from "next/link";

export default function DataDeletion() {
  return (
    <div className="bg-upBlack min-h-screen text-upLightGray py-16 px-6">
      <div className="max-w-3xl mx-auto bg-upCard border border-upBorder rounded-2xl p-8 md:p-12">
        <Link href="/" className="text-upPink hover:underline text-sm font-semibold mb-6 inline-block">
          ← Voltar para a Home
        </Link>
        <h1 className="text-3xl font-bold text-upWhite mb-6">Exclusão de Dados do Facebook/Instagram</h1>
        <p className="text-xs text-upGray mb-8">Última atualização: 04 de julho de 2026</p>

        <div className="flex flex-col gap-6 text-sm text-upGray leading-relaxed">
          <p>
            O UP Analytics é um aplicativo integrado com a Meta Graph API. Em conformidade com as regras de proteção de dados da Meta, fornecemos esta página para orientar o usuário sobre como remover suas credenciais e apagar qualquer histórico de informações sincronizadas do seu perfil.
          </p>

          <section>
            <h2 className="text-lg font-bold text-upWhite mb-3">Como solicitar a exclusão de dados</h2>
            <p>
              Você pode realizar a remoção de forma simples e imediata seguindo as etapas abaixo:
            </p>
            <ol className="list-decimal pl-5 mt-3 flex flex-col gap-2">
              <li>Acesse o painel do UP Analytics e faça o login com suas credenciais.</li>
              <li>Vá para a página de <strong>Configurações</strong> e clique na aba <strong>Integrações</strong>.</li>
              <li>Ao lado da conta vinculada do Instagram, clique em <strong>Desconectar e Apagar Histórico</strong>.</li>
              <li>Alternativamente, você pode nos enviar uma solicitação através do e-mail <strong>suporte@upideias.com</strong> solicitando a exclusão total da sua conta e de todos os dados salvos associados aos seus tokens da Meta.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-upWhite mb-3">O que acontece ao excluir seus dados</h2>
            <p>
              Após a confirmação da solicitação, todos os tokens de acesso são imediatamente invalidados, e todos os registros de métricas diárias, posts e históricos de mídia associados àquela conta do Instagram são excluídos de forma permanente e irreversível dos nossos servidores.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
