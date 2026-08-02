# Промпт для агента Cursor (репозиторий psikholog-dlya-muzhchin-rf)

Скопируйте текст ниже в чат агента, открытый в репозитории **psikholog-dlya-muzhchin-rf**.

---

Добавь тестовый домен в allowlist Cloudflare Worker заявок, чтобы формы с тестового сайта могли слать лиды.

Файл: `cloudflare/psi-leads-worker.js`

1. В массив `ALLOWED_ORIGINS` добавь:
   - `https://muzhskoy-psikholog.ru`
   - `http://muzhskoy-psikholog.ru` (на случай, пока кто-то откроет без HTTPS)

2. Если есть отдельные Set’ы хостов (MALE_HOSTS / FAMILY_HOSTS) — **не** добавляй тест туда как «мужской» или «семейный». Нужен нейтральный origin в CORS allowlist. Если в коде есть проверка «известный сайт» для подписи в Telegram — добавь третью метку вроде `TEST` / `anna-psy-test` с подписью «Тест muzhskoy-psikholog.ru», чтобы заявки с теста было видно.

3. После правки дай команды деплоя Worker (`cd cloudflare && npx wrangler deploy`) и кратко что проверить: отправка формы с https://muzhskoy-psikholog.ru/ должна пройти CORS и дойти в Telegram.

4. Код виджета записи и anna-psy-schedule не трогай.

5. README Worker/cloudflare обнови одной строкой про тестовый origin.

Не коммить и не пушь, пока я не попрошу.
