# 🚀 INSTRUÇÕES COMPLETAS - BUILD ZENPRESS APK

## PASSO 1 - PREPARAR AMBIENTE
```bash
npm install -g @expo/cli eas-cli
```

## PASSO 2 - LOGIN
```bash
npx expo login
# Use sua conta: username/password
```

## PASSO 3 - NAVEGAR PARA PROJETO
```bash
cd ZenPressExpo
```

## PASSO 4 - GERAR APK
```bash
npx eas build --platform android --profile preview
```

## PASSO 5 - AGUARDAR BUILD
- ⏳ Aguarde 10-15 minutos
- 📱 Link do APK será fornecido
- 💾 Baixe o APK gerado

## CONFIGURAÇÕES JÁ PRONTAS:
✅ app.json configurado
✅ eas.json configurado  
✅ Package: com.zenpress.app
✅ Nome: ZenPress - Acupressão e TCM
✅ Ícones e assets incluídos

## EM CASO DE ERRO:
```bash
npx eas build:configure
npx eas build --platform android --profile preview --clear-cache
```
