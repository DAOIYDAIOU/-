@echo off
cd /d %~dp0
if not exist .env copy .env.example .env >nul
node bot.js
pause
