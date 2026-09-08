---
name: deploy-and-database
description: Guia operacional de deploy (Vercel Frontend e Docker VPS Backend) e referência exata do schema de todas as tabelas e colunas do PostgreSQL (Supabase) do UP Ideias.
---

# Deploy & Database Reference - UP Ideias

Este documento é a referência operacional definitiva para **deploys de frontend e backend** e para a estrutura de **tabelas e colunas do banco de dados PostgreSQL** da plataforma UP Ideias.

---

## 1. Arquitetura e Procedimentos de Deploy

### A. Frontend (Vercel)
- **Domínio Principal**: `https://www.upideias.com`
- **Ambiente**: Produção (Vercel Project `henriques-projects-31af9234/app-upideias`)
- **Gatilho de Deploy**:
  1. **Automático**: Qualquer `git push origin main` dispara o build e deploy de produção na Vercel.
  2. **Manual (CLI)**:
     ```bash
     cd apps/web
     npx vercel --prod
     ```
- **Rotas e Páginas**: Next.js 14 App Router com 44 rotas estáticas e dinâmicas pré-renderizadas.
- **Validação prévia obrigatória**:
  ```bash
  cd apps/web
  npx tsc --noEmit
  ```

---

### B. Backend e Container Web (VPS Hostinger / Docker)
- **IP do Servidor**: `184.107.141.97`
- **Usuário SSH**: `root@184.107.141.97` (autenticação por chave SSH sem senha)
- **Diretório do Projeto na VPS**: `/opt/upideias/app-upideias`
- **URL da API**: `https://api.upideias.com`
- **Porta Local da Aplicação Web**: `3000` (mapeada no container `up-analytics-web`)
- **Proxy Reverso**: `main-caddy` (Caddy) gerenciando portas 80/443 com certificados automáticos Let's Encrypt.
- **Script Oficial de Deploy**:
  O script `/opt/upideias/app-upideias/scripts/deploy-vps.sh` executa o fluxo completo:
  1. `git fetch origin main && git reset --hard origin/main`
  2. Sanitização do arquivo `.env`
  3. `docker compose down`
  4. `docker compose up -d --build --remove-orphans`
  5. `docker image prune -f`
- **Comando de Execução do Deploy via SSH**:
  ```bash
  ssh root@184.107.141.97 "bash /opt/upideias/app-upideias/scripts/deploy-vps.sh"
  ```
- **Containers Ativos na VPS**:
  - `up-analytics-web`: Container Next.js compilado para produção (`app-upideias-web`)
  - `supabase-db`: PostgreSQL 17 com pgvector (porta interna `5432`)
  - `supabase-auth`: GoTrue Auth service
  - `supabase-rest`: PostgREST API
  - `supabase-storage`: Serviço de arquivos e upload
  - `supabase-studio`: Painel visual do Supabase
  - `main-caddy`: Proxy reverso global da VPS

---

## 2. Como Executar Comandos no Banco de Dados

### A. Via SSH direto no PostgreSQL (Container `supabase-db`)
Para executar consultas ou migrations diretamente:
```bash
# Executar comando SQL único
ssh root@184.107.141.97 "docker exec -i supabase-db psql -U postgres -d postgres -c 'SELECT * FROM plans;'"

# Executar script SQL via pipe
Get-Content migrations.sql | ssh root@184.107.141.97 "docker exec -i supabase-db psql -U postgres -d postgres"
```

### B. Via Node.js com Supabase Client
O script `scripts/check_db.mjs` conecta diretamente à API pública:
```bash
node scripts/check_db.mjs
```

---

## 3. Dicionário Completo de Tabelas e Colunas (38 Tabelas)

Todas as tabelas residem no schema `public` do PostgreSQL.

### A. Planos, Limites e Assinaturas
#### `plans`
| Coluna | Tipo | Descrição / Regra |
| :--- | :--- | :--- |
| `id` | `uuid` | Identificador único (PK) |
| `slug` | `text` | Identificador textual (`iniciante`, `premium`, `pro`, `enterprise`, `agencia`) |
| `name` | `text` | Nome oficial exibido |
| `description` | `text` | Resumo do plano |
| `monthly_price_cents` | `integer` | Preço mensal em centavos (ex: 5490 = R$ 54,90, 0 para Enterprise) |
| `annual_price_cents` | `integer` | Preço anual em centavos (ex: 54900 = R$ 549,00) |
| `trial_days` | `integer` | Dias de teste gratuito |
| `is_featured` | `boolean` | Destaque na grade (True para Plano Pro) |
| `is_active` | `boolean` | Flag de disponibilidade |
| `sort_order` | `integer` | Ordem de exibição na grade (1 a 4) |
| `created_at` / `updated_at` | `timestamptz` | Carimbos de data/hora |

