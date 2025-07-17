# 🤝 Contribuindo para o ZenPress

## 🎯 Como Contribuir

### 1. 🐛 Reportar Bugs
- Use as issues do GitHub
- Inclua screenshots se possível
- Descreva os passos para reproduzir

### 2. 💡 Sugerir Funcionalidades
- Abra uma issue com label "enhancement"
- Descreva o problema que a funcionalidade resolveria
- Explique a solução proposta

### 3. 🔧 Desenvolvimento

#### Configuração do Ambiente
```bash
# Clone o repositório
git clone <repo-url>
cd ZenPress-Package

# Instale as dependências
docker-compose up -d

# Execute os testes
docker-compose exec backend python -m pytest
```

#### Estrutura de Branches
- `main` - Produção
- `develop` - Desenvolvimento
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs

#### Padrões de Código
- **Backend**: PEP 8 (Python)
- **Frontend**: ESLint + Prettier
- **Mobile**: Expo guidelines

### 4. 📖 Documentação
- Mantenha o README.md atualizado
- Comente código complexo
- Documente APIs no formato OpenAPI

### 5. 🧪 Testes
- Escreva testes para novas funcionalidades
- Mantenha cobertura acima de 70%
- Teste em diferentes navegadores

## 📋 Checklist para Pull Requests

- [ ] Código testado localmente
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Sem conflitos com main
- [ ] Descrição clara do que foi alterado

## 🎨 Diretrizes de Design

### Cores Principais
- Azul: `#2196F3` (Primary)
- Verde: `#4CAF50` (Success)
- Laranja: `#FF9800` (Warning)
- Vermelho: `#F44336` (Error)

### Tipografia
- Títulos: Roboto Bold
- Corpo: Roboto Regular
- Código: Fira Code

### Ícones
- Use Ionicons para consistência
- Tamanhos: 16px, 24px, 32px
- Sempre com fallback

## 🌐 Internacionalização

### Adicionar Novo Idioma
1. Crie arquivo em `frontend/src/i18n/locales/`
2. Traduza todas as chaves
3. Adicione no array de idiomas
4. Teste todas as telas

### Chaves de Tradução
- Use namespaces: `auth.login.title`
- Seja descritivo: `payment.success.message`
- Evite repetição: use interpolação

## 🔒 Segurança

### Práticas Obrigatórias
- Nunca commitar chaves API
- Use variáveis de ambiente
- Valide inputs do usuário
- Sanitize dados do banco

### Autenticação
- JWT com expiração
- Refresh tokens
- Rate limiting
- Hash passwords com bcrypt

## 📱 Mobile Guidelines

### Performance
- Lazy loading de componentes
- Otimização de imagens
- Cache de dados
- Offline first

### UX/UI
- Navegação intuitiva
- Feedback visual
- Estados de loading
- Tratamento de erros

## 🚀 Deploy

### Ambientes
- **Development**: Branch develop
- **Staging**: Branch main
- **Production**: Tags v1.x.x

### Checklist de Deploy
- [ ] Testes passando
- [ ] Backup do banco
- [ ] Variáveis de ambiente
- [ ] Logs configurados
- [ ] Monitoramento ativo

## 📞 Suporte

- **Issues**: Use o GitHub Issues
- **Discussões**: GitHub Discussions
- **Email**: Aleksayev@zenpress.org

---

**Obrigado por contribuir com o ZenPress! 🙏**