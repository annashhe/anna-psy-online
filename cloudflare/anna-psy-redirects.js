/**
 * Real HTTP 301 redirects for anna-psy.online (GitHub Pages cannot emit 301).
 * Non-matching paths are proxied to the Pages origin unchanged.
 *
 * Deploy: see CLOUDFLARE-301.md
 */
const REDIRECTS = {
  // B — niches → .рф
  '/family': 'https://психолог-семейный-онлайн.рф/',
  '/family/': 'https://психолог-семейный-онлайн.рф/',
  '/family.html': 'https://психолог-семейный-онлайн.рф/',
  '/psycholog-dlya-muzhchin': 'https://психолог-для-мужчин.рф/',
  '/psycholog-dlya-muzhchin/': 'https://психолог-для-мужчин.рф/',
  '/psycholog-dlya-muzhchin.html': 'https://психолог-для-мужчин.рф/',
  '/semeynyy-psikholog-kaliningrad': 'https://психолог-семейный-онлайн.рф/kaliningrad/',
  '/semeynyy-psikholog-kaliningrad/': 'https://психолог-семейный-онлайн.рф/kaliningrad/',
  '/semeynyy-psikholog-kaliningrad.html': 'https://психолог-семейный-онлайн.рф/kaliningrad/',

  // C — blog → male .рф
  '/blog/breakup/kak_zabyt_cheloveka': 'https://психолог-для-мужчин.рф/blog/kak-zabyt-cheloveka/',
  '/blog/breakup/kak_zabyt_cheloveka/': 'https://психолог-для-мужчин.рф/blog/kak-zabyt-cheloveka/',
  '/blog/breakup/kak_zabyt_cheloveka.html': 'https://психолог-для-мужчин.рф/blog/kak-zabyt-cheloveka/',
  '/blog/self-knowledge/v_chem_smysl_zhizni': 'https://психолог-для-мужчин.рф/blog/v-chem-smysl-zhizni/',
  '/blog/self-knowledge/v_chem_smysl_zhizni/': 'https://психолог-для-мужчин.рф/blog/v-chem-smysl-zhizni/',
  '/blog/self-knowledge/v_chem_smysl_zhizni.html': 'https://психолог-для-мужчин.рф/blog/v-chem-smysl-zhizni/',
  '/blog/v_chem_smysl_zhizni': 'https://психолог-для-мужчин.рф/blog/v-chem-smysl-zhizni/',
  '/blog/v_chem_smysl_zhizni/': 'https://психолог-для-мужчин.рф/blog/v-chem-smysl-zhizni/',
  '/blog/v_chem_smysl_zhizni.html': 'https://психолог-для-мужчин.рф/blog/v-chem-smysl-zhizni/',

  // A12 — old thank-you
  '/thankyoupage': 'https://anna-psy.online/thank-you-booking/',
  '/thankyoupage/': 'https://anna-psy.online/thank-you-booking/',
  '/thankyoupage.html': 'https://anna-psy.online/thank-you-booking/',
};

/** Slash helpers: /about → /about/ (only known content folders) */
const SLASH_FOLDERS = [
  '/about',
  '/privacy',
  '/oferta',
  '/blog',
  '/it',
  '/parting',
  '/bloggers',
  '/group2026',
  '/vopros-psikhologu',
  '/psikholog-v-kaliningrade',
  '/thank-you-booking',
  '/thank-you-callback',
];

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // D3 — канон без www
    if (url.hostname === 'www.anna-psy.online') {
      url.hostname = 'anna-psy.online';
      return Response.redirect(url.toString(), 301);
    }

    const path = url.pathname;

    const mapped = REDIRECTS[path];
    if (mapped) {
      return Response.redirect(mapped, 301);
    }

    if (!path.endsWith('/') && SLASH_FOLDERS.includes(path)) {
      url.pathname = path + '/';
      return Response.redirect(url.toString(), 301);
    }

    if (
      !path.endsWith('/') &&
      !/\.[a-z0-9]+$/i.test(path) &&
      path.startsWith('/blog/') &&
      path.split('/').filter(Boolean).length >= 2
    ) {
      url.pathname = path + '/';
      return Response.redirect(url.toString(), 301);
    }

    // Pass through to GitHub Pages origin (orange-cloud DNS → this Worker → origin).
    return fetch(request);
  },
};
