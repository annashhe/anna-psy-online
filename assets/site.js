(function () {
  'use strict';

  window.PSI_SITE_HOME = 'https://anna-psy.online';
  window.PSI_LEADS_API = 'https://psi-leads.anna-shhe-adwords.workers.dev';

  /** Capture first-touch UTMs once; keep across in-site navigation. */
  (function captureUtms() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      var utm = {};
      var found = false;
      keys.forEach(function (k) {
        var v = params.get(k);
        if (v) {
          utm[k] = String(v).slice(0, 200);
          found = true;
        }
      });
      if (!found) return;
      try {
        if (!sessionStorage.getItem('psiUtms')) {
          sessionStorage.setItem('psiUtms', JSON.stringify(utm));
        }
      } catch (e0) {}
      try {
        if (!localStorage.getItem('psiUtmsFirst')) {
          localStorage.setItem('psiUtmsFirst', JSON.stringify(utm));
        }
      } catch (e1) {}
    } catch (e) {}
  })();

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
        alert('Заявку не удалось отправить. Напишите в Telegram @annashhe или на WhatsApp +7 913 755 6284.');
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
      if (website && website.value.trim()) {
        window.location.href = '/thank-you-callback/';
        return;
      }

      postLead(
        Object.assign(
          {
            source: 'callback',
            name: name.value.trim(),
            phone: phoneDigits(phone.value),
            contactMethods: selected,
            comment: comment ? comment.value.trim() : '',
            website: website ? website.value.trim() : '',
            pageUrl: window.location.href,
            site: 'anna-psy.online'
          },
          getLeadTrackingPayload()
        ),
        form.querySelector('[type="submit"]')
      );
    });
  }

  function initVoprosForm() {
    var form = document.getElementById('voprosForm');
    if (!form) return;

    var steps = Array.prototype.slice.call(form.querySelectorAll('[data-quiz-step]')).sort(function (a, b) {
      return Number(a.getAttribute('data-quiz-step')) - Number(b.getAttribute('data-quiz-step'));
    });
    if (!steps.length) return;

    var current = 0;
    var total = steps.length;
    var stepCurrentEl = form.querySelector('[data-quiz-current]');
    var stepTotalEl = form.querySelector('[data-quiz-total]');
    var bigNumEl = form.querySelector('[data-quiz-big-num]');
    var noteEl = form.querySelector('[data-quiz-note]');
    var btnNext = form.querySelector('[data-quiz-next]');
    var btnBack = form.querySelector('[data-quiz-back]');
    var btnSubmit = form.querySelector('.quiz-submit');

    var name = form.querySelector('[name="name"]');
    var phone = form.querySelector('[name="phone"]');
    var email = form.querySelector('[name="email"]');
    var age = form.querySelector('[name="age"]');
    var userComment = form.querySelector('[name="userComment"]');
    var consent = form.querySelector('[name="consent"]');
    var website = form.querySelector('[name="website"]');
    var question = form.querySelector('[name="question"]');
    var topicsCustomText = form.querySelector('[name="topicsCustomText"]');
    var timesCustomText = form.querySelector('[name="timesCustomText"]');
    var scaleInput = form.querySelector('[data-scale-input]');
    var scaleOutput = form.querySelector('[data-scale-output]');
    var topicCustomToggle = form.querySelector('[data-topic-custom-toggle]');
    var topicCustomWrap = form.querySelector('[data-topic-custom]');
    var timeCustomToggle = form.querySelector('[data-time-custom-toggle]');
    var timeCustomWrap = form.querySelector('[data-time-custom]');
    var contacts = form.querySelectorAll('[name="contactMethods"]');
    var contactBox = form.querySelector('[data-contact-methods]');

    if (stepTotalEl) stepTotalEl.textContent = String(total);
    bindPhoneMask(phone);

    function clearStepErrors(step) {
      step.querySelectorAll('.is-error').forEach(function (el) {
        el.classList.remove('is-error');
      });
    }

    function checkedValues(nameAttr) {
      return Array.prototype.filter.call(form.querySelectorAll('[name="' + nameAttr + '"]'), function (el) {
        return el.checked;
      }).map(function (el) {
        return el.value;
      });
    }

    function selectedRadio(nameAttr) {
      var el = form.querySelector('[name="' + nameAttr + '"]:checked');
      return el ? el.value : '';
    }

    function showStep(index) {
      steps.forEach(function (step, i) {
        step.hidden = i !== index;
      });
      current = index;
      if (stepCurrentEl) stepCurrentEl.textContent = String(index + 1);
      if (bigNumEl) bigNumEl.textContent = String(index + 1);
      if (noteEl) {
        var defaultNote = 'Ответы помогут сделать встречу бережной и полезной для вас';
        noteEl.textContent = steps[index].getAttribute('data-quiz-note') || defaultNote;
      }
      if (btnBack) btnBack.hidden = index === 0;
      if (btnNext) btnNext.hidden = index === total - 1;
      if (btnSubmit) btnSubmit.hidden = index !== total - 1;
    }

    function validateStep(index) {
      var step = steps[index];
      clearStepErrors(step);
      var valid = true;
      var stepNum = Number(step.getAttribute('data-quiz-step'));

      if (stepNum === 1) {
        if (!selectedRadio('role')) {
          setError(step.querySelector('.quiz-options'), true);
          valid = false;
        }
      }

      if (stepNum === 3) {
        var topics = checkedValues('topics').filter(function (v) { return v !== 'custom'; });
        var customTopicChecked = topicCustomToggle && topicCustomToggle.checked;
        if (!topics.length && !customTopicChecked) {
          setError(step.querySelector('[data-topics-box]'), true);
          valid = false;
        }
        if (customTopicChecked && (!topicsCustomText || !topicsCustomText.value.trim())) {
          setError(topicsCustomText, true);
          valid = false;
        }
      }

      if (stepNum === 4) {
        if (!selectedRadio('experience')) {
          setError(step.querySelector('.quiz-options'), true);
          valid = false;
        }
      }

      if (stepNum === 7 && timeCustomToggle && timeCustomToggle.checked) {
        if (!timesCustomText || !timesCustomText.value.trim()) {
          setError(timesCustomText, true);
          valid = false;
        }
      }

      if (stepNum === 8) {
        var formatChecks = form.querySelectorAll('[name="formatAgree"]');
        var allFormat = formatChecks.length && Array.prototype.every.call(formatChecks, function (c) {
          return c.checked;
        });
        if (!allFormat) {
          setError(step.querySelector('[data-format-box]'), true);
          valid = false;
        }
        if (!consent || !consent.checked) {
          setError(consent && consent.parentElement, true);
          valid = false;
        }
      }

      if (stepNum === 9) {
        var selectedContacts = checkedValues('contactMethods');
        var badName = !name || !name.value.trim();
        var badPhone = !phone || phoneDigits(phone.value).length !== 11;
        var badContacts = !selectedContacts.length;
        var badConsentFinal = !consent || !consent.checked;
        if (age && age.value) {
          var ageNum = Number(age.value);
          if (ageNum < 18 || ageNum > 80) {
            setError(age, true);
            valid = false;
          }
        }
        setError(name, badName);
        setError(phone, badPhone);
        setError(contactBox, badContacts);
        setError(consent && consent.parentElement, badConsentFinal);
        if (badName || badPhone || badContacts || badConsentFinal) valid = false;
      }

      return valid;
    }

    function buildComment() {
      var parts = [];
      var roleVal = selectedRadio('role');
      if (roleVal) parts.push('Роль: ' + roleVal);
      if (question && question.value.trim()) parts.push('Вопрос: ' + question.value.trim());

      var topics = checkedValues('topics').filter(function (v) { return v !== 'custom'; });
      if (topicCustomToggle && topicCustomToggle.checked && topicsCustomText && topicsCustomText.value.trim()) {
        topics.push(topicsCustomText.value.trim());
      }
      if (topics.length) parts.push('Темы: ' + topics.join('; '));

      var experienceVal = selectedRadio('experience');
      if (experienceVal) parts.push('Опыт с психологом: ' + experienceVal);

      var individualVal = selectedRadio('individual');
      if (individualVal) parts.push('Индивидуальная работа: ' + individualVal);

      if (scaleInput) parts.push('Тяжесть (1–10): ' + scaleInput.value);

      var days = checkedValues('days');
      if (days.length) parts.push('Удобные дни: ' + days.join(', '));

      var times = checkedValues('times').filter(function (v) { return v !== 'custom'; });
      if (timeCustomToggle && timeCustomToggle.checked && timesCustomText && timesCustomText.value.trim()) {
        times.push(timesCustomText.value.trim());
      }
      if (times.length) parts.push('Удобное время: ' + times.join('; '));

      var formatAgree = checkedValues('formatAgree');
      if (formatAgree.length) parts.push('Согласие с форматом: ' + formatAgree.join('; '));

      if (email && email.value.trim()) parts.push('Email: ' + email.value.trim());
      if (age && age.value) parts.push('Возраст: ' + age.value);
      if (userComment && userComment.value.trim()) parts.push('Комментарий: ' + userComment.value.trim());

      return parts.join('\n');
    }

    if (scaleInput && scaleOutput) {
      scaleInput.addEventListener('input', function () {
        scaleOutput.textContent = scaleInput.value;
      });
    }

    if (topicCustomToggle && topicCustomWrap) {
      topicCustomToggle.addEventListener('change', function () {
        topicCustomWrap.hidden = !topicCustomToggle.checked;
        if (!topicCustomToggle.checked && topicsCustomText) topicsCustomText.value = '';
      });
    }

    if (timeCustomToggle && timeCustomWrap) {
      timeCustomToggle.addEventListener('change', function () {
        timeCustomWrap.hidden = !timeCustomToggle.checked;
        if (!timeCustomToggle.checked && timesCustomText) timesCustomText.value = '';
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', function () {
        if (!validateStep(current)) return;
        if (current < total - 1) showStep(current + 1);
      });
    }

    if (btnBack) {
      btnBack.addEventListener('click', function () {
        if (current > 0) showStep(current - 1);
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!validateStep(current)) return;
      if (website && website.value.trim()) {
        window.location.href = '/thank-you-callback/';
        return;
      }

      var selectedContacts = checkedValues('contactMethods');
      postLead(
        Object.assign(
          {
            source: 'vopros-psikhologu',
            name: name.value.trim(),
            phone: phoneDigits(phone.value),
            contactMethods: selectedContacts,
            comment: buildComment(),
            website: website ? website.value.trim() : '',
            pageUrl: window.location.href,
            site: 'anna-psy.online'
          },
          getLeadTrackingPayload()
        ),
        btnSubmit
      );
    });

    showStep(0);
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
    function show() {
      header.classList.remove('header-hidden');
    }

    function hide() {
      if (header.querySelector('.nav.is-open') || header.querySelector('.nav-item.is-open')) {
        show();
        return;
      }
      header.classList.add('header-hidden');
    }

    function update() {
      ticking = false;
      var y = window.scrollY || 0;
      // Test banner removed; keep constant to avoid layout reads on scroll.
      var bannerH = 0;

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
      if (delta > 2) hide();
      else if (delta < -2) show();
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
    update();
  }

  function initNavDropdowns() {
    var items = document.querySelectorAll('.nav-item');
    if (!items.length) return;

    function setExpanded(item, open) {
      var toggle = item.querySelector('[data-dropdown-toggle]');
      if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function suppressHover(item) {
      item.classList.add('dropdown-suppress-hover');
    }

    function clearSuppress(item) {
      item.classList.remove('dropdown-suppress-hover');
    }

    function closeItem(item) {
      item.classList.remove('is-open');
      suppressHover(item);
      setExpanded(item, false);
    }

    function openItem(item) {
      closeAllDropdowns(item);
      clearSuppress(item);
      item.classList.add('is-open');
      setExpanded(item, true);
    }

    items.forEach(function (item) {
      var toggle = item.querySelector('[data-dropdown-toggle]');
      if (!toggle) return;

      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var isOpen = item.classList.contains('is-open');
        var suppressed = item.classList.contains('dropdown-suppress-hover');
        var desktopHover =
          window.matchMedia('(min-width: 861px) and (hover: hover)').matches;
        // On desktop, :hover also shows the panel — treat that as open so a second click closes.
        var visuallyOpen =
          isOpen || (desktopHover && !suppressed && item.matches(':hover'));
        if (visuallyOpen) closeItem(item);
        else openItem(item);
      });

      // After clicking a dropdown link, close menu even if mouse stays over the item (:hover).
      item.querySelectorAll('.nav-dropdown a').forEach(function (link) {
        link.addEventListener('click', function () {
          closeAllDropdowns();
          suppressHover(item);
        });
      });

      item.addEventListener('mouseleave', function () {
        clearSuppress(item);
        item.classList.remove('is-open');
        setExpanded(item, false);
      });
    });

    // Capture phase so outside-click still wins if something stops bubbling.
    document.addEventListener(
      'pointerdown',
      function (event) {
        if (event.target.closest('.nav-item')) return;
        closeAllDropdowns();
      },
      true
    );

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('.nav-item').forEach(function (item) {
        if (item.classList.contains('is-open') || item.matches(':hover')) {
          closeItem(item);
        }
      });
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
      var hasCallbackForm = !!document.getElementById('callbackForm');
      var extra = hasCallbackForm
        ? ' · <a href="#contact">Оставить заявку</a>'
        : ' · <a href="/about/#contact">Оставить заявку</a>';
      host.innerHTML =
        '<div style="padding:1.25rem;border:1px solid rgba(28,26,23,.12);border-radius:12px;background:#fff;">' +
        '<p style="margin:0 0 .75rem;">Календарь временно недоступен. Запишитесь через мессенджеры' +
        (hasCallbackForm ? ' или форму ниже' : ' или форму на странице «О работе»') +
        '.</p>' +
        '<p style="margin:0;"><a href="https://t.me/annashhe" data-cms-href="messengers.telegram" target="_blank" rel="noopener">Telegram</a> · ' +
        '<a href="https://wa.me/79137556284" data-cms-href="messengers.whatsapp" target="_blank" rel="noopener">WhatsApp</a>' +
        extra +
        '</p></div>';
      try {
        var copy = window.__ANNA_SITE_COPY__;
        if (copy) {
          var links = host.querySelectorAll('a[data-cms-href]');
          links.forEach(function (a) {
            var key = a.getAttribute('data-cms-href');
            if (key && copy[key]) a.setAttribute('href', copy[key]);
          });
        }
      } catch (e) {}
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
        localStorage.getItem('psiUtmsFirst') || sessionStorage.getItem('psiUtms') || '{}'
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

    function syncTherapyPricesFromCms() {
      var map = window.__ANNA_THERAPY_PRICES__;
      if (!map) return;
      if (map.individual) {
        THERAPY.individual.price = map.individual;
      }
      if (map.individual_90 || map.individual90) {
        var p90 = map.individual_90 || map.individual90;
        THERAPY.individual90.price = p90;
        THERAPY.individual_90.price = p90;
      }
      if (map.family) THERAPY.family.price = map.family;
    }
    syncTherapyPricesFromCms();
    window.addEventListener('anna-site-copy', syncTherapyPricesFromCms);

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
            // Backend /public/bookings already creates the slot and sends Telegram.
            // Do not POST source=booking to psi-leads — that duplicated TG messages.
            started = true;
            goThankYou(payload, therapy, endIso);
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
    var autoAttr = root.getAttribute('data-carousel-auto');
    var autoEnabled = autoAttr !== null;
    var autoMs = parseInt(autoAttr, 10);
    if (!autoMs || isNaN(autoMs)) {
      autoMs = 2500;
    }
    var autoTimer = null;
    var userStopped = false;

    function perView() {
      if (window.matchMedia('(max-width: 900px)').matches) return 1;
      if (isAbout) {
        var w = viewport.getBoundingClientRect().width;
        if (w < 760) return 1;
        if (w < 1120) return 2;
        return 3;
      }
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
            stopAuto();
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

    function stopAuto() {
      userStopped = true;
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    root._annaStopAuto = stopAuto;

    function startAuto() {
      if (!autoEnabled || userStopped || cards.length <= perView()) return;
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(function () {
        if (document.hidden || userStopped) return;
        index = index >= maxIndex() ? 0 : index + 1;
        update();
      }, autoMs);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        stopAuto();
        index -= 1;
        update();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        stopAuto();
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
        stopAuto();
        index += deltaX < 0 ? 1 : -1;
        update();
      }
    });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        update();
        if (autoEnabled && !userStopped) startAuto();
      }, 120);
    });

    update();
    startAuto();
  }

  function initReviewExpand() {
    document.querySelectorAll('[data-review-expand]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.review-card');
        if (!card) return;
        var open = card.classList.toggle('is-open');
        btn.textContent = open ? 'Свернуть' : 'Читать полностью';
        var carousel = card.closest('[data-carousel]');
        if (carousel && carousel._annaStopAuto) carousel._annaStopAuto();
      });
    });
  }

  function initBlogFilters() {
    var root = document.querySelector('[data-blog-filters]');
    var cardsHost = document.querySelector('[data-blog-cards]');
    if (!root || !cardsHost) return;
    var buttons = root.querySelectorAll('[data-filter]');
    var cards = cardsHost.querySelectorAll('.blog-card');

    function applyFilter(filter) {
      cards.forEach(function (card) {
        var cat = (card.getAttribute('data-category') || '').trim();
        var show = filter === 'all' || cat === filter;
        if (show) {
          card.hidden = false;
          card.removeAttribute('hidden');
          card.classList.remove('is-filtered-out');
        } else {
          card.hidden = true;
          card.setAttribute('hidden', '');
          card.classList.add('is-filtered-out');
        }
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter') || 'all';
        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        applyFilter(filter);
      });
    });
  }

  function initPageDots() {
    var nav = document.querySelector('[data-page-dots]');
    if (!nav) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[data-dot-target]'));
    if (!links.length) return;

    var sections = links
      .map(function (link) {
        var id = link.getAttribute('data-dot-target');
        var el = id === 'top' ? document.body : document.getElementById(id);
        return { link: link, el: el, id: id };
      })
      .filter(function (item) {
        return !!item.el;
      });

    function setActive(id) {
      links.forEach(function (link) {
        var on = link.getAttribute('data-dot-target') === id;
        link.classList.toggle('is-active', on);
        if (on) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }

    function update() {
      var marker = (window.scrollY || 0) + Math.min(window.innerHeight * 0.35, 280);
      var current = sections[0] && sections[0].id;
      sections.forEach(function (item) {
        var top =
          item.id === 'top'
            ? 0
            : item.el.getBoundingClientRect().top + (window.scrollY || 0);
        if (top <= marker) current = item.id;
      });
      setActive(current);
    }

    var ticking = false;
    function schedule() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    update();
  }

  function initScrollTop() {
    if (document.querySelector('.scroll-top')) return;

    var btn = document.createElement('a');
    btn.className = 'scroll-top';
    btn.href = '#top';
    btn.setAttribute('aria-label', 'Наверх');
    btn.setAttribute('title', 'Наверх');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 14.5L12 8.5L18 14.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    btn.addEventListener('click', function (event) {
      var topEl = document.getElementById('top');
      if (!topEl) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if ('scrollBehavior' in document.documentElement.style) {
        event.preventDefault();
        topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    document.body.appendChild(btn);

    var threshold = 420;
    var ticking = false;
    function update() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      btn.classList.toggle('is-visible', y > threshold);
    }
    function schedule() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    update();
  }

  /** Policies, offer, blog: discourage casual copy (not DRM). */
  function initNoCopy() {
    var path = location.pathname || '';
    if (!/^\/(privacy|oferta|blog)(\/|$)/i.test(path)) return;
    document.documentElement.classList.add('no-copy');
    function block(event) {
      var t = event.target;
      if (t && (t.closest('input, textarea, [contenteditable="true"]'))) return;
      event.preventDefault();
    }
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('contextmenu', block);
    document.addEventListener('dragstart', block);
    document.addEventListener('keydown', function (event) {
      var key = (event.key || '').toLowerCase();
      if (!(event.ctrlKey || event.metaKey)) return;
      if (key !== 'c' && key !== 'x' && key !== 'a' && key !== 's') return;
      var t = event.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      event.preventDefault();
    });
  }

  // Apply class ASAP so CSS user-select works before DOMContentLoaded.
  initNoCopy();

  document.addEventListener('DOMContentLoaded', function () {
    initCallbackForm();
    initVoprosForm();
    initMobileNav();
    initNavDropdowns();
    initHeaderHideOnScroll();
    initCarousels();
    initReviewExpand();
    initBlogFilters();
    setupLazyWidget();
    patchBookingThankYou();
    initPageDots();
    initScrollTop();
  });
})();
