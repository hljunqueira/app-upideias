# Guia de Proteção e Publicação de Vídeos no UP Creator

Este documento detalha como preparar e publicar vídeos de aulas no **UP Creator** de forma segura, evitando cópias, downloads não autorizados e redirecionamentos para fora da plataforma.

---

## 1. Configuração de Vídeos no YouTube Studio (Vídeos Não-Listados)

Ao utilizar o YouTube para hospedar as aulas da sua plataforma, siga as configurações abaixo:

1. **Visibilidade do Vídeo:**
   - Selecione **Não Listado (Unlisted)**.
   - **NÃO** selecione *Público* (para não aparecer em buscas nem no seu canal).
   - **NÃO** selecione *Privado* (senão os alunos cadastrados no UP Creator não conseguirão carregar o streaming).

2. **Opções de Incorporação:**
   - Na aba **Mais Opções** do YouTube Studio, certifique-se de que a opção **"Permitir incorporação" (Allow embedding)** está **MARCADA**.

3. **Restrição de Conteúdo:**
   - Marque a opção apropriada de conteúdo para maiores ou geral conforme o assunto da aula.

---

## 2. Como o Player Protegido do UP Creator Funciona

O player exclusivo do UP Creator (`ProtectedVideoPlayer.tsx`) aplica as seguintes proteções em tempo real:

- **Modo Modest Branding & No-Rel:** Oculta o logotipo padrão do YouTube na barra de controle e impede a exibição de vídeos recomendados de canais de terceiros ao final da aula.
- **Shield Overlay Anti-Redirecionamento:** Uma máscara transparente posicionado sobre a área do cabeçalho do iframe bloqueia os cliques no título do vídeo e no botão *"Assistir no YouTube.com"*, garantindo que o aluno assista à aula exclusivamente dentro do UP Creator.
- **Bloqueio de Menu de Contexto (Anti-Download):** O botão direito do mouse (`onContextMenu`) e o recurso de arrastar vídeos (`onDragStart`) são interceptados e desabilitados em todo o player.
- **Controle de Velocidade Nativo (1x, 1.25x, 1.5x, 2x):** Os botões de velocidade comunicam-se via evento `postMessage` seguro utilizando a API oficial do Iframe do YouTube.

---

## 3. Hospedagens Recomendadas com Proteção DRM Avançada

Para criadores que necessitam de **proteção reforçada contra cópias** ou criptografia DRM de nível empresarial:

- **Panda Video:** Hospedagem brasileira com DRM proprietário, bloqueio por domínio e streaming HLS.
- **Vimeo OTT / Vimeo Pro:** Opção de restrição estrita por domínio (`*.upideias.com`).
- **Cloudflare Stream:** Criptografia de vídeo via chave HLS curta e assinatura JWT por sessão do aluno.

O componente `<ProtectedVideoPlayer />` do UP Creator é nativamente compatível com todos estes provedores.
