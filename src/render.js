export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const e = escapeHtml;
const icon = name => `<img class="icon" src="assets/icons/${name}.svg" alt="" aria-hidden="true" width="24" height="24">`;
const list = items => `<ul class="text-list">${items.map(item => `<li>${e(item)}</li>`).join('')}</ul>`;
const nav = () => '<a href="#about">О курсе</a><a href="#works">Работы студентов</a><a href="#program">Программа</a><a href="#contacts">Контакты</a>';
const brand = () => '<a class="brand-lockup" href="#top" aria-label="ШАГ и Astana Hub — к началу страницы"><img class="step-logo" src="assets/brand/step-white.svg" alt="Компьютерная Академия ШАГ" width="100" height="108"><span class="brand-divider" aria-hidden="true"></span><img class="hub-logo" src="assets/brand/astana-hub-white.svg" alt="Astana Hub participant" width="259" height="54"></a>';
const cta = (label, extra = '') => `<a class="button button-primary ${extra}" href="#consultation">${e(label)}${icon('arrow-right')}</a>`;
const heading = (label, title, intro = '') => `<div class="section-heading"><p class="eyebrow">${e(label)}</p><h2>${e(title)}</h2>${intro ? `<p class="section-intro">${e(intro)}</p>` : ''}</div>`;
const external = item => `<a href="${e(item.href)}">${e(item.label)}${icon('arrow-up-right')}</a>`;

