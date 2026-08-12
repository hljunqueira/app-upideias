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
- **Fluxo de Onboarding de Primeiro Acesso (`OnboardingConnectModal.tsx`):** Ao acessar o aplicativo (`/app/dashboard`) pela primeira vez sem conta vinculada, um modal interativo em 3 passos orienta a vinculação do Instagram e dispara a sincronização automática de métricas na API (`mockSyncInstagramMetrics`).
- **Higienização White-Label nas Interfaces:** É estritamente proibido exibir o nome de fornecedores de infraestrutura (ex: Phyllo) nos botões ou textos do usuário. Todos os botões devem utilizar nomenclaturas proprietárias (ex: **"Sincronizar Todas as Contas"**, **"Detalhes da Conexão Social"**).
- **Arquitetura Social Phyllo API (`SocialProvider`):** É estritamente proibido criar formulários manuais no Admin (`/admin/accounts`) para digitar handles ou números fictícios de seguidores. As contas sociais são vinculadas exclusivamente pelo **próprio cliente assinante** no aplicativo (`/app`) via widget oficial **Phyllo Connect SDK** (`<PhylloConnectModal />`).
- **Papel da Tela de Contas no Admin (`/admin/accounts`):** O painel `/admin/accounts` atua exclusivamente para monitoramento de saúde de tokens, exibição de detalhes da conexão social, execução de sincronizações globais (`mockSyncInstagramMetrics`) e revogação de permissões com `ConfirmModal`.
- **Separacão de Escopos de Usuários no Admin:** O caminho `/admin/users` é estritamente dedicado à **Gestão de Clientes Assinantes da Plataforma** (Nome, E-mail, Instagram, Plano de Assinatura, Status). A **Equipe Interna e Administradores** continuam gerenciados separadamente na página `/admin/team`.
- **Desativação em vez de Exclusão (Soft-Delete):** É proibido deletar fisicamente clientes assinantes da tabela `profiles`. A remoção de acesso deve ser realizada via alteração do campo `status` para `'Suspenso'` (**Desativar Conta**), permitindo a **Reativação** a qualquer momento com o botão **Reativar Conta** (`status = 'Ativo'`).
- **Bloqueio de Contas Suspensas:** O `middleware.ts` valida o campo `status` da tabela `profiles` e redireciona usuários suspensos que tentem acessar `/app/*` para `/login?error=account_suspended`.

