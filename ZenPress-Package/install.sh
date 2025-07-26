#!/bin/bash

echo "🌟 ZenPress - Instalação Automática"
echo "==================================="

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale Docker primeiro."
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Por favor, instale Docker Compose primeiro."
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"

# Verificar se as portas estão disponíveis
check_port() {
    local port=$1
    if lsof -i :$port &> /dev/null; then
        echo "⚠️  Porta $port está em uso. Por favor, feche o processo ou altere a porta no docker-compose.yml"
        return 1
    fi
    return 0
}

echo "🔍 Verificando portas disponíveis..."
check_port 3000 || exit 1
check_port 8001 || exit 1
check_port 8082 || exit 1
check_port 27017 || exit 1

echo "✅ Todas as portas estão disponíveis"

# Parar containers existentes se houver
echo "🛑 Parando containers existentes..."
docker-compose down &> /dev/null

# Build e start dos containers
echo "🏗️  Construindo e iniciando containers..."
docker-compose up -d --build

# Aguardar services subirem
echo "⏳ Aguardando services iniciarem..."
sleep 30

# Verificar se os services estão rodando
echo "🔍 Verificando status dos services..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services iniciados com sucesso!"
    echo ""
    echo "🌐 Acesse suas aplicações:"
    echo "   Frontend Web: http://localhost:3000"
    echo "   App Mobile:   http://localhost:8082"
    echo "   API Backend:  http://localhost:8001"
    echo "   API Docs:     http://localhost:8001/docs"
    echo ""
    echo "📖 Leia o README.md para mais informações"
    echo "🎉 Instalação concluída com sucesso!"
else
    echo "❌ Erro ao iniciar services. Verificando logs..."
    docker-compose logs
fi