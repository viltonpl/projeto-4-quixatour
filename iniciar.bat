@echo off
title QuixaTour - Iniciar
cd /d "%~dp0"

echo ==============================================
echo   QuixaTour - iniciando backend e app web
echo ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado. Instale em https://nodejs.org e tente de novo.
  pause
  exit /b 1
)

rem --- Instala dependencias na primeira execucao ---
if not exist "node_modules" (
  echo Instalando dependencias do app...
  call npm install
)
if not exist "backend\node_modules" (
  echo Instalando dependencias do backend...
  call npm --prefix backend install
)

rem --- Backend (porta 3001) ---
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if errorlevel 1 (
  echo Iniciando backend na porta 3001...
  start "QuixaTour Backend" cmd /k "npm run backend"
) else (
  echo Backend ja esta rodando na porta 3001.
)

rem --- App web Expo (porta 8081) ---
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if errorlevel 1 (
  echo Iniciando app web na porta 8081...
  start "QuixaTour App" cmd /k "npx expo start --port 8081"
) else (
  echo App web ja esta rodando na porta 8081.
)

rem --- Espera os dois servidores ficarem prontos (ate 2 minutos) ---
echo.
echo Aguardando os servidores ficarem prontos...
powershell -NoProfile -Command "$fim=(Get-Date).AddMinutes(2); while((Get-Date) -lt $fim){ $b=Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue; $a=Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue; if($a -and $b){ exit 0 }; Start-Sleep -Seconds 1 }; exit 1"
if errorlevel 1 (
  echo [AVISO] Os servidores demoraram para responder. Veja as janelas "QuixaTour Backend" e "QuixaTour App".
)

echo Abrindo o navegador...
start "" "http://localhost:8081"

echo.
echo ==============================================
echo   Tudo pronto!
echo   App:      http://localhost:8081
echo   Backend:  http://localhost:3001/api/health
echo.
echo   Turista:    seu@email.com    / 123456
echo   Prestador:  ze@quixatour.com / 123456
echo.
echo   Dica: abra uma segunda aba para logar como
echo   prestador ao mesmo tempo que o turista.
echo   Para parar tudo, use o encerrar.bat
echo ==============================================
echo.
timeout /t 10
