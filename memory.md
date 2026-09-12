# Memória do Projeto e Regras de Sessão

## Padrões Arquiteturais e Infraestrutura

- **Banco de Dados Oficial:** Supabase Self-Hosted dedicado na VPS em `/opt/upideias/supabase/` (`self-hosted/v0.8.0`), operando com PostgreSQL 17.6, API Gateway Envoy (`api-gw`) e Caddy reverse proxy.
- **Portas e Segurança de Host:** Zero binds públicos da stack Supabase no host (somente portas 22, 80 e 443 abertas).
- **Modelo Social Agnóstico:** Interfaces compartilhadas em `@up-analytics/types` (`SocialPlatform`, `SocialAccount`, `SocialAccountMetrics`, `SocialContent`, `SocialContentMetrics`, `AudienceMetrics`).
- **Isolamento de Credenciais:** `SocialAccount` é estritamente seguro para a UI (sem tokens ou segredos). `SocialConnectionCredentials` é mantido exclusivamente no banco server-side com RLS ativo sem políticas públicas e acesso exclusivo por `service_role`.
- **Migrations:** Migration `20260812000000_social_agnostic_schema.sql` é uma migration estrutural versionada, aplicada com fail-fast/`ON_ERROR_STOP=1`, protegida por preflight audit e com procedimento de rollback definido.

## Status das Fases
- **P1:** CONCLUÍDO (PR #1 merged na main).
- **P2.1:** CONCLUÍDO (Infraestrutura Supabase self-hosted, schema social agnóstico, RLS, grants, seed, build e HTTPS `api.upideias.com` configurados).
  - *Pendência Técnica:* Backup off-site para bucket S3/R2 configurado como **`BLOQUEADOR DE GO-LIVE COM DADOS REAIS DE CLIENTES`**.
- **P2.2 (Supabase Auth / Google OAuth):** PRÓXIMO PASSO (Aguardando merge do PR P2.1).

## Convenções de Código e Decisões de UI/UX

- **Conexão com Banco no UP Creator:** Todos os cursos, módulos, aulas e trilhas do UP Creator devem ser persistidos no Supabase (`courses`, `modules`, `lessons`, `learning_trails`). É proibido reinserir arrays de mock estáticos no `coursesStore.ts`.
- **Configurador e CRUD Completo de Planos (`/admin/plans`):** Permite **Criar Novos Planos** e **Excluir Planos** com confirmação (`ConfirmModal`). O campo de preço aceita e formata decimais com vírgula ou ponto (ex: `79,90` $\rightarrow$ `R$ 79,90`), exibindo o valor formatado nos cartões, landing page e checkout. Cada cartão de plano renderiza de forma sincronizada os Benefícios Textuais e as Permissões de Telas do App.
- **Notificações Reais via Supabase (`notificationsStore.ts` & `public.notifications`):** É estritamente proibido utilizar listas de mocks estáticos hardcoded para alertas do sistema. O `notificationsStore.ts` consulta em tempo real o PostgreSQL gerenciado via Supabase (`notifications`, `subscriptions`, `sync_logs`, `instagram_accounts`).
- **Seletor Dinâmico de Contas Sociais no Dashboard (`/app/dashboard`):** Quando um cliente possui mais de uma conta conectada (planos Pro/Agência), o cabeçalho do Dashboard renderiza um **Dropdown de Seleção de Conta** (`<select>`). O chaveamento busca e recarrega dinamicamente as métricas diárias, gráficos e publicações filtrados exclusivamente para a conta selecionada.
- **Higienização White-Label Estrita nas Interfaces (Regra de Ouro):**
  - É estritamente proibido exibir o nome de fornecedores de infraestrutura (Zernio, Nango, Phyllo) em qualquer tela, botão, título, modal ou mensagem de erro visível ao usuário final ou administradores.
  - Toda a comunicação textual utiliza exclusivamente termos proprietários e oficiais da plataforma: **"Conexão do Instagram"**, **"Instagram Profissional"**, **"Meta Graph API"**, **"ID da Conexão Social"**, **"Sincronizar Todas as Contas"**.
- **Arquitetura de Conexão Oficial do Instagram:**
  - As contas sociais são vinculadas exclusivamente pelo próprio assinante no aplicativo (`/app`) via modal oficial (`<SocialConnectModal />`), utilizando autenticação oficial direta em pop-up seguro com `loginMethod=instagram_login`.
- **Papel da Tela de Contas no Admin (`/admin/accounts`):**
  - Monitoramento de conexões ativas, visualização do ID da conexão social, execução de sincronizações reais via `/api/integrations/zernio/sync` e revogação de acessos com `ConfirmModal`.
- **Sincronização Imediata Pós-Conexão:**
  - No momento em que o Instagram é autorizado, o callback dispara a busca e a persistência imediata de perfil (`social_accounts`), métricas dos últimos 30 dias (`social_account_metrics`) e publicações recentes (`social_content`). O Dashboard é atualizado em tempo real via eventos do navegador sem exigir recarga de página (F5).
- **Sincronização Sob Demanda:**
  - O painel de logs do admin (`/admin/sync-logs`) e as telas de contas disparam `POST /api/integrations/zernio/sync`, atualizando os registros no PostgreSQL Supabase e gravando o log com duração de execução em `sync_logs`.
- **Favicon e Ícones com Fundo Transparente:**
  - O favicon principal da aplicação e a propriedade `metadata.icons` utilizam a logo oficial com fundo transparente (`/UP-Logo-removebg-preview.png`).

## Integração Oficial Zernio (Independência da Meta)
- **Provedor de Conexão Social:** Zernio API (`https://zernio.com/api/v1`).
- **Autenticação Direta sem App Review:** Utiliza o App ID oficial da Zernio aprovado com Advanced Access pela Meta (`1387147079198980`). O assinante não precisa de verificação de empresa ou criação de app no Meta for Developers.
- **Padrão de Conexão:** `loginMethod=instagram_login` (conexão direta em 1 etapa via popup seguro).
- **Diretrizes Estritas de Design:**
  - Zero ícones decorativos (sem troféus, sparkles, escudos ou estrelas).
  - Apenas o glifo oficial do Instagram é permitido exclusivamente nos botões de conexão para identificação de rede social.
  - Zero menções a IA ("Inteligência Artificial", robôs, etc.) nas telas e relatórios da integração.
- **Fail-Closed em Limites de Contas por Plano:**
  - Iniciante: 1 conta
  - Premium: 2 contas
  - Pro: 5 contas
  - Enterprise: Ilimitado (-1)





