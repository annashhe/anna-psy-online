# Хостинг и DNS: muzhskoy-psikholog.ru

## Что сломалось (2026-08-07)

Симптом: в браузере на `/about/` — GitHub Pages  
**«404 — There isn't a GitHub Pages site here»**.

Параллельно whatsmydns показывает разные A-записи:

| Куда резолвится | IP | Что видит пользователь |
|-----------------|----|------------------------|
| Cloudflare (прокси) | `104.21.*`, `172.67.*`, `188.114.*` | Сайт обычно **открывается** |
| GitHub Pages (старый кэш / прямой A) | `185.199.108–111.153` | **404** «нет сайта Pages» |
| Часть точек | пусто | ошибка DNS |

NS домена сейчас: **Cloudflare** (`donna` / `randall.ns.cloudflare.com`).  
В репозитории GitHub Pages: `cname=muzhskoy-psikholog.ru`, но статус деплоя **`building` / последние Actions — failure/cancelled**.  
Прямой запрос на `185.199.*` с `Host: muzhskoy-psikholog.ru` → тот же generic 404.

Итог: это не «пропала страница `/about/`» (файл `about/index.html` в репо есть), а **разъезд DNS + мёртвый деплой GitHub Pages**.

---

## Быстрый обход для себя

1. Открыть https://muzhskoy-psikholog.ru/about/ через DNS Cloudflare:  
   в системе временно DNS `1.1.1.1` / `8.8.8.8`, режим инкогнито.
2. В Cloudflare → **Caching → Purge Everything**.
3. На https://www.whatsmydns.net/#A/muzhskoy-psikholog.ru дождаться, пока везде будут только IP Cloudflare (или только GitHub — см. выбранную схему ниже), без `185.199.*` вперемешку.

---

## Выбрать одну схему (не смешивать)

### Схема A — как .рф сайты: только GitHub Pages (рекомендуется для теста)

В Cloudflare DNS (лучше **DNS only**, серое облако):

```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
AAAA  @     2606:50c0:8000::153
AAAA  @     2606:50c0:8001::153
AAAA  @     2606:50c0:8002::153
AAAA  @     2606:50c0:8003::153
CNAME www   annashhe.github.io
```

В GitHub → Settings → Pages:

- Source: **GitHub Actions** (workflow `Deploy to GitHub Pages`)  
  **или** Deploy from branch `main` / `(root)` — как у мужского/семейного .рф.
- Custom domain: `muzhskoy-psikholog.ru`, HTTPS включён.
- Дождаться статуса **Active** / build **built**, не вечного `building`.

Проверка:

```bash
curl -sI --resolve muzhskoy-psikholog.ru:443:185.199.108.153 \
  https://muzhskoy-psikholog.ru/about/ | head -5
# ожидаем HTTP/2 200, server: GitHub.com
```

### Схема B — только Cloudflare Pages

- Custom Domain живёт в **Cloudflare Pages**, прокси оранжевый — нормально.
- В GitHub Pages **убрать** custom domain (или не использовать Pages вообще), чтобы `185.199.*` больше нигде не светились.
- Не держать «и CF Pages, и GitHub Pages на одном домене».

---

## Что сделать в GitHub прямо сейчас

1. Отменить зависшие workflow (Actions → cancelled/stuck `pages-build-deployment` / Deploy).
2. Запустить **Deploy to GitHub Pages** вручную (`workflow_dispatch`) на `main`.
3. Если Actions снова висят — временно переключить Pages на **Deploy from a branch** (`main`, `/`), как на `психолог-для-мужчин.рф`.
4. Убедиться, что после деплоя прямой заход на `185.199.*` даёт **200**, а не generic 404.

---

## Не путать с контентом

| Проверка | Ожидание |
|----------|----------|
| `about/index.html` в репо | есть |
| Ответ через Cloudflare (с рабочего DNS) | 200 + HTML сайта |
| Ответ напрямую с GitHub Pages IP | сейчас 404 → чинить деплой/DNS |
| Тильда / anna-psy.online | не трогать |

После стабилизации DNS этот файл можно сократить до ссылки из `CUTOVER.md`.
