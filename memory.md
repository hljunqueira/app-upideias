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
