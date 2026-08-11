# Diretrizes para Agentes do Projeto — UP Analytics & UP Creator

## 1. Objetivo e Contexto do Produto

O ecossistema **UP** (by UpIdeias) é composto por dois módulos principais integrados:

- **UP Analytics:** Plataforma SaaS de estratégia, acompanhamento de clientes, métricas de redes sociais, análise de performance, conteúdos, audiência, diagnósticos, relatórios automatizados, alertas e comparações históricas.
- **UP Creator:** Módulo educacional com cursos, módulos, aulas, trilhas de aprendizagem e acompanhamento de progresso dos criadores.

**Visão de Integração do Produto:**
$$\text{Dados de Redes} \longrightarrow \text{Diagnósticos & Insights} \longrightarrow \text{Recomendações Práticas} \longrightarrow \text{Conteúdo Educacional no UP Creator}$$

---

## 2. Arquitetura Oficial do Monorepo

O repositório utiliza **npm workspaces** (`apps/*`, `packages/*`). A estrutura oficial e definitiva do projeto é:

```
apps/
  web/                     # Aplicação principal e FONTE ÚNICA do Frontend
packages/
  config/                  # tsconfig.base.json e presets de configuração
  lib/                     # Client Supabase, SocialProvider, Mocks e Services
  types/                   # FONTE ÚNICA de Interfaces e Tipos (@up-analytics/types)
  ui/                      # Design System e Primitivos Visuais (@up-analytics/ui)
supabase/
  migrations/              # Schemas relacionais para PostgreSQL
  seed.sql                 # Dados de seed iniciais
docs/                      # Especificações técnicas e documentações do projeto
```

### Diretórios Históricos e Transição:
- **`frontend/` (LEGADO):** Cópia histórica standalone do Next.js. **NÃO** criar novas funcionalidades neste diretório. Ele será removido após a consolidação completa em `apps/web`.
- **`apps/mobile/` (DESCONTINUADO):** Protótipo Expo/React Native descontinuado. **NÃO** criar novas funcionalidades nele.
- **`backend/` (REFERÊNCIA):** Servidor Python (FastAPI + MongoDB). É um protótipo de referência para consultar regras de IA, prompts e endpoints. **NÃO** implementar novas funcionalidades nele e **NÃO** remover até que toda a lógica útil seja documentada e migrada.

---

## 3. Estratégia Mobile Oficial

A estratégia mobile oficial do produto é:
$$\text{Next.js Web Responsivo} \longrightarrow \text{Capacitor} \longrightarrow \text{Android / iOS}$$

- **Regras Mobile:**
  - Toda nova interface deve ser desenvolvida de forma **web responsiva** (Mobile-first ou Mobile-ready).
  - **NÃO** adicionar Expo, React Native ou criar aplicações mobile separadas.
  - **NÃO** duplicar componentes ou telas exclusivamente para mobile.
  - Funcionalidades nativas futuras de Android/iOS serão tratadas via **Capacitor** e plugins nativos diretamente sobre a base Web.

---

## 4. Deploy de Produção e Domínio

- **Domínio Oficial:** `upideias.com`
- **Plataforma de Deploy Frontend:** Vercel
- **Configuração Oficial de Build (`vercel.json`):**
  - `buildCommand`: `npm run build --workspace=apps/web`
  - `outputDirectory`: `apps/web/.next`

**Restrição de Operação:** O agente **NUNCA** deve alterar `vercel.json`, o Root Directory de deploy, os comandos de build, registros de DNS, domínio ou variáveis de produção sem solicitação expressa do usuário. Qualquer refatoração deve preservar a compatibilidade com a produção.

---

## 5. Tipagem Centralizada (`@up-analytics/types`)

- **`packages/types` é a FONTE ÚNICA de modelos e interfaces compartilhadas.**
- **Workflow antes de criar um tipo:**
  1. Pesquisar os modelos existentes em `@up-analytics/types`.
  2. Reutilizar os modelos presentes quando aplicável.
  3. Somente criar uma nova interface quando for comprovadamente necessária.
- **Proibição:** **NÃO** criar arquivos de tipos duplicados locais (ex: `apps/web/src/lib/types.ts`).
- Evitar o uso do tipo `any` em novos modelos e assinaturas de métodos.

---

## 6. Modelo Social Agnóstico de Plataforma (`Social*`)

