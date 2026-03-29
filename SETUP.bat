\
@echo off
cd /d %~dp0
echo ==========================================
echo TRENDSETTER MARKET - SIMPLE SETUP V5
echo ==========================================
echo.
echo Vvedi admin ID bez probelov.
echo Primer:
echo 123456789,987654321,555666777
echo.
set /p BOT_TOKEN=Vvedi BOT_TOKEN ot BotFather: 
set /p WEB_APP_URL=Vvedi WEB_APP_URL (ngrok https://...): 
set /p ADMIN_IDS=Vvedi admin ID cherez zapyatuyu: 
set /p ADMIN_KEY=Vvedi ADMIN_KEY: 

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
echo PEREZAPUSTI:
echo RUN_SERVER.bat
echo RUN_BOT.bat
pause
