# 📋 Guia Passo a Passo: Respostas do Questionário Meta App Review

Use este guia para responder cada pergunta da tela de revisão da Meta. Todas as respostas estão alinhadas com as políticas de conformidade da Meta para aprovação rápida.

---

## 1. Perguntas de Múltipla Escolha (Proteção de Dados & Conformidade)

| Pergunta da Meta | Opção / Resposta a Selecionar |
| :--- | :--- |
| **O aplicativo compartilha dados com terceiros?** | **NÃO** (*Não compartilhamos dados com terceiros*) |
| **O aplicativo vende dados de usuários?** | **NÃO** (*Nunca vendemos ou licenciamos dados*) |
| **Os dados são usados para direcionar anúncios ou criar perfis de crédito/seguro?** | **NÃO** |
| **Os dados são usados exclusivamente para fornecer a funcionalidade do app?** | **SIM** |
| **Como os dados são protegidos em trânsito e em repouso?** | **Criptografia padrão da indústria (TLS/HTTPS em trânsito e criptografia de banco de dados em repouso)** |
| **O aplicativo possui uma Política de Privacidade válida?** | **SIM** $\rightarrow$ Cole a URL: `https://www.upideias.com/privacy` |
| **O aplicativo possui Termos de Serviço públicos?** | **SIM** $\rightarrow$ Cole a URL: `https://www.upideias.com/terms` |
| **O aplicativo oferece um mecanismo para exclusão de dados?** | **SIM** $\rightarrow$ Cole a URL: `https://www.upideias.com/data-deletion` |
| **O aplicativo exclui os dados quando o usuário desconecta ou revoga o acesso?** | **SIM** (*Os dados e conexões são excluídos imediatamente após a revogação*) |

---

## 2. Respostas de Texto para as Permissões

### 🔹 1. `instagram_business_basic`
> **Pergunta: Forneça uma descrição detalhada de como seu aplicativo usa esta permissão:**
>
> ```text
> O aplicativo UP Ideias utiliza a permissão instagram_business_basic para identificar a conta comercial do Instagram conectada pelo usuário, recuperando seu nome de exibição, nome de usuário (@), foto de perfil e contagem total de publicações. Esses dados são exibidos no cabeçalho do painel de controle para que o usuário identifique qual perfil profissional está gerenciando na plataforma.
> ```

---

### 🔹 2. `instagram_business_manage_insights`
> **Pergunta: Forneça uma descrição detalhada de como seu aplicativo usa esta permissão:**
>
> ```text
> A permissão instagram_business_manage_insights é o recurso central do nosso módulo de Analytics. O UP Ideias a utiliza para coletar métricas agregadas da própria conta do usuário (como alcance diário 'reach', impressões, visualizações e contagem de seguidores 'follower_count'). Com esses dados, geramos relatórios e gráficos históricos de desempenho para auxiliar criadores de conteúdo e pequenas empresas a tomarem decisões estratégicas de marketing.
> ```

---

### 🔹 3. `instagram_business_content_publish`
> **Pergunta: Forneça uma descrição detalhada de como seu aplicativo usa esta permissão:**
>
> ```text
> O UP Ideias utiliza a permissão instagram_business_content_publish para permitir que criadores de conteúdo e administradores criem, planejem e publiquem postagens de mídia (fotos e vídeos) diretamente da plataforma web para o feed de suas contas profissionais do Instagram.
> ```

---

## 3. Credenciais e Instruções para o Revisor da Meta

No campo de **Instruções da Análise (*Testing Instructions*)**, cole o seguinte texto:

```text
URL da Aplicação: https://www.upideias.com/login
E-mail de Teste: meta.reviewer@upideias.com
Senha de Teste: UpReviewer2026!

Passos para testar a integração:
1. Acesse https://www.upideias.com/login e entre com as credenciais acima.
2. No menu superior ou lateral, clique no botão "Conectar Instagram".
3. Na janela do OAuth oficial da Meta, selecione a conta comercial do Instagram desejada e confirme as permissões.
4. Após o redirecionamento, a conta aparecerá com o status "CONECTADO".
5. No Dashboard, visualize os cards com a contagem de seguidores, alcance diário, taxa de engajamento e a galeria de publicações sincronizadas.
```

---

## 4. O que Mostrar no Vídeo de Demonstração (Screencast)
*(Grave um vídeo de 1 minuto mostrando a tela do computador)*

1. Abra o navegador em `https://www.upideias.com`.
2. Mostre o clique no botão **"Conectar Instagram"**.
3. Mostre a janela oficial da Meta abrindo e você autorizando a conta `@hlj.dev`.
4. Mostre a tela retornando ao site e o Dashboard carregando com os dados do perfil, seguidores e posts.
5. Salve o arquivo em `.mp4` e faça o upload no formulário da Meta.
