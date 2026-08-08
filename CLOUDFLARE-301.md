# Настоящие HTTP 301 для anna-psy.online

GitHub Pages **не умеет** отдавать произвольные 301. Сейчас редиректы — HTML (`meta refresh` + JS), в httpstatus.io это выглядит как `200`.

Чтобы получить **настоящий 301**, трафик должен идти через **Cloudflare** (оранжевое облако) + Worker из этой папки.

## Важно про РФ

Раньше для `muzhskoy-psikholog.ru` оранжевое Cloudflare ломало доступ у части провайдеров.  
Перед включением proxy на `anna-psy.online` **проверь с МегаФона/мобильного**: открывается ли сайт.

Если снова `ERR_CONNECTION_RESET` — откат: снова серое облако / NS REG.RU, остаются HTML-редиректы.

## Статус 2026-08-08 (вечер)

- NS → Cloudflare (`donna` / `randall`); зона Active; proxy orange
- SSL **Full** + Always Use HTTPS; МегаФон: сайт открывается
- Worker **`anna-psy-redirects`** задеплоен, routes `anna-psy.online/*` и `www.anna-psy.online/*`
- Редиректы `/family/` `/psycholog-dlya-muzhchin/` `/semeynyy-psikholog-kaliningrad/` `/thankyoupage/` → **HTTP 301**
- Меню «Услуги» ведёт **напрямую** на .рф (не через 301); старые URL редиректов оставляем для внешних ссылок
- PageSpeed (поле): LCP ~2,4 с — CWV пройден; lab ~88
- **Cache Rule** `assets long cache` Active: `/assets/` → Edge 6 months, Browser 7 days (#146)
- Деплой Worker из PowerShell: один раз в сессии `$env:CLOUDFLARE_API_TOKEN = "…"` (в чат не слать) или `wrangler login`

## Cache Rule: длинный кеш `/assets/*` (#146)

GitHub Pages часто отдаёт статику с коротким `Cache-Control` (~10 мин). На Free Cloudflare это обходится **Cache Rule**.

CSS/JS у нас с `?v=…` — при выкладке меняй версию в HTML, браузер сам возьмёт новый файл. Картинки без `?v=` обновляются через Purge или через неделю–месяц (см. TTL ниже).

### В дашборде (рекомендуется)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → зона **`anna-psy.online`**
2. **Caching** → **Cache Rules** → **Create rule**  
   (или **Rules** → **Cache Rules**)
3. **Rule name:** `assets long cache`
4. **When incoming requests match** → **Custom filter expression**
   - Field: **URI Path**
   - Operator: **starts with**
   - Value: `/assets/`
5. **Then**
   - **Cache eligibility:** Eligible for cache
   - **Edge TTL:** Ignore cache-control header and use this TTL → **1 month**
   - **Browser TTL:** Override origin and use this TTL → **1 week**  
     (картинки без `?v=` не «залипнут» на год; CSS/JS и так с версией)
6. **Deploy** / Save

Проверка: открой DevTools → Network → любой `/assets/...` (повторная загрузка) → заголовок `cf-cache-status: HIT` (после второго запроса) и длинный `cache-control` / возраст на edge.

При срочной смене картинки без `?v=`: **Caching** → **Configuration** → **Purge Cache** → Custom Purge URL.

### Через API (твой PowerShell, токен не в чат)

```powershell
$env:CLOUDFLARE_API_TOKEN = "…"   # права: Zone Cache Rules Edit + Zone Read
$zoneId = (Invoke-RestMethod -Headers @{Authorization="Bearer $env:CLOUDFLARE_API_TOKEN"} `
  "https://api.cloudflare.com/client/v4/zones?name=anna-psy.online").result[0].id

