TREND SETTER — готово для деплоя на Bothost

Что уже подготовлено:
1. Добавлен единый запуск: npm start
2. start.js запускает сразу:
   - server.js (магазин + админка)
   - bot.js (Telegram бот)
3. Обновлён package.json
4. Добавлен .gitignore чтобы .env не попал в GitHub

Что нужно сделать в Bothost:
1. Загрузить этот проект в GitHub или zip, если Bothost принимает архив.
2. В панели Bothost выбрать Node.js проект.
3. Указать стартовую команду:
   npm start
4. Добавить переменные окружения:
   BOT_TOKEN=твой токен бота
   WEB_APP_URL=https://ТВОЙ-URL-НА-BOTHOST
   PORT=3000
   ADMIN_CHAT_ID=твой telegram id
   ADMIN_IDS=твой telegram id,второй админ id
   ADMIN_KEY=любой секретный ключ

Важно:
- WEB_APP_URL должен быть публичным адресом проекта на Bothost.
- Если админов несколько, добавляй их через ADMIN_IDS или через админку.
- На бесплатном тарифе локальные данные могут быть нестабильны после рестарта.

После запуска:
1. Напиши боту /start
2. Напиши /myid чтобы узнать свой Telegram ID
3. Укажи этот ID в ADMIN_CHAT_ID
4. Напиши /admin чтобы открыть админку

Если обновляешь проект:
- git add .
- git commit -m "update"
- git push
