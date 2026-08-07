/**
 * Яндекс.Метрика с учётом согласия из cookie-notice.js.
 * По умолчанию статистика включена до явного отказа в настройках cookie.
 */
(function (global) {
  var METRIKA_ID = 99617923;
  var started = false;

  function loadMetrika() {
    if (global.__psiMetrikaLoaded) return;
    global.__psiMetrikaLoaded = true;
    (function (m, e, t, r, i, k, a) {
      m[i] =
        m[i] ||
        function () {
          (m[i].a = m[i].a || []).push(arguments);
        };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) return;
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=' + METRIKA_ID, 'ym');

    global.ym(METRIKA_ID, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
      trackHash: false,
      triggerEvent: false,
    });
  }

  function deleteCookie(name, path, domain) {
    var expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = name + '=; expires=' + expires + '; path=' + (path || '/') + ';';
    if (domain) {
      document.cookie = name + '=; expires=' + expires + '; path=' + (path || '/') + '; domain=' + domain + ';';
    }
  }

  function clearAnalyticsCookies() {
    var host = global.location && global.location.hostname;
    var parts = host ? host.split('.') : [];
    var domains = [''];
    if (host) {
      domains.push(host);
      if (parts.length > 1) domains.push('.' + parts.slice(-2).join('.'));
    }
    var raw = document.cookie ? document.cookie.split(';') : [];
    var names = [];
    for (var i = 0; i < raw.length; i++) {
      var pair = raw[i].trim().split('=');
      var n = pair[0];
      if (/^(_ym|_ga|_gid|_gat)/.test(n)) names.push(n);
    }
    names.forEach(function (name) {
      domains.forEach(function (d) {
        deleteCookie(name, '/', d || undefined);
      });
    });
  }

  global.psiLoadAnalytics = function () {
    if (global.__psiAnalyticsDisabled) return;
    if (started) return;
    if (typeof global.psiHasAnalyticsConsent === 'function' && !global.psiHasAnalyticsConsent()) {
      return;
    }
    started = true;
    loadMetrika();
  };

  global.psiStopAnalytics = function () {
    global.__psiAnalyticsDisabled = true;
    started = false;
    clearAnalyticsCookies();
  };

  function tryLoadIfAllowed() {
    if (typeof global.psiHasAnalyticsConsent === 'function' && !global.psiHasAnalyticsConsent()) {
      return;
    }
    var run = function () {
      global.psiLoadAnalytics();
    };
    var schedule = function () {
      if (typeof global.requestIdleCallback === 'function') {
        global.requestIdleCallback(run, { timeout: 3500 });
      } else {
        global.setTimeout(run, 2000);
      }
    };
    if (document.readyState === 'complete') {
      schedule();
    } else {
      global.addEventListener('load', schedule, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryLoadIfAllowed);
  } else {
    tryLoadIfAllowed();
  }
})(window);
