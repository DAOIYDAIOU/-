@echo off
chcp 65001 >nul
cd /d %~dp0
echo ==========================================
echo TRENDSETTER MARKET - BOTHOST SETUP
echo ==========================================
echo.
echo 1) Vvedi BOT_TOKEN ot BotFather
echo 2) Vvedi URL prilozheniya ot BotHost / Bothost
echo    primer: https://your-project.bot-host.ru
echo 3) Vvedi ID adminov cherez zapyatuyu
echo.
set /p BOT_TOKEN=BOT_TOKEN: 
set /p WEB_APP_URL=WEB_APP_URL (Bothost URL): 
if "%WEB_APP_URL%"=="" set WEB_APP_URL=http://localhost:3000
set /p ADMIN_IDS=ADMIN_IDS (123,456): 
set /p ADMIN_KEY=ADMIN_KEY (Enter = trendsetter_admin_2026): 
if "%ADMIN_KEY%"=="" set ADMIN_KEY=trendsetter_admin_2026

set "ADMIN_IDS=%ADMIN_IDS: =%"
for /f "tokens=1 delims=," %%a in ("%ADMIN_IDS%") do set FIRST_ADMIN_ID=%%a

(
echo BOT_TOKEN=%BOT_TOKEN%
echo WEB_APP_URL=%WEB_APP_URL%
echo PORT=3000
echo ADMIN_CHAT_ID=%FIRST_ADMIN_ID%
echo ADMIN_IDS=%ADMIN_IDS%
echo ADMIN_KEY=%ADMIN_KEY%
) > .env

echo.
echo .env sozdan:
type .env
echo.
call npm.cmd install
echo.
node check-token.js
echo.
echo Zapusk lokalno:
echo   RUN_SERVER.bat
echo   RUN_BOT.bat
echo.
echo Dlya Bothost repo uzhe gotov. V paneli ukazhi komandou zapuska: npm start
pause
