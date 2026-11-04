/* MOB — barcha sahifalar uchun umumiy funksiyalar */
const MOB = (() => {
  'use strict';

  const TOAST_MS = 2800;
  const FAV_KEY = 'mob_favs';
  const PHONE_LINK = 'tel:+998901234567';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  /* Qidiruv: apostrof turlari va katta-kichik harf farqi hisobga olinmaydi */
  const SUGGEST_LIMIT = 6;
  const normalize = (s) => String(s).toLowerCase().replace(/[ʻʼ'’‘`´]/g, '').replace(/\s+/g, ' ').trim();
  const matchesQuery = (p, query) => {
    const words = normalize(query).split(' ').filter(Boolean);
    if (!words.length) return true;
    const haystack = normalize(`${p.name} ${p.catLabel} ${p.keywords}`);
    return words.every((w) => haystack.includes(w));
  };
  const countByCat = (catId) => (catId === 'all' ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === catId).length);
  const listeners = [];
  const onFavChange = (fn) => listeners.push(fn);

  /* ---------- Toast ---------- */
  let toastTimer;
  const toast = (msg) => {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), TOAST_MS);
  };

  /* ---------- Sevimlilar (localStorage) ---------- */
  const loadFavs = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.filter((id) => PRODUCTS.some((p) => p.id === id)) : [];
    } catch (err) {
      console.warn("Sevimlilarni o'qib bo'lmadi:", err);
      return [];
    }
  };
  let favs = loadFavs();
  const isFav = (id) => favs.includes(id);
  const toggleFav = (id) => {
    favs = isFav(id) ? favs.filter((f) => f !== id) : [...favs, id];
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (err) { console.warn("Saqlab bo'lmadi:", err); }
    toast(isFav(id) ? "Sevimlilarga qo'shildi ♥" : 'Sevimlilardan olib tashlandi');
    renderFavs();
    listeners.forEach((fn) => fn());
  };

  /* ---------- Mahsulot kartasi ---------- */
  const cardHtml = (p) => `
    <article class="card">
      <div class="card__media" data-open="${p.id}">
        <img src="${p.images[0]}" alt="${escapeHtml(p.name)}" loading="lazy" width="400" height="300">
        <button class="card__fav${isFav(p.id) ? ' on' : ''}" data-fav="${p.id}" aria-label="Sevimlilarga qo'shish">${isFav(p.id) ? '♥' : '♡'}</button>
      </div>
      <div class="card__body">
        <h3 class="card__title" data-open="${p.id}">${escapeHtml(p.name)}</h3>
        <div class="card__bottom"><a href="${PHONE_LINK}" class="btn btn--gold card__call">📞 Qo'ng'iroq qilish</a></div>
      </div>
    </article>`;
  const emptyHtml = "<div class=\"empty\">😔 Hech narsa topilmadi. Boshqa so'z bilan qidirib ko'ring.</div>";

  /* ---------- Modal / drawer ---------- */
  const openLayer = (sel) => {
    $(sel).classList.add('open');
    $(sel).setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLayers = () => {
    $$('.modal.open, .drawer.open').forEach((el) => { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); });
    document.body.style.overflow = '';
  };

  let modalProduct = null;
  const updateModalFav = () => {
    if (!modalProduct) return;
    const on = isFav(modalProduct.id);
    $('#mFav').textContent = on ? '♥' : '♡';
    $('#mFav').classList.toggle('on', on);
  };
  const openModal = (id) => {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    modalProduct = p;
    $('#mImage').src = p.images[0];
    $('#mImage').alt = p.name;
    $('#mThumbs').innerHTML = p.images
      .map((src, i) => `<img src="${src}" alt="" class="${i === 0 ? 'active' : ''}" data-thumb="${src}">`).join('');
    $('#mCat').textContent = p.catLabel;
    $('#mTitle').textContent = p.name;
    updateModalFav();
    openLayer('#productModal');
  };

  const renderFavs = () => {
    $('#favCount').textContent = favs.length;
    const items = PRODUCTS.filter((p) => isFav(p.id));
    $('#favList').innerHTML = items.length
      ? items.map((p) => `<div class="fav-item">
          <img src="${p.images[0]}" alt="${escapeHtml(p.name)}" data-open="${p.id}">
          <div><p>${escapeHtml(p.name)}</p><small>${escapeHtml(p.catLabel)}</small></div>
          <button data-fav="${p.id}" aria-label="O'chirish">×</button></div>`).join('')
      : "<p class=\"empty\">Sevimlilar ro'yxati bo'sh. Mahsulotdagi ♡ belgisini bosing.</p>";
    updateModalFav();
  };

  /* ---------- Header ---------- */
  const initHeader = () => {
    const burger = $('#burger');
    const nav = $('#nav');
    const toggleMenu = (open) => {
      nav.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggleMenu(!nav.classList.contains('open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) toggleMenu(false); });

    let ticking = false;
    const onScroll = () => {
      ticking = false;
      $('#header').classList.toggle('scrolled', window.scrollY > 10);
      $('#toTop').classList.toggle('show', window.scrollY > 600);
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    $('#toTop').addEventListener('click', () => window.scrollTo({ top: 0 }));
    onScroll();
  };

  /* Qidiruv: onQuery berilsa jonli filtr, aks holda katalog sahifasiga o'tadi */
  const initSearch = (onQuery) => {
    const input = $('#searchInput');
    const form = $('#searchForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.classList.remove('open');
      if (onQuery) { onQuery(input.value); return; }
      window.location.href = `catalog.html?q=${encodeURIComponent(input.value.trim())}`;
    });
    if (onQuery) input.addEventListener('input', () => onQuery(input.value));
    else initSuggest(input, form);
    const toggle = document.createElement('button');
    toggle.className = 'icon-btn search-toggle';
    toggle.setAttribute('aria-label', 'Qidiruvni ochish');
    toggle.textContent = '🔍';
    toggle.addEventListener('click', () => { form.classList.toggle('open'); input.focus(); });
    $('#favOpen').before(toggle);
  };

  /* Bosh sahifada: yozish bilan natijalar ro'yxati chiqadi */
  const initSuggest = (input, form) => {
    const box = document.createElement('div');
    box.className = 'suggest';
    box.setAttribute('role', 'listbox');
    form.append(box);
    const hide = () => box.classList.remove('open');
    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (!q) { hide(); return; }
      const found = PRODUCTS.filter((p) => matchesQuery(p, q));
      const items = found.slice(0, SUGGEST_LIMIT).map((p) => `
        <button type="button" class="suggest__item" data-open="${p.id}">
          <img src="${p.images[0]}" alt="" width="56" height="42"><span>${escapeHtml(p.name)}<small>${escapeHtml(p.catLabel)}</small></span>
        </button>`).join('');
      box.innerHTML = found.length
        ? `${items}<a class="suggest__all" href="catalog.html?q=${encodeURIComponent(q)}">Barcha natijalar (${found.length}) →</a>`
        : '<p class="suggest__empty">Hech narsa topilmadi</p>';
      box.classList.add('open');
    });
    input.addEventListener('focus', () => { if (input.value.trim()) input.dispatchEvent(new Event('input')); });
    document.addEventListener('click', (e) => { if (!form.contains(e.target) || e.target.closest('[data-open]')) hide(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  };

  const orderProduct = (name) => {
    const field = $('#formProduct');
    if (!field) { window.open('https://t.me/mebel_online_bozor', '_blank', 'noopener'); return; }
    field.value = name;
    closeLayers();
    document.getElementById('contact').scrollIntoView();
    $('#contactForm').elements.name.focus({ preventScroll: true });
  };

  const initGlobalEvents = () => {
    document.addEventListener('click', (e) => {
      const fav = e.target.closest('[data-fav]');
      if (fav) { e.stopPropagation(); toggleFav(fav.dataset.fav); return; }
      const open = e.target.closest('[data-open]');
      if (open) { closeLayers(); openModal(open.dataset.open); return; }
      const thumb = e.target.closest('[data-thumb]');
      if (thumb) {
        $('#mImage').src = thumb.dataset.thumb;
        $$('#mThumbs img').forEach((t) => t.classList.toggle('active', t === thumb));
        return;
      }
      if (e.target.closest('[data-close]')) closeLayers();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLayers(); });
    $('#favOpen').addEventListener('click', () => openLayer('#favDrawer'));
    $('#mFav').addEventListener('click', () => modalProduct && toggleFav(modalProduct.id));
    $('#mOrder').addEventListener('click', () => modalProduct && orderProduct(modalProduct.name));
  };

  const init = () => {
    initHeader();
    initGlobalEvents();
    renderFavs();
  };

  return Object.freeze({ $, $$, escapeHtml, matchesQuery, countByCat, toast, cardHtml, emptyHtml, onFavChange, initSearch, init });
})();