#### `plan_limits`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `plan_id` | `uuid` | FK para `plans.id` |
| `max_instagram_accounts` | `integer` | Limite de contas (1=Iniciante, 2=Premium, 5=Pro, -1=Enterprise) |
| `history_days` | `integer` | Dias de métricas (30=Iniciante, 60=Premium, 90=Pro, -1=Enterprise) |
| `max_clients` | `integer` | Slots na área do cliente (0=Iniciante/Premium, 1=Pro, -1=Enterprise) |
| `max_users` | `integer` | Número máximo de assentos |
| `max_scheduled_posts` | `integer` | Agendamentos simultâneos |
| `max_ai_requests_month` | `integer` | Campo legado |
| `max_whatsapp_messages_month` | `integer` | Campo legado |
| `max_social_accounts` | `integer` | Teto total de contas |

#### `plan_features`
- `id` (`uuid`), `plan_id` (`uuid`), `feature_key` (`text`), `feature_name` (`text`), `feature_description` (`text`), `is_enabled` (`boolean`), `limit_value` (`integer`), `config` (`jsonb`).

#### `subscriptions`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK para `auth.users` |
| `plan_name` | `text` | Nome do plano contratado (`Iniciante`, `Premium`, `Pro`, `Enterprise`) |
| `amount` | `numeric` | Valor contratado em reais |
| `amount_cents` | `integer` | Valor em centavos |
| `status` | `text` | `active`, `canceled`, `past_due`, `incomplete` |
| `cycle` | `text` | `monthly` ou `annual` |
| `current_period_start` | `timestamptz` | Início do ciclo vigente |
| `current_period_end` | `timestamptz` | Fim do ciclo vigente |
| `payment_provider` | `text` | `Cartão de Crédito`, `PIX`, `Boleto` |
| `payment_provider_customer_id` | `text` | ID do cliente no gateway |
| `payment_provider_subscription_id` | `text` | ID da transação |

---

### B. Usuários e Perfis
#### `profiles`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | PK (vinculado a `auth.users.id`) |
| `name` | `text` | Nome completo do usuário |
| `email` | `text` | E-mail da conta |
| `phone` | `text` | Telefone / Contato |
| `role` | `text` | `user`, `admin` |
| `plan` | `text` | Nome do plano ativo (`Iniciante`, `Premium`, `Pro`, `Enterprise`) |
| `status` | `text` | `Ativo`, `Inativo`, `Pendente` |
| `instagram_handle` | `text` | @ do Instagram principal |
| `avatar_url` | `text` | URL da foto de perfil |
| `bio` | `text` | Bio institucional |
| `has_used_upgrade_discount` | `boolean` | Flag que trava desconto de primeiro ciclo |
| `whatsapp_opt_in` / `whatsapp_opt_in_at` | `boolean`, `timestamptz` | Preferência de notificação |

#### `clients` (Área do Cliente B2B)
- `id` (`uuid`), `owner_user_id` (`uuid`), `name` (`text`), `email` (`text`), `phone` (`text`), `company` (`text`), `status` (`text`), `created_at`, `updated_at`.

#### `notifications` & `notification_preferences`
- `notifications`: `id`, `user_id`, `scope`, `title`, `description`, `type`, `link`, `unread` (`boolean`), `created_at`.
- `notification_preferences`: `id`, `user_id`, `weekly_report`, `daily_tips`, `performance_alerts`, `billing_alerts`, `post_reminders`, `preferred_time`.

---

### C. Instagram & Métricas Oficiais (Meta Graph API)
#### `social_accounts` (Contas Conectadas via Nango)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK para `auth.users` (isolamento obrigatório) |
| `client_id` | `uuid` | Opcional (vínculo a cliente B2B) |
| `platform` | `USER-DEFINED` | `instagram`, `facebook` |
| `external_account_id` | `varchar` | ID do perfil na Meta |
| `username` | `text` | @ oficial sem arroba |
| `name` | `text` | Nome exibido no Instagram |
| `profile_picture_url` | `text` | Foto sincronizada |
| `account_type` | `text` | `BUSINESS` ou `MEDIA_CREATOR` |
| `followers_count` | `integer` | Total de seguidores |
| `following_count` | `integer` | Total seguindo |
| `media_count` | `integer` | Número de publicações |
| `status` | `text` | `connected`, `disconnected` |
| `connected_at` | `timestamptz` | Data da conexão |

#### `social_account_metrics` & `instagram_daily_metrics`
- `followers_count`, `reach`, `views`, `profile_views`, `website_clicks`, `interactions`, `engagement_rate`, `metric_date`.

