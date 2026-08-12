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
- **Padronização de Confirmações de Exclusão (`ConfirmModal`):** É estritamente proibido usar `window.confirm()` nativo do navegador. Qualquer modal/ação de exclusão deve utilizar o componente `@/components/ui/ConfirmModal`.
- **Proteção de Vídeos no UP Creator (`ProtectedVideoPlayer`):** Toda exibição de vídeo/aula deve utilizar o `<ProtectedVideoPlayer />` (`@/components/creator/ProtectedVideoPlayer`). O player aplica overlay transparente no topo do iframe (bloqueando clique em "Assistir no YouTube" e título), desabilita o menu de contexto (`onContextMenu`), oculta a marca do YouTube e aceita comandos da API do Iframe do YouTube (`postMessage`) para controlar a velocidade de reprodução (1x, 1.25x, 1.5x, 2x). Os vídeos no YouTube Studio devem ser gravados/configurados como **Não Listados** com incorporação liberada.
- **Unificação Dinâmica de Planos & Benefícios:** A interface `PlanConfig` em `@up-analytics/types` é a fonte de dados padrão para o ecossistema. Toda a interface (Landing Page `Pricing.tsx`, `/admin/plans`, `/admin/users`, `/admin/subscriptions`, `PlanGate`) consome planos dinamicamente de `getStoredPlans()` / `planService`. É estritamente proibido criar mapas hardcoded de benefícios (ex: `DEFAULT_BENEFITS_MAP`) ou seletores fixos com nomes de planos desatualizados (ex: `"Start"`).
- **Editor Dinâmico de Benefícios no Admin:** O modal em `/admin/plans` permite que administradores incluam, editem e removam itens textuais da `featuresList` diretamente, propagando alterações instantaneamente para a Landing Page e o Checkout.
- **Fluxo Obrigatório de Cadastro via Google OAuth \(\longrightarrow\) Checkout:** O cadastro via Google Auth em `/register` preserva o plano escolhido e passa o parâmetro `next=/checkout?plan=PLANO`, garantindo que novos usuários passem pela etapa de contratação/checkout antes de acessar a Dashboard.
- **Seed de Planos Zerada:** O arquivo `supabase/seed.sql` teve as inserções estáticas de planos removidas para permitir o cadastro e configuração zerados de planos pelo administrador via painel.

