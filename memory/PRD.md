# UP Analytics by UpIdeias — PRD

## Problema original
"Revisar app no github e melhorar, já tem a proposta e só fazer funcionar conectar com backend, revise tudo o app-upideias e sugira modificações"

O repositório original era um monorepo Next.js/Expo desenhado para Supabase + Gemini + Meta Graph API + Evolution API, mas sem backend funcional (serviços mock/Supabase inacessível).

## Escolhas do usuário (21/06/2026... registrado 2026-07-21)
- Backend: FastAPI + MongoDB (substituindo Supabase)
- IA: Gemini (gemini-3-flash-preview) via Emergent LLM key
- Instagram: dados SIMULADOS/demo (Meta API real fica para depois)
- Auth: JWT email/senha + Google (Emergent-managed)
- Escopo: tudo (dashboard, IA, calendário, aprovações, billing, WhatsApp simulado, UP Creator)

## Arquitetura atual
- `/app/frontend` — Next.js 14 App Router standalone (porta 3000, dark theme upPink). Aliases tsconfig: `@up-analytics/lib` → `src/lib/api.ts`, `@up-analytics/types` → `src/lib/types.ts`, `@up-analytics/ui` → `src/lib/ui/`
- `/app/backend/server.py` — FastAPI + Motor MongoDB (porta 8001, prefixo /api)
- `/app/apps`, `/app/packages`, `/app/supabase` — código original do monorepo (mantido como referência, não usado em runtime)
- DB: `up_analytics` — collections: users, user_sessions, login_attempts, instagram_accounts, instagram_daily_metrics, instagram_media, ai_insights, ai_requests, content_ideas, whatsapp_messages, sync_logs

## Implementado (2026-07-21)
- Auth dupla: JWT (bcrypt, cookies httpOnly) + Google via Emergent Auth (session_token); brute-force lockout (X-Forwarded-For); admin/demo seedados
- Seed automático de dados demo por usuário: conta IG @upideias, 30 dias de métricas, 9 posts realistas
- Dashboard conectado ao backend (KPIs, gráfico 30d, tabela de posts, sync simulado)
- IA Gemini real: /api/ai/insight (diagnóstico estruturado), /api/ai/ideas (ideias completas com hook/caption/script/hashtags), /api/ai/caption, /api/ai/usage
- WhatsApp SIMULADO (loga + persiste), planos e billing simulados, guard de rota + logout funcionais
- Testado: 20/20 backend, 9/9 fluxos frontend (iteration_1.json)

## Itens MOCKADOS (destacar ao usuário)
- Métricas Instagram (demo seedado, sem Meta Graph API)
- WhatsApp (sem Evolution API real)
- Billing (sem gateway de pagamento)
- KPIs de Ads no dashboard rotulados "— Demo"

## Backlog priorizado
- P0: Conectar Meta Instagram Graph API real (precisa META_APP_ID/SECRET + conta business aprovada)
- P1: Persistir calendário editorial, aprovações e biblioteca no backend (hoje páginas usam dados estáticos internos)
- P1: Pagamentos reais (Stripe) para planos Iniciante/Pro/Agência
- P2: WhatsApp real via Evolution API + relatórios semanais agendados
- P2: UP Creator com vídeos/progresso persistidos; painel admin funcional
- P2: Forgot/reset password; app mobile Expo
