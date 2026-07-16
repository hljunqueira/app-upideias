# Guia de Configuração das Variáveis de Ambiente (.env)

Este documento detalha o que é cada variável de ambiente exigida no arquivo `.env` do **UP Analytics**, como obtê-la e qual a sua finalidade no projeto.

---

## 💾 1. Configurações do Supabase (Banco de Dados e Auth)

O Supabase é o provedor do nosso banco de dados PostgreSQL e do serviço de autenticação de usuários.

*   **`NEXT_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_URL`**
    *   **O que é**: URL de endpoint da API do seu projeto no Supabase.
    *   **Como obter**: No painel do Supabase, acesse **Project Settings** > **API**.
    *   **Finalidade**: Permite que a aplicação Next.js e o app Expo se conectem ao banco e autentiquem usuários.
*   **`NEXT_PUBLIC_SUPABASE_ANON_KEY` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`**
    *   **O que é**: Chave pública anônima do cliente (Safe for browser).
    *   **Como obter**: No painel do Supabase, acesse **Project Settings** > **API**.
    *   **Finalidade**: Utilizada pelas aplicações front-end para operações básicas com o banco respeitando as Row Level Security (RLS) policies.
*   **`SUPABASE_SERVICE_ROLE_KEY`**
    *   **O que é**: Chave de bypass de segurança administrativa (Service Role).
    *   **Como obter**: No painel do Supabase, acesse **Project Settings** > **API**.
    *   **Aviso**: **Nunca exponha essa chave no front-end**.
    *   **Finalidade**: Usada em webhooks ou funções de backend onde é necessário contornar regras RLS (ex: criar dados mockados ou processamento administrativo).

---

## 🧠 2. Configurações da Google Gemini AI

*   **`GEMINI_API_KEY`**
    *   **O que é**: Chave de acesso da API da inteligência artificial do Google.
    *   **Como obter**: Acesse o [Google AI Studio](https://aistudio.google.com/) e gere uma nova API Key.
    *   **Finalidade**: Alimentar os diagnósticos semanais automáticos de perfil e o gerador de ideias/roteiros de Reels.

---

## 📊 3. Configurações da Meta Instagram Graph API

Utilizado para a integração oficial de métricas e sincronização automática de posts de contas profissionais ou de criadores no Instagram.

*   **`META_APP_ID`**
    *   **O que é**: ID único do aplicativo criado no Meta for Developers.
    *   **Como obter**: Acesse o [Meta for Developers](https://developers.facebook.com/), crie um aplicativo do tipo "Consumidor" ou "Empresa" e copie o ID.
*   **`META_APP_SECRET`**
    *   **O que é**: Chave secreta de autenticação do aplicativo da Meta.
    *   **Como obter**: No painel do aplicativo da Meta, vá em **Configurações** > **Básico** > **Chave Secreta do Aplicativo**.
*   **`META_REDIRECT_URI`**
    *   **O que é**: URL de retorno de chamada de autenticação OAuth da Meta.
    *   **Exemplo**: `https://seudominio.com/api/auth/instagram/callback`.

---

## 💬 4. Configurações da Evolution API (WhatsApp)

Utilizado para gerenciar o envio automático de relatórios semanais de performance e alertas urgentes de queda de alcance no WhatsApp dos clientes.

*   **`WHATSAPP_API_URL`**
    *   **O que é**: URL base da sua instância instalada da Evolution API.
    *   **Exemplo**: `https://evolution.seudominio.com`.
*   **`WHATSAPP_API_KEY`**
    *   **O que é**: Token de autenticação administrativo global ou da instância da Evolution API.
*   **`WHATSAPP_SENDER_ID`**
    *   **O que é**: Nome ou ID da instância criada dentro da Evolution API que está conectada ao WhatsApp que fará os disparos das mensagens.

---

## 🌐 5. Configurações Gerais

*   **`APP_URL`**
    *   **O que é**: A URL pública principal de execução do aplicativo.
    *   **Exemplo**: `http://localhost:3000` (desenvolvimento) ou `https://upanalytics.com.br` (produção).
