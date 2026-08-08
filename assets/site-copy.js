/**
 * Live site copy from anna-backend SiteCopy CMS.
 * Fallback = HTML already on the page (no flash / no blank if API fails).
 */
(function () {
  var API = "https://anna-backend.ru/public/site-copy";
  var SITE = "ОСНОВНОЙ";
  var KEYS = [
    "prices",
    "messengers.telegram",
    "messengers.whatsapp",
    "messengers.max",
    "links.b17",
    "links.yandexMaps",
    "links.yandexServices",
    "links.yasno",
    "links.profi",
  ];

  function escHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
    return first + (rest ? "<br />" + escHtml(rest).replace(/\n/g, "<br />") : "");
  }

  function applyHrefs(items) {
    document.querySelectorAll("[data-cms-href]").forEach(function (el) {
      var key = el.getAttribute("data-cms-href");
      if (!key) return;
      var url = items[key];
      if (url && String(url).trim()) el.setAttribute("href", String(url).trim());
    });
  }

  function applyPrices(raw) {
    var list;
    try {
      list = JSON.parse(raw);
    } catch (e) {
      return;
    }
    if (!Array.isArray(list)) return;
    var byId = {};
    list.forEach(function (row) {
      if (row && row.id) byId[row.id] = row;
    });
    document.querySelectorAll("[data-price-id]").forEach(function (article) {
      var id = article.getAttribute("data-price-id");
      var row = byId[id];
      if (!row) return;
      var titleEl = article.querySelector(".price-line-title");
      var amountEl = article.querySelector("[data-price-amount]");
      var noteEl = article.querySelector("[data-price-note]");
      var packageEl = article.querySelector("[data-price-package]");
      var hrefEl = article.querySelector("[data-price-title-href]");

      if (titleEl && row.title && !hrefEl) {
        if (id === "package5") {
          titleEl.innerHTML = "<em>" + escHtml(row.title) + "</em>";
        } else {
          titleEl.textContent = row.title;
        }
      }
      if (hrefEl && row.title) {
        hrefEl.textContent = row.title;
        if (row.titleHref) hrefEl.setAttribute("href", row.titleHref);
      }
      if (amountEl && row.amountLabel) amountEl.textContent = row.amountLabel;
      if (noteEl && row.durationNote) noteEl.innerHTML = noteToHtml(row.durationNote);
      if (packageEl && row.packageHtml) {
        packageEl.innerHTML = "<em>" + row.packageHtml + "</em>";
      }
    });
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
      if (!data || !data.items) return;
      applyHrefs(data.items);
      if (data.items.prices) applyPrices(data.items.prices);
    })
    .catch(function () {
      /* keep static HTML */
    });
})();
