#!/bin/bash

echo "🌟 Criando ZenPress no seu computador..."

# Criar diretório principal
mkdir -p ZenPress-Local
cd ZenPress-Local

# Criar estrutura básica
mkdir -p backend frontend mobile scripts

# Criar docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: zenpress_mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=zenpress
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    container_name: zenpress_backend
    restart: unless-stopped
    ports:
      - "8001:8001"
    depends_on:
      - mongodb
    environment:
      - MONGO_URL=mongodb://mongodb:27017/zenpress
      - JWT_SECRET=your-jwt-secret-key-here
      - STRIPE_API_KEY=sk_test_your_stripe_key_here
      - PIX_KEY=aleksayev@gmail.com

  frontend:
    build: ./frontend
    container_name: zenpress_frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8001

  mobile:
    build: ./mobile
    container_name: zenpress_mobile
    restart: unless-stopped
    ports:
      - "8082:8082"

volumes:
  mongodb_data:
EOF

# Criar README
cat > README.md << 'EOF'
# ZenPress - Aplicativo de Acupressão

## Instalação
```bash
docker-compose up -d
```

## Acesso
- Frontend: http://localhost:3000
- Mobile: http://localhost:8082
- API: http://localhost:8001
EOF

# Criar script de instalação
cat > install.sh << 'EOF'
#!/bin/bash
echo "🚀 Instalando ZenPress..."
docker-compose up -d
echo "✅ ZenPress instalado!"
echo "🌐 Acesse: http://localhost:3000"
EOF

chmod +x install.sh

echo "✅ Estrutura básica criada!"
echo "📁 Pasta: ZenPress-Local"
echo "🚀 Execute: ./install.sh"