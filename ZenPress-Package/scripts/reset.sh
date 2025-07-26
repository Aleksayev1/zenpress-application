#!/bin/bash

echo "🔄 Resetando ZenPress..."
echo "⚠️  ATENÇÃO: Isso apagará todos os dados!"
read -p "Tem certeza? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v
    docker system prune -a -f
    echo "✅ Reset completo realizado!"
else
    echo "❌ Reset cancelado."
fi