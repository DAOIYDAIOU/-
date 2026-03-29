@echo off
cd /d %~dp0
if not exist .env copy .env.example .env >nul
start "TRENDSETTER SERVER" cmd /k node server.js
timeout /t 2 >nul
start "TRENDSETTER BOT" cmd /k node bot.js
