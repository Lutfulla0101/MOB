/* MOB — bosh sahifa */
(() => {
  'use strict';
  const { $, $$, escapeHtml, countByCat, toast, cardHtml, onFavChange, initSearch, init } = MOB;

  const POPULAR_COUNT = 8;
  const SLIDE_INTERVAL_MS = 5000;
  const SWIPE_PX = 50;
  const PHONE_RE = /^\+?998\d{9}$/;

  const renderCats = () => {
    $('#cats').innerHTML = CATEGORIES.map((c) => `
      <a class="cat" href="catalog.html${c.id === 'all' ? '' : `?cat=${c.id}`}">
        <img src="${IMG_DIR}${c.cover}.webp" alt="" loading="lazy">
        <span>${escapeHtml(c.name)} <small>(${countByCat(c.id)})</small></span>
      </a>`).join('');
  };

  const renderPopular = () => {
    const top = PRODUCTS.slice().sort((a, b) => b.popularity - a.popularity).slice(0, POPULAR_COUNT);
    $('#productGrid').innerHTML = top.map(cardHtml).join('');
  };

  const initSlider = () => {
    const slides = $$('.hero__slide');
    const dots = $('#heroDots');
    dots.innerHTML = slides.map((_, i) => `<button aria-label="${i + 1}-slayd"></button>`).join('');
    let current = 0;
    let timer;
    const go = (i) => {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('active', k === current));
      [...dots.children].forEach((d, k) => d.classList.toggle('active', k === current));
      clearInterval(timer);
      timer = setInterval(() => go(current + 1), SLIDE_INTERVAL_MS);
    };
    $('#heroPrev').addEventListener('click', () => go(current - 1));
    $('#heroNext').addEventListener('click', () => go(current + 1));
    dots.addEventListener('click', (e) => { const i = [...dots.children].indexOf(e.target); if (i >= 0) go(i); });
    const hero = $('.hero');
    let startX = 0;
    hero.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > SWIPE_PX) go(current + (dx < 0 ? 1 : -1));
    });
    go(0);
  };


  const validateForm = (form) => {
    const data = Object.fromEntries(new FormData(form));
    const name = String(data.name || '').trim();
    const phone = String(data.phone || '').replace(/[\s()-]/g, '');
    const nameOk = name.length >= 2;
    const phoneOk = PHONE_RE.test(phone);
    form.elements.name.classList.toggle('invalid', !nameOk);
    form.elements.phone.classList.toggle('invalid', !phoneOk);
    if (!nameOk) return { error: 'Iltimos, ismingizni kiriting (kamida 2 harf).' };
    if (!phoneOk) return { error: "Telefon raqam noto'g'ri. Namuna: +998 90 123 45 67" };
    return { name };
  };

  const initForm = () => {
    const form = $('#contactForm');
    if (!form) return;
    const preset = new URLSearchParams(window.location.search).get('product');
    if (preset) $('#formProduct').value = preset.slice(0, 120);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = validateForm(form);
      $('#formError').textContent = result.error || '';
      if (result.error) return;
      form.reset();
      toast(`Rahmat, ${result.name}! Arizangiz qabul qilindi. Tez orada qo'ng'iroq qilamiz.`);
    });
  };

  /* Scroll-spy: qaysi bo'lim ko'rinib tursa, nav'dagi mos havola active bo'ladi */
  const SPY_OFFSET_PX = 140;
  const SPY_MAP = [
    ['home', 'index.html'],
    ['about', 'index.html#about'],
    ['contact', 'index.html#contact'],
  ];
  const initScrollSpy = () => {
    const sections = SPY_MAP.map(([id, href]) => ({ el: document.getElementById(id), href }));
    const links = $$('.nav__link');
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY + SPY_OFFSET_PX;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const current = atBottom
        ? sections[sections.length - 1]
        : sections.filter((s) => s.el.offsetTop <= y).pop() || sections[0];
      links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === current.href));
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  };

  init();
  initSearch();
  initScrollSpy();
  renderCats();
  renderPopular();
  onFavChange(renderPopular);
  initSlider();
  initForm();
})();
