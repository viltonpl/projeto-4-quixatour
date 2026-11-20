@echo off
title QuixaTour - Encerrar
cd /d "%~dp0"

echo ==============================================
echo   QuixaTour - encerrando backend e app web
echo ==============================================
echo.

rem --- Fecha as janelas abertas pelo iniciar.bat (e tudo que roda dentro delas) ---
taskkill /FI "WINDOWTITLE eq QuixaTour Backend*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq QuixaTour App*" /T /F >nul 2>nul

rem --- Derruba processos do QuixaTour que sobraram (npm run backend, tsx watch, expo start)
rem     e qualquer coisa ainda ocupando as portas 3001 (backend) e 8081 (app) ---
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$padrao = 'run backend|backend run dev|tsx.*watch src/server\.ts|src/server\.ts|expo start|expo.*cli.*start';" ^
  "$procs = Get-CimInstance Win32_Process -Filter \"Name='node.exe' or Name='cmd.exe'\" | Where-Object { $_.CommandLine -match $padrao };" ^
  "foreach ($p in $procs) { taskkill /PID $p.ProcessId /T /F 2>$null | Out-Null };" ^
  "foreach ($porta in 3001, 8081) {" ^
  "  $pids = (Get-NetTCPConnection -LocalPort $porta -State Listen -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique;" ^
  "  foreach ($id in $pids) { taskkill /PID $id /T /F 2>$null | Out-Null }" ^
  "};" ^
  "Start-Sleep -Seconds 1;" ^
  "foreach ($porta in 3001, 8081) {" ^
  "  if (Get-NetTCPConnection -LocalPort $porta -State Listen -ErrorAction SilentlyContinue) { Write-Host ('[AVISO] Porta ' + $porta + ' ainda em uso.') }" ^
  "  else { Write-Host ('Porta ' + $porta + ' livre.') }" ^
  "}"

echo.
echo QuixaTour encerrado.
timeout /t 5
