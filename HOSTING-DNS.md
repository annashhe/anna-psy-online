# Хостинг и DNS: muzhskoy-psikholog.ru

**Актуальная схема (с 2026-08-07): GitHub Pages + DNS в Cloudflare (серое облако).**

Cloudflare Pages больше не используем для этого домена: у части РФ‑провайдеров (МегаФон и др.) соединения к Cloudflare рвутся (`ERR_CONNECTION_RESET`), из‑за этого сайт «висел» или открывался без CSS.

---

## Что должно быть в Cloudflare → DNS

Все записи для сайта — **DNS only** (серое облако, не оранжевое!).

| Тип | Имя | Содержимое | Proxy |
|-----|-----|------------|-------|
| A | `@` | `185.199.108.153` | DNS only |
| A | `@` | `185.199.109.153` | DNS only |
| A | `@` | `185.199.110.153` | DNS only |
| A | `@` | `185.199.111.153` | DNS only |
| AAAA | `@` | `2606:50c0:8000::153` | DNS only |
| AAAA | `@` | `2606:50c0:8001::153` | DNS only |
| AAAA | `@` | `2606:50c0:8002::153` | DNS only |
| AAAA | `@` | `2606:50c0:8003::153` | DNS only |
| CNAME | `www` | `annashhe.github.io` | DNS only |

**Удалить**, если остались:

- CNAME `@` → `muzhskoy-psikholog-ru.pages.dev` (или любой `*.pages.dev`)
- CNAME `www` → `*.pages.dev`
- любые A/AAAA на IP Cloudflare (`104.21.*`, `172.67.*`, `188.114.*`) для `@` / `www`

NS домена могут оставаться у Cloudflare (`*.ns.cloudflare.com`) — это нормально: Cloudflare только как DNS, сайт отдаёт GitHub.

---

## Что сделать в Cloudflare → Pages

1. Workers & Pages → проект `muzhskoy-psikholog-ru`
2. Custom domains → **удалить** `muzhskoy-psikholog.ru` и `www.muzhskoy-psikholog.ru`
3. Сам проект можно не удалять (просто не использовать)

---

## Что сделать в GitHub

1. Репозиторий `annashhe/muzhskoy-psikholog-ru` → **Settings → Pages**
2. **Build and deployment → Source:** GitHub Actions  
   (не «Deploy from a branch»)
3. **Custom domain:** `muzhskoy-psikholog.ru` → Save
4. Дождаться галочки DNS check / сертификата, включить **Enforce HTTPS**
5. **Actions** → workflow **Deploy to GitHub Pages** → убедиться, что последний run зелёный
6. Секрет `CLOUDFLARE_API_TOKEN` для деплоя сайта больше не нужен (можно оставить — не мешает)

Файл `CNAME` в корне репо уже содержит `muzhskoy-psikholog.ru`.

---

## После смены DNS у себя на компьютере

1. `ipconfig /flushdns` в PowerShell (от администратора не обязательно)
2. Инкогнито без VPN (или с VPN — оба должны открываться)
3. Проверки:
   - https://muzhskoy-psikholog.ru/
   - https://muzhskoy-psikholog.ru/vopros-psikhologu/
   - https://muzhskoy-psikholog.ru/assets/site.css?v=20260807f
4. На https://www.whatsmydns.net/#A/muzhskoy-psikholog.ru — везде `185.199.*`, без `104.21.*`

В исходном коде страницы (Ctrl+U) должно быть `site.css?v=20260807f`, анкета с `data-quiz-step`.

---

## Деплой после возврата

Push в `main` → Actions **Deploy to GitHub Pages** → сайт обновляется.

Ручной wrangler / `deploy-cloudflare-pages.ps1` для этого домена **не использовать**.

Формы по-прежнему могут ходить в Cloudflare Worker `psi-leads` (это отдельно от хостинга HTML).

---

## Если снова 404 «There isn't a GitHub Pages site here»

1. Actions: дождаться успешного Deploy
2. Pages: Source = GitHub Actions, domain привязан
3. DNS: только GitHub IP, серое облако
4. Подождать 5–30 минут на DNS / HTTPS
