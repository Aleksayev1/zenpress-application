@echo off
echo 🌟 ZenPress - Instalação Automática
echo ===================================

:: Verificar se Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não encontrado. Por favor, instale Docker primeiro.
    echo    https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

:: Verificar se Docker Compose está instalado
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose não encontrado. Por favor, instale Docker Compose primeiro.
    echo    https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo ✅ Docker e Docker Compose encontrados

:: Parar containers existentes se houver
echo 🛑 Parando containers existentes...
docker-compose down >nul 2>&1

:: Build e start dos containers
echo 🏗️  Construindo e iniciando containers...
docker-compose up -d --build

:: Aguardar services subirem
echo ⏳ Aguardando services iniciarem...
timeout /t 30 /nobreak >nul

:: Verificar se os services estão rodando
echo 🔍 Verificando status dos services...
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Services iniciados com sucesso!
    echo.
    echo 🌐 Acesse suas aplicações:
    echo    Frontend Web: http://localhost:3000
    echo    App Mobile:   http://localhost:8082
    echo    API Backend:  http://localhost:8001
    echo    API Docs:     http://localhost:8001/docs
    echo.
    echo 📖 Leia o README.md para mais informações
    echo 🎉 Instalação concluída com sucesso!
) else (
    echo ❌ Erro ao iniciar services. Verificando logs...
    docker-compose logs
)

pause