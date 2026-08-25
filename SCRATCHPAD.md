# Scratchpad & Histórico de Sessões

## Tarefa Atual
- [x] Diagnóstico e resolução do cadastro de cursos no UP Creator (Supabase / Web UI).

## Log de Modificações Recentes
- **Diagnóstico e Correções UP Creator**:
  - Testes diretos via REST e PostgREST no Supabase (`https://api.upideias.com`) confirmaram que o banco e a tabela `courses` estão 100% operacionais e recebendo dados.
  - Otimização no envio de imagens de capa: adicionada compressão automática de fotos via Canvas no cliente (16:9, ~100KB) e aba de inserção por Link URL direto para evitar estouro de tamanho de payload no navegador.
  - Correção na camada de persistência (`coursesStore.ts`): tratamento explícito de retornos (`success` e `error`), remoção de erros silenciosos e emissão de eventos reativos (`up_courses_updated`, `up_trails_updated`, `up_modules_updated`).
  - Interface do `CourseModal`: adicionado estado de carregamento no botão (`Salvando...`), prevenção de duplo clique e banner de erro visível na tela.
  - Build de produção testado e aprovado (`npm run build --workspace=apps/web`) gerando 43/43 rotas estáticas e dinâmicas com sucesso.
