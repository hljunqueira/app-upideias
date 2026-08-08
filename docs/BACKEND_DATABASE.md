# UP Ideias — Especificação de Backend & Banco de Dados

> Documento de referência para construir/evoluir o backend e o banco de dados do ecossistema UP Ideias (UP Analytics + UP Creator).
> Última atualização: 2026-08-08

---

## 1. Visão Geral & Stack

| Camada | Tecnologia | Observação |
|---|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind + Framer Motion | Porta 3000. Design system da landing (Unbounded/Caveat/Inter, coral #FF5368, dark) |
| Backend | FastAPI (Python) + Motor (async MongoDB) | Porta 8001, todas as rotas com prefixo `/api` |
| Banco | MongoDB (`DB_NAME=up_analytics`) | IDs próprios `uuid4` em string (nunca expor ObjectId) |
| IA | Gemini `gemini-3-flash-preview` via `emergentintegrations` (Emergent LLM Key) | Diagnósticos, ideias, legendas |
| Auth | JWT (bcrypt + cookies httpOnly) + Google (Emergent-managed) | Roles: `admin`, `user` |

### Variáveis de ambiente (backend/.env)
```
MONGO_URL, DB_NAME, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, EMERGENT_LLM_KEY, FRONTEND_URL
```
Frontend: `NEXT_PUBLIC_BACKEND_URL` (todas as chamadas usam `credentials: 'include'`).

---

## 2. Autenticação & Perfis (RBAC)

### Fluxos implementados
1. **E-mail/senha (JWT)** — `bcrypt` para hash, token JWT 7 dias em cookie `access_token` (httpOnly, secure, samesite=none). Brute-force lockout: 5 tentativas → 15 min de bloqueio (coleção `login_attempts`, chave `ip:email`).
2. **Google (Emergent Auth)** — frontend redireciona para `auth.emergentagent.com`; `session_id` é trocado por `session_token` em `/api/auth/session`; sessão persiste em `user_sessions` (7 dias).
3. **Seed automático no startup** — admin (`ADMIN_EMAIL`/`ADMIN_PASSWORD`, role `admin`) e demo assinante (`creator@upideias.com` / `Creator@2026`).

### Perfis e permissões
| Perfil | role | plan | Acesso |
|---|---|---|---|
| Admin | `admin` | — | `/admin/*` (painel geral, usuários, assinaturas, logs, UP Creator CMS) + tudo do app |
| Assinante | `user` | `start` / `pro` / `agencia` | `/app/*` conforme limites do plano |
| Usuário (trial/free) | `user` | trial 7 dias | `/app/*` com limites reduzidos |

Redirecionamento pós-login (frontend): `role === 'admin' → /admin`, senão `→ /app/dashboard`.

### Endpoints de auth
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | name, email, password (≥6). Seta cookie, retorna user |
| POST | `/api/auth/login` | email, password. Lockout 5x/15min. Retorna user (com `role`, `plan`) |
| POST | `/api/auth/session` | Header `X-Session-ID` (Google). Cria/loga usuário |
| GET | `/api/auth/me` | Usuário autenticado |
| POST | `/api/auth/logout` | Limpa cookies/sessão |
| ⏳ POST | `/api/auth/forgot-password` / `reset-password` | A construir (token `secrets.token_urlsafe(32)`, TTL 1h, coleção `password_reset_tokens`) |

---

## 3. Esquema do Banco (coleções MongoDB)

### 3.1 Existentes (implementadas)
**users**
```json
{ "user_id": "user_<hex12>", "email": "str (unique)", "name": "str", "picture": "str|null",
  "phone": "str|null", "role": "user|admin", "plan": "start|pro|agencia",
  "password_hash": "bcrypt (omitir em respostas)", "whatsapp_opt_in": true,
  "created_at": "ISO", "updated_at": "ISO" }
```
**user_sessions** — `{ user_id, session_token, expires_at (7d), created_at }`
**login_attempts** — `{ identifier: "ip:email", count, locked_until }`
**instagram_accounts** — `{ id, user_id, client_id, instagram_user_id, username, name, account_type, followers_count, media_count, access_token, token_expires_at, status, connected_at, ... }`
**instagram_daily_metrics** — `{ id, instagram_account_id, metric_date, followers_count, reach, views, profile_views, website_clicks, interactions, engagement_rate }` (1 doc/dia)
**instagram_media** — `{ id, instagram_account_id, instagram_media_id, media_type, media_product_type, caption, permalink, published_at, published_weekday, published_hour, like_count, comments_count, reach, engagement }`
**ai_insights** — `{ id, user_id, instagram_account_id, period_start/end, insight_type, title, summary, what_improved[], what_got_worse[], opportunities[], recommended_actions[], content_suggestions[] }`
**ai_requests** — `{ id, user_id, instagram_account_id, request_type, status, created_at }` (medição de uso p/ limites de plano)
**content_ideas** — `{ id, user_id, instagram_account_id, format, objective, niche, tone, theme, title, hook, caption, script, cta, hashtags[], visual_suggestion, status: draft|planned|approved|published, planned_date }`
**whatsapp_messages** — `{ id, user_id, type, phone, message, status, provider_message_id, sent_at }`
**sync_logs** — `{ id, instagram_account_id, status, message, started_at, finished_at }`

### 3.2 A construir (próximas fases)
**courses** (UP Creator CMS)
```json
{ "id": "uuid", "title": "str", "slug": "str", "tag": "Estratégia|Reels|...", "description": "str",
  "level": "Iniciante|Intermediário|Avançado", "track": "fundamentos|criadores|social_pro|agencias",
  "cover_video_url": "str", "thumbnail_url": "str", "duration_minutes": 220,
  "min_plan": "start|pro|agencia", "is_published": true, "sort_order": 1, "created_at": "ISO" }
```
**lessons** — `{ id, course_id, title, video_url, duration_seconds, sort_order, is_free_preview }`
**course_progress** — `{ id, user_id, course_id, lesson_id, seconds_watched, completed, updated_at }` (índice composto user_id+course_id)
**certificates** — `{ id, user_id, course_id, issued_at, code }`
**calendar_events** — `{ id, user_id, content_idea_id|null, title, format, scheduled_at, status: planned|approved|published }`
**clients** (plano Agência) — `{ id, agency_user_id, name, email, instagram_account_id, portal_token }`
**approvals** — `{ id, client_id, content_idea_id, status: pending|approved|rejected, feedback, decided_at }`
**subscriptions** — `{ id, user_id, plan_slug, status: trialing|active|past_due|canceled, provider: stripe, provider_subscription_id, current_period_start/end, trial_ends_at }`
**payment_transactions** — `{ id, user_id, session_id, amount_cents, currency, plan_slug, payment_status: pending|paid|failed|expired, created_at }` (nunca confiar em valores vindos do frontend — tabela de preços no backend)
**password_reset_tokens** — `{ token, user_id, expires_at (TTL index), used }`

### 3.3 Índices obrigatórios
```python
db.users.create_index("email", unique=True)
db.users.create_index("user_id")
db.user_sessions.create_index("session_token")
db.login_attempts.create_index("identifier")
db.instagram_daily_metrics.create_index([("instagram_account_id", 1), ("metric_date", 1)], unique=True)
db.course_progress.create_index([("user_id", 1), ("course_id", 1)])
db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
```

---

## 4. Endpoints do Sistema

### Implementados
| Área | Rotas |
|---|---|
| Instagram (demo) | GET `/api/instagram/accounts`, GET `.../{id}/metrics?days=30`, GET `.../{id}/posts`, POST `.../{id}/sync` |
| IA | POST `/api/ai/insight`, POST `/api/ai/ideas`, POST `/api/ai/caption`, GET `/api/ai/usage` |
| Conteúdo | GET `/api/content/ideas` |
| Automações | POST `/api/automations/whatsapp/send` (SIMULADO), GET `/api/automations/messages` |
| Planos | GET `/api/plans`, GET `/api/billing/subscription` (SIMULADO) |

### A construir
| Área | Rotas sugeridas |
|---|---|
| UP Creator | GET `/api/creator/courses`, GET `/api/creator/courses/{id}` (com lessons), POST `/api/creator/progress`, GET `/api/creator/progress`, POST `/api/creator/certificates/{course_id}` |
| Creator CMS (admin) | POST/PUT/DELETE `/api/admin/courses`, `/api/admin/lessons` (guard `role=admin`) |
| Calendário | CRUD `/api/calendar/events` |
| Aprovações | POST `/api/approvals`, PUT `/api/approvals/{id}` (portal do cliente via `portal_token`) |
| Admin | GET `/api/admin/stats`, GET `/api/admin/users` (paginação), PUT `/api/admin/users/{id}` (plan/role) |
| Pagamentos | Stripe Checkout: POST `/api/payments/checkout` (preço lido do backend!), GET `/api/payments/status/{session_id}`, webhook `/api/webhooks/stripe` |
| Meta API real | OAuth Meta + sync agendado (substituir seed demo) — requer `META_APP_ID/SECRET` |
| WhatsApp real | Evolution API (`EVOLUTION_API_URL/KEY`) substituindo simulação |

---

## 5. Regras de Negócio (limites por plano)
| Recurso | Start (R$97) | Pro (R$197) | Agência (R$497) |
|---|---|---|---|
| Contas Instagram | 1 | 3 | 10 |
| Usuários | 1 | 3 | 10 |
| Gerações de IA/mês | 30 | 150 | 500 |
| Histórico de métricas | 30 dias | 90 dias | 180 dias |
| UP Creator | trilha Fundamentos | completo + certificados | completo p/ equipe |
| Clientes + aprovações | — | — | até 10 |
| Relatórios WhatsApp | — | semanal | diário + PDF |

Enforcement: middleware/dependency que lê `user.plan` + contagem em `ai_requests` (mês corrente) antes de chamar a IA → 402/403 com mensagem amigável.

## 6. Convenções
- Todos os endpoints prefixados com `/api`; IDs `uuid4` string; datas ISO-8601 UTC (`datetime.now(timezone.utc)`).
- Nunca retornar `_id`/`password_hash`; sempre projeção `{"_id": 0}`.
- Erros com `detail` string em pt-BR.
- MOCKS atuais a substituir: métricas Instagram (seed), WhatsApp, billing.
