/**
 * Cookie-уведомление и выбор категорий (как на мужском сайте).
 * Статистика по умолчанию до явного отказа; отказ останавливает сбор и очищает cookie аналитики.
 */
(function (global) {
  var STORAGE_KEY = 'psiCookiePrefs';
  var BANNER_KEY = 'psiCookieBannerShown';
  var PRIVACY_HREF = '/privacy/';

  function readPrefs() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function writePrefs(prefs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {}
  }

  global.psiGetCookiePrefs = function () {
    return readPrefs();
  };

  global.psiHasAnalyticsConsent = function () {
    var p = readPrefs();
    if (!p) return true;
    return p.analytics !== false;
  };

  function notifyAnalyticsGate() {
    var allowed = global.psiHasAnalyticsConsent();
    if (typeof global.psiOnAnalyticsConsentChange === 'function') {
      global.psiOnAnalyticsConsentChange(allowed);
    }
    if (allowed) {
      try {
        global.__psiAnalyticsDisabled = false;
      } catch (e) {}
      if (typeof global.psiLoadAnalytics === 'function') {
        global.psiLoadAnalytics();
      }
    } else if (typeof global.psiStopAnalytics === 'function') {
      global.psiStopAnalytics();
    }
  }

  function savePrefs(analytics, source) {
    writePrefs({
      analytics: !!analytics,
      essential: true,
      updated: new Date().toISOString(),
      source: source || 'banner',
    });
    notifyAnalyticsGate();
  }

  function bannerShownThisVisit() {
    try {
      return sessionStorage.getItem(BANNER_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function markBannerShownThisVisit() {
    try {
      sessionStorage.setItem(BANNER_KEY, '1');
    } catch (e) {}
  }

  function hideBannerEl() {
    var el = document.getElementById('psiCookieNotice');
    if (el) {
      el.classList.remove('open');
      el.setAttribute('hidden', 'hidden');
    }
  }

  function ensureStyles() {
    if (document.getElementById('psi-cookie-notice-style')) return;
    var style = document.createElement('style');
    style.id = 'psi-cookie-notice-style';
    style.textContent =
      '.psi-cookie-notice{position:fixed;left:16px;right:16px;bottom:16px;z-index:1200;max-width:560px;margin:0 auto;background:#fff;border:1px solid #eae7ea;border-radius:12px;box-shadow:0 12px 40px rgba(26,26,26,.12);padding:1rem 1.2rem;display:none;align-items:flex-start;gap:1rem;flex-wrap:wrap;font-family:Manrope,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color-scheme:light}' +
      '.psi-cookie-notice.open{display:flex}' +
      '.psi-cookie-notice p{flex:1 1 240px;margin:0;font-size:.85rem;color:#3d3d3d;line-height:1.5}' +
      '.psi-cookie-notice a.psi-cookie-settings-link,.psi-cookie-notice a.psi-cookie-policy-link{color:#5c2238;font-weight:inherit;text-decoration:none}' +
      '.psi-cookie-notice a.psi-cookie-settings-link{cursor:pointer}' +
      '.psi-cookie-notice a.psi-cookie-settings-link:hover,.psi-cookie-notice a.psi-cookie-policy-link:hover{color:#802d4b;text-decoration:none}' +
      '.psi-cookie-notice-actions{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;flex-shrink:0}' +
      '.psi-cookie-notice .psi-cookie-ok{flex:0 0 auto;padding:.45rem 1.15rem;border-radius:8px;font-weight:600;font-size:.85rem;cursor:pointer;font-family:inherit;border:1px solid transparent;background:#802d4b;color:#fff;border-color:#802d4b}' +
      '.psi-cookie-modal-overlay{position:fixed;inset:0;z-index:1300;background:rgba(26,26,26,.45);display:none;align-items:center;justify-content:center;padding:16px}' +
      '.psi-cookie-modal-overlay.open{display:flex}' +
      '.psi-cookie-modal{background:#fff;border-radius:14px;max-width:440px;width:100%;padding:1.25rem 1.35rem;box-shadow:0 20px 50px rgba(26,26,26,.18);font-family:Manrope,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color-scheme:light}' +
      '.psi-cookie-modal h2{font-size:1.05rem;margin:0 0 .75rem;color:#1a1a1a}' +
      '.psi-cookie-modal p{font-size:.85rem;color:#3d3d3d;line-height:1.55;margin:0 0 1rem}' +
      '.psi-cookie-row{display:flex;gap:.75rem;align-items:flex-start;padding:.75rem 0;border-top:1px solid #eae7ea}' +
      '.psi-cookie-row:first-of-type{border-top:0}' +
      '.psi-cookie-row label{flex:1;font-size:.85rem;color:#3d3d3d;line-height:1.45;cursor:pointer}' +
      '.psi-cookie-row strong{display:block;color:#1a1a1a;margin-bottom:.2rem}' +
      '.psi-cookie-row input{margin-top:.2rem;accent-color:#802d4b}' +
      '.psi-cookie-modal-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem;justify-content:flex-end}' +
      '.psi-cookie-modal-actions button{padding:.5rem 1rem;border-radius:8px;font-weight:600;font-size:.85rem;cursor:pointer;font-family:inherit;border:1px solid #d8cfd3;background:#fff;color:#3d3d3d}' +
      '.psi-cookie-modal-actions .psi-cookie-save{background:#802d4b;color:#fff;border-color:#802d4b}' +
      '@media (max-width:700px){.psi-cookie-notice{bottom:calc(16px + env(safe-area-inset-bottom,0px))}}';
    document.head.appendChild(style);
  }

  var modalLastFocus = null;
  var modalKeyHandler = null;

  function lockBodyScroll(lock) {
    try {
      document.documentElement.style.overflow = lock ? 'hidden' : '';
      document.body.style.overflow = lock ? 'hidden' : '';
    } catch (e) {}
  }

  function getModalFocusables(overlay) {
    if (!overlay) return [];
    return Array.prototype.slice.call(
      overlay.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
  }

  function closeSettingsModal() {
    var overlay = document.getElementById('psiCookieModal');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('hidden', 'hidden');
    lockBodyScroll(false);
    if (modalKeyHandler) {
      document.removeEventListener('keydown', modalKeyHandler, true);
      modalKeyHandler = null;
    }
    if (modalLastFocus && typeof modalLastFocus.focus === 'function') {
      try {
        modalLastFocus.focus();
      } catch (e) {}
    }
    modalLastFocus = null;
  }

  function openSettingsModal() {
    ensureStyles();
    modalLastFocus = document.activeElement;
    var existing = document.getElementById('psiCookieModal');
    if (existing) {
      existing.classList.add('open');
      existing.removeAttribute('hidden');
      lockBodyScroll(true);
      bindModalA11y(existing);
      var focusables = getModalFocusables(existing);
      if (focusables[0]) focusables[0].focus();
      return;
    }
    var prefs = readPrefs();
    var analyticsOn = prefs ? !!prefs.analytics : true;

    var overlay = document.createElement('div');
    overlay.id = 'psiCookieModal';
    overlay.className = 'psi-cookie-modal-overlay open';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'psiCookieModalTitle');
    overlay.innerHTML =
      '<div class="psi-cookie-modal">' +
      '<h2 id="psiCookieModalTitle">Настройки cookie</h2>' +
      '<p>Выберите, что разрешить. Подробнее — в <a href="' +
      PRIVACY_HREF +
      '" target="_blank" rel="noopener">политике конфиденциальности</a>.</p>' +
      '<div class="psi-cookie-row">' +
      '<input type="checkbox" id="psiCookieEssential" checked disabled aria-disabled="true" />' +
      '<label for="psiCookieEssential"><strong>Необходимые</strong>Нужны для работы сайта (формы, запись). Отключить нельзя.</label>' +
      '</div>' +
      '<div class="psi-cookie-row">' +
      '<input type="checkbox" id="psiCookieAnalytics"' +
      (analyticsOn ? ' checked' : '') +
      ' />' +
      '<label for="psiCookieAnalytics"><strong>Статистика посещений</strong>Яндекс.Метрика — просмотры страниц и клики. Подробнее — в политике конфиденциальности.</label>' +
      '</div>' +
      '<div class="psi-cookie-modal-actions">' +
      '<button type="button" class="psi-cookie-reject-analytics">Только необходимые</button>' +
      '<button type="button" class="psi-cookie-save">Сохранить</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    lockBodyScroll(true);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeSettingsModal();
    });

    var analyticsEl = document.getElementById('psiCookieAnalytics');
    overlay.querySelector('.psi-cookie-save').addEventListener('click', function () {
      savePrefs(analyticsEl && analyticsEl.checked, 'settings');
      closeSettingsModal();
      hideBannerEl();
    });
    overlay.querySelector('.psi-cookie-reject-analytics').addEventListener('click', function () {
      if (analyticsEl) analyticsEl.checked = false;
      savePrefs(false, 'reject-analytics');
      closeSettingsModal();
      hideBannerEl();
    });

    bindModalA11y(overlay);
    var focusables = getModalFocusables(overlay);
    if (focusables[0]) focusables[0].focus();
  }

  function bindModalA11y(overlay) {
    if (modalKeyHandler) {
      document.removeEventListener('keydown', modalKeyHandler, true);
    }
    modalKeyHandler = function (e) {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSettingsModal();
        return;
      }
      if (e.key !== 'Tab') return;
      var focusables = getModalFocusables(overlay);
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', modalKeyHandler, true);
  }

  global.psiOpenCookieSettings = openSettingsModal;

  global.mountPsiCookieNotice = function () {
    notifyAnalyticsGate();

    var prefs = readPrefs();
    if (prefs) return;

    if (bannerShownThisVisit()) return;
    if (document.getElementById('psiCookieNotice')) return;

    ensureStyles();

    var el = document.createElement('div');
    el.id = 'psiCookieNotice';
    el.className = 'psi-cookie-notice open';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Уведомление о cookie');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<p>Мы используем cookie: необходимые — для работы сайта; сбор статистики можно <a href="#" class="psi-cookie-settings-link" role="button">настроить</a>. Подробнее — в <a href="' +
      PRIVACY_HREF +
      '" class="psi-cookie-policy-link" target="_blank" rel="noopener">политике конфиденциальности</a>.</p>' +
      '<div class="psi-cookie-notice-actions">' +
      '<button type="button" class="psi-cookie-ok" id="psiCookieNoticeOk">Ок</button>' +
      '</div>';

    document.body.appendChild(el);
    markBannerShownThisVisit();

    el.querySelector('.psi-cookie-settings-link').addEventListener('click', function (e) {
      e.preventDefault();
      openSettingsModal();
    });
    document.getElementById('psiCookieNoticeOk').addEventListener('click', function () {
      savePrefs(true, 'ok-all');
      hideBannerEl();
    });
  };

  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest && e.target.closest('.js-cookie-settings');
    if (!link) return;
    e.preventDefault();
    openSettingsModal();
  });

  // Show banner after LCP settles — early mount made the cookie text win LCP in PageSpeed.
  function scheduleCookieBanner() {
    notifyAnalyticsGate();
    var prefs = readPrefs();
    if (prefs) return;

    var show = function () {
      global.mountPsiCookieNotice();
    };
    var afterLoad = function () {
      if (typeof global.requestIdleCallback === 'function') {
        global.requestIdleCallback(show, { timeout: 4500 });
      } else {
        global.setTimeout(show, 2800);
      }
    };
    if (document.readyState === 'complete') {
      global.setTimeout(afterLoad, 1200);
    } else {
      global.addEventListener(
        'load',
        function () {
          global.setTimeout(afterLoad, 1200);
        },
        { once: true }
      );
    }
  }

  scheduleCookieBanner();
})(window);
