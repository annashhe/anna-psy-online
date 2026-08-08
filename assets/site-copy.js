/**
 * Universal SiteCopy consumer for all Anna sites.
 *
 * Usage:
 *   <html data-cms-site="ОСНОВНОЙ"> … </html>
 *   <script src="/assets/site-copy.js?v=…" defer></script>
 *   or from niches: https://anna-psy.online/assets/site-copy.js
 *
 * Exposes window.__ANNA_SITE_COPY__ and fires "anna-site-copy" when ready.
 * Applies:
 *   - [data-cms-href], [data-cms-text], [data-cms-phone], [data-cms-amount]
 *   - price blocks [data-price-id]
 *   - projects [data-cms-project="da"|"yarche"]
 *   - known URL rewrites (t.me, wa.me, max.ru, b17, yandex profiles, da/yarche)
 *   - tel: links + visible phone text
 *   - JSON-LD telephone / sameAs / Offer.price
 */
(function () {
  var API = "https://anna-backend.ru/public/site-copy";
  var root = document.documentElement;
  var SITE =
    root.getAttribute("data-cms-site") ||
    (document.body && document.body.getAttribute("data-cms-site")) ||
    "ОСНОВНОЙ";

  var KEYS = [
    "contacts.phoneTel",
    "contacts.phoneDisplay",
    "messengers.telegram",
    "messengers.whatsapp",
    "messengers.max",
    "links.b17",
    "links.yandexMaps",
    "links.yandexServices",
    "links.yasno",
    "links.profi",
    "prices",
    "projects",
    "group2026.seatsBadge",
  ];

  var FALLBACK = {
    "contacts.phoneTel": "+79137556284",
    "contacts.phoneDisplay": "+7 913 755 6284",
    "messengers.telegram": "https://t.me/annashhe",
    "messengers.whatsapp": "https://wa.me/79137556284",
    "messengers.max":
      "https://max.ru/u/f9LHodD0cOKrHIa3XdZycCKQSXXx0dFf9Ck7hXPtx3Ti-6RSxFnoPC7d1Ag",
    "links.b17": "https://www.b17.ru/annams/",
    "links.yandexMaps": "https://yandex.ru/profile/119983917035",
    "links.yandexServices": "https://uslugi.yandex.ru/profile/AnnaShh-3119113",
  };

  function escHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function mergeItems(items) {
    var out = {};
    Object.keys(FALLBACK).forEach(function (k) {
      out[k] = FALLBACK[k];
    });
    if (items) {
      Object.keys(items).forEach(function (k) {
        if (items[k] != null && String(items[k]).trim() !== "") out[k] = items[k];
      });
    }
    return out;
  }

  function parseJson(raw, fallback) {
    if (!raw) return fallback;
    try {
      var data = JSON.parse(raw);
      return data;
    } catch (e) {
      return fallback;
    }
  }

  function noteToHtml(note) {
    var lines = String(note || "").split("\n");
    if (!lines.length) return "";
    var first = lines[0];
    var rest = lines.slice(1).join("<br />");
    if (/^✔\s*/.test(first)) {
      first = '<span class="price-check">✔</span> ' + escHtml(first.replace(/^✔\s*/, ""));
    } else {
      first = escHtml(first);
    }
    return first + (rest ? "<br />" + escHtml(rest) : "");
  }

  function digitsOnly(s) {
    return String(s || "").replace(/\D/g, "");
  }

  function applyAttrHrefs(items) {
    document.querySelectorAll("[data-cms-href]").forEach(function (el) {
      var key = el.getAttribute("data-cms-href");
      if (!key) return;
      var url = items[key];
      if (url && String(url).trim()) el.setAttribute("href", String(url).trim());
    });
  }

  function applyAttrText(items) {
    document.querySelectorAll("[data-cms-text]").forEach(function (el) {
      var key = el.getAttribute("data-cms-text");
      if (!key) return;
      var val = items[key];
      if (val != null && String(val).trim() !== "") el.textContent = String(val);
    });
  }

  function applyPhone(items) {
    var tel = items["contacts.phoneTel"] || FALLBACK["contacts.phoneTel"];
    var display = items["contacts.phoneDisplay"] || FALLBACK["contacts.phoneDisplay"];
    var telHref = "tel:" + String(tel).replace(/\s/g, "");

    document.querySelectorAll("[data-cms-phone]").forEach(function (el) {
      if (el.tagName === "A") {
        el.setAttribute("href", telHref);
        if (!el.getAttribute("data-cms-keep-label")) el.textContent = display;
      } else {
        el.textContent = display;
      }
    });

    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var d = digitsOnly(href);
      if (d === "79137556284" || d === "89137556284" || d.indexOf("9137556284") !== -1) {
        a.setAttribute("href", telHref);
        var txt = (a.textContent || "").trim();
        if (/^\+?7[\s-]?\(?913\)?[\s-]?755[\s-]?6284$/.test(txt) || txt === "+7 913 755 6284" || txt.indexOf("913") !== -1 && txt.indexOf("755") !== -1) {
          a.textContent = display;
        }
      }
    });
  }

  function rewriteUrl(href, fromPrefixes, toUrl) {
    if (!toUrl) return null;
    var h = String(href || "");
    for (var i = 0; i < fromPrefixes.length; i++) {
      if (h.indexOf(fromPrefixes[i]) === 0 || h === fromPrefixes[i]) return toUrl;
    }
    return null;
  }

  function applyKnownUrlRewrites(items) {
    var rules = [
      {
        prefixes: ["https://t.me/annashhe", "http://t.me/annashhe", "https://telegram.me/annashhe"],
        to: items["messengers.telegram"],
      },
      {
        prefixes: ["https://wa.me/79137556284", "https://api.whatsapp.com/send"],
        to: items["messengers.whatsapp"],
      },
      {
        prefixes: ["https://max.ru/u/"],
        to: items["messengers.max"],
        matchContains: "f9LHodD0cOKrHIa3XdZycCKQSXXx0dFf9Ck7hXPtx3Ti-6RSxFnoPC7d1Ag",
      },
      {
        prefixes: ["https://www.b17.ru/annams", "https://b17.ru/annams"],
        to: items["links.b17"],
      },
      {
        prefixes: ["https://yandex.ru/profile/119983917035"],
        to: items["links.yandexMaps"],
      },
      {
        prefixes: [
          "https://uslugi.yandex.ru/profile/AnnaShh-3119113",
          "https://uslugi.yandex.ru/search?action=addReview&profile=AnnaShh-3119113",
        ],
        to: items["links.yandexServices"],
        keepQuery: true,
      },
    ];

    document.querySelectorAll("a[href]").forEach(function (a) {
      if (a.hasAttribute("data-cms-href")) return;
      var href = a.getAttribute("href") || "";
      for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (rule.matchContains && href.indexOf(rule.matchContains) === -1) continue;
        var next = rewriteUrl(href, rule.prefixes, rule.to);
        if (next) {
          if (rule.keepQuery && href.indexOf("?") !== -1 && next.indexOf("?") === -1) {
            /* keep addReview URLs as-is if CMS only has profile root — still update profile id host */
            if (href.indexOf("addReview") !== -1) return;
          }
          a.setAttribute("href", next);
          return;
        }
      }
    });
  }

  function applyProjects(raw) {
    var list = parseJson(raw, null);
    if (!Array.isArray(list)) return;
    var byId = {};
    list.forEach(function (row) {
      if (row && row.id) byId[row.id] = row;
    });
    document.querySelectorAll("[data-cms-project]").forEach(function (el) {
      var id = el.getAttribute("data-cms-project");
      var row = byId[id];
      if (!row || !row.url) return;
      if (el.tagName === "A") el.setAttribute("href", row.url);
      else {
        var a = el.querySelector("a[href]");
        if (a) a.setAttribute("href", row.url);
      }
    });

    // rewrite known project URLs
    document.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href.indexOf("da-online.ru") !== -1 && byId.da && byId.da.url) {
        a.setAttribute("href", byId.da.url);
      }
      if (href.indexOf("yarchefest.ru") !== -1 && byId.yarche && byId.yarche.url) {
        a.setAttribute("href", byId.yarche.url);
      }
    });
  }

  function applyPrices(raw) {
    var list = parseJson(raw, null);
    if (!Array.isArray(list)) return;
    var byId = {};
    list.forEach(function (row) {
      if (row && row.id) byId[row.id] = row;
    });

    window.__ANNA_PRICES_BY_ID__ = byId;
    window.__ANNA_THERAPY_PRICES__ = {
      individual: (byId.individual50 && byId.individual50.amountLabel) || "4 500 ₽",
      individual_90: (byId.individual90 && byId.individual90.amountLabel) || "7 000 ₽",
      individual90: (byId.individual90 && byId.individual90.amountLabel) || "7 000 ₽",
      family: (byId.family90 && byId.family90.amountLabel) || "7 000 ₽",
    };

    document.querySelectorAll("[data-price-id]").forEach(function (article) {
      var id = article.getAttribute("data-price-id");
      var row = byId[id];
      if (!row) return;
      var titleEl = article.querySelector(".price-line-title, [data-price-title], h3");
      var amountEl = article.querySelector("[data-price-amount]");
      var noteEl = article.querySelector("[data-price-note]");
      var packageEl = article.querySelector("[data-price-package]");
      var hrefEl = article.querySelector("[data-price-title-href]");

      if (titleEl && row.title && !hrefEl && titleEl.tagName !== "H3") {
        if (id === "package5") titleEl.innerHTML = "<em>" + escHtml(row.title) + "</em>";
        else titleEl.textContent = row.title;
      }
      if (hrefEl && row.title) {
        hrefEl.textContent = row.title;
        if (row.titleHref) hrefEl.setAttribute("href", row.titleHref);
      }
      if (amountEl && row.amountLabel) {
        // Niche cards often use "4 500 <small>₽</small>"
        if (amountEl.querySelector("small")) {
          var num = String(row.amountLabel).replace(/\s*₽\s*$/, "").trim();
          amountEl.innerHTML = escHtml(num) + " <small>₽</small>";
        } else {
          amountEl.textContent = row.amountLabel;
        }
      }
      if (noteEl && row.durationNote) noteEl.innerHTML = noteToHtml(row.durationNote);
      if (packageEl && row.packageHtml) packageEl.innerHTML = "<em>" + row.packageHtml + "</em>";
    });

    document.querySelectorAll("[data-cms-amount]").forEach(function (el) {
      var id = el.getAttribute("data-cms-amount");
      var row = byId[id];
      if (row && row.amountLabel) el.textContent = row.amountLabel;
    });

    document.querySelectorAll("[data-cms-oferta-prices]").forEach(function (box) {
      var html = box.innerHTML;
      if (byId.individual50 && byId.individual50.amountLabel) {
        html = html.replace(/4\s*500\s*₽/g, byId.individual50.amountLabel);
        html = html.replace(/4\s*500\s*руб/gi, byId.individual50.amountLabel.replace("₽", "руб"));
      }
      if (byId.individual90 && byId.individual90.amountLabel) {
        html = html.replace(/7\s*000\s*₽/g, byId.individual90.amountLabel);
        html = html.replace(/7\s*000\s*руб/gi, byId.individual90.amountLabel.replace("₽", "руб"));
      }
      box.innerHTML = html;
    });
  }

  function walkJsonLd(node, items, pricesById) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(function (n) {
        walkJsonLd(n, items, pricesById);
      });
      return;
    }
    if (typeof node.telephone === "string") {
      node.telephone = items["contacts.phoneTel"] || node.telephone;
    }
    if (Array.isArray(node.sameAs)) {
      node.sameAs = node.sameAs.map(function (u) {
        var s = String(u);
        if (s.indexOf("t.me/") !== -1) return items["messengers.telegram"] || s;
        if (s.indexOf("b17.ru") !== -1) return items["links.b17"] || s;
        if (s.indexOf("da-online") !== -1) return s;
        if (s.indexOf("yarchefest") !== -1) return s;
        if (s.indexOf("yandex.ru/profile") !== -1) return items["links.yandexMaps"] || s;
        return s;
      });
    }
    if (node["@type"] === "Offer" || node["@type"] === "AggregateOffer") {
      if (pricesById.individual50 && pricesById.individual50.amountLabel) {
        var n50 = digitsOnly(pricesById.individual50.amountLabel);
        var n90 = digitsOnly(
          (pricesById.individual90 && pricesById.individual90.amountLabel) ||
            (pricesById.family90 && pricesById.family90.amountLabel) ||
            ""
        );
        if (node.price != null) {
          var p = String(node.price);
          if (p === "4500" || p === "4 500") node.price = n50;
          if (p === "7000" || p === "7 000") node.price = n90 || p;
        }
        if (node.lowPrice) node.lowPrice = n50;
        if (node.highPrice && n90) node.highPrice = n90;
        if (node.priceRange) node.priceRange = n50 + "-" + (n90 || node.priceRange);
      }
    }
    Object.keys(node).forEach(function (k) {
      if (k === "@context") return;
      walkJsonLd(node[k], items, pricesById);
    });
  }

  function applyJsonLd(items) {
    var pricesById = window.__ANNA_PRICES_BY_ID__ || {};
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (script) {
      try {
        var data = JSON.parse(script.textContent || "null");
        if (!data) return;
        walkJsonLd(data, items, pricesById);
        script.textContent = JSON.stringify(data);
      } catch (e) {
        /* ignore malformed */
      }
    });
  }

  function applySeats(items) {
    var val = items["group2026.seatsBadge"];
    if (!val) return;
    document.querySelectorAll("#group2026-seats-badge, [data-cms-seats]").forEach(function (el) {
      el.textContent = val;
    });
  }

  function applyAll(rawItems) {
    var items = mergeItems(rawItems);
    window.__ANNA_SITE_COPY__ = items;
    applyAttrHrefs(items);
    applyAttrText(items);
    applyPhone(items);
    applyKnownUrlRewrites(items);
    applyPrices(items.prices);
    applyProjects(items.projects);
    applySeats(items);
    applyJsonLd(items);
    try {
      window.dispatchEvent(new CustomEvent("anna-site-copy", { detail: items }));
    } catch (e) {
      /* IE ignore */
    }
  }

  var url =
    API +
    "?site=" +
    encodeURIComponent(SITE) +
    "&keys=" +
    encodeURIComponent(KEYS.join(","));

  fetch(url, { credentials: "omit" })
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (data) {
      applyAll(data && data.items ? data.items : null);
    })
    .catch(function () {
      applyAll(null);
    });
})();
