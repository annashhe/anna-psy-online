(function () {
  'use strict';

  window.PSI_SITE_HOME = 'https://muzhskoy-psikholog.ru';
  window.PSI_LEADS_API = 'https://psi-leads.anna-shhe-adwords.workers.dev';

  function phoneDigits(value) {
    return String(value || '').replace(/\D/g, '').replace(/^8/, '7').slice(0, 11);
  }

  function formatPhone(value) {
    var digits = phoneDigits(value);
    if (!digits) return '';
    if (digits.charAt(0) !== '7') digits = '7' + digits;
    var out = '+7';
    if (digits.length > 1) out += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) out += ') ' + digits.slice(4, 7);
    if (digits.length >= 7) out += '-' + digits.slice(7, 9);
    if (digits.length >= 9) out += '-' + digits.slice(9, 11);
    return out;
  }

  function setError(el, on) {
    if (!el) return;
    el.classList.toggle('is-error', !!on);
  }

  function bindPhoneMask(phone) {
    if (!phone) return;
    phone.addEventListener('input', function () {
      phone.value = formatPhone(phone.value);
      setError(phone, false);
    });
    phone.addEventListener('focus', function () {
      if (!phone.value) phone.value = '+7';
    });
  }

  function postLead(payload, submit) {
    if (submit) submit.disabled = true;
    return fetch(window.PSI_LEADS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('lead_failed');
        try {
          sessionStorage.setItem(
            'callbackThankYou',
            JSON.stringify({
              name: payload.name || '',
              phone: payload.phone || '',
              contactMethods: payload.contactMethods || [],
              comment: payload.comment || '',
              source: payload.source || 'callback'
            })
          );
        } catch (e) {}
        window.location.href = '/thank-you-callback/';
      })
      .catch(function () {
        if (submit) submit.disabled = false;
        alert('Заявку не удалось отправить. Напишите в Telegram @annashhe или на WhatsApp +7 913 755 62 84.');
      });
  }

  function initCallbackForm() {
    var form = document.getElementById('callbackForm');
    if (!form) return;

    var name = form.querySelector('[name="name"]');
    var phone = form.querySelector('[name="phone"]');
    var comment = form.querySelector('[name="comment"]');
    var consent = form.querySelector('[name="consent"]');
    var website = form.querySelector('[name="website"]');
    var contacts = form.querySelectorAll('[name="contactMethods"]');
    var contactBox = form.querySelector('[data-contact-methods]');

    bindPhoneMask(phone);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var selected = Array.prototype.filter.call(contacts, function (c) {
        return c.checked;
      }).map(function (c) {
        return c.value;
      });

      var badName = !name || !name.value.trim();
      var badPhone = !phone || phoneDigits(phone.value).length !== 11;
      var badContacts = !selected.length;
      var badConsent = !consent || !consent.checked;

      setError(name, badName);
      setError(phone, badPhone);
      setError(contactBox, badContacts);
      setError(consent && consent.parentElement, badConsent);
      if (badName || badPhone || badContacts || badConsent) return;

      postLead(
        {
          source: 'callback',
          name: name.value.trim(),
          phone: phoneDigits(phone.value),
          contactMethods: selected,
          comment: comment ? comment.value.trim() : '',
          website: website ? website.value.trim() : '',
          pageUrl: window.location.href,
          site: 'muzhskoy-psikholog.ru'
        },
        form.querySelector('[type="submit"]')
      );
    });
  }

  function initVoprosForm() {
    var form = document.getElementById('voprosForm');
    if (!form) return;

    var name = form.querySelector('[name="name"]');
    var phone = form.querySelector('[name="phone"]');
    var comment = form.querySelector('[name="comment"]');
    var consent = form.querySelector('[name="consent"]');
    var website = form.querySelector('[name="website"]');
    var role = form.querySelector('[name="role"]');
    var question = form.querySelector('[name="question"]');
    var contacts = form.querySelectorAll('[name="contactMethods"]');
    var contactBox = form.querySelector('[data-contact-methods]');

    bindPhoneMask(phone);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var selected = Array.prototype.filter.call(contacts, function (c) {
        return c.checked;
      }).map(function (c) {
        return c.value;
      });

      var badName = !name || !name.value.trim();
      var badPhone = !phone || phoneDigits(phone.value).length !== 11;
      var badContacts = !selected.length;
      var badConsent = !consent || !consent.checked;

      setError(name, badName);
      setError(phone, badPhone);
      setError(contactBox, badContacts);
      setError(consent && consent.parentElement, badConsent);
      if (badName || badPhone || badContacts || badConsent) return;

      var parts = [];
      if (role && role.value) parts.push('Роль: ' + role.value);
      if (question && question.value.trim()) parts.push('Вопрос: ' + question.value.trim());
      if (comment && comment.value.trim()) parts.push(comment.value.trim());

      postLead(
        {
          source: 'vopros-psikhologu',
          name: name.value.trim(),
          phone: phoneDigits(phone.value),
          contactMethods: selected,
          comment: parts.join('\n'),
          website: website ? website.value.trim() : '',
          pageUrl: window.location.href,
          site: 'muzhskoy-psikholog.ru'
        },
        form.querySelector('[type="submit"]')
      );
    });
  }

  function closeAllDropdowns(except) {
    document.querySelectorAll('.nav-item.is-open').forEach(function (item) {
      if (item === except) return;
      item.classList.remove('is-open');
      var toggle = item.querySelector('[data-dropdown-toggle]');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  function initMobileNav() {
    var btn = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('.site-header .nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) closeAllDropdowns();
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.matchMedia('(max-width: 860px)').matches) {
          nav.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
          closeAllDropdowns();
        }
      });
    });
  }

  function initHeaderHideOnScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var lastY = window.scrollY || 0;
    var ticking = false;
    var releaseTimer = null;

    function show() {
      header.classList.remove('header-hidden');
    }

    function hide() {
      // Keep open menus visible while interacting
      if (header.querySelector('.nav.is-open') || header.querySelector('.nav-item.is-open')) {
        show();
        return;
      }
      header.classList.add('header-hidden');
    }

    function update() {
      ticking = false;
      var y = window.scrollY || 0;
      var banner = document.querySelector('.banner-test');
      var bannerH = banner ? banner.offsetHeight : 0;

      header.classList.toggle('is-scrolled', y > 8);

      // Near top (incl. test banner): always show
      if (y <= Math.max(64, bannerH + 8)) {
        show();
        lastY = y;
        return;
      }

      if (header.querySelector('.nav.is-open') || header.querySelector('.nav-item.is-open')) {
        show();
        lastY = y;
        return;
      }

      var delta = y - lastY;
      if (delta > 4) hide();
      if (delta < -4) show();
      lastY = y;
    }

    function schedule() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('touchmove', schedule, { passive: true });
    window.addEventListener('wheel', schedule, { passive: true });
    window.addEventListener('resize', function () {
      show();
      lastY = window.scrollY || 0;
    });
    window.addEventListener(
      'touchend',
      function () {
        if (releaseTimer) clearTimeout(releaseTimer);
        releaseTimer = setTimeout(function () {
          if (header.querySelector('.nav.is-open') || header.querySelector('.nav-item.is-open')) return;
          show();
        }, 180);
      },
      { passive: true }
    );
    update();
  }

  function initNavDropdowns() {
    var items = document.querySelectorAll('.nav-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var toggle = item.querySelector('[data-dropdown-toggle]');
      if (!toggle) return;

      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var willOpen = !item.classList.contains('is-open');
        closeAllDropdowns(item);
        item.classList.toggle('is-open', willOpen);
        toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });

    document.addEventListener('click', function (event) {
      if (event.target.closest('.nav-item')) return;
      closeAllDropdowns();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeAllDropdowns();
    });
  }

  function loadBookingWidget() {
    if (window.__psiWidgetLoading) return;
    window.__psiWidgetLoading = true;
    var host = document.querySelector('[data-anna-psy-widget]');
    var root = document.getElementById('booking');
    if (!host || !root) return;

    var s = document.createElement('script');
    s.src = 'https://anna-backend.ru/widget.js';
    s.async = true;
    s.onerror = function () {
      host.innerHTML =
        '<div style="padding:1.25rem;border:1px solid rgba(28,26,23,.12);border-radius:12px;background:#fff;">' +
        '<p style="margin:0 0 .75rem;">Календарь временно недоступен. Запишитесь через мессенджеры или форму ниже.</p>' +
        '<p style="margin:0;"><a href="https://t.me/annashhe" target="_blank" rel="noopener">Telegram</a> · ' +
        '<a href="https://wa.me/79137556284" target="_blank" rel="noopener">WhatsApp</a> · ' +
        '<a href="#contact">Оставить заявку</a></p></div>';
    };
    root.appendChild(s);
  }

  function setupLazyWidget() {
    var root = document.getElementById('booking');
    if (!root || !document.querySelector('[data-anna-psy-widget]')) return;
    if (!('IntersectionObserver' in window)) {
      loadBookingWidget();
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            loadBookingWidget();
            io.disconnect();
          }
        });
      },
      { rootMargin: '200px 0px' }
    );
    io.observe(root);
  }

  function getLeadTrackingPayload() {
    var pageUrl = '';
    try {
      pageUrl = window.location.href;
    } catch (e0) {
      pageUrl = (window.PSI_SITE_HOME || '').replace(/\/$/, '') || '';
    }
    var utm = {};
    try {
      utm = JSON.parse(
        sessionStorage.getItem('psiUtms') || localStorage.getItem('psiUtmsFirst') || '{}'
      );
    } catch (e2) {}
    return {
      pageUrl: pageUrl,
      utmSource: utm.utm_source || '',
      utmMedium: utm.utm_medium || '',
      utmCampaign: utm.utm_campaign || '',
      utmContent: utm.utm_content || '',
      utmTerm: utm.utm_term || ''
    };
  }

  function patchBookingThankYou() {
    if (!window.fetch) return;
    var original = window.fetch.bind(window);
    var started = false;
    var CONTACT = { telegram: 'Telegram', whatsapp: 'WhatsApp', max: 'MAX', sms: 'SMS' };
    var THERAPY = {
      individual: { title: 'Индивидуальная консультация', duration: '50 минут', price: '4 500 ₽' },
      individual90: { title: 'Индивидуальная консультация', duration: '90 минут', price: '7 000 ₽' },
      individual_90: { title: 'Индивидуальная консультация', duration: '90 минут', price: '7 000 ₽' },
      family: { title: 'Семейная (парная) консультация', duration: '90 минут', price: '7 000 ₽' }
    };
    var api = window.PSI_LEADS_API || 'https://psi-leads.anna-shhe-adwords.workers.dev';

    function resolveTherapy(payload) {
      var type = (payload && (payload.therapyType || payload.therapy)) || 'individual';
      if (type === 'individual_90') type = 'individual90';
      if (payload && payload.startIso && payload.endIso) {
        var mins = Math.round((new Date(payload.endIso) - new Date(payload.startIso)) / 60000);
        if (type === 'individual' && mins >= 80) type = 'individual90';
      }
      return { type: type, meta: THERAPY[type] || THERAPY.individual };
    }

    function formatContact(methods) {
      var list = (Array.isArray(methods) ? methods : [])
        .map(function (m) {
          var key = String(m || '').toLowerCase();
          return CONTACT[key] || String(m || '').trim();
        })
        .filter(Boolean);
      if (!list.length) return '';
      if (list.length === 1) return list[0];
      if (list.length === 2) return list[0] + ' или ' + list[1];
      return list.slice(0, -1).join(', ') + ' или ' + list[list.length - 1];
    }

    function formatWhen(startIso, endIso, tz) {
      if (!startIso) return '';
      try {
        var start = new Date(startIso);
        var end = endIso ? new Date(endIso) : null;
        var zone = tz || 'Europe/Kaliningrad';
        var datePart = start.toLocaleDateString('ru-RU', {
          timeZone: zone,
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        var t0 = start.toLocaleTimeString('ru-RU', {
          timeZone: zone,
          hour: '2-digit',
          minute: '2-digit'
        });
        if (!end) return datePart + ', ' + t0 + ' (' + zone + ')';
        var t1 = end.toLocaleTimeString('ru-RU', {
          timeZone: zone,
          hour: '2-digit',
          minute: '2-digit'
        });
        return datePart + ', ' + t0 + ' – ' + t1 + ' (' + zone + ')';
      } catch (e) {
        return startIso;
      }
    }

    function postBookingLead(body, attempt) {
      attempt = attempt || 0;
      return original(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body
      }).then(function (r) {
        if (!r.ok) throw new Error('lead status ' + r.status);
        return r;
      }).catch(function () {
        if (attempt < 2) {
          return new Promise(function (resolve) {
            setTimeout(resolve, 700 * (attempt + 1));
          }).then(function () {
            return postBookingLead(body, attempt + 1);
          });
        }
        throw new Error('lead_failed');
      });
    }

    function goThankYou(payload, therapy, endIso) {
      try {
        sessionStorage.setItem(
          'bookingThankYou',
          JSON.stringify({
            name: payload.name || '',
            phone: payload.phone || '',
            email: payload.email || '',
            therapyType: therapy.type,
            therapy: therapy.meta.title,
            duration: therapy.meta.duration,
            price: therapy.meta.price,
            contactMethods: Array.isArray(payload.contactMethods)
              ? payload.contactMethods.slice()
              : [],
            contact: formatContact(payload.contactMethods),
            startIso: payload.startIso || '',
            endIso: endIso || '',
            clientTimezone: payload.clientTimezone || '',
            datetime: formatWhen(payload.startIso, endIso, payload.clientTimezone),
            comment: payload.comment || ''
          })
        );
      } catch (e1) {}
      window.location.href = '/thank-you-booking/';
    }

    window.fetch = function () {
      var args = arguments;
      var url = String(args[0] || '');
      var init = args[1] || {};
      var isBooking =
        /\/public\/bookings\b/.test(url) &&
        String(init.method || 'GET').toUpperCase() === 'POST';
      return original.apply(window, args).then(function (res) {
        if (isBooking && res && res.ok && !started) {
          try {
            var payload = {};
            try {
              payload = init.body ? JSON.parse(init.body) : {};
            } catch (parseErr) {
              payload = {};
            }
            var therapy = resolveTherapy(payload);
            var endIso = payload.endIso;
            if (payload.startIso && !endIso) {
              var d = new Date(payload.startIso);
              d.setMinutes(d.getMinutes() + (therapy.meta.duration.indexOf('90') >= 0 ? 90 : 50));
              endIso = d.toISOString();
            }
            var contactMethods = Array.isArray(payload.contactMethods)
              ? payload.contactMethods.slice()
              : [];
            var tracking = getLeadTrackingPayload();
            var leadBody = JSON.stringify(
              Object.assign(
                {
                  source: 'booking',
                  name: payload.name,
                  phone: payload.phone,
                  therapyType: therapy.type,
                  contactMethods: contactMethods,
                  startIso: payload.startIso,
                  endIso: endIso,
                  clientTimezone: payload.clientTimezone,
                  comment: payload.comment || '',
                  website: ''
                },
                tracking
              )
            );
            started = true;
            postBookingLead(leadBody)
              .then(function () {
                goThankYou(payload, therapy, endIso);
              })
              .catch(function () {
                started = false;
                alert(
                  'Запись в календаре прошла, но уведомление мне не отправилось. Напишите в Telegram @annashhe или WhatsApp +7 913 755 62 84 — подтвердим слот.'
                );
                goThankYou(payload, therapy, endIso);
              });
          } catch (e) {
            started = false;
            try {
              window.location.href = '/thank-you-booking/';
            } catch (e2) {
              started = false;
            }
          }
        }
        return res;
      });
    };
  }

  function initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(function (root) {
      initCarousel(root);
    });
  }

  function initCarousel(root) {
    var track = root.querySelector('[data-carousel-track]');
    var viewport = root.querySelector('[data-carousel-viewport]');
    var prev = root.querySelector('[data-carousel-prev]');
    var next = root.querySelector('[data-carousel-next]');
    var section = root.closest('section') || root.parentElement;
    var dotsHost = section ? section.querySelector('[data-carousel-dots]') : null;
    var cards = track ? track.querySelectorAll('.carousel-card') : [];
    if (!track || !viewport || !cards.length) return;

    var index = 0;
    var startX = 0;
    var deltaX = 0;
    var dragging = false;
    var isAbout = root.classList.contains('about-carousel');

    function perView() {
      if (window.matchMedia('(max-width: 900px)').matches) return 1;
      if (isAbout) return 3;
      return 3;
    }

    function maxIndex() {
      return Math.max(0, cards.length - perView());
    }

    function renderDots() {
      if (!dotsHost) return;
      var pages = maxIndex() + 1;
      dotsHost.innerHTML = '';
      for (var i = 0; i < pages; i += 1) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'carousel-dot' + (i === index ? ' is-active' : '');
        btn.setAttribute('aria-label', 'Страница ' + (i + 1));
        btn.addEventListener('click', function (page) {
          return function () {
            index = page;
            update();
          };
        }(i));
        dotsHost.appendChild(btn);
      }
    }

    function update() {
      index = Math.max(0, Math.min(index, maxIndex()));
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap) || 16;
      var cardWidth = cards[0].getBoundingClientRect().width;
      var offset = index * (cardWidth + gap);
      track.style.transform = 'translateX(-' + offset + 'px)';
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= maxIndex();
      renderDots();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        index -= 1;
        update();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        index += 1;
        update();
      });
    }

    viewport.addEventListener('touchstart', function (event) {
      if (!event.touches || !event.touches.length) return;
      dragging = true;
      startX = event.touches[0].clientX;
      deltaX = 0;
    }, { passive: true });

    viewport.addEventListener('touchmove', function (event) {
      if (!dragging || !event.touches || !event.touches.length) return;
      deltaX = event.touches[0].clientX - startX;
    }, { passive: true });

    viewport.addEventListener('touchend', function () {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(deltaX) > 40) {
        index += deltaX < 0 ? 1 : -1;
        update();
      }
    });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(update, 120);
    });

    if (root.hasAttribute('data-carousel-auto') && cards.length > perView()) {
      setInterval(function () {
        if (document.hidden) return;
        index = index >= maxIndex() ? 0 : index + 1;
        update();
      }, 6000);
    }

    update();
  }

  function initCookieBanner() {
    var banner = document.querySelector('[data-cookie-banner]');
    var ok = document.querySelector('[data-cookie-ok]');
    if (!banner || !ok) return;
    var key = 'anna_psy_cookie_ok';
    try {
      if (window.localStorage.getItem(key) === '1') return;
    } catch (e) {}
    banner.hidden = false;
    ok.addEventListener('click', function () {
      try {
        window.localStorage.setItem(key, '1');
      } catch (err) {}
      banner.hidden = true;
    });
  }

  function initReviewExpand() {
    document.querySelectorAll('[data-review-expand]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.review-card');
        if (!card) return;
        var open = card.classList.toggle('is-open');
        btn.textContent = open ? 'Свернуть' : 'Читать полностью';
      });
    });
  }

  function initBlogFilters() {
    var root = document.querySelector('[data-blog-filters]');
    var cardsHost = document.querySelector('[data-blog-cards]');
    if (!root || !cardsHost) return;
    var buttons = root.querySelectorAll('[data-filter]');
    var cards = cardsHost.querySelectorAll('.blog-card');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter') || 'all';
        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        cards.forEach(function (card) {
          var cat = card.getAttribute('data-category') || '';
          var show = filter === 'all' || cat === filter;
          card.hidden = !show;
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCallbackForm();
    initVoprosForm();
    initMobileNav();
    initNavDropdowns();
    initHeaderHideOnScroll();
    initCarousels();
    initReviewExpand();
    initCookieBanner();
    initBlogFilters();
    setupLazyWidget();
    patchBookingThankYou();
  });
})();
