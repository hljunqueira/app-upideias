# app-upideias

## [Visão Geral & Arquitetura]
- **Propósito**: Aplicação / Serviço app-upideias
- **Stack**: React (TypeScript), Nenhum / Nativo, CSS / Padrão, Docker
- **Estrutura Mapeada**:
- `/.vercel`
- `/.vscode`
- `/apps`
- `/backend`
- `/docs`
- `/frontend`
- `/memory`
- `/packages`
- `/stitch_up_analytics_dashboard`
- `/supabase`
- `/test_reports`

## [Comandos Essenciais]
- **Desenvolvimento Web**: `npm run dev:web`
- **Validação TypeScript**: `cd apps/web && npx tsc --noEmit`
- **Deploy Frontend (Vercel)**: `git push origin main` (automático) ou `npx vercel --prod`
- **Deploy Backend (VPS Docker)**: `ssh root@184.107.141.97 "bash /opt/upideias/app-upideias/scripts/deploy-vps.sh"`
- **Consulta Banco de Dados**: `ssh root@184.107.141.97 "docker exec -i supabase-db psql -U postgres -d postgres -c '<SQL>'"` ou `node scripts/check_db.mjs`

## [Skills & Protocolos de Execução Obrigatórios]

### 1. Skill: Grill Me & Quebrar Plano
- Se o pedido do usuário for ambíguo ou amplo, faça **1 a 3 perguntas diretas** antes de codificar.
- Decomponha qualquer tarefa grande em passos atômicos (um arquivo/função por vez).

### 2. Skill: Mapa de Contexto & Arquivos Protegidos
- Identifique e liste os arquivos que serão alterados antes de iniciar a edição.
- **Proibido alterar sem autorização**: arquivos `.env*`, configs de build (`next.config.js`, `tsconfig.json`) e credenciais.

### 3. Skill: Systematic Debugging (Zero Tentativa e Erro)
- Em caso de bug ou falha:
  1. Reproduza o erro e colete o log/mensagem exata.
  2. Isole a causa raiz e formule uma hipótese.
  3. Aplique a correção mínima necessária e valide.

### 4. Skill: Verification Before Completion (Sem "Pronto" Falso)
- NUNCA declare uma tarefa concluída sem rodar a validação fresca (`npx tsc --noEmit` ou build).
- Apresente a evidência do teste/comando executado na resposta.

### 5. Skill: Minto Pyramid & Comunicação
- Responda primeiro com a alteração/código final.
- Evite explicações teóricas desnecessárias; foque apenas nas justificativas técnicas indispensáveis.
- Mantenha o arquivo `SCRATCHPAD.md` sincronizado com o status do trabalho.

### 6. Skill: Deploy & Database Schema (`.agents/skills/deploy-and-database/SKILL.md`)
- **Frontend Vercel**: `https://www.upideias.com` sincronizado com branch `main`.
- **Backend VPS Docker**: `https://api.upideias.com` em `184.107.141.97` (`/opt/upideias/app-upideias`).
- **Banco PostgreSQL (38 tabelas)**: Consultar schema completo no arquivo da skill antes de gerar queries ou migrations.
- **Fail-Closed em Assinaturas**: Se o plano não for identificado, travar no nível `Iniciante`. NUNCA conceder `Pro` como fallback.
- **Design Limpo e Minimalista**: Sem ícones decorativos, troféus, emojis ou badges espalhafatosos ("sem icones e design limpo").

## [Skill: UI/UX Pro Max, Motion & Design]
- **Hierarquia & Acabamento**: Não aceite interfaces genéricas. Aplique espaçamento consistente (grid 4/8px), contraste correto e microinterações em todos os elementos clicáveis.
- **Cinematic Scroll & GSAP/Framer**: Em componentes dinâmicos, use interpolação suave, revelação progressiva e aceleração via GPU (`transform`, `opacity`).
- **Acessibilidade**: Respeite sempre `prefers-reduced-motion` e tags semânticas ARIA.
