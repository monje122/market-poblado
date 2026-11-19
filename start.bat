@echo off
echo ========================================================
echo   Iniciando Tienda Online de Supermercado El Poblado
echo ========================================================
echo.
cd /d "%~dp0"
start "" http://localhost:3000
node server.js
