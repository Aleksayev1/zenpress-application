#!/bin/bash

echo "🔄 Atualizando ZenPress..."

# Parar containers
echo "🛑 Parando containers..."
docker-compose down

# Atualizar código (se usar git)
if [ -d ".git" ]; then
    echo "📥 Atualizando código..."
    git pull origin main
fi

# Rebuild containers
echo "🏗️  Rebuilding containers..."
docker-compose build

# Reiniciar
echo "🚀 Reiniciando..."
docker-compose up -d

echo "✅ Atualização concluída!"
echo "🌐 Acesse: http://localhost:3000"