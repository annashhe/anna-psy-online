/**
 * Rebuild niche pages to match homepage visual structure.
 * Run: node scripts/rebuild-niche-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const TG_ICON = `<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M50 100c27.614 0 50-22.386 50-50S77.614 0 50 0 0 22.386 0 50s22.386 50 50 50Zm21.977-68.056c.386-4.38-4.24-2.576-4.24-2.576-3.415 1.414-6.937 2.85-10.497 4.302-11.04 4.503-22.444 9.155-32.159 13.734-5.268 1.932-2.184 3.864-2.184 3.864l8.351 2.577c3.855 1.16 5.91-.129 5.91-.129l17.988-12.238c6.424-4.38 4.882-.773 3.34.773l-13.49 12.882c-2.056 1.804-1.028 3.35-.129 4.123 2.55 2.249 8.82 6.364 11.557 8.16.712.467 1.185.778 1.292.858.642.515 4.111 2.834 6.424 2.319 2.313-.516 2.57-3.479 2.57-3.479l3.083-20.226c.462-3.511.993-6.886 1.417-9.582.4-2.546.705-4.485.767-5.362Z" fill="#b4436c"/></svg>`;

const TG_ICON_CURRENT = TG_ICON.replace('fill="#b4436c"', 'fill="currentColor"');

const ARROW_PREV = `<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M23 13L15.5 20L23 27" stroke="currentColor" stroke-width="2"/></svg>`;
const ARROW_NEXT = `<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M17 13L24.5 20L17 27" stroke="currentColor" stroke-width="2"/></svg>`;

function header() {
  return `<header class="site-header">
    <div class="wrap">
      <a class="brand" href="/">Психолог Анна Щеголихина</a>
      <button class="mobile-nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="main-nav" aria-label="Меню"><span></span><span></span><span></span><span></span></button>
      <nav class="nav" id="main-nav" aria-label="Основная навигация">
        <div class="nav-item">
          <button class="nav-link" type="button" data-dropdown-toggle aria-expanded="false" aria-haspopup="true">Услуги</button>
          <div class="nav-dropdown" role="menu">
            <a href="/group2026/" role="menuitem">Терапевтическая Группа</a>
            <a href="/psikholog-v-kaliningrade/" role="menuitem">Психолог в Калининграде</a>
            <a href="/semeynyy-psikholog-kaliningrad/" role="menuitem">Семейный психолог в Калининграде</a>
            <a href="/" role="menuitem">Индивидуальные консультации онлайн</a>
            <a href="/family/" role="menuitem">Семейные консультации онлайн</a>
            <a href="/psycholog-dlya-muzhchin/" role="menuitem">Психолог для Мужчин</a>
            <a href="/it/" role="menuitem">Психолог для IT специалистов</a>
            <a href="/parting/" role="menuitem">Психолог при Расставании, разводе, измене</a>
            <a href="/bloggers/" role="menuitem">Психолог для Блогеров и Экспертов</a>
          </div>
        </div>
        <div class="nav-item">
          <button class="nav-link" type="button" data-dropdown-toggle aria-expanded="false" aria-haspopup="true">О работе со мной</button>
          <div class="nav-dropdown" role="menu">
            <a href="/about/#about" role="menuitem">Обо мне</a>
            <a href="/about/#education" role="menuitem">Образование и дипломы</a>
            <a href="/about/#principles" role="menuitem">Мои принципы</a>
            <a href="/about/#therapypath" role="menuitem">Путь в терапии - шаг за шагом</a>
            <a href="/about/#firstmeeting" role="menuitem">Первая консультация</a>
            <a href="/about/#notsuitable" role="menuitem">Для кого я не подхожу</a>
            <a href="/about/#cancellation" role="menuitem">Отмена и перенос встречи</a>
            <a href="/blog/" role="menuitem">Статьи психолога</a>
          </div>
        </div>
        <a href="#pricing">Стоимость</a>
        <a href="#reviews">Отзывы</a>
        <a href="#contact">Контакты</a>
        <a class="nav-mobile-cta btn btn-primary" href="#booking">Записаться на консультацию</a>
      </nav>
      <div class="header-actions">
        <a class="btn-icon" href="https://t.me/annashhe" target="_blank" rel="noopener" aria-label="Telegram">
          ${TG_ICON}
        </a>
        <a class="btn btn-primary header-cta" href="#booking"><span class="btn-label-full">Записаться на консультацию</span><span class="btn-label-short">Записаться</span></a>
      </div>
    </div>
  </header>`;
}

function quoteBand(textHtml) {
  return `<section class="quote-band" aria-label="Цитата">
      <div class="quote-rule" aria-hidden="true"><div class="quote-rule-line"></div></div>
      <blockquote class="quote-decor">
        <span class="quote-mark" aria-hidden="true">“</span>
        <p>${textHtml}</p>
        <cite>Психолог, Анна Щеголихина</cite>
      </blockquote>
      <div class="quote-rule" aria-hidden="true"><div class="quote-rule-line"></div></div>
    </section>`;
}

function requestRows(title, items) {
  return `<section class="section section-soft" id="requests">
      <div class="wrap">
        <h2>${title}</h2>
        <div class="request-rows">
          ${items
            .map(
              (i) => `<article class="request-row">
            <h3>${i.title}</h3>
            <p>${i.text}</p>
          </article>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>`;
}

function changeCards(items) {
  return items
    .map(
      (item, idx) => `<article class="change-card" style="background-image:url('/assets/images/tilda/change-${idx + 1}.jpg')">
            <div class="change-card-inner">
              <h3><span>${item.title}</span></h3>
              <p><span>${item.text}</span></p>
            </div>
          </article>`
    )
    .join('\n          ');
}

function reviewsBlock() {
  const reviews = [
    {
      avatar: 1,
      name: 'М.',
      source: '(<a href="https://www.b17.ru/annams/#otzyv" target="_blank" rel="noopener">b17</a>)',
      age: '49 лет',
      text: 'Проходил через развод и обратился к Анне, чтобы не утонуть в эмоциях. Работа помогла мне держать голову холодной, не влетать в конфликты и постепенно собрать себя заново. Чувствую, что вышел из ситуации гораздо сильнее, чем мог бы сам. Спасибо!',
    },
    {
      avatar: 2,
      name: 'К.',
      source: '(<a href="https://yandex.ru/profile/119983917035" target="_blank" rel="noopener">Яндекс Карты</a>)',
      age: '32 года',
      text: 'Большая благодарность Анне, за ее человечность, отличный подход без копания в детских травмах если это некомфортно, подсвечивает такие важные моменты, которых я бы точно не заметила если бы разбиралась в одиночку.<br />Очень нравится наше общение, где меня принимают разной. Когда я обратилась за помощью изначально, я уже ни во что не верила и готова была опустить руки, но спустя несколько месяцев продуктивной работы, вижу этот колоссальный прогресс и понимаю, что точно хочу прожить эту жизнь в гармонии с собой и быть наполненным сосудом!<br />Спасибо, Анна, вы вернули мне себя🙏',
    },
    {
      avatar: 3,
      name: 'М.',
      source: '(<a href="https://uslugi.yandex.ru/profile/AnnaShh-3119113" target="_blank" rel="noopener">Яндекс Услуги</a>)',
      age: '29 лет',
      text: 'Довольно скептически относилась к психологии, но когда отношения с мужем были почти разрушены - решились на семейную терапию в качестве последнего шанса.<br />Сессии проходили в комфортном темпе, Анна не давала нам уходить в ссоры или обиды, выводила на конструктивные диалоги, которые помогали находить корень проблемы и работали уже с самим источником разлада.<br />Сейчас прошло несколько месяцев с начала терапии, и я очень благодарна Анне за ее профессионализм, такт, комфорт благодаря которым нам удалось сохранить семью, конечно впереди еще много работы, но сейчас ситуация сильно изменилась, так как мы наконец стали слышать друг друга.<br />Спасибо большое, очень рада что нашла вас',
    },
    {
      avatar: 4,
      name: 'С.',
      source: '(Личные сообщения)',
      age: '44 года',
      text: 'Аня, добрый день!<br />Хочу написать отзыв о работе с тобой, вдруг это кому-то поможет ещё)<br /><br />Прошло полгода с того момента как мы начали наши встречи, и я уже чувствую реальную разницу в себе. Раньше постоянное напряжение, выгорание и тревога были нормой, я почти не умел останавливаться и отдыхать, мне вечно казалось, что я куда-то не успеваю и что всё чего я добиваюсь недостаточно ((<br /><br />Сейчас же я стал рациональнее распределять задачи, слушать себя и свои приоритеты, и могу принимать решения без постоянного внутреннего давления. Появилось ощущение, что можно идти к целям, не " раздавливая" себя при этом. С тобой легко говорить обо всём, даже о сомнениях и страхах, которые раньше казались стыдными. Ты помогаешь видеть то, что я сам обычно не замечаю, задаёшь точные вопросы, и благодаря этому я начинаю понимать свои мотивации и реакции. Иногда бывает непросто, но после встреч остаётся ясность и уверенность, что я двигаюсь в правильном направлении.<br /><br />Очень благодарен за твоё внимание и поддержку! Планирую продолжать встречи, потому что понимаю, что ещё многое могу открыть для себя с твоей помощью )',
    },
    {
      avatar: 5,
      name: 'А.',
      source: '(<a href="https://yandex.ru/profile/119983917035" target="_blank" rel="noopener">Яндекс Карты</a>)',
      age: '43 года',
      text: 'Хочу выразить огромную, искреннюю благодарность Анне за профессиональную помощь и поддержку на очень сложном отрезке моей жизни.<br />Не буду расписывать, с какой проблемой я обратилась, но с первого же сеанса я почувствовала не формальное отношение, а настоящий интерес и безопасность. Анна не давала готовых ответов или советов «как жить». Вместо этого она мягко и профессионально помогала мне самой разобраться в хитросплетениях моих чувств, мыслей и поступков.<br />Спасибо огромное 🙏🏽',
    },
    {
      avatar: 6,
      name: 'И.',
      source: '(<a href="https://yandex.ru/profile/119983917035" target="_blank" rel="noopener">Яндекс Карты</a>)',
      age: '38 лет',
      text: 'Прохожу терапию у Анны несколько месяцев и чувствую реальный результат. Каждая встреча точная и продуктивная, без лишних разговоров ни о чём. Благодаря этим сессиям я лучше понимаю себя, спокойнее реагирую на стресс и выстраиваю отношения с женой иначе.<br /><br />Ценно, что изменения ощущаются в повседневной жизни, а не только во время разговора. Анна умеет видеть то, что самому сложно заметить, и помогает найти свои решения.',
    },
  ];

  return `<section class="section section-white" id="reviews">
      <div class="wrap">
        <h2>Отзывы</h2>
        <div class="carousel" data-carousel data-carousel-auto="2500">
          <button class="carousel-btn carousel-prev" type="button" data-carousel-prev aria-label="Предыдущие отзывы">
            ${ARROW_PREV}
          </button>
          <div class="carousel-viewport" data-carousel-viewport>
            <div class="carousel-track" data-carousel-track>
              ${reviews
                .map(
                  (r) => `<article class="carousel-card review-card review-card-expandable">
                <div class="review-head">
                  <img class="review-avatar" src="/assets/images/tilda/review-avatar-${r.avatar}.jpg" alt="" width="64" height="64" />
                  <div>
                    <strong>${r.name} <span class="review-source">${r.source}</span></strong>
                    <span>${r.age}</span>
                  </div>
                </div>
                <p>${r.text}</p>
                <button type="button" class="review-expand" data-review-expand>Читать полностью</button>
              </article>`
                )
                .join('\n              ')}
            </div>
          </div>
          <button class="carousel-btn carousel-next" type="button" data-carousel-next aria-label="Следующие отзывы">
            ${ARROW_NEXT}
          </button>
        </div>
        <div class="carousel-dots" data-carousel-dots aria-hidden="true"></div>
      </div>
    </section>`;
}

function leaveReview() {
  return `<section class="section section-soft" id="leave-review">
      <div class="wrap leave-review">
        <h2>Оставьте отзыв о работе со мной</h2>
        <ul class="checklist">
          <li>
            <img src="/assets/images/icons/location_meeting_heart.svg" alt="" width="40" height="40" />
            <span class="checklist-copy">
              <strong>Отзыв на Яндекс Картах</strong>
              <a href="https://yandex.ru/profile/119983917035?tab=reviews" target="_blank" rel="noopener">Написать отзыв</a>
            </span>
          </li>
          <li>
            <img src="/assets/images/icons/thoughts_heart_love.svg" alt="" width="40" height="40" />
            <span class="checklist-copy">
              <strong>Отзыв на Яндекс Услугах</strong>
              <a href="https://uslugi.yandex.ru/search?action=addReview&amp;profile=AnnaShh-3119113" target="_blank" rel="noopener">Написать отзыв</a>
            </span>
          </li>
          <li>
            <img src="/assets/images/icons/chat_talk_heart.svg" alt="" width="40" height="40" />
            <span class="checklist-copy">
              <strong>Отзыв на b17</strong>
              <a href="https://www.b17.ru/annams/#otzyv" target="_blank" rel="noopener">Написать отзыв</a>
            </span>
          </li>
          <li>
            <img src="/assets/images/icons/phone_message_call_heart.svg" alt="" width="40" height="40" />
            <span class="checklist-copy">
              <strong>Отзыв в личные сообщения (Telegram)</strong>
              <a href="https://t.me/annashhe" target="_blank" rel="noopener">Написать отзыв</a>
            </span>
          </li>
        </ul>
      </div>
    </section>`;
}

function pricingBlock(lines, packageHtml) {
  return `<section class="section section-white" id="pricing">
      <div class="wrap">
        <h2>Стоимость</h2>
        <p class="section-lead section-lead-note price-note"><em>*при каждой оплате <strong>высылаю вам чек</strong></em></p>
        <div class="price-list">
          ${lines
            .map(
              (l) => `<article class="price-line">
            <h3 class="price-line-title">${l.title}</h3>
            <div class="price-line-mid">
              <p><span class="price-check">✔</span> ${l.mid}</p>
            </div>
            <p class="amount">${l.amount}</p>
          </article>`
            )
            .join('\n          ')}
          <article class="price-line price-line-package">
            <h3 class="price-line-title"><em>−20%</em></h3>
            <div class="price-line-mid price-line-mid-wide">
              <p><em>${packageHtml}</em></p>
            </div>
          </article>
        </div>
        <div class="section-cta">
          <a class="btn btn-primary" href="#booking">Выбрать время консультации в графике</a>
        </div>
      </div>
    </section>`;
}

function aboutBlock() {
  return `<section class="section section-white" id="about-brief">
      <div class="wrap">
        <h2>Обо мне</h2>
        <div class="carousel about-carousel" data-carousel data-carousel-auto="2500">
          <button class="carousel-btn carousel-prev" type="button" data-carousel-prev aria-label="Предыдущие карточки">
            ${ARROW_PREV}
          </button>
          <div class="carousel-viewport" data-carousel-viewport>
            <div class="carousel-track" data-carousel-track>
              <article class="carousel-card about-card">
                <div class="about-card-body">
                  <h3><span>Квалификация</span>:<br />Клинический психолог<br />Семейный психолог</h3>
                  <p>Более 2 500 часов образования</p>
                  <a class="btn btn-primary btn-sm" href="/about/#education">Подробнее об образовании</a>
                </div>
              </article>
              <article class="carousel-card about-card">
                <div class="about-card-body">
                  <h3>Мои <span>принципы</span></h3>
                  <p>Конфиденциальность<br />Диалог без сложных терминов<br />Уважение к вашей уникальности<br />Фокус на ваших ресурсах</p>
                  <a class="btn btn-primary btn-sm" href="/about/#principles">Подробнее о принципах</a>
                </div>
              </article>
              <article class="carousel-card about-card">
                <div class="about-card-body">
                  <h3>В психологии <span>с 2019 года</span></h3>
                  <p>Личная терапия + групповая терапия + образование + регулярные супервизии</p>
                  <a class="btn btn-primary btn-sm" href="/about/#about">Подробнее обо мне</a>
                </div>
              </article>
              <article class="carousel-card about-card">
                <div class="about-card-body">
                  <h3><span>Регулярное обучение</span> и повышение квалификации</h3>
                  <p>В текущий момент обучаюсь на <a href="/group2026/">группового терапевта</a></p>
                  <a class="btn btn-primary btn-sm" href="/about/#education">Посмотреть дипломы</a>
                </div>
              </article>
              <article class="carousel-card about-card">
                <div class="about-card-body">
                  <h3><span>Соучредитель</span> сервиса по подбору и работе с психологами Д<span>А</span></h3>
                  <p>Проверенные психологи</p>
                  <a class="btn btn-primary btn-sm" href="https://www.da-online.ru/?utm_source=annawebsite" target="_blank" rel="noopener">Перейти на сайт ДА</a>
                </div>
              </article>
              <article class="carousel-card about-card">
                <div class="about-card-body">
                  <h3><span>Организатор</span> психологических мероприятий ЯРЧЕ</h3>
                  <p>Зимние фестивали и летние смены в Калининграде</p>
                  <a class="btn btn-primary btn-sm" href="https://yarchefest.ru/?utm_source=annawebsite" target="_blank" rel="noopener">Перейти на сайт ЯРЧЕ</a>
                </div>
              </article>
            </div>
          </div>
          <button class="carousel-btn carousel-next" type="button" data-carousel-next aria-label="Следующие карточки">
            ${ARROW_NEXT}
          </button>
        </div>
        <div class="carousel-dots" data-carousel-dots aria-hidden="true"></div>
      </div>
    </section>`;
}

function howBlock() {
  return `<section class="section section-white" id="how">
      <div class="wrap">
        <h2>Как проходит работа</h2>
        <div class="steps-row">
          <div class="step-card">
            <span class="step-num" aria-hidden="true">1</span>
            <strong>Первая встреча</strong>
            <p>Мы знакомимся, обсуждаем ваш запрос и ожидания, намечаем ориентиры для работы</p>
          </div>
          <div class="step-card">
            <span class="step-num" aria-hidden="true">2</span>
            <strong>Последующие консультации</strong>
            <p>Постепенно вам становится понятнее, что происходит внутри и в отношениях</p>
          </div>
          <div class="step-card">
            <span class="step-num" aria-hidden="true">3</span>
            <strong>Изменения</strong>
            <p>Появляется больше устойчивости, спокойствия, ясности и внутренней опоры</p>
          </div>
          <div class="step-card">
            <span class="step-num" aria-hidden="true">4</span>
            <strong>Завершение</strong>
            <p>Обсуждаем результаты, навыки, изменения и то, что теперь поддерживает вас в жизни</p>
          </div>
        </div>
        <div class="section-cta">
          <a class="btn btn-primary" href="/about/">Подробнее об этапах работы</a>
        </div>
      </div>
    </section>`;
}

function formatBlock(rows) {
  return `<section class="section section-white" id="format">
      <div class="wrap">
        <h2 class="format-heading">Удобный формат консультаций</h2>
        <div class="format-split">
          <div class="format-list">
            ${rows
              .map(
                (r) => `<article class="format-row">
              <div class="format-icon" aria-hidden="true"><img src="${r.icon}" alt="" width="40" height="40" /></div>
              <div>
                <h3>${r.title}</h3>
                <p>${r.text}</p>
              </div>
            </article>`
              )
              .join('\n            ')}
          </div>
          <div class="format-visual">
            <img src="/assets/images/tilda/format-photo.jpg" alt="Онлайн-консультация" width="720" height="900" />
          </div>
        </div>
      </div>
    </section>`;
}

function bookingBlock() {
  return `<section class="section section-white" id="booking">
      <div class="wrap">
        <h2 class="booking-heading">Выберите удобное <em class="accent">время в графике</em>, чтобы записаться на Онлайн консультацию ⤵︎</h2>
        <div class="booking-shell">
          <div data-anna-psy-widget></div>
        </div>
        <p class="calendar-note">Если календарь не отображается, попробуйте отключить VPN или открыть страницу в другом браузере</p>
      </div>
    </section>`;
}

function contactBlock() {
  return `<section class="section section-soft" id="contact">
      <div class="wrap contact-block">
        <h2>Контакты</h2>
        <p class="section-lead">Вы можете связаться со мной любым удобным для вас способом, чтобы обсудить ваш запрос и подобрать удобное время. Я отвечу вам в течение дня.</p>
        <div class="social-round" aria-label="Социальные сети и мессенджеры">
          <a class="social-btn" href="tel:+79137556284" aria-label="Позвонить">
            <img src="/assets/images/icons/phone.svg" alt="" width="28" height="28" />
          </a>
          <a class="social-btn" href="https://t.me/annashhe" target="_blank" rel="noopener" aria-label="Telegram">
            ${TG_ICON_CURRENT}
          </a>
          <a class="social-btn" href="https://max.ru/u/f9LHodD0cOKrHIa3XdZycCKQSXXx0dFf9Ck7hXPtx3Ti-6RSxFnoPC7d1Ag" target="_blank" rel="noopener" aria-label="MAX">
            <img src="/assets/images/icons/max.svg" alt="" width="22" height="22" />
          </a>
          <a class="social-btn social-btn-b17" href="https://www.b17.ru/annams/" target="_blank" rel="noopener" aria-label="b17" title="b17">
            <img src="/assets/images/icons/b17.png?v=2" alt="b17" width="48" height="48" />
          </a>
        </div>
        <p class="contact-phone"><a href="tel:+79137556284">+7 913 755 6284</a></p>
      </div>
    </section>`;
}

function faqBlock(items) {
  return `<section class="section section-white" id="faq">
      <div class="wrap">
        <h2>Частые вопросы</h2>
        <div class="faq">
          ${items
            .map(
              (i) => `<details>
            <summary>${i.q}</summary>
            <p>${i.a}</p>
          </details>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>`;
}

function blogBlock() {
  const cards = [
    { href: '/blog/breakup/kak-perezhit-rasstavanie/', img: 'kak-perezhit-rasstavanie.jpg', cat: 'breakup', tag: 'Расставание', title: 'Как пережить расставание', text: 'Как бережно пройти острый период после разрыва и не потерять опору в себе.' },
    { href: '/blog/family/ya_nenavizhu_chuzhih_detey/', img: 'ya_nenavizhu_chuzhih_detey.jpg', cat: 'family', tag: 'Семья и отношения', title: 'Я ненавижу чужих детей', text: 'Честный разговор о раздражении, границах и чувствах, которые стыдно признавать.' },
    { href: '/blog/self-knowledge/kak_perestat_vso_kontrolirovat/', img: 'kak_perestat_vso_kontrolirovat.jpg', cat: 'self', tag: 'Самопознание', title: 'Как перестать всё контролировать', text: 'Почему контроль так цепляет и как постепенно отпускать то, что нельзя удержать.' },
    { href: '/blog/family/sozavisimost-emotsionalnaya-zavisimost/', img: 'sozavisimost-emotsionalnaya-zavisimost.jpg', cat: 'family', tag: 'Семья и отношения', title: 'Созависимость vs эмоциональная зависимость', text: 'В чём разница между близостью, зависимостью и потерей себя в отношениях.' },
    { href: '/blog/men/nastoyashchiy_muzhchina/', img: 'nastoyashchiy_muzhchina.jpg', cat: 'men', tag: 'Для мужчин', title: 'Настоящий мужчина', text: 'Как стереотипы о «настоящем мужчине» мешают жить и чувствовать.' },
    { href: '/blog/breakup/kak_zabyt_cheloveka/', img: 'kak_zabyt_cheloveka.jpg', cat: 'breakup', tag: 'Расставание', title: 'Как забыть человека', text: 'Почему «просто забыть» не работает и что помогает отпустить связь.' },
    { href: '/blog/self-knowledge/v_chem_smysl_zhizni/', img: 'v_chem_smysl_zhizni.jpg', cat: 'self', tag: 'Самопознание', title: 'В чём смысл жизни', text: 'Как искать смысл без давления «должен понять раз и навсегда».' },
    { href: '/blog/self-knowledge/millenialy/', img: 'millenialy.jpg', cat: 'self', tag: 'Самопознание', title: 'Миллениалы: кто они', text: 'Поколенческий портрет: тревога, успех и поиск опоры в неопределённости.' },
  ];

  return `<section class="section section-soft" id="blog">
      <div class="wrap">
        <h2>Статьи психолога Анны Щеголихиной</h2>
        <div class="blog-filters" data-blog-filters role="tablist" aria-label="Фильтр статей">
          <button type="button" class="blog-filter is-active" data-filter="all" aria-pressed="true">Все</button>
          <button type="button" class="blog-filter" data-filter="men" aria-pressed="false">Для мужчин</button>
          <button type="button" class="blog-filter" data-filter="family" aria-pressed="false">Семья и отношения</button>
          <button type="button" class="blog-filter" data-filter="breakup" aria-pressed="false">Расставание</button>
          <button type="button" class="blog-filter" data-filter="self" aria-pressed="false">Самопознание</button>
        </div>
        <div class="blog-cards" data-blog-cards>
          ${cards
            .map(
              (c) => `<a class="blog-card" href="${c.href}" data-category="${c.cat}">
            <div class="blog-card-media">
              <img src="/assets/images/articles/${c.img}" alt="" width="480" height="360" loading="lazy" />
              <span class="blog-card-tag">${c.tag}</span>
            </div>
            <strong>${c.title}</strong>
            <p>${c.text}</p>
          </a>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>`;
}

function footer() {
  return `<footer class="site-footer site-footer-lavender">
    <div class="wrap footer-bar">
      <div class="footer-copy">© Щеголихина А. М., 2024–2026</div>
      <nav class="footer-nav" aria-label="Подвал">
        <a href="/about/">О работе со мной</a>
        <a href="/privacy/">Политика конфиденциальности</a>
        <a href="/oferta/">Публичная оферта</a>
      </nav>
      <a class="footer-up" href="#top">Наверх</a>
    </div>
  </footer>

  <div class="cookie-banner" data-cookie-banner hidden>
    <p>Мы используем файлы cookie для улучшения работы сайта и анализа его посещаемости. Продолжая использовать наш сайт, вы соглашаетесь с использованием cookie.</p>
    <button class="btn btn-cookie" type="button" data-cookie-ok>OK</button>
  </div>

  <nav class="page-dots" aria-label="Навигация по разделам" data-page-dots>
    <a href="#top" data-dot-target="top"><span class="page-dots-tip">Обложка</span><span class="page-dots-dot" aria-hidden="true"></span></a>
    <a href="#requests" data-dot-target="requests"><span class="page-dots-tip">Часто приходят с этими запросами</span><span class="page-dots-dot" aria-hidden="true"></span></a>
    <a href="#results" data-dot-target="results"><span class="page-dots-tip">Ваши изменения</span><span class="page-dots-dot" aria-hidden="true"></span></a>
    <a href="#reviews" data-dot-target="reviews"><span class="page-dots-tip">Отзывы</span><span class="page-dots-dot" aria-hidden="true"></span></a>
    <a href="#pricing" data-dot-target="pricing"><span class="page-dots-tip">Стоимость</span><span class="page-dots-dot" aria-hidden="true"></span></a>
    <a href="#about-brief" data-dot-target="about-brief"><span class="page-dots-tip">Обо мне</span><span class="page-dots-dot" aria-hidden="true"></span></a>
    <a href="#how" data-dot-target="how"><span class="page-dots-tip">Как проходит работа</span><span class="page-dots-dot" aria-hidden="true"></span></a>
    <a href="#format" data-dot-target="format"><span class="page-dots-tip">Формат работы</span><span class="page-dots-dot" aria-hidden="true"></span></a>
    <a href="#booking" data-dot-target="booking"><span class="page-dots-tip">Выберите удобное время в графике</span><span class="page-dots-dot" aria-hidden="true"></span></a>
    <a href="#contact" data-dot-target="contact"><span class="page-dots-tip">Контакты</span><span class="page-dots-dot" aria-hidden="true"></span></a>
    <a href="#faq" data-dot-target="faq"><span class="page-dots-tip">Часто задаваемые вопросы</span><span class="page-dots-dot" aria-hidden="true"></span></a>
    <a href="#blog" data-dot-target="blog"><span class="page-dots-tip">Статьи психолога</span><span class="page-dots-dot" aria-hidden="true"></span></a>
  </nav>

  <script src="/assets/site.js?v=20260806b" defer></script>`;
}

const defaultFaq = [
  {
    q: 'Как проходит онлайн-консультация?',
    a: 'Онлайн-консультация проходит так же, как очная встреча, только вам не нужно никуда ехать. За 5–10 минут до начала я пришлю вам ссылку на видеовстречу в удобном для вас мессенджере (Telegram, WhatsApp, MAX), вам не нужны никакие дополнительные программы — только ссылка в браузере или ваш мессенджер. Длительность сессии — 50 минут или 90 минут (по договоренности). Всё это время будет полностью ваше: мы сможем говорить о том, что вас беспокоит, так же открыто и доверительно, как если бы вы пришли в кабинет. Важно только заранее позаботиться о комфортном месте — где вас никто не потревожит. Главное преимущество такого формата — вы можете находиться где угодно: дома под пледом с чашкой чая, в уютном кафе или даже в путешествии. Всё, что нужно, — это интернет и немного личного пространства. Если остались вопросы о технической части — напишите мне, и я помогу подготовиться к первой встрече.',
  },
  {
    q: 'Как часто нужно встречаться с психологом?',
    a: 'Оптимальная частота — 1 раз в неделю. Такой ритм создаёт устойчивый процесс: вы успеваете проживать изменения между встречами и при этом не теряете контакт с тем, что происходит внутри, а также с психологом. Иногда на старте или в период повышенной нагрузки мы можем встречаться 2 раза в неделю — это помогает быстрее стабилизировать состояние, снизить тревогу и восстановить ощущение опоры. Реже чем раз в неделю можно работать, но, как правило, это замедляет процесс и усложняет достижение устойчивых результатов: слишком большие паузы часто возвращают к уже пройденным этапам. При завершении интенсивной работы формат может становиться более свободным — например, раз в 2 недели или раз в месяц, чтобы поддерживать состояние и интегрировать изменения. Мы всегда согласуем частоту встреч индивидуально. Главное — чтобы ритм работы поддерживал вас, ваш темп и вашу жизнь, а не мешал ей.',
  },
  {
    q: 'Сколько времени нужно, чтобы стало легче?',
    a: 'Ответ на данный вопрос зависит от многих факторов. Если же говорить в среднем, первое облегчение наступает уже в течение первых 3–6 встреч — когда становится понятнее, что с вами происходит, снижается напряжение и появляется ощущение опоры. Более глубокие и устойчивые изменения формируются в процессе нескольких месяцев (6–12 или более) регулярной работы. Это зависит от запроса, интенсивности симптомов и вашего темпа. Главное — мы идём в вашем темпе. С вниманием к вашему состоянию и с опорой на то, что уже получается. Каждая встреча — это посильный шаг к тому, чтобы вам становилось спокойнее, понятнее и устойчивее.',
  },
  {
    q: 'Что если я опоздаю или пропущу встречу?',
    a: 'Если потребуется перенос или отмена бронирования — пожалуйста, предупредите не позднее чем за 24 часа до встречи. В этом случае я верну вам деньги, или мы просто подберём другое время. При отмене встречи менее чем за 24 часа — деньги не возвращаются.',
  },
];

const onlineFormat = [
  {
    icon: '/assets/images/icons/globe.svg',
    title: 'Онлайн-встречи',
    text: '50 или 90 минут',
  },
  {
    icon: '/assets/images/icons/video.svg',
    title: 'Мы встречаемся по видеосвязи',
    text: 'За 5–10 минут до встречи я пришлю вам ссылку на видеовстречу (<u>ничего скачивать не нужно</u>, ссылка откроется в вашем браузере)',
  },
  {
    icon: '/assets/images/icons/meeting.svg',
    title: 'С заботой о себе',
    text: 'Вам понадобится только тихое место и интернет',
  },
];

const defaultPrices = [
  {
    title: 'Индивидуальная консультация',
    mid: '50 мин<br />Стандартное время консультации, подходит в большинстве случаев',
    amount: '4 500 ₽',
  },
  {
    title: 'Индивидуальная консультация (1,5 часа)',
    mid: '90 мин<br />Если чувствуете, что вам нужно больше времени для себя в текущих жизненных обстоятельствах',
    amount: '7 000 ₽',
  },
  {
    title: '<a href="/family/">Семейная (парная) консультация</a>',
    mid: '90 мин<br />Формат для пары или семьи, когда важно услышать друг друга, наладить диалог и двигаться к изменениям вместе',
    amount: '7 000 ₽',
  },
];

const packageBoth = `При оплате 5 консультаций одним платежом:<br />
              5 сессий по 50 минут — 18 000 ₽ <s>вместо 22 500 ₽</s><br />
              5 сессий по 90 минут — 28 000 ₽ <s>вместо 35 000 ₽</s>`;

const pages = [
  {
    dir: 'psikholog-v-kaliningrade',
    title: 'Психолог в Калининграде — Анна Щеголихина | ТЕСТ',
    description:
      'Психолог в Калининграде: помощь взрослым и парам при тревоге и сложностях в отношениях.',
    heroHeadline:
      'Помогаю взрослым и парам справляться с <em class="accent">тревогой и сложностями в отношениях</em>',
    heroDescr: 'Анна Щеголихина<br />семейный и клинический психолог в Калининграде (Кирова, 1)',
    quote1:
      'Вы не обязаны справляться со всем в одиночку. Я здесь — <em class="quote-em-strong">для вас</em>',
    requestsTitle: 'Специализируюсь на таких запросах',
    requests: [
      { title: 'Тревога и стресс', text: 'Постоянное напряжение, тревожные мысли, выгорание, ощущение, что внутри слишком много всего' },
      { title: 'Сложности в отношениях', text: 'Конфликты, недопонимание, ощущение что вас не слышат' },
      { title: 'Самооценка и самореализация', text: 'Сомнения в себе, синдром самозванца, страх проявляться, перфекционизм, поиск себя' },
      { title: 'Расставание или измена', text: 'Когда отношения рушатся и нужно пережить это бережно' },
    ],
    invite: 'А вы хотите разобраться в своей ситуации?',
    inviteCta: 'Запишитесь на консультацию',
    changes: [
      { title: 'Понимание себя', text: 'Вы начнёте лучше понимать свои реакции, чувства и потребности' },
      { title: 'Спокойствие', text: 'Тревога становится меньше, появляется больше внутренней опоры' },
      { title: 'Умение говорить о сложном', text: 'Без скандалов, избегания и эмоциональных взрывов' },
      { title: 'Чёткие границы', text: 'Становится проще говорить «нет» и защищать свои потребности' },
      { title: 'Ясность в отношениях', text: 'Понимание, что происходит между вами и партнёром' },
    ],
    quote2:
      'Моя задача — не давать советы, а помочь вам <em class="quote-em-strong">услышать себя и найти свою опору</em>',
    prices: defaultPrices,
    packageHtml: packageBoth,
    format: [
      {
        icon: '/assets/images/icons/meeting.svg',
        title: 'Очные консультации в Калининграде',
        text: 'В центре города (400 м от Северного вокзала): Кирова, 1',
      },
      {
        icon: '/assets/images/icons/video.svg',
        title: 'Онлайн-встречи по видеосвязи',
        text: 'За 5–10 минут до встречи я пришлю вам ссылку на видеовстречу (<u>ничего скачивать не нужно</u>, ссылка откроется в вашем браузере)',
      },
      {
        icon: '/assets/images/icons/globe.svg',
        title: 'С заботой о себе',
        text: '50 или 90 минут посвящены вам или вашей паре, вашим переживаниям и поиску новых смыслов',
      },
    ],
    quote3:
      'Иногда достаточно одного разговора со специалистом, чтобы <em class="quote-em-strong">многое стало яснее</em>',
    faq: defaultFaq,
  },
  {
    dir: 'it',
    title: 'Психолог для IT-специалистов — Анна Щеголихина | ТЕСТ',
    description:
      'Психолог для IT-специалистов: помощь при выгорании, тревоге и сложностях в отношениях.',
    heroHeadline:
      'Помогаю IT-специалистам справляться с <em class="accent">выгоранием, тревогой и сложностями в отношениях</em>',
    heroDescr:
      'Анна Щеголихина<br />семейный и клинический психолог<br />По первому образованию — магистр прикладной математики и информатики',
    quote1:
      'Вы не обязаны справляться со всем в одиночку. Я здесь — <em class="quote-em-strong">для вас</em>',
    requestsTitle: 'Специализируюсь на таких запросах',
    requests: [
      { title: 'Выгорание и постоянное напряжение', text: 'Работа без остановки, усталость, ощущение что «ресурса больше нет»' },
      { title: 'Сложности в отношениях', text: 'Конфликты с партнёром, ощущение что вас не понимают ИЛИ отсутствие отношений' },
      { title: 'Самооценка и синдром самозванца', text: 'Страх ошибок, перфекционизм, ощущение, что вы недостаточно хороши' },
      { title: 'Одиночество и изоляция', text: 'Когда работа занимает большую часть жизни и не хватает близости' },
    ],
    invite: 'Хотите разобраться в своей ситуации?',
    inviteCta: 'Запишитесь на онлайн-консультацию',
    changes: [
      { title: 'Понимание себя', text: 'Лучше понимать свои реакции, состояние и перегрузки' },
      { title: 'Спокойствие', text: 'Фоновое напряжение и тревога постепенно уменьшаются' },
      { title: 'Умение говорить о сложном', text: 'Проще обсуждать проблемы без конфликтов и ухода в себя' },
      { title: 'Чёткие границы', text: 'Проще отделять работу от личной жизни и не жить только задачами' },
      { title: 'Ясность в отношениях', text: 'Понимание, что происходит между вами и партнёром' },
    ],
    quote2:
      'Моя задача — не давать советы, а помочь вам <em class="quote-em-strong">разобраться в себе и найти внутренние решения</em>',
    prices: defaultPrices,
    packageHtml: packageBoth,
    format: onlineFormat,
    quote3:
      'Иногда достаточно одного разговора со специалистом, чтобы <em class="quote-em-strong">многое стало яснее</em>',
    faq: defaultFaq,
  },
  {
    dir: 'parting',
    title: 'Психолог при расставании и разводе — Анна Щеголихина | ТЕСТ',
    description:
      'Психолог при расставании и разводе: помощь пережить разрыв и восстановить внутреннюю опору.',
    heroHeadline:
      'Помогаю пережить <em class="accent">разрыв отношений</em> и восстановить внутреннюю опору',
    heroDescr: 'Анна Щеголихина<br />семейный и клинический психолог',
    quote1:
      'Когда расставание ощущается так, будто жизнь рушится, важно не оставаться с этим в одиночку. Я здесь — <em class="quote-em-strong">для вас</em>',
    requestsTitle: 'Специализируюсь на запросах при расставании',
    requests: [
      { title: 'Эмоциональная боль после расставания', text: 'Ощущение пустоты, сильная тоска, тревога, мысли о прошлом и о том, что всё могло быть иначе' },
      { title: 'Развод и сложные решения', text: 'Когда нужно принимать важные решения и при этом сохранять внутреннюю устойчивость' },
      { title: 'Навязчивые мысли о партнёре', text: 'Трудно перестать прокручивать разговоры, воспоминания и сценарии «что если»' },
      { title: 'Потеря опоры и самооценки', text: 'Кажется, что часть жизни исчезла и сложно понять, как двигаться дальше' },
    ],
    invite: 'Хотите разобраться в своей ситуации?',
    inviteCta: 'Запишитесь на онлайн-консультацию',
    changes: [
      { title: 'Понимание происходящего', text: 'Вы начинаете лучше понимать свои чувства, реакции и то, что произошло в отношениях' },
      { title: 'Меньше эмоциональной боли', text: 'Острота переживаний постепенно снижается, становится легче дышать и жить дальше' },
      { title: 'Спокойные решения', text: 'Появляется больше ясности в вопросах развода, общения с партнёром и будущего' },
      { title: 'Возвращение опоры', text: 'Постепенно возвращается ощущение устойчивости и контроля над своей жизнью' },
      { title: 'Возможность двигаться дальше', text: 'Прошлое перестаёт занимать всё пространство, появляется место для новой жизни' },
    ],
    quote2:
      'Моя задача — не давать советы, а помочь вам <em class="quote-em-strong">прожить этот период и постепенно восстановить внутреннюю опору</em>',
    prices: [
      {
        title: 'Индивидуальная консультация',
        mid: '50 мин<br />Стандартное время консультации, подходит в большинстве случаев',
        amount: '4 500 ₽',
      },
      {
        title: 'Индивидуальная консультация (1,5 часа)',
        mid: '90 мин<br />Если чувствуете, что вам нужно больше времени для себя в текущих жизненных обстоятельствах',
        amount: '7 000 ₽',
      },
    ],
    packageHtml: packageBoth,
    format: onlineFormat,
    quote3:
      'Иногда достаточно одного разговора со специалистом, чтобы <em class="quote-em-strong">многое стало яснее</em>',
    faq: defaultFaq,
  },
  {
    dir: 'bloggers',
    title: 'Психолог для блогеров и экспертов — Анна Щеголихина | ТЕСТ',
    description:
      'Психолог для блогеров и экспертов: помощь при выгорании, тревоге и потере себя.',
    heroHeadline:
      'Помогаю Блогерам и Экспертам справляться с <em class="accent">выгоранием, тревогой и потерей себя</em>',
    heroDescr: 'Анна Щеголихина<br />семейный и клинический психолог',
    quote1:
      'Вы не обязаны справляться со всем в одиночку. Я здесь — <em class="quote-em-strong">для вас</em>',
    requestsTitle: 'Специализируюсь на запросах блогеров',
    requests: [
      { title: 'Эмоциональное выгорание', text: 'Контент перестает радовать, а каждая публикация требует все больше усилий. Хочется отдохнуть, но страшно потерять аудиторию, результаты и доход' },
      { title: 'Страх оценки и зависимость от мнения других', text: 'Настроение, уверенность в себе и отношение к собственной работе начинают зависеть от комментариев, охватов, просмотров и реакции подписчиков' },
      { title: 'Сложности в отношениях и личных границах', text: 'Близким может быть трудно принимать постоянное присутствие социальных сетей в жизни. Возникают конфликты, обиды, ощущение, что работа начинает занимать слишком много места в отношениях' },
      { title: 'Потеря уверенности и синдром самозванца', text: 'Кажется, что вы недостаточно экспертны, интересны или талантливы, несмотря на реальные достижения и признание аудитории' },
    ],
    invite: 'Хотите разобраться в своей ситуации?',
    inviteCta: 'Запишитесь на онлайн-консультацию',
    changes: [
      { title: 'Меньше тревоги', text: 'Будет проще справляться с переживаниями, напряжением и постоянным внутренним давлением' },
      { title: 'Спокойнее к критике', text: 'Негативные комментарии и чужие оценки перестанут выбивать из колеи на дни или недели' },
      { title: 'Больше уверенности', text: 'Вы начнете больше доверять себе и своим решениям, не оглядываясь постоянно на реакцию окружающих' },
      { title: 'Чёткие границы', text: 'Станет легче отстаивать свои интересы, говорить «нет» и не подстраиваться под всех вокруг' },
      { title: 'Понимание себя', text: 'Сможете лучше слышать собственные желания и выбирать то, что действительно важно именно для вас' },
    ],
    quote2:
      'Моя задача — не давать ответы, а помочь вам <em class="quote-em-strong">разобраться в себе и найти собственные решения</em>',
    prices: defaultPrices,
    packageHtml: packageBoth,
    format: onlineFormat,
    quote3:
      'Иногда достаточно одного разговора со специалистом, чтобы <em class="quote-em-strong">многое стало яснее</em>',
    faq: [
      {
        q: 'Нужно ли быть популярным блогером, чтобы обратиться?',
        a: 'Нет. Ко мне обращаются люди с разной аудиторией и разным опытом ведения социальных сетей.',
      },
      {
        q: 'Можно ли обратиться, если я только хочу начать вести блог?',
        a: 'Да. Часто работа касается не самого блога, а страхов оценки, критики, ошибок или публичности.',
      },
      ...defaultFaq,
    ],
  },
];

function buildPage(p) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${p.title}</title>
  <meta name="description" content="${p.description}" />
  <meta name="robots" content="noindex, nofollow" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="stylesheet" href="/assets/site.css?v=20260806b" />
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
<body id="top">
  <div class="banner-test">ТЕСТОВЫЙ САЙТ · <strong>muzhskoy-psikholog.ru</strong> · не индексируется · боевой пока на anna-psy.online</div>
  ${header()}

  <main>
    <section class="hero hero-with-photo">
      <div class="wrap hero-grid fade-in">
        <div>
          <h1 class="hero-headline">${p.heroHeadline}</h1>
          <p class="hero-descr">${p.heroDescr}</p>
          <div class="cta-row">
            <a class="btn btn-primary" href="#booking">Записаться на консультацию</a>
          </div>
        </div>
        <div class="hero-visual">
          <img class="hero-photo" src="/assets/images/hero-portrait.webp" alt="Психолог Анна Щеголихина" width="720" height="900" />
        </div>
      </div>
    </section>

    ${quoteBand(p.quote1)}

    ${requestRows(p.requestsTitle, p.requests)}

    <section class="cta-invite" aria-label="Приглашение">
      <div class="wrap cta-invite-inner">
        <p>${p.invite}</p>
        <a class="btn btn-primary" href="#booking">${p.inviteCta}</a>
      </div>
    </section>

    <section class="section section-white" id="results">
      <div class="wrap">
        <h2>Ваши изменения всего через несколько месяцев</h2>
        <p class="section-lead section-lead-note">*ниже приведены часто называемые изменения в долгосрочной терапии (ваша ситуация уникальна, поэтому субъективные результаты могут отличаться)</p>
        <div class="change-cards">
          ${changeCards(p.changes)}
        </div>
      </div>
    </section>

    ${quoteBand(p.quote2)}

    ${reviewsBlock()}

    ${leaveReview()}

    ${pricingBlock(p.prices, p.packageHtml)}

    ${aboutBlock()}

    ${howBlock()}

    ${formatBlock(p.format)}

    ${quoteBand(p.quote3)}

    ${bookingBlock()}

    ${contactBlock()}

    ${faqBlock(p.faq)}

    <section class="cta-invite cta-doubts" aria-label="Связаться при сомнениях">
      <div class="wrap cta-invite-inner">
        <p>Остались сомнения или страхи?</p>
        <a class="btn btn-primary" href="#contact">Свяжитесь со мной ⤴︎</a>
      </div>
    </section>

    ${blogBlock()}
  </main>

  ${footer()}
</body>
</html>
`;
}

for (const p of pages) {
  const out = path.join(root, p.dir, 'index.html');
  fs.writeFileSync(out, buildPage(p), 'utf8');
  console.log('wrote', out);
}

console.log('done');
