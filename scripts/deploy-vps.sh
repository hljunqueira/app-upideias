#!/usr/bin/env bash
# ==============================================================================
# UP Analytics - Script de Deploy Automatizado para VPS (Docker)
# ==============================================================================
set -e

echo "🚀 [DEPLOY VPS] Iniciando processo de atualização..."

# 1. Diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"
echo "📂 Diretório do projeto: $PROJECT_DIR"

# 2. Verificar se o Git está limpo ou fazer pull da branch main
echo "📥 Atualizando código do repositório (branch: main)..."
git fetch origin main
git reset --hard origin/main

# 3. Validar e sanitizar arquivo .env
if [ ! -f ".env" ]; then
  if [ -f ".env.production" ]; then
    echo "⚠️ Arquivo .env não encontrado, copiando de .env.production..."
    cp .env.production .env
  else
    echo "⚠️ ATENÇÃO: Arquivo .env não encontrado na raiz da VPS. Certifique-se de configurar as variáveis de ambiente."
  fi
fi

if [ -f ".env" ]; then
  echo "🧹 Sanitizando arquivo .env (removendo CRLF e aspas residuais)..."
  tr -d '\r' < .env > .env.clean
  sed -i -E 's/^([A-Za-z0-9_]+)="?(.*?)"?$/\1=\2/' .env.clean
  mv .env.clean .env
fi

# 4. Reconstrução e reinicialização dos containers com Docker Compose
echo "🐳 Reconstruindo imagens e subindo containers com Docker Compose..."
docker compose down || true
docker compose up -d --build --remove-orphans

# 5. Limpeza de imagens e camadas antigas/órfãs (evita estourar o disco da VPS)
echo "🧹 Limpando imagens antigas sem uso..."
docker image prune -f

# 6. Status dos serviços
echo "✅ Deploy concluído com sucesso!"
echo "📊 Status dos containers em execução:"
docker compose ps
