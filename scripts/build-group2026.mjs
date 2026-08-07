import fs from 'fs';
import path from 'path';

const css = fs.readFileSync('local/group-etalon.css', 'utf8');
let body = fs.readFileSync('local/group-etalon-body.html', 'utf8');

// Fix about links to trailing slash
body = body.replaceAll('href="/about"', 'href="/about/"');

const bannerCss = ``;

const mobileHeroCss = `
/* Mobile: photo first, ≤ half viewport; centered button labels */
@media (max-width: 992px) {
  .hero-image { order: -1; max-height: 45vh; }
  .hero-image img {
    max-width: min(280px, 100%);
    max-height: 45vh;
    width: auto;
    height: auto;
    object-fit: cover;
    margin: 0 auto;
  }
}
@media (max-width: 640px) {
  .hero-image img {
    max-width: min(220px, 100%);
    max-height: 42vh;
  }
}
.btn, a.btn, button.btn {
  text-align: center !important;
  justify-content: center !important;
  border-radius: 60px !important;
  max-width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  white-space: normal !important;
}
@media (max-width: 640px) {
  .btn, a.btn, button.btn,
  .hero-buttons-bottom .btn,
  .cta-buttons .btn {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    padding-left: 1.25rem !important;
    padding-right: 1.25rem !important;
  }
}
`;

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
  <title>Терапевтическая группа «Здоровые отношения» онлайн | Анна Щеголихина</title>
  <meta name="description" content="Групповая терапия онлайн для тех, кто устал от неудачных знакомств. Научитесь строить тёплые, устойчивые отношения. 12–16 встреч, старт 5 сентября 2026." />
  <link rel="canonical" href="https://anna-psy.online/group2026/" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://static.tildacdn.com" />
  <link rel="preload" as="image" href="https://static.tildacdn.com/tild6361-3465-4932-a539-643662633539/1211_26775___3.webp" fetchpriority="high" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="stylesheet" href="/assets/group2026.css?v=20260806f" />
  <script>
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) return; }
      k = e.createElement(t); a = e.getElementsByTagName(t)[0];
      k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    ym(99617923, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
  </script>
</head>
<body>
${body}
</body>
</html>
`;

fs.writeFileSync('assets/group2026.css', bannerCss + '\n' + css + '\n' + mobileHeroCss);
fs.writeFileSync('group2026/index.html', html);
console.log('wrote group2026/index.html', html.length);
console.log('wrote assets/group2026.css', bannerCss.length + css.length);
