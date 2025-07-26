# XZenPress - Estrutura Completa do Projeto

## 📁 Estrutura de Diretórios

```
/app/
├── frontend/                     # React frontend (PWA)
│   ├── src/
│   │   ├── components/           # Componentes React
│   │   │   ├── Home.jsx         # Página inicial
│   │   │   ├── TechniqueDetail.jsx # Detalhes das técnicas
│   │   │   ├── CategoryView.jsx # Visualização por categoria
│   │   │   ├── Favorites.jsx    # Técnicas favoritas
│   │   │   ├── History.jsx      # Histórico de sessões
│   │   │   ├── PaymentPage.jsx  # Página de pagamentos
│   │   │   ├── ConsultationPage.jsx # Consultas
│   │   │   ├── Navigation.jsx   # Navegação
│   │   │   ├── AuthContext.jsx  # Contexto de autenticação
│   │   │   └── ui/             # Componentes UI (Radix)
│   │   ├── services/           # Serviços/API calls
│   │   ├── i18n/              # Internacionalização
│   │   └── App.js             # App principal
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   ├── sw.js             # Service Worker
│   │   └── index.html        # HTML base
│   ├── package.json          # Dependências React
│   └── build/               # Build de produção
├── backend/                     # FastAPI backend
│   ├── server.py              # Servidor principal
│   ├── models.py              # Modelos de dados
│   ├── auth.py                # Autenticação JWT
│   ├── payments.py            # Pagamentos Stripe
│   ├── crypto_payments.py     # Pagamentos crypto (Binance)
│   ├── reviews_analytics.py   # Analytics e reviews
│   ├── spotify_auth.py        # Integração Spotify
│   ├── requirements.txt       # Dependências Python
│   └── .env                  # Variáveis de ambiente
└── Arquivos na raiz:
    ├── index.html            # Build deployado
    ├── manifest.json         # PWA manifest deployado
    ├── sw.js                # Service Worker deployado
    ├── static/              # Assets do build (CSS/JS)
    └── images/              # Imagens da aplicação
```

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19.0.0** - Framework principal
- **React Router Dom** - Roteamento
- **Radix UI** - Componentes de interface
- **Tailwind CSS** - Estilização
- **Axios** - HTTP client
- **i18next** - Internacionalização (PT/EN)
- **PWA** - Progressive Web App com Service Worker

### Backend
- **FastAPI** - Framework Python
- **MongoDB/Motor** - Banco de dados
- **JWT Authentication** - Autenticação
- **Stripe** - Pagamentos convencionais
- **Binance Pay** - Pagamentos crypto
- **Spotify API** - Integração musical
- **Uvicorn** - Servidor ASGI

## 🏗️ Arquitetura da Aplicação

### Funcionalidades Principais

#### 1. **Sistema de Acupressão**
- 50+ técnicas de acupressão e craniopuntura
- Timer de 60 segundos para cada técnica
- Instruções detalhadas com imagens
- Categorias: TCM, Craniopuntura, etc.

#### 2. **Sistema de Usuários**
- Registro e login com JWT
- Perfis de usuário
- Histórico de sessões
- Favoritos
- Sistema premium/freemium

#### 3. **Pagamentos**
- **Stripe**: Cartões convencionais
- **PIX via Binance Pay**: Pagamentos instantâneos
- Planos mensais e anuais
- Sistema de assinaturas

#### 4. **PWA (Progressive Web App)**
- Instalável como app nativo
- Funciona offline
- Service Worker para cache
- Manifest para Google Play Store

#### 5. **Funcionalidades Extras**
- Respiração 4-7-8 guiada
- Analytics de uso
- Consultas via WhatsApp
- Integração Spotify (pausada)
- Multi-idioma (PT/EN)

## 🔧 APIs e Integrações

### Endpoints Backend (/api)
```
/auth/register      - Registro de usuário
/auth/login         - Login
/users/me          - Perfil do usuário
/techniques        - Lista técnicas
/techniques/{id}   - Detalhes técnica
/sessions          - Histórico de sessões
/favorites         - Técnicas favoritas
/payments/*        - Sistema de pagamentos
/crypto/*          - Pagamentos crypto
/reviews/*         - Analytics
```

### Integrações Externas
- **Stripe API** - Pagamentos cartão
- **Binance Pay** - PIX/crypto
- **MongoDB Atlas** - Database
- **Spotify API** - Música (desativada)

## 💳 Sistema de Monetização

### Planos
- **Gratuito**: 3 técnicas básicas + respiração
- **Premium**: 50+ técnicas + histórico + consultas
- **Preços**: R$ 19,90/mês ou R$ 199,90/ano

### Métodos de Pagamento
- Cartão (Stripe)
- PIX via Binance Pay
- Crypto (Bitcoin, USDT)

## 🌍 Deploy e URLs

### Produção Atual
- **Domain**: https://jazzy-arithmetic-0f0607.netlify.app/
- **Status**: Funcionando com aplicação completa
- **PWA**: Instalável via manifest.json

### Ambiente
- **Frontend**: Netlify (auto-deploy do GitHub)
- **Backend**: Emergent cloud (porta 8001)
- **Database**: MongoDB (configurado via .env)

## 📱 Recursos PWA

### Instalação
- Manifest configurado para Google Play
- Ícones 192x192 e 512x512
- Screenshots mobile/desktop
- Service Worker para offline

### Funcionalidades Offline
- Cache de técnicas visualizadas
- Timer funciona offline
- Dados sincronizam quando volta online

## 🔐 Segurança

- JWT tokens para autenticação
- Senhas hash com bcrypt
- CORS configurado
- Validação de dados com Pydantic
- Rate limiting (pode ser implementado)

## 📊 Analytics

- Tracking de sessões por usuário
- Estatísticas de técnicas mais usadas
- Dados de retenção e engajamento
- Dashboard para desenvolvedores

## 🚀 Como Usar Este Código

1. **Extrair o arquivo**: `tar -xzf zenpress-codigo-completo.tar.gz`
2. **Backend**: 
   - `cd backend`
   - `pip install -r requirements.txt`
   - Configurar `.env` com MongoDB e APIs
   - `uvicorn server:app --host 0.0.0.0 --port 8001`
3. **Frontend**:
   - `cd frontend`
   - `yarn install`
   - Configurar `.env` com backend URL
   - `yarn start` (dev) ou `yarn build` (prod)

## 📝 Notas Importantes

- Todos os IDs são UUID (não ObjectID do MongoDB)
- Backend usa prefix `/api` para todas as rotas
- Frontend configurado para PWA completa
- Sistema de pagamentos totalmente funcional
- Pronto para Google Play Store (internal testing)

---

**Status**: ✅ Aplicação completa e funcional
**Última atualização**: Julho 2025
**Desenvolvido por**: Emergent AI + Colaboração humana