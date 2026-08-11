# Memória do Projeto e Decisões Permanentes

- **Aplicação Única Frontend:** `apps/web` é a fonte única oficial do frontend (Next.js 14). Os diretórios históricos `frontend/` e `apps/mobile/` foram completamente removidos no P1.
- **Estratégia Mobile Oficial:** Web Responsivo -> Capacitor -> Android / iOS. Não utilizar React Native/Expo.
- **Documento Oficial de Regras:** `AGENTS.md` na raiz é a autoridade única e definitiva de diretrizes do projeto.
- **Modelos Sociais Agnósticos (`packages/types`):** `SocialPlatform` ('instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'x'), `SocialAccount`, `SocialAccountMetrics`, `SocialContent`, `SocialContentMetrics` e `AudienceMetrics` (propriedades em camelCase).
- **Provedor de Dados Sociais (`packages/lib`):** Abstração `SocialProvider` tipada sem `any` e implementada por `MockSocialProvider`.
- **Arquitetura Traseira da Phyllo:** Phyllo -> Backend/Worker em VPS -> Normalização -> PostgreSQL (Supabase) -> UP Analytics UI. O frontend nunca consumirá a Phyllo API diretamente.
- **Deploy de Produção:** Vercel (`upideias.com`) compilando `apps/web` via `npm run build --workspace=apps/web`.