export function pageMarkup(c) {
  return `<a class="skip-link" href="#main-content">Перейти к содержанию</a>
  <header class="site-header" id="top"><div class="container header-inner">
    ${brand()}<nav class="desktop-nav" aria-label="Основная навигация">${nav()}</nav>
    <a class="header-phone" href="${e(c.contacts.phones[0].href)}" aria-label="Позвонить ${e(c.contacts.phones[0].label)}">${icon('phone')}<span>${e(c.contacts.phones[0].label)}</span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Открыть меню" hidden>${icon('list')}</button>
  </div><nav id="mobile-nav" class="mobile-nav container" aria-label="Мобильная навигация" hidden>${nav()}<a href="#consultation">${e(c.consultationLabel)}</a></nav></header>
  <main id="main-content">
    <section class="hero container" aria-labelledby="hero-title">
      <div class="hero-copy"><p class="eyebrow">IT STEP · АЛМАТЫ</p>
        <h1 id="hero-title">Графический<br>дизайн <span>+ AI</span></h1>
        <p class="hero-description">${e(c.courseBenefits[0])}</p>
        <div class="hero-meta"><span>${c.durationMonths} месяцев</span><span>${e(c.format)}</span></div>
        <div class="hero-actions">${cta(c.consultationLabel, 'hero-cta')}<a class="button button-outline" href="#program">Программа курса${icon('arrow-right')}</a></div>
      </div>
      <figure class="hero-visual"><img src="assets/images/hero.webp" width="1100" height="1209" fetchpriority="high" alt="Дизайнерский постер с оранжевой фактурной скульптурой и хромированным шаром"></figure>
    </section>
    <div class="container hero-highlights" aria-label="Результаты курса">${c.outcomes.map((x,i) => `<div>${icon(['certificate','stack','cube'][i])}<span>${e(x.title)}</span></div>`).join('')}</div>

    <section class="section container" id="about" aria-labelledby="about-title">
      <div class="section-heading"><p class="eyebrow">ДЛЯ КОГО</p><h2 id="about-title">Кому подойдет онлайн-курс. <br>из графического дизайна?</h2></div>
      <div class="audience-grid" role="region" aria-label="Кому подойдёт курс — карточки" tabindex="0">${c.audiences.map((a,i) => `<article class="audience-card"><span class="large-index" aria-hidden="true">0${i+1}</span><h3>${e(a.title)}</h3>${list(a.items)}</article>`).join('')}</div>
    </section>

    <section class="section profession-section" id="profession"><div class="container">
      ${heading('ПРОФЕССИЯ','Преимущества будущего профессии графического дизайнера',c.introduction)}
      <div class="benefit-grid">${c.professionBenefits.map((b,i) => `<article class="benefit-row"><span class="row-number">0${i+1}</span><div><h3>${e(b.title)}</h3><p>${e(b.text)}</p></div></article>`).join('')}</div>
    </div></section>

    <section class="section container" id="skills">
      ${heading('НАВЫКИ И ИНСТРУМЕНТЫ','До конца курса у вас будет. профессиональное резюме')}
      <div class="skills-layout"><div><h3 class="small-heading">Навыки</h3><ul class="skills-list">${c.skills.map(s => `<li>${icon('check-circle')}<span>${e(s)}</span></li>`).join('')}</ul></div>
        <aside class="tool-panel"><h3 class="small-heading">Инструменты</h3><div class="tool-list">${c.tools.map((t,i) => `<span><span class="tool-index" aria-hidden="true">0${i+1}</span>${e(t)}</span>`).join('')}</div><img class="editorial-detail" src="assets/images/editorial.webp" alt="Композиция из оранжево-чёрного и кремового дизайнерских постеров" width="1600" height="701" loading="lazy"></aside>
      </div>
    </section>

    <section class="section container" id="career">${heading('РАЗВИТИЕ','Ваша карьерная траектория')}
      <div class="career-grid">${c.career.map((x,i) => `<article><span class="eyebrow">0${i+1}</span><h3>${e(x.title)}</h3><p>${e(x.text)}</p><p class="salary">${e(x.salary)}</p></article>`).join('')}</div>
    </section>

    <section class="section works-section" id="works"><div class="container">
      ${heading('ПОРТФОЛИО','Работы наших студентов')}
      <div class="work-gallery">${c.studentWorks.map((w,i) => `<figure class="student-work"><a href="${e(w.src)}" target="_blank" rel="noopener noreferrer" aria-label="Открыть работу студента ${i+1} на сайте IT STEP"><img data-original-work src="${e(w.src)}" alt="${e(w.alt)}" width="580" height="580" loading="lazy"><span class="image-fallback" hidden>Работа ${i+1} · открыть оригинал${icon('arrow-up-right')}</span></a><figcaption><span>IT STEP</span><span>0${i+1}</span></figcaption></figure>`).join('')}</div>
      <a class="text-link" href="${e(c.source)}">Графический Дизайн + AI${icon('arrow-up-right')}</a>
    </div></section>

    <section class="section container" id="benefits">${heading('ПОДХОД К ОБУЧЕНИЮ','Почему следует выбрать курс')}
      <div class="course-benefits">${c.courseBenefits.map((text,i) => `<article>${icon(['cube','stack','certificate'][i])}<h3>${e(text)}</h3></article>`).join('')}</div>
      <figure class="editorial-figure"><img src="assets/images/editorial.webp" alt="Декоративные дизайнерские постеры в оранжевой, чёрной и кремовой палитре" width="1600" height="701" loading="lazy"></figure>
      <h3 class="industry-title">Востребованность в разных сферах</h3><ul class="industry-list">${c.industries.map(x => `<li>${e(x)}</li>`).join('')}</ul>
    </section>

    <section class="section programme-section" id="program"><div class="container">
      <div class="program-header">${heading('ПРОГРАММА','Что вы будете учить на курсе Графический дизайн +')}
        <div class="program-meta"><strong>${c.durationMonths}<span>месяцев</span></strong><p>${e(c.format)}</p></div></div>
      <p class="programme-intro">${e(c.programmeIntroduction)}</p>
      <div class="module-list">${c.modules.map((m,i) => `<details class="module" data-module="${i+1}"${i===0?' open':''}><summary><span class="module-number">0${i+1}</span><span class="module-title"><span class="module-prefix">Модуль ${i+1}</span>${e(m.title)}</span><span class="topic-count">${m.topics.length} ${i===2?'темы':i===3||i===4?'тем':'темы'}</span>${icon('plus')}</summary><div class="module-content">${list(m.topics)}</div></details>`).join('')}</div>
      <button class="button button-outline show-modules" type="button" aria-controls="program" hidden>Показать еще${icon('plus')}</button>
    </div></section>

    <section class="section container" id="results">${heading('РЕЗУЛЬТАТ','Что вы получите после курса?')}
      <div class="outcomes-grid" role="region" aria-label="Что вы получите после курса — карточки" tabindex="0">${c.outcomes.map((x,i) => `<article class="outcome outcome-${i+1}">${icon(['certificate','stack','cube'][i])}<h3>${e(x.title)}</h3><p>${e(x.text)}</p>${i===0?`<a class="certificate-link" href="${e(c.certificateImage)}" target="_blank" rel="noopener noreferrer"><img data-original-work src="${e(c.certificateImage)}" width="568" height="400" alt="Сертификат ITSTEP Academy с исходной страницы курса" loading="lazy"><span class="image-fallback" hidden>Открыть сертификат на сайте IT STEP${icon('arrow-up-right')}</span></a>`:''}</article>`).join('')}</div>
    </section>

    <section class="section container" id="start">${heading('СЛЕДУЮЩИЙ ШАГ','Почему стоит записаться на курс сейчас?')}
      <div class="reasons-list">${c.reasonsToStart.map((r,i)=>`<article><span class="row-number">0${i+1}</span><div><h3>${e(r.title)}</h3><p>${e(r.text)}</p></div></article>`).join('')}</div>
    </section>

    <section class="section container faq-section" id="faq">${heading('АКТУАЛЬНЫЕ ВОПРОСЫ','Часто задаваемые вопросы')}
      <div>${c.faq.map((f,i)=>`<details class="faq-item" data-faq="${i+1}"><summary>${e(f.question)}${icon('plus')}</summary><p>${e(f.answer)}</p></details>`).join('')}</div>
    </section>

    <section class="section container" id="consultation" aria-labelledby="consultation-title"><div class="consultation-panel"><div><p class="eyebrow">ГРАФИЧЕСКИЙ ДИЗАЙН + AI</p><h2 id="consultation-title">${e(c.consultationLabel)}</h2><p>${e(c.faq[2].answer)}</p></div><div class="consultation-actions"><a class="button button-consultation" href="${e(c.contacts.phones[0].href)}">${e(c.contacts.phones[0].label)}${icon('phone')}</a><a class="consultation-email" href="mailto:${e(c.contacts.email)}">${e(c.contacts.email)}${icon('arrow-up-right')}</a></div></div></section>

    <section class="section container contact-section" id="contacts">${heading('АЛМАТЫ','Контакты')}
      <div class="campus-grid">${c.contacts.addresses.map((address,i)=>`<article class="campus"><div class="campus-title">${icon('map-pin')}<h3>${e(address)}</h3></div><p class="muted">Приемная комиссия</p><div class="campus-phones">${c.contacts.phones.map(p=>`<a href="${e(p.href)}">${e(p.label)}</a>`).join('')}</div><a class="email-link" href="mailto:${e(c.contacts.email)}">${e(c.contacts.email)}</a><p class="campus-hours">${e(c.contacts.hours)}</p></article>`).join('')}</div>
    </section>
  </main>
  <footer class="site-footer"><div class="container"><div class="footer-top">${brand()}<a class="back-to-top" href="#top">Наверх${icon('arrow-up-right')}</a></div><div class="footer-grid"><div><h2>Курсы</h2><div class="footer-course-links">${c.links.courses.map(external).join('')}</div></div><div><h2>Об Академии IT STEP</h2><div class="footer-academy-links">${c.links.academy.map(external).join('')}</div></div></div><div class="footer-bottom"><p>${e(c.copyright)}</p><div>${external(c.links.offer)}${external(c.links.privacy)}</div></div></div></footer>
  <div class="mobile-quickbar" hidden>${cta(c.consultationLabel)}</div>
  <noscript><nav class="nojs-nav container" aria-label="Навигация без JavaScript">${nav()}</nav></noscript>`;
}

export function renderCourseContent(root, content) {
  root.innerHTML = pageMarkup(content);
}
