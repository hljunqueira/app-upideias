---
name: Premium Data Core
colors:
  surface: '#1d1010'
  surface-dim: '#1d1010'
  surface-bright: '#463535'
  surface-container-lowest: '#180b0b'
  surface-container-low: '#261818'
  surface-container: '#2b1c1c'
  surface-container-high: '#362626'
  surface-container-highest: '#423031'
  on-surface: '#f8dcdc'
  on-surface-variant: '#e2bebe'
  inverse-surface: '#f8dcdc'
  inverse-on-surface: '#3d2c2d'
  outline: '#a98989'
  outline-variant: '#5a4041'
  surface-tint: '#ffb3b5'
  primary: '#ffb3b5'
  on-primary: '#680019'
  primary-container: '#ff5368'
  on-primary-container: '#5c0015'
  inverse-primary: '#b81b3a'
  secondary: '#ffb3b5'
  on-secondary: '#5f131e'
  secondary-container: '#802c35'
  on-secondary-container: '#ff9da2'
  tertiary: '#5ade96'
  on-tertiary: '#00391f'
  tertiary-container: '#00a765'
  on-tertiary-container: '#00321b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b5'
  on-primary-fixed: '#40000c'
  on-primary-fixed-variant: '#920027'
  secondary-fixed: '#ffdada'
  secondary-fixed-dim: '#ffb3b5'
  on-secondary-fixed: '#40000c'
  on-secondary-fixed-variant: '#7d2a33'
  tertiary-fixed: '#78fbb0'
  tertiary-fixed-dim: '#5ade96'
  on-tertiary-fixed: '#002110'
  on-tertiary-fixed-variant: '#00522f'
  background: '#1d1010'
  on-background: '#f8dcdc'
  surface-variant: '#423031'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  stats-display:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 20px
  gutter: 16px
---

## Marca e Estilo

Este sistema de design foi concebido para um SaaS mobile-first de alta performance, focado em análise de dados e decisões estratégicas. A personalidade da marca é **ambiciosa, precisa e sofisticada**. O objetivo é evocar uma sensação de controle absoluto sobre os dados, utilizando um contraste extremo entre o preto profundo e o coral vibrante para destacar métricas críticas.

O estilo visual adota o **Minimalismo de Alto Contraste com toques de Modernismo Dark Mode**. A interface prioriza a clareza das informações, eliminando ruídos visuais e utilizando camadas tonais sutis para criar profundidade em um ambiente predominantemente escuro. O design comunica confiança e modernidade tecnológica, transformando dados complexos em insights visualmente atraentes e acionáveis.

## Cores

A paleta é centrada em uma estética "OLED-ready", utilizando o preto profundo (`#050505`) para maximizar o contraste e economizar energia em dispositivos móveis. 

- **Primária (Coral):** Usada exclusivamente para ações principais, destaques de dados positivos e elementos de branding. É a cor que guia o olhar do usuário.
- **Escala de Cinzas/Superfícies:** O sistema utiliza uma hierarquia de profundidade baseada em tons: o fundo é o mais escuro, enquanto cards e superfícies interativas sobem levemente na escala de luminosidade para indicar proximidade e interatividade.
- **Acentuação:** O branco puro é reservado para leitura crítica, enquanto o cinza secundário (`#A1A1AA`) é aplicado em metadados e informações de suporte para manter a hierarquia visual organizada.

## Tipografia

Utilizamos a fonte **Inter** por sua legibilidade excepcional em telas pequenas e sua estética técnica e neutra, que não compete com os gráficos de dados.

- **Hierarquia de Dados:** Criamos o estilo `stats-display` especificamente para dashboards, onde números grandes e impactantes são o foco principal.
- **Ritmo Visual:** As headlines utilizam um kerning (espaçamento entre letras) levemente negativo para um aspecto mais moderno e compacto. Os rótulos (labels) usam maiúsculas e espaçamento expandido para facilitar a categorização rápida.
- **Adaptabilidade:** Em dispositivos móveis, as fontes de exibição são reduzidas para evitar quebras de linha indesejadas em títulos longos, mantendo a densidade de informação necessária para um SaaS de análise.

## Layout e Espaçamento

O sistema adota uma filosofia de **grade fluida otimizada para mobile**, baseada em um sistema de 4 colunas para smartphones e 12 colunas para visualização em desktop/tablet.

- **Ritmo de 4px:** Todos os componentes e espaçamentos seguem múltiplos de 4px, garantindo alinhamento matemático e consistência visual.
- **Margens de Segurança:** Em dispositivos móveis, utilizamos uma margem lateral fixa de 20px para garantir que o conteúdo não encoste nas bordas físicas do aparelho.
- **Densidade:** Para um SaaS de dados, a densidade é moderada. Espaços maiores (lg/xl) são usados para separar seções lógicas, enquanto espaços menores (sm/md) agrupam dados relacionados dentro de um mesmo card.

## Elevação e Profundidade

Neste sistema de design, a profundidade não é comunicada através de sombras pesadas, mas sim por meio de **Camadas Tonais e Bordas de Baixo Contraste**.

- **Nível 0 (Fundo):** `#050505` - A base imersiva.
- **Nível 1 (Cards):** `#111116` - Superfícies que contêm dados. Possuem uma borda sutil (`#26262D`) para separação visual nítida.
- **Nível 2 (Overlays/Modais):** Elevados com um brilho de borda levemente mais claro e, opcionalmente, um efeito de vidro (backdrop-blur) quando sobrepostos a gráficos para manter o contexto.
- **Interação:** Estados de hover ou seleção utilizam um aumento sutil na luminosidade do preenchimento ou a cor primária em 10% de opacidade como "glow" de fundo.

## Formas

A linguagem de formas é equilibrada para transmitir precisão técnica sem ser excessivamente agressiva. 

- **Arredondamento Padrão:** Definido como `0.5rem (8px)` para a maioria dos elementos como botões, inputs e pequenos cards. Este valor cria um visual moderno e "amigável ao toque" em telas móveis.
- **Grandes Recipientes:** Cards de métricas principais utilizam `1rem (16px)` para se destacarem como blocos fundamentais da interface.
- **Pill-shape:** Reservado exclusivamente para badges de status (ex: "Ativo", "Pendente") e avatares, criando um contraste geométrico com os cards retangulares.

## Componentes

### Botões
- **Primário:** Preenchimento Coral (`#FF5368`), texto branco, peso semibold. Efeito de hover escurece para `#E64058`.
- **Secundário:** Borda fina `#26262D`, fundo transparente ou levemente cinza, texto branco.

### Cards de Métricas
- Fundo `#111116`, borda `#26262D`, raio de 16px. 
- Estrutura interna: Título em `label-md` (cinza), valor em `stats-display` (branco), e indicador de tendência (gráfico sparkline ou porcentagem) em Coral ou Branco.

### Inputs e Seletores
- Fundo `#0B0B0F`, borda `#26262D`. 
- Estado de foco: Borda muda para o Coral primário, sinalizando atenção imediata.

### Gráficos
- Devem ser minimalistas, sem linhas de grade pesadas. Use gradientes que partem do Coral para o transparente.
- Pontos de dados importantes usam marcadores brancos para alto contraste.

### Badges de Status
- Formato de pílula (pill-shaped) com fundo opaco em 15% da cor de status e texto na mesma cor com brilho total para máxima legibilidade.