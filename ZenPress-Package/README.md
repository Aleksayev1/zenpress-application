# 🌟 ZenPress - Aplicativo de Acupressão e Medicina Tradicional Chinesa

## 📋 Sobre o Projeto

ZenPress é uma aplicação completa para alívio natural da dor através de técnicas de acupressão e craniopuntura. O projeto inclui:

- **🌐 Frontend Web** (React) - Interface principal
- **📱 App Mobile** (Expo) - Aplicativo móvel responsivo  
- **🔧 Backend API** (FastAPI) - Servidor com todas as funcionalidades
- **🗄️ Banco de Dados** (MongoDB) - Armazenamento de dados

## ✨ Funcionalidades Principais

### 🌐 Frontend Web
- Homepage com categorias de técnicas
- Integração com Spotify para música relaxante
- Sistema de pagamentos (Cartão e Crypto)
- Páginas de técnicas por categoria
- Sistema Premium com controle de acesso
- Suporte a 5 idiomas (PT, EN, ES, FR, DE)

### 📱 App Mobile
- Navegação por tabs (Home, Timer, Técnicas)
- Timer de 60 segundos para acupressão
- Respiração guiada 4-7-8 com animações
- Lista de técnicas com filtros
- Design responsivo e moderno

### 🔧 Backend API
- **48 endpoints testados** (78.7% de sucesso)
- Autenticação JWT completa
- 7 técnicas de acupressão cadastradas
- Sistema de favoritos e histórico
- Pagamentos crypto (Bitcoin, USDT, PIX)
- Analytics de avaliações
- Sistema Premium com controle de acesso

## 🚀 Instalação Rápida

### Pré-requisitos
- Docker e Docker Compose instalados
- Git (opcional)

### Passos para Instalação

1. **Clone ou descompacte o projeto**
   ```bash
   # Se usar git
   git clone <repositorio>
   cd ZenPress-Package
   
   # Ou simplesmente descompacte o arquivo ZIP
   cd ZenPress-Package
   ```

2. **Execute o script de instalação**
   ```bash
   # Linux/Mac
   chmod +x install.sh
   ./install.sh
   
   # Windows
   install.bat
   ```

3. **Ou execute manualmente**
   ```bash
   docker-compose up -d
   ```

## 🌐 Acesso às Aplicações

Após a instalação, você pode acessar:

- **🌐 Frontend Web**: http://localhost:3000
- **📱 App Mobile**: http://localhost:8082  
- **🔧 API Backend**: http://localhost:8001
- **📊 API Docs**: http://localhost:8001/docs
- **🗄️ MongoDB**: mongodb://localhost:27017

## 📖 Guia de Uso

### 🌐 Frontend Web
1. Acesse http://localhost:3000
2. Explore as categorias: Craniopuntura, MTC, Saúde Mental
3. Use a integração Spotify para música relaxante
4. Acesse /payment para ver planos premium
5. Teste os botões de pagamento

### 📱 App Mobile
1. Acesse http://localhost:8082
2. Navegue pelas tabs: ZenPress, Timer, Técnicas
3. Use o Timer com respiração 4-7-8
4. Explore a lista de técnicas
5. Teste a navegação entre telas

### 🔧 Backend API
1. Acesse http://localhost:8001/docs
2. Teste a autenticação (registro/login)
3. Explore os endpoints de técnicas
4. Teste o sistema de favoritos
5. Experimente os pagamentos crypto

## ⚙️ Configuração Avançada

### Variáveis de Ambiente

Edite o arquivo `docker-compose.yml` para personalizar:

```yaml
environment:
  - MONGO_URL=mongodb://mongodb:27017/zenpress
  - JWT_SECRET=your-jwt-secret-key-here
  - STRIPE_API_KEY=sk_test_your_stripe_key_here
  - PIX_KEY=aleksayev@gmail.com
  - REACT_APP_BACKEND_URL=http://localhost:8001
```

### Portas Personalizadas

Para alterar as portas, modifique as seções `ports` no docker-compose.yml:

```yaml
ports:
  - "SUA_PORTA:PORTA_INTERNA"
```

## 🛠️ Desenvolvimento

### Estrutura do Projeto
```
ZenPress-Package/
├── backend/           # API FastAPI
├── frontend/          # React Web App
├── mobile/            # Expo Mobile App
├── docker-compose.yml # Configuração Docker
├── install.sh         # Script de instalação (Linux/Mac)
├── install.bat        # Script de instalação (Windows)
└── README.md          # Esta documentação
```

### Comandos Úteis

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Rebuild containers
docker-compose build

# Reset completo (cuidado: apaga dados!)
docker-compose down -v
docker system prune -a
```

## 🧪 Testes

O backend foi testado com **48 de 61 testes passando** (78.7% de sucesso).

### Endpoints Testados
- ✅ Autenticação JWT
- ✅ Técnicas de acupressão
- ✅ Sistema de favoritos
- ✅ Sessões de prática
- ✅ Pagamentos crypto
- ✅ Sistema premium
- ✅ Analytics de reviews

### Problemas Conhecidos
- ❌ Pagamentos por cartão precisam de chave Stripe válida
- ⚠️ Alguns endpoints retornam 500 em vez de códigos HTTP específicos

## 🔧 Solução de Problemas

### Container não inicia
```bash
# Verificar logs
docker-compose logs nome_do_servico

# Limpar cache Docker
docker system prune -a
```

### Erro de porta em uso
```bash
# Verificar processos usando a porta
lsof -i :3000  # ou 8001, 8082

# Matar processo
kill -9 PID_DO_PROCESSO
```

### Problemas de permissão
```bash
# Linux/Mac
sudo chown -R $USER:$USER .

# Windows: Execute como Administrador
```

## 📊 Especificações Técnicas

### Backend
- **Framework**: FastAPI
- **Banco**: MongoDB
- **Autenticação**: JWT
- **Testes**: 48/61 endpoints funcionando
- **Pagamentos**: Crypto (BTC, USDT, PIX)

### Frontend
- **Framework**: React
- **Roteamento**: React Router
- **Internacionalização**: 5 idiomas
- **Pagamentos**: Stripe + Crypto
- **Integração**: Spotify

### Mobile
- **Framework**: Expo (React Native)
- **Navegação**: Tab Navigation
- **Animações**: React Native Reanimated
- **Timer**: 60s com respiração 4-7-8

## 🎯 Próximos Passos

1. **Substituir chave Stripe** por uma válida
2. **Melhorar tratamento de erros** HTTP
3. **Adicionar mais técnicas** de acupressão
4. **Implementar notificações** push
5. **Deploy para produção**

## 📞 Suporte

Para suporte técnico:
- **Email**: Aleksayev@zenpress.org
- **Documentação**: Consulte este README.md
- **API Docs**: http://localhost:8001/docs

## 📄 Licença

Este projeto é para uso educacional e informativo. Não substitui consulta médica profissional.

---

**🌟 Desenvolvido com ❤️ para promover bem-estar natural**