O domínio social do UP não deve ficar restrito ao Instagram. Os modelos devem atender a múltiplas redes:

- `SocialPlatform` = `'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'x'`
- Modelos principais: `SocialAccount`, `SocialAccountMetrics`, `SocialContent`, `SocialContentMetrics`, `AudienceMetrics`.
- **Nomenclatura TypeScript:** Propriedades dos modelos no frontend devem utilizar `camelCase` (ex: `accountId`, `ageDistribution`, `updatedAt`).
- **Compatibilidade:** Tipos antigos (`InstagramAccount`, etc.) podem ser mantidos temporariamente como aliases de tipo em `packages/types` durante a migração. **NÃO** realizar refatorações destrutivas no código apenas para renomear variáveis.

---

## 7. Padrão Arquitetural `SocialProvider`

Todas as integrações sociais devem obrigatoriamente implementar a interface de abstração `SocialProvider`:

```typescript
export interface SocialProvider {
  connectAccount(platform: SocialPlatform): Promise<SocialAccount>;
  getAccount(accountId: string): Promise<SocialAccount>;
  getAccountMetrics(accountId: string, periodDays: number): Promise<SocialAccountMetrics[]>;
  getContent(accountId: string): Promise<SocialContent[]>;
  getContentMetrics(contentId: string): Promise<SocialContentMetrics[]>;
  getAudience(accountId: string): Promise<AudienceMetrics>;
}
```

O frontend **jamais** deve consumir ou depender do formato de resposta bruto de qualquer API externa (Phyllo, Meta, TikTok, YouTube, etc.). A normalização deve ocorrer na camada de entrada do provedor.

---

## 8. Integração com a Phyllo API

- A **Phyllo API** será a principal fonte externa de dados sociais.
- **Regra de Ouro de Segurança:** **NUNCA** consumir a Phyllo API diretamente a partir do navegador/frontend.
- Fluxo Obrigatório:
$$\text{Phyllo API} \longrightarrow \text{Backend / Worker Seguro} \longrightarrow \text{Normalização} \longrightarrow \text{PostgreSQL / Supabase} \longrightarrow \text{UP Analytics (Web UI)}$$
- Segredos como `PHYLLO_CLIENT_SECRET` devem permanecer isolados no ambiente servidor/worker. Todos os dados coletados devem ser salvos no banco PostgreSQL para formação de histórico proprietário.

---

## 9. Backend e Camada Segura de Workers

- O Supabase Client no browser **NÃO** substitui o backend para operações sensíveis.
- Processos como webhooks, tokens de acesso, tarefas agendadas (crons), chamadas a LLMs (Gemini), normalização e regras administrativas devem rodar em ambiente seguro.
- A arquitetura futura poderá utilizar **Node.js Workers na VPS**, **Supabase Edge Functions** ou serviços dedicados.
- **Espaço Arquitetural Futuro:** `workers/social-sync/` e `workers/ai-jobs/`. **NÃO** criar estes diretórios nem implementar workers antes da fase de infraestrutura real.

---

## 10. Banco de Dados Oficial

- **Banco Oficial Definitivo:** PostgreSQL gerenciado via **Supabase** (`supabase/migrations`).
- O MongoDB presente no backend antigo faz parte exclusivamente do protótipo histórico. **NÃO** construir novas funcionalidades permanentes dependentes de MongoDB.

---

## 11. Dados Simulados (Mocks) Durante o Desenvolvimento

- Enquanto as integrações reais (Phyllo/Supabase) estiverem desconectadas, os mocks devem ser preservados.
- Os dados simulados devem ser expostos **atrás das interfaces oficiais** (ex: `MockSocialProvider` implementando `SocialProvider`).
- Componentes visuais **NÃO** devem conter datasets grandes hardcoded em seu corpo. A substituição do mock por dados reais no futuro não deve exigir a reescrita de telas.

---

## 12. Reutilização Obrigatória de Código

Antes de criar um novo componente, hook, service, tipo ou utilitário, pesquise ativamente nos diretórios existentes:
1. `packages/ui` (Primitivos de UI como `MetricCard`, `StatusBadge`, `PlanLockedContent`, etc.)
2. `packages/lib` (Helpers e serviços)
3. `packages/types` (Interfaces)
4. `apps/web/src/components` (Componentes específicos do app e landing)

