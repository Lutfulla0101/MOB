/* MOB — katalog sahifasi: filtrlar URL bilan sinxron */
(() => {
  'use strict';
  const { $, escapeHtml, matchesQuery, countByCat, cardHtml, emptyHtml, onFavChange, initSearch, init } = MOB;

  const PAGE_SIZE = 12;
  const SEARCH_DEBOUNCE_MS = 250;
  const VALID_CATS = CATEGORIES.map((c) => c.id);
  const SORTERS = {
    popular: (a, b) => b.popularity - a.popularity,
    rating: (a, b) => b.rating - a.rating,
    new: (a, b) => Number(b.isNew) - Number(a.isNew),
  };

  const readUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    const sort = params.get('sort');
    return Object.freeze({
      cat: VALID_CATS.includes(cat) ? cat : 'all',
      query: (params.get('q') || '').slice(0, 60),
      sort: SORTERS[sort] ? sort : 'popular',
      onlyNew: params.get('new') === '1',
      limit: PAGE_SIZE,
    });
  };

  let state = readUrl();

  const writeUrl = () => {
    const params = new URLSearchParams();
    if (state.cat !== 'all') params.set('cat', state.cat);
    if (state.query) params.set('q', state.query);
    if (state.sort !== 'popular') params.set('sort', state.sort);
    if (state.onlyNew) params.set('new', '1');
    const qs = params.toString();
    history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  };

  const getFiltered = () => {
    return PRODUCTS
      .filter((p) => state.cat === 'all' || p.cat === state.cat)
      .filter((p) => !state.onlyNew || p.isNew)
      .filter((p) => matchesQuery(p, state.query))
      .slice()
      .sort(SORTERS[state.sort]);
  };

  const renderFilters = () => {
    $('#catFilter').innerHTML = CATEGORIES.map((c) => `
      <li><button class="${state.cat === c.id ? 'active' : ''}" data-cat="${c.id}">
        ${escapeHtml(c.name)} <small>${countByCat(c.id)}</small></button></li>`).join('');
    $('#sortSelect').value = state.sort;
    if (document.activeElement !== $('#filterSearch')) $('#filterSearch').value = state.query;
    if (document.activeElement !== $('#searchInput')) $('#searchInput').value = state.query;
  };

  const render = () => {
    const list = getFiltered();
    $('#productGrid').innerHTML = list.length ? list.slice(0, state.limit).map(cardHtml).join('') : emptyHtml;
    const catName = CATEGORIES.find((c) => c.id === state.cat).name;
    $('#resultInfo').textContent = `${catName}: ${list.length} ta mahsulot`;
    $('#loadMore').style.display = list.length > state.limit ? '' : 'none';
    renderFilters();
    writeUrl();
  };

  const setState = (patch) => {
    state = Object.freeze({ ...state, ...patch });
    render();
  };

  let debounce;
  const setQuery = (value) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => setState({ query: value.slice(0, 60), limit: PAGE_SIZE }), SEARCH_DEBOUNCE_MS);
  };

  const initEvents = () => {
    $('#catFilter').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat]');
      if (btn) setState({ cat: btn.dataset.cat, limit: PAGE_SIZE });
    });
    $('#sortSelect').addEventListener('change', (e) => setState({ sort: e.target.value }));
    $('#filterSearch').addEventListener('input', (e) => setQuery(e.target.value));
    $('#loadMore').addEventListener('click', () => setState({ limit: state.limit + PAGE_SIZE }));
    $('#resetFilters').addEventListener('click', () => setState({ ...readUrlDefaults() }));
    $('#filtersToggle').addEventListener('click', () => $('#filters').classList.toggle('open'));
  };

  const readUrlDefaults = () => ({ cat: 'all', query: '', sort: 'popular', onlyNew: false, limit: PAGE_SIZE });

  init();
  initSearch(setQuery);
  initEvents();
  onFavChange(render);
  render();
})();
