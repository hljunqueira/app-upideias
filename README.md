# UP Analytics by UpIdeias

> **Posicionamento**: "Transforme métricas em estratégia."
> **Frase de apoio**: "Sua empresa não precisa apenas de mais posts. Precisa de estratégia."

O **UP Analytics** é uma plataforma SaaS premium projetada para empresas, criadores, social medias e agências acompanharem métricas do Instagram, receberem diagnósticos inteligentes com IA, gerarem ideias de postagens, gerenciarem calendários editoriais, controlarem aprovações de clientes, receberem relatórios automáticos no WhatsApp e acessarem aulas de treinamento no hub **UP Creator**.

## 🚀 Arquitetura do Repositório (Monorepo)

O projeto é estruturado em um monorepo com npm Workspaces:

```
up-analytics/
├── apps/
│   ├── web/           # Plataforma Web Next.js (App Router, Tailwind CSS, Recharts)
│   └── mobile/        # Aplicativo Mobile Expo (Expo Router, NativeWind)
├── packages/
│   ├── ui/            # Componentes visuais reutilizáveis
│   ├── lib/           # Conectores, API Clients (Gemini, Evolution API, Supabase) e helpers
│   ├── types/         # Interfaces e tipos TypeScript compartilhados
│   └── config/        # Configurações TypeScript/ESLint/Prettier base
├── supabase/
│   ├── migrations/    # Estrutura de banco de dados PostgreSQL
│   └── seed.sql       # Dados iniciais para planos, features e UP Creator
├── docker-compose.yml # Dockerização completa para Deploy na VPS
└── README.md
```

## 🛠️ Configuração do Ambiente

1. **Instalar dependências**:
   No diretório raiz do monorepo, execute:
   ```bash
   npm install
   ```

2. **Variáveis de Ambiente**:
   Copie o arquivo `.env.example` para `.env` na raiz e configure as chaves necessárias.

3. **Banco de Dados Supabase**:
   Configure as migrações localizadas em `supabase/migrations` no painel do Supabase ou utilizando a CLI do Supabase.

4. **Automações e WhatsApp**:
   - **n8n**: Orquestrador de integrações e cron jobs.
   - **Evolution API**: Servidor de mensageria WhatsApp para alertas inteligentes e relatórios semanais.

## 💻 Desenvolvimento

- Rodar web em modo desenvolvimento:
  ```bash
  npm run dev:web
  ```

- Rodar mobile com Expo Go:
  ```bash
  npm run dev:mobile
  ```

## 🐳 Docker & Deploy na VPS

Para rodar a plataforma Next.js (`apps/web`) em modo de produção utilizando Docker, siga os passos abaixo:

1. **Configurar as Variáveis de Ambiente**:
   Certifique-se de que o arquivo `.env` na raiz do projeto esteja preenchido com as chaves corretas (`GEMINI_API_KEY`, etc.).

2. **Construir e Iniciar os Containers**:
   Execute o comando abaixo na raiz do monorepo:
   ```bash
   docker-compose up -d --build
   ```

3. **Acessar a Plataforma**:
   A aplicação Next.js estará acessível na porta `3000` (ex: `http://localhost:3000` ou pelo IP da sua VPS).

---
*Assinatura: by UpIdeias*
