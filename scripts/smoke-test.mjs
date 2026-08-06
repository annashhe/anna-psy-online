/**
 * Smoke checks for https://muzhskoy-psikholog.ru/ (test stand).
 * Usage: node scripts/smoke-test.mjs
 * Optional: SMOKE_BASE=https://muzhskoy-psikholog.ru node scripts/smoke-test.mjs
 */
const BASE = (process.env.SMOKE_BASE || 'https://muzhskoy-psikholog.ru').replace(/\/$/, '');
const ORIGIN = BASE;
const WIDGET = 'https://anna-backend.ru/widget.js';
const LEADS = 'https://psi-leads.anna-shhe-adwords.workers.dev';
const BOOKINGS = 'https://anna-backend.ru/public/bookings';

const pages = [
  '/',
  '/about/',
  '/privacy/',
  '/oferta/',
  '/thank-you-booking/',
  '/thank-you-callback/',
  '/psikholog-v-kaliningrade/',
  '/it/',
  '/parting/',
  '/bloggers/',
  '/group2026/',
  '/vopros-psikhologu/',
  '/blog/',
  '/family/',
  '/psycholog-dlya-muzhchin/',
  '/semeynyy-psikholog-kaliningrad/',
];

const assets = [
  '/assets/site.css',
  '/assets/site.js',
  '/assets/group2026.css',
  '/robots.txt',
  '/favicon.ico',
];

const fails = [];
const warns = [];

function ok(label) {
  console.log(`  ✓ ${label}`);
}

function fail(label, detail) {
  fails.push(`${label}: ${detail}`);
  console.log(`  ✗ ${label} — ${detail}`);
}

function warn(label, detail) {
  warns.push(`${label}: ${detail}`);
  console.log(`  ! ${label} — ${detail}`);
}

async function fetchText(url, init = {}) {
  const res = await fetch(url, {
    redirect: 'manual',
    ...init,
    headers: {
      'User-Agent': 'muzhskoy-smoke/1.0',
      ...(init.headers || {}),
    },
  });
  const text = await res.text().catch(() => '');
  return { res, text };
}

async function checkPage(path) {
  const url = BASE + path;
  const { res, text } = await fetchText(url);
  if (res.status !== 200) {
    fail(path, `HTTP ${res.status}`);
    return;
  }
  if (!/charset=utf-8/i.test(res.headers.get('content-type') || '') && !text.includes('charset="UTF-8"')) {
    warn(path, 'content-type without utf-8');
  }
  const noindex = /noindex/i.test(text) || path.startsWith('/thank-you');
  if (!noindex && path !== '/robots.txt') {
    // thank-you always noindex; others should have meta or rely on robots.txt
    if (!/<meta[^>]+robots[^>]+noindex/i.test(text)) {
      warn(path, 'no meta noindex (robots.txt still Disallow: /)');
    }
  }
  if (path === '/group2026/') {
    if (!text.includes('group2026.css')) fail(path, 'missing group2026.css');
    else if (text.includes('class="group-page"')) fail(path, 'old group-page body still present');
    else if (!text.includes('badge-start') && !text.includes('hero-image')) fail(path, 'etalon hero markers missing');
    else ok(`${path} (etalon layout)`);
  } else if (path === '/') {
    if (!text.includes('banner-test')) warn(path, 'test banner missing');
    if (!text.includes('data-anna-psy-widget')) fail(path, 'widget host missing');
    else ok(`${path} (widget host)`);
  } else {
    ok(path);
  }
}

async function checkAsset(path) {
  const { res } = await fetchText(BASE + path);
  if (res.status !== 200) fail(path, `HTTP ${res.status}`);
  else ok(path);
}

async function checkRobots() {
  const { res, text } = await fetchText(BASE + '/robots.txt');
  if (res.status !== 200) {
    fail('robots.txt', `HTTP ${res.status}`);
    return;
  }
  if (!/Disallow:\s*\//i.test(text)) fail('robots.txt', 'missing Disallow: /');
  else ok('robots.txt Disallow: /');
}

async function checkWidget() {
  const { res, text } = await fetchText(WIDGET);
  if (res.status !== 200) fail('widget.js', `HTTP ${res.status}`);
  else if (text.length < 500) fail('widget.js', 'suspiciously short');
  else ok(`widget.js (${text.length} bytes)`);
}

async function checkCors(name, url, method = 'OPTIONS') {
  const { res } = await fetchText(url, {
    method,
    headers: {
      Origin: ORIGIN,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
  const allowOrigin = res.headers.get('access-control-allow-origin') || '';
  const okOrigin =
    allowOrigin === '*' ||
    allowOrigin === ORIGIN ||
    allowOrigin.includes('muzhskoy-psikholog.ru');
  if (res.status >= 400 && res.status !== 204) {
    // Some endpoints answer 200/204 on OPTIONS
    warn(name, `OPTIONS HTTP ${res.status}, ACAO=${allowOrigin || '(none)'}`);
  } else if (!okOrigin && method === 'OPTIONS') {
    // Try a lightweight POST probe for leads CORS (expect 4xx validation, not CORS block)
    warn(name, `OPTIONS ACAO=${allowOrigin || '(none)'} — will probe POST`);
  } else {
    ok(`${name} CORS (${allowOrigin || res.status})`);
  }
}

async function checkLeadsEndpoint() {
  // Invalid payload should not create a lead; we only care that API is reachable + CORS.
  const { res, text } = await fetchText(LEADS, {
    method: 'POST',
    headers: {
      Origin: ORIGIN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ smoke: true }),
  });
  const acao = res.headers.get('access-control-allow-origin') || '';
  const corsOk = acao === '*' || acao === ORIGIN || acao.includes('muzhskoy-psikholog.ru');
  if (!corsOk) fail('psi-leads CORS', `ACAO=${acao || '(none)'}`);
  else ok(`psi-leads CORS (${acao})`);
  if (res.status === 0) fail('psi-leads', 'network failure');
  else if (res.status >= 500) fail('psi-leads', `HTTP ${res.status} ${text.slice(0, 120)}`);
  else ok(`psi-leads reachable (HTTP ${res.status})`);
}

async function checkBookingsProbe() {
  const { res } = await fetchText(BOOKINGS, {
    method: 'OPTIONS',
    headers: {
      Origin: ORIGIN,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
  const acao = res.headers.get('access-control-allow-origin') || '';
  const corsOk = acao === '*' || acao === ORIGIN || acao.includes('muzhskoy-psikholog.ru');
  if (!corsOk) warn('bookings CORS', `ACAO=${acao || '(none)'} HTTP ${res.status}`);
  else ok(`bookings CORS (${acao || res.status})`);
}

async function main() {
  console.log(`Smoke base: ${BASE}\n`);
  console.log('Pages');
  for (const p of pages) await checkPage(p);
  console.log('\nAssets / robots');
  await checkRobots();
  for (const a of assets) await checkAsset(a);
  console.log('\nIntegrations');
  await checkWidget();
  await checkCors('psi-leads OPTIONS', LEADS);
  await checkLeadsEndpoint();
  await checkBookingsProbe();

  console.log('');
  if (warns.length) {
    console.log(`Warnings: ${warns.length}`);
    warns.forEach((w) => console.log(`  - ${w}`));
  }
  if (fails.length) {
    console.log(`FAILED: ${fails.length}`);
    fails.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
  console.log('All smoke checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
