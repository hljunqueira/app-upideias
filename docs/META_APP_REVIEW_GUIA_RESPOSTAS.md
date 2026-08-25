# 📋 Guia de Respostas para Aprovação do App Meta (App Review)
**Aplicativo:** UP Ideias / UP Analytics  
**URL de Produção:** `https://www.upideias.com`  
**Política de Privacidade:** `https://www.upideias.com/privacy`  
**Termos de Serviço:** `https://www.upideias.com/terms`  
**Instruções de Exclusão de Dados:** `https://www.upideias.com/data-deletion`

---

## 1. Uso Permitido (*Permitted Use*)

### Pergunta: Qual é a finalidade principal do seu aplicativo?
> **Resposta:**  
> O UP Ideias / UP Analytics é uma plataforma SaaS de gestão de marketing e inteligência de dados voltada para criadores de conteúdo e pequenas/médias empresas. O aplicativo permite que os próprios administradores e criadores conectem suas contas profissionais do Instagram para visualizar em um dashboard centralizado suas métricas de alcance, engajamento, desempenho de publicações (feed e reels) e evolução de audiência, otimizando o planejamento de seus conteúdos.

---

### Justificativas das Permissões Solicitadas:

#### A. `instagram_basic`
> **Como é utilizada:**  
> Esta permissão é necessária para identificar a conta do Instagram conectada pelo usuário, exibindo seu `@nome_de_usuario`, foto de perfil e contagem total de publicações no cabeçalho do dashboard da plataforma.

#### B. `instagram_manage_insights`
> **Como é utilizada:**  
> Esta permissão é o recurso central do nosso painel de Analytics. Ela é utilizada para ler as métricas agregadas da conta do próprio usuário (alcance diário `reach`, impressões, visualizações e evolução do número de seguidores `follower_count`), permitindo ao usuário analisar o crescimento do seu perfil ao longo do tempo.

#### C. `pages_show_list` e `pages_read_engagement`
> **Como é utilizada:**  
> Utilizadas para permitir que o usuário selecione a Página do Facebook à qual a sua conta profissional do Instagram está vinculada no Meta Business Suite, viabilizando a conexão segura via Meta Graph API.

#### D. `public_profile`
> **Como é utilizada:**  
> Utilizada para autenticação básica do usuário e exibição do seu nome no perfil da plataforma.

---

## 2. Tratamento de Dados & Segurança (*Data Handling & Privacy*)

### Pergunta: Como os dados dos usuários da Meta são armazenados e protegidos?
> **Resposta:**  
> Todos os dados e tokens de acesso são transmitidos exclusivamente através de canais criptografados com TLS/HTTPS e armazenados em banco de dados seguro com políticas estritas de isolamento por usuário (Row Level Security - RLS). Apenas o próprio usuário autenticado proprietário da conta tem acesso às métricas do seu perfil.

### Pergunta: Os dados obtidos da Meta são vendidos, compartilhados ou transferidos a terceiros?
> **Resposta:**  
> **Não.** Em nenhuma hipótese os dados obtidos através das APIs da Meta são vendidos, licenciados, compartilhados ou transferidos a terceiros, corretores de dados ou plataformas de publicidade. Os dados são utilizados exclusivamente para renderização de relatórios ao próprio usuário titular da conta.

### Pergunta: Como o usuário pode solicitar a exclusão de seus dados?
> **Resposta:**  
> O aplicativo disponibiliza um botão direto de desconexão no painel (`Desconectar Conta`), que revoga o token e interrompe imediatamente a sincronização. Além disso, disponibilizamos uma página pública com instruções e canal para exclusão definitiva de dados em: `https://www.upideias.com/data-deletion`.

---

## 3. Instruções para o Revisor da Meta (*Review Instructions*)

### Dados de Acesso para a Equipe de Revisão da Meta:
- **URL da Aplicação:** `https://www.upideias.com/login`
- **Usuário de Teste / E-mail:** `meta.reviewer@upideias.com`
- **Senha:** `UpReviewer2026!`

### Passo a Passo da Demonstração (Texto para colar nas instruções):
> 1. Acesse `https://www.upideias.com/login` e faça login com as credenciais de teste fornecidas.  
> 2. No menu lateral ou no topo do Dashboard, clique no botão **"Conectar Instagram"**.  
> 3. Na janela do Meta OAuth, autorize o acesso à sua Página e Conta Comercial do Instagram.  
> 4. Após a autorização, a conta aparecerá com o status **CONECTADO**.  
> 5. No Dashboard, veja os cards com a contagem de seguidores, alcance diário e a lista das últimas publicações sincronizadas da conta.

---

## 4. Roteiro para o Vídeo de Demonstração (Screencast)
*(A Meta exige um vídeo de 30 a 90 segundos sem cortes)*

1. **Gravar a tela:** Abra o navegador em `https://www.upideias.com`.
2. **Faça o login** na sua conta.
3. **Clique no botão "Conectar Instagram"** no topo da tela.
4. **Mostre a tela de login da Meta** onde aparecem as permissões solicitadas.
5. **Conclua a autorização** e mostre a tela retornando para o `upideias.com`.
6. **Mostre o Dashboard carregando:** destaque o card com o nome `@hlj.dev`, o número de seguidores e as publicações exibidas no painel.
7. Salve o vídeo no formato `.mp4` ou `.mov` e faça o upload no campo de vídeo da Meta.
