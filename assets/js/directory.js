/* Instant search, category filtering and sorting for the business directory.
   Progressive enhancement: every card is in the HTML already, so the page is
   fully usable with JavaScript switched off. */
(function () {
  'use strict';

  var root = document.getElementById('directory');
  if (!root) return;

  var input = document.getElementById('directorySearch');
  var searchWrap = document.getElementById('directorySearchWrap');
  var clearBtn = document.getElementById('directoryClear');
  var sortSelect = document.getElementById('directorySort');
  var chips = Array.prototype.slice.call(root.querySelectorAll('[data-category-chip]'));
  var groups = Array.prototype.slice.call(root.querySelectorAll('[data-category-group]'));
  var flatGrid = document.getElementById('directoryFlat');
  var countEl = document.getElementById('directoryCount');
  var emptyEl = document.getElementById('directoryEmpty');
  var resetBtn = document.getElementById('directoryReset');
  var cards = Array.prototype.slice.call(root.querySelectorAll('[data-business]'));

  var state = { query: '', category: '', sort: 'category' };

  /* Fold accents and punctuation so "Jose's Cafe" matches "jose cafe". */
  function normalise(value) {
    var s = String(value == null ? '' : value).toLowerCase();
    if (s.normalize) s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return s.replace(/[^a-z0-9]+/g, ' ').trim();
  }

  // Cache each card's haystack once rather than re-reading the DOM per keystroke.
  cards.forEach(function (card) {
    card._haystack = normalise(card.getAttribute('data-search'));
    card._name = normalise(card.getAttribute('data-name'));
    card._category = card.getAttribute('data-category') || '';
    card._home = card.parentNode;
  });

  function matches(card) {
    if (state.category && card._category !== state.category) return false;
    if (!state.query) return true;
    // Every term must appear somewhere in the card, in any order.
    return state.query.split(' ').every(function (term) {
      return card._haystack.indexOf(term) !== -1;
    });
  }

  function render() {
    var visible = 0;

    cards.forEach(function (card) {
      var show = matches(card);
      card.hidden = !show;
      if (show) visible++;
    });

    var flat = state.sort === 'name';

    if (flat) {
      // Pull matching cards into one alphabetical list.
      var shown = cards.filter(function (c) { return !c.hidden; });
      shown.sort(function (a, b) { return a._name.localeCompare(b._name); });
      shown.forEach(function (c) { flatGrid.appendChild(c); });
      flatGrid.hidden = false;
      groups.forEach(function (g) { g.hidden = true; });
    } else {
      // Put cards back in their category, then hide categories with no matches.
      cards.forEach(function (card) {
        if (card.parentNode !== card._home) card._home.appendChild(card);
      });
      flatGrid.hidden = true;
      groups.forEach(function (group) {
        var any = Array.prototype.some.call(
          group.querySelectorAll('[data-business]'),
          function (c) { return !c.hidden; }
        );
        group.hidden = !any;
      });
    }

    if (countEl) {
      var noun = visible === 1 ? 'business' : 'businesses';
      var suffix = '';
      if (state.category) suffix += ' in ' + state.category;
      if (state.query) suffix += ' matching “' + input.value.trim() + '”';
      countEl.innerHTML = '<strong>' + visible + '</strong> ' + noun + suffix;
    }

    if (emptyEl) emptyEl.hidden = visible !== 0;

    chips.forEach(function (chip) {
      var value = chip.getAttribute('data-category-chip');
      chip.setAttribute('aria-pressed', String(value === state.category));
    });

    if (searchWrap) searchWrap.classList.toggle('has-value', !!input.value);

    syncUrl();
  }

  /* Keep the address bar in step so a filtered view can be shared. */
  function syncUrl() {
    if (!window.history || !window.history.replaceState) return;
    var params = new URLSearchParams(window.location.search);
    if (input && input.value.trim()) params.set('q', input.value.trim()); else params.delete('q');
    if (state.category) params.set('category', state.category); else params.delete('category');
    if (state.sort !== 'category') params.set('sort', state.sort); else params.delete('sort');
    var qs = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
  }

  function setQuery(value) {
    if (input) input.value = value;
    state.query = normalise(value);
    render();
  }

  function setCategory(value) {
    state.category = state.category === value ? '' : value;
    render();
  }

  /* --- Wiring ----------------------------------------------------------- */

  if (input) {
    input.addEventListener('input', function () {
      state.query = normalise(input.value);
      render();
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && input.value) {
        e.stopPropagation();
        setQuery('');
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      setQuery('');
      input.focus();
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      setCategory(chip.getAttribute('data-category-chip'));
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      state.sort = sortSelect.value;
      render();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      state.category = '';
      setQuery('');
      if (input) input.focus();
    });
  }

  // "/" focuses search, the way it does in most search-first interfaces.
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
    e.preventDefault();
    input.focus();
    input.select();
  });

  /* --- Restore state from the URL on load ------------------------------- */
  var params = new URLSearchParams(window.location.search);
  var known = chips.map(function (c) { return c.getAttribute('data-category-chip'); });
  var initialCategory = params.get('category') || '';

  if (input && params.get('q')) {
    input.value = params.get('q');
    state.query = normalise(input.value);
  }
  if (initialCategory && known.indexOf(initialCategory) !== -1) state.category = initialCategory;
  if (params.get('sort') === 'name' && sortSelect) {
    state.sort = 'name';
    sortSelect.value = 'name';
  }

  root.classList.add('is-enhanced');
  render();
})();
