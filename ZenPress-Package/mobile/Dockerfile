FROM node:18-alpine

WORKDIR /app

# Instalar Expo CLI globalmente
RUN npm install -g @expo/cli

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código da aplicação
COPY . .

# Expor porta
EXPOSE 8082

# Comando para iniciar a aplicação
CMD ["npx", "expo", "start", "--web", "--port", "8082", "--host", "0.0.0.0"]