#### `social_audience_snapshots`
- `age_distribution` (`jsonb`), `gender_distribution` (`jsonb`), `top_cities` (`jsonb`), `top_countries` (`jsonb`).

#### `social_content` & `instagram_media`
- `id`, `instagram_media_id`, `caption`, `permalink`, `thumbnail_url`, `media_url`, `media_type` (`IMAGE`, `VIDEO`, `CAROUSEL_ALBUM`), `published_at`, `like_count`, `comments_count`.

#### `social_connection_credentials`
- `account_id`, `access_token`, `refresh_token`, `platform`.

#### `sync_logs`
- `id`, `instagram_account_id`, `status` (`success`, `error`), `message`, `started_at`, `finished_at`.

---

### D. UP Creator (Cursos & Trilhas de Aprendizado)
#### `courses`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `text` | Slug do curso (ex: `analise-metricas-instagram`) |
| `title` | `text` | Título do curso |
| `description` | `text` | Descrição técnica detalhada |
| `track` | `text` | Trilha associada (ex: `Analytics & Inteligência`) |
| `tag` | `text` | Categoria de exibição (ex: `Analytics`) |
| `level` | `text` | `Iniciante`, `Intermediário`, `Avançado` |
| `access_tier` | `text` | `Todos os Planos`, `Plano Premium`, `Plano Pro`, `Plano Enterprise` |
| `thumbnail_url` | `text` | URL da imagem de capa |
| `video_teaser_url` | `text` | URL do teaser demonstrativo |
| `xp_reward` | `integer` | Carga horária estimada em horas |
| `modules_count` | `integer` | Quantidade de módulos |
| `lessons_count` | `integer` | Quantidade de aulas |
| `is_landing_page_featured`| `boolean` | Destaque na vitrine externa |
| `is_recommended_first` | `boolean` | Indicador "Começar por aqui" |
| `status` | `text` | `published` ou `draft` |

#### `modules` & `lessons`
- `modules`: `id` (`uuid`/`text`), `course_id`, `title`, `description`, `order_index`.
- `lessons`: `id`, `module_id`, `course_id`, `title`, `description`, `video_url`, `video_provider` (`youtube`, `vimeo`, `pandavideo`), `duration_minutes`, `is_free_preview` (`boolean`), `order_index`.

#### `learning_trails`
- `id` (`text`), `name` (`text`), `description` (`text`), `recommended_order` (`integer`), `courses_count` (`integer`).

#### `user_lesson_progress` & `user_course_progress`
- `user_lesson_progress`: `id`, `user_id`, `lesson_id`, `course_id`, `is_completed` (`boolean`), `watched_seconds`, `last_accessed_at`.
- `user_course_progress`: `id`, `user_id`, `course_id`, `progress_percent`, `is_completed`, `last_accessed_at`.

---

### E. Conteúdo & Calendário
- `content_calendar`: `id`, `user_id`, `client_id`, `content_idea_id`, `instagram_account_id`, `planned_date`, `planned_time`, `status`, `notes`.
- `content_approvals`: `id`, `user_id`, `client_id`, `content_idea_id`, `status` (`pending`, `approved`, `rejected`), `client_comment`, `approved_at`.
- `content_library`: `id`, `user_id`, `client_id`, `type`, `title`, `content`, `tags` (`ARRAY`).
- `content_ideas`: `id`, `user_id`, `client_id`, `format`, `title`, `caption`, `script`, `cta`, `status`.

---

### F. Tabelas de Integração / Webhooks
- `webhook_event_logs`: `provider` (`nango`, `meta`), `provider_event_id`, `event_type`, `payload` (`jsonb`), `processed_at`.
- `user_social_providers`: `provider`, `phyllo_user_id` (legado).
- `automation_events`, `whatsapp_messages`, `ai_requests`, `ai_insights`: Tabelas mantidas para integridade referencial com eventos arquivados.

---

## 4. Regras Obrigatórias para Novas Sessões

1. **Zero Mocks**: Nenhuma tela deve utilizar objetos estáticos de demonstração quando a API ou banco estiverem disponíveis.
2. **Fail-Closed em Assinaturas**: Se o plano do usuário não for resolvido ou a sessão estiver expirada, a permissão fecha no nível `Iniciante`. NUNCA liberar `Pro` como padrão.
3. **Design Limpo e Minimalista**: Sem ícones decorativos, troféus, emojis ou badges exagerados ("sem icones e design limpo").
4. **Isolamento de Contas**: Toda query em `social_accounts`, `metrics` e `clients` DEVE filtrar por `user_id = auth.uid()`.
5. **Universalidade de Relatórios**: O recurso de exportação oficial (`exportReports: true`) pertence a todos os 4 planos.