# Правила Cache Settings — phase entrypoint; проще через UI, если API rulesets незнаком
```

На Free проще и надёжнее создать правило в UI (шаги выше).

## Было (до старта)

- NS: `ns1.reg.ru` / `ns2.reg.ru`
- A `@` → `185.199.*` (GitHub Pages)
- www → CNAME `annashhe.github.io`

## Шаг 1 — добавить сайт в Cloudflare (серое облако)

1. Войти на [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Add a domain** / **Добавить сайт** → `anna-psy.online`
3. План: **Free**
4. Cloudflare просканирует DNS. Проверь/поправь записи:

| Тип | Имя | Содержимое | Proxy (облако) |
|-----|-----|------------|----------------|
| A | `@` | `185.199.108.153` | **DNS only (серое)** |
| A | `@` | `185.199.109.153` | **DNS only (серое)** |
| A | `@` | `185.199.110.153` | **DNS only (серое)** |
| A | `@` | `185.199.111.153` | **DNS only (серое)** |
| CNAME | `www` | `annashhe.github.io` | **DNS only (серое)** |

Удали лишние записи от скана (Тильда, старые MX не трогай, если почта на домене).  
Пока облако **серое** — сайт работает как сейчас, без риска РФ.

5. Cloudflare покажет два NS вида `xxx.ns.cloudflare.com` и `yyy.ns.cloudflare.com` — **скопируй их**.

Напиши мне: «Шаг 1 готов, NS: …» — перейдём к REG.RU.

## Шаг 2 — сменить NS у REG.RU

1. [REG.RU](https://www.reg.ru) → домен `anna-psy.online` → DNS-серверы / делегирование
2. Вместо `ns1.reg.ru` / `ns2.reg.ru` вставь два NS от Cloudflare
3. Сохрани. Ожидание: от минут до нескольких часов (иногда до суток)
4. Проверка: [whatsmydns.net](https://www.whatsmydns.net/#NS/anna-psy.online) — везде Cloudflare NS  
   В Cloudflare статус домена станет **Active**

Пока NS не Active — **не** включай оранжевое облако.

## Шаг 3 — SSL в Cloudflare

1. SSL/TLS → Overview → режим **Full** (не Flexible)
2. SSL/TLS → Edge Certificates → **Always Use HTTPS**: On  
3. (позже) HSTS можно включить после стабильной работы orange

## Шаг 4 — оранжевое облако + проверка с МегаФона

1. DNS → у всех четырёх A `@` и у `www`: клик по облаку → **Proxied (оранжевое)**
2. С телефона **МегаФон / LTE, без Wi‑Fi**: открой `https://anna-psy.online/`
3. Если **открывается** — пиши «Шаг 4 ок», деплоим Worker  
4. Если `ERR_CONNECTION_RESET` / не грузится — сразу верни **серое** облако и напиши мне

## Шаг 5 — Worker (делаем вместе в Cursor)

```powershell
cd C:\Users\ANNA\SITES\anna-psy-online\cloudflare
npx wrangler login
npx wrangler deploy
```

Routes в Cloudflare → Workers → `anna-psy-redirects`:

- `anna-psy.online/*`
- `www.anna-psy.online/*`

## Шаг 6 — проверка 301

[httpstatus.io](https://httpstatus.io):

- `https://anna-psy.online/family/` → **301** → семейный .рф  
- `https://anna-psy.online/psycholog-dlya-muzhchin/` → **301** → мужской .рф  
- `https://anna-psy.online/semeynyy-psikholog-kaliningrad/` → **301** → семейный `/kaliningrad/`  
- `https://anna-psy.online/` → **200**

## Откат

1. Снять routes у Worker или выключить Worker  
2. Proxy → DNS only, либо вернуть NS REG.RU  
3. HTML-заглушки в репо продолжают работать как запасной вариант

## Что редиректит Worker

См. `anna-psy-redirects.js` и таблицу B/C/A12 в `REDIRECTS.md`.  
HTML-заглушки в репо можно оставить: если Cloudflare отвалится, пользователи всё ещё уйдут на .рф.
