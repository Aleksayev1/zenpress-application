#!/bin/bash

echo "🔍 Verificando saúde do ZenPress..."

# Verificar containers
echo "📦 Status dos containers:"
docker-compose ps

# Verificar conectividade
echo -e "\n🌐 Verificando conectividade:"

# Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: Erro"
fi

# Backend
if curl -s http://localhost:8001/docs > /dev/null; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: Erro"
fi

# Mobile
if curl -s http://localhost:8082 > /dev/null; then
    echo "✅ Mobile: OK"
else
    echo "❌ Mobile: Erro"
fi

# MongoDB
if docker-compose exec mongodb mongo --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB: OK"
else
    echo "❌ MongoDB: Erro"
fi

echo -e "\n📊 Uso de recursos:"
docker stats --no-stream