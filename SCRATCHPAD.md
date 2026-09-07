# Scratchpad & Histórico de Sessões

## Tarefa Atual
- [x] Mapeamento e substituição de todos os dados falsos/mocks por conexões reais com o banco de dados (Supabase) e APIs oficiais.
- [x] Erradicação total de emojis soltos de IA e revisão da comunicação visual para estética executiva/SaaS B2B premium.
- [x] Auditoria global profunda em todas as páginas, modais e componentes: remoção definitiva de fotos Unsplash, fallbacks estáticos de valores e emails, e integração com Supabase.
- [x] Validação de integridade: linter e build do Next.js sem erros (44/44 rotas geradas).

## Log de Modificações Recentes
- **Auditoria Global & Conexões Reais ao Banco de Dados**:
  - `admin/ai-usage`: Conectado à tabela `ai_requests` com cálculo dinâmico de tokens e custos em tempo real; persistência de provedores sob `up_ai_providers_config`; remoção de textos legados ("Phyllo").
  - `OnboardingConnectModal`: Eliminada simulação com `setTimeout` e IDs fake; integrado ao modal oficial de conexão de redes sociais (`open-nango-modal`) e listener reativo `social-account-changed`.
  - `components/landing/Pricing`: Sincronização direta com `fetchPlansFromDb()`, garantindo que os planos da landing page reflitam sempre a tabela `plans` do Supabase.
  - `app/automations`: Carregamento e gravação do número de celular e consentimento na tabela `profiles` (`phone` e `whatsapp_opt_in`).
  - `admin/team` & `teamStore`: Remoção de foto fixa da Unsplash (`photo-1534528741775...`), fallbacks fixos de email (`equipe@upideias.com`) e sincronização de permissões com a coluna `role` de `profiles`.
  - `app/billing`: Planos carregados via `fetchPlansFromDb()`; eliminado fallback arbitrário `"R$ 129,00"` para faturas sem valor explícito.
  - `AdminSuggestContentModal` & `app/approvals`: Removida URL estática da Unsplash e textos fictícios de posts; quando não há imagem, é renderizado um preview visual nativo sofisticado do design system.
  - `app/library`: Removida injeção forçada de URL da Unsplash como fallback ao salvar item do tipo imagem sem URL.
  - `NangoConnectModal` & `admin/accounts`: Limpeza de textos e mensagens técnicas com marcas terceiras ("Phyllo", "Nango"), garantindo conformidade white-label estrita.
  - `up-creator` & `coursesStore`: Substituído fallback da Unsplash no catálogo de cursos e leaderboard por avatares dinâmicos com iniciais estilizadas e asset local da marca.
- **Validação de Integridade**:
  - `npx next lint`: **0 erros** (Exit code 0).
  - `npm run build --workspace=apps/web`: **Exit code 0** (44/44 páginas estáticas geradas).