**Proibição:** É proibido recriar um componente já existente na base de código.

---

## 13. Prevenção de Overengineering

- **Foco Absoluto em Simplicidade:** Desenvolver a solução mais direta e limpa para resolver o problema exigido.
- **NÃO** instalar ou configurar ferramentas adicionais de observabilidade, testes de mutação ou linters avançados (ex: Datadog, New Relic, OpenTelemetry, Sentry, Stryker, Codecov, Knip, arch-contract, Commitlint) a menos que explicitamente solicitado pelo usuário.
- **Ordem de Prioridade Técnica:**
  1. Código funcionando com clareza
  2. Arquitetura simples e modular
  3. Tipagem TypeScript consistente (sem `any`)
  4. Reutilização de código existente
  5. Build e deploy sem erros
  6. Qualidade de UX e responsividade
  7. Testes proporcionais ao risco da alteração

---

## 14. Estratégia Proporcional de Testes

- A validação técnica deve ser sempre **proporcional ao risco da alteração**:
  - **Para alterações estruturais e de UI:** Validação rigorosa via TypeScript, ESLint, `npm run build`, smoke test manual de navegação e responsividade visual.
  - **Para lógica de negócio e serviços críticos:** Adicionar testes unitários/integração quando apropriado.
  - **Para fluxos ponta a ponta críticos:** Utilizar E2E com Playwright apenas quando a relevância do fluxo justificar.

---

## 15. UX, Animações e Responsividade

- Preservar padrões visuais refinados, Skeleton Screens durante o carregamento de dados e micro-interações via `framer-motion`.
- **Regras de UX & Performance:**
  - Nunca sacrificar a performance da página por causa de animações.
  - Respeitar a preferência `prefers-reduced-motion`.
  - Evitar salto visual e mudança acumulada de layout (CLS).
  - Garantir funcionamento impecável em **Desktop**, **Tablet** e **Mobile (~390px)**.
  - Evitar elementos interativos que dependam exclusivamente de estado `hover` (devem funcionar perfeitamente em telas touch).
  - Garantir preparação para execução futura fluída no Capacitor.

---

## 16. Alterações Arquiteturais e Escopo

- Antes de realizar qualquer alteração estrutural no monorepo, pacotes compartilhados, autenticação ou deploy, o agente deve **investigar profundamente** o código existente.
- Mudanças por preferência pessoal de estilo ou ferramenta são **estritamente proibidas**.
- Caso o agente identifique uma oportunidade de melhoria arquitetural que ultrapasse o escopo da tarefa atual, deve **documentá-la como recomendação** e **NÃO** implementá-la sem autorização prévia.

---

## 17. Gestão de Tarefas, Issues, PRs e Checkpoint Git

- **Vínculo com Issues:** Toda implementação deve estar associada a uma Issue categorizada (`Correção`, `Melhoria`, `Nova função`).
- **Deploy via PRs:** Entregas para a branch principal devem ser realizadas via Pull Request contendo:
  1. Link da Issue relacionada.
  2. Resumo objetivo das alterações.
  3. Comprovação das validações executadas (build, testes, imagens).
  4. Riscos, limitações e próximos passos.
- **Checkpoint Git:** Antes de executar refatorações estruturais relevantes, realize um checkpoint limpo no Git (`git status`, `git add .`, `git commit`, `git push`).
- **Escopo do PR:** Não misturar em um mesmo PR refatorações massivas, novas funcionalidades e reformulações de design.

---

## 18. Memória de Sessão (`memory.md`)

- **Ação Obrigatória:** No início de qualquer sessão de trabalho, leia o arquivo `memory.md`.
- **Registro de Aprendizados:** Sempre que o usuário corrigir uma abordagem do agente, ensinar um padrão do projeto, definir uma nova decisão arquitetural ou estabelecer uma limitação permanente, o agente deve registrar a regra resumida no `memory.md`.
- Não registrar conversas triviais ou temporárias.

---

## 19. Regra Final de Conduta do Agente

> O objetivo do agente não é reconstruir o UP Analytics. É evoluir a base existente com segurança, simplicidade e consistência.
> 
> - **Antes de criar, procure.**
> - **Antes de substituir, entenda.**
> - **Antes de abstrair, confirme a necessidade.**
> - **Antes de remover, verifique referências.**
> - **Antes de alterar infraestrutura, confirme o escopo.**
