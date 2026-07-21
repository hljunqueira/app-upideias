# UP Analytics — Credenciais de Teste

## Contas (JWT email/senha)
| Papel | Email | Senha |
|---|---|---|
| Admin | admin@upideias.com | Admin@2026 |
| Usuário demo | creator@upideias.com | Creator@2026 |

## Google Auth (Emergent-managed)
- Login social via https://auth.emergentagent.com (sem senha gerenciada pelo app)
- Sessões salvas em `user_sessions` (session_token cookie)

## Endpoints de auth
- POST /api/auth/register {name, email, password}
- POST /api/auth/login {email, password}
- POST /api/auth/session (header X-Session-ID) — Google
- GET /api/auth/me
- POST /api/auth/logout

## Notas
- Cookies: access_token (JWT) e session_token (Google), httpOnly, secure, samesite=none
- Cada usuário novo recebe dados demo de Instagram (conta @upideias + 30 dias de métricas + 9 posts)
- DB: up_analytics (MongoDB local)
