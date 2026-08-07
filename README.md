# anna-psy-online

Сайт психолога **Анны Щеголихиной**: https://anna-psy.online/  
Репозиторий: статический HTML / CSS / JS → **GitHub Pages**.

Сейчас на Pages смотрит тест-домен **https://muzhskoy-psikholog.ru/** (пока DNS боевого домена на Тильде). Переезд: `CUTOVER.md`.

## Стек

- Статика (как мужской и семейный .рф-сайты).
- Хостинг: **GitHub Pages** (`main` → корень).
- Календарь записи: `https://anna-backend.ru/widget.js`.
- Формы → Cloudflare Worker `psi-leads` → CRM + Telegram.
- Cookie / аналитика: `assets/cookie-notice.js` + `assets/consent-analytics.js` (Метрика `99617923`, отказ от статистики как на мужском сайте).

## Важно

- Код Тильды **не копируем**. Контент (включая privacy/oferta) перенесён своими страницами.
- Боевой виджет на Тильде и .рф этим репо не ломаем.
- До смены DNS **не** менять `CNAME` на `anna-psy.online`.
- Бэкапы Postgres на VPS: в репо schedule — `BACKUP.md`.
- Локальный бэклог: `local/BACKLOG.md` (в `.gitignore`).

## Локальный просмотр

```powershell
cd C:\Users\ANNA\SITES\anna-psy-online
start index.html
```

Или любой локальный static-server из корня репо.

## Деплой

Push в `main` → workflow **Deploy to GitHub Pages**.  
DNS/Pages (серое облако Cloudflare → IP GitHub): **`HOSTING-DNS.md`**.

## Ключевые файлы

| Путь | Назначение |
|------|------------|
| `index.html` | Главная |
| `about/`, ниши (`it/`, `parting/`, `bloggers/`, …) | Контентные страницы |
| `group2026/` | Лендинг терапевтической группы |
| `privacy/`, `oferta/` | Юрстраницы |
| `thank-you-booking/`, `thank-you-callback/` | Спасибо (`noindex`) |
| `blog/` | Индекс + статьи на бренде; часть карточек → мужской .рф |
| `REDIRECTS.md` | Таблица редиректов |
| `CUTOVER.md` | Чеклист переезда DNS |
| `robots.txt` | Allow `/`; Disallow thank-you |
| `scripts/smoke-test.mjs` | Смоук стенда |

## Метрика

Счётчик: `99617923` (webvisor + clickmap). Загрузка через consent-gate; отказ — в «Настройки cookie».
