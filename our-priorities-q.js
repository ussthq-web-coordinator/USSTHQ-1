/* ========================================================================
   All For Jesus - page behavior
   Wrapped in an IIFE so nothing leaks into the CMS global scope.
   ======================================================================== */
(function () {
  'use strict';


  /* ---------- Markup this file owns ----------
     Moved out of the HTML to keep the body short enough to paste into the
     CMS. Only chrome lives here - the tile strip, the social icon shapes
     and the lightbox shell. Every section, heading, paragraph and in-page
     image is still in the HTML, so with no JavaScript the page is the full
     document, just without the tile navigation and the enlarge-on-click.
     ------------------------------------------------------------------ */
  var IMG_BASE = 'https://salvationarmysouth.widen.net/content/';
  var IMG_Q = '?w=480&h=320&position=c&color=ffffffff&quality=55&u=ukifzm';

  var TILES = [
    ['afj-at-priorities', 'Three Priorities', 'swepmkcyvh/jpeg/HOUSTON_Hill-Drive-Canteen-26.jpeg'],
    ['afj-at-scripture', 'God’s Call', 'ob2k4mqiro/jpeg/AugustaAreaCommand2022-6404.jpeg'],
    ['afj-at-all', 'How Much Is All?', 'okpwwq98tx/jpeg/_TSA2746.jpeg'],
    ['afj-at-three', 'All For Jesus', 'cczlgjidr0/jpeg/Greenville%20Kroc%20Center-9476.jpeg'],
    ['afj-at-practice', 'In Practice', 'hcxf7jpx0y/jpeg/20220719-Camp%20Grandview-170.jpeg'],
    ['afj-at-reflect', 'Four Passages', 'kawnybwf1n/jpeg/Womens%20Ministries%20Photo-022.jpeg'],
    ['afj-at-require', 'What God Requires', 'rxyags9tqo/jpeg/_TSA9111-1-DeNoiseAI-clear%20copy.jpeg'],
    ['afj-at-share', 'Invite Someone', 'bhcs1b6txo/jpeg/_TSA1236.jpeg'],
    ['afj-at-centennial', 'Centennial Celebration', 'v9td8i9rjx/jpeg/20230711%20-%202023-049_Camp%20Heart%20O%27Hills%20-%200476.jpeg'],
    ['afj-at-prayer', '24/7 Prayer', 'kv0kuztlmg/jpeg/Charleston_SC_Hurricane_Matthew_120.jpeg'],
    ['afj-at-connect', 'Everyone Is Welcome', 'kawnybwf1n/jpeg/Womens%20Ministries%20Photo-022.jpeg'],
    ['afj-at-listen', 'Listen to Soundcast', 'py4vczs0xm/jpeg/CampRappahannock2023-02404.jpeg'],
    ['afj-at-brochure', 'Brochure', 'apfye5dgld/jpeg/Employee%20male%20at%20desk%20computer-5.jpeg'],
    ['afj-at-resources', 'Resources', 'wqstogaykh/jpeg/20230713%20-%202023-050_Camp%20Hidden%20Lake%20-%201818.jpeg'],
    ['afj-at-social', 'Follow Us', 'v9td8i9rjx/jpeg/20230711%20-%202023-049_Camp%20Heart%20O%27Hills%20-%200476.jpeg'],
  ];

  var ICONS = {
    facebook: 'M16.662 1.75c-1.742 0-3.246.531-4.303 1.58-1.056 1.05-1.63 2.587-1.63 4.474v2.468H7.532a.533.533 0 00-.533.532v4.261a.533.533 0 00.533.533h3.195v10.12a.533.533 0 00.533.532h4.26a.532.532 0 00.533-.533v-10.12h3.729a.533.533 0 00.528-.465l.533-4.261a.532.532 0 00-.529-.6h-4.26v-2.13c0-.594.47-1.065 1.065-1.065h3.195a.533.533 0 00.533-.533V2.467a.533.533 0 00-.463-.528c-.47-.062-2.17-.189-3.723-.189zm0 1.065c1.298 0 2.553.104 3.12.157v3.039H17.12c-1.17 0-2.13.96-2.13 2.13v2.663a.533.533 0 00.532.533h4.19l-.4 3.196h-3.79a.533.533 0 00-.533.532v10.12h-3.196v-10.12a.533.533 0 00-.532-.532H8.065v-3.196h3.196a.533.533 0 00.533-.533v-3c0-1.675.49-2.897 1.316-3.719.827-.821 2.023-1.27 3.552-1.27z',
    instagram: 'M8.989 1.75c-3.991 0-7.239 3.248-7.239 7.239V19.01c0 3.991 3.248 7.239 7.239 7.239H19.01c3.991 0 7.239-3.248 7.239-7.239V8.99c0-3.991-3.248-7.239-7.239-7.239H8.99zm0 1.114H19.01a6.117 6.117 0 016.125 6.125V19.01a6.117 6.117 0 01-6.125 6.125H8.99a6.117 6.117 0 01-6.125-6.125V8.99A6.117 6.117 0 018.99 2.865zm11.693 3.34a1.114 1.114 0 100 2.228 1.114 1.114 0 000-2.227zM14 7.876A6.134 6.134 0 007.875 14 6.134 6.134 0 0014 20.125 6.134 6.134 0 0020.125 14 6.134 6.134 0 0014 7.875zm0 1.114A5.003 5.003 0 0119.011 14 5.003 5.003 0 0114 19.011 5.003 5.003 0 018.989 14 5.003 5.003 0 0114 8.989z',
    linkedin: 'M4.946 1.75c-.9 0-1.686.256-2.262.72a2.45 2.45 0 00-.928 1.909c0 1.461 1.309 2.592 3.039 2.66.049.015.1.024.15.025.935 0 1.73-.274 2.298-.759a2.525 2.525 0 00.891-1.955c-.082-1.47-1.39-2.6-3.188-2.6zm0 1.053c1.39 0 2.075.682 2.133 1.59a1.42 1.42 0 01-.519 1.112c-.347.297-.884.506-1.614.506-1.386 0-2.137-.752-2.137-1.632 0-.44.18-.802.537-1.09.356-.287.9-.486 1.6-.486zM2.283 8.135a.533.533 0 00-.533.533v15.445a.533.533 0 00.533.533h5.326a.532.532 0 00.532-.533V8.668a.533.533 0 00-.532-.533H2.283zm7.989 0a.533.533 0 00-.533.533v15.445a.533.533 0 00.533.533h5.326a.532.532 0 00.532-.533v-8.788c0-1.035.829-1.864 1.865-1.864 1.035 0 1.864.829 1.864 1.864v8.788a.532.532 0 00.532.533h5.326a.533.533 0 00.533-.533V15.06c0-2.198-.646-3.939-1.734-5.126-1.089-1.188-2.607-1.798-4.238-1.798-2.08 0-3.337.76-4.148 1.386v-.853a.532.532 0 00-.532-.533h-5.326zM2.815 9.2h4.261v14.38h-4.26V9.2zm7.99 0h4.26v1.406a.533.533 0 00.93.355s1.579-1.76 4.283-1.76c1.37 0 2.572.49 3.453 1.451.88.962 1.454 2.416 1.454 4.407v8.522h-4.261v-8.256a.533.533 0 00-.045-.218c-.118-1.505-1.35-2.711-2.884-2.711a2.938 2.938 0 00-2.93 2.93v8.254h-4.26V9.2z',
    youtube: 'M13.917 5.25c-3.753 0-7.277.284-9.154.682-1.25.284-2.331 1.137-2.558 2.445-.226 1.363-.455 3.41-.455 5.969 0 2.558.226 4.547.51 5.969.23 1.25 1.309 2.16 2.559 2.444 1.992.398 5.4.682 9.153.682s7.162-.284 9.151-.681c1.253-.285 2.332-1.137 2.558-2.445.23-1.422.514-3.467.569-6.025 0-2.558-.284-4.605-.569-6.027-.226-1.25-1.305-2.16-2.558-2.445-1.99-.284-5.456-.568-9.206-.568zm0 1.137c4.092 0 7.388.34 8.98.624.853.229 1.534.797 1.648 1.537.341 1.818.568 3.752.568 5.742-.055 2.443-.34 4.432-.568 5.854-.17 1.079-1.306 1.42-1.648 1.536-2.047.398-5.458.68-8.87.68-3.41 0-6.876-.227-8.866-.68-.853-.228-1.535-.797-1.648-1.536-.455-1.592-.626-3.695-.626-5.798 0-2.616.229-4.548.455-5.74.171-1.082 1.364-1.424 1.648-1.537 1.876-.398 5.345-.682 8.927-.682zm-3.071 3.41v9.096l7.958-4.547-7.958-4.548zm1.137 1.935l4.547 2.614-4.547 2.613v-5.227z',
  };

  /* Social icons: the links and their screen-reader labels are in the HTML,
     only the path data lives here, so the links work regardless. */
  function initSocialIcons() {
    var links = document.querySelectorAll('[data-afj-icon]');
    Array.prototype.forEach.call(links, function (a) {
      var d = ICONS[a.getAttribute('data-afj-icon')];
      if (!d) return;
      var ns = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 28 28');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      var path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      svg.appendChild(path);
      a.appendChild(svg);
    });
  }

  /* The lightbox is a pure JavaScript affordance, so it is built on demand. */
  function buildLightbox() {
    if (document.getElementById('afj-lightbox')) return;
    var box = document.createElement('div');
    box.className = 'afj-lightbox';
    box.id = 'afj-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Enlarged image viewer');
    box.innerHTML =
      '<button type="button" class="afj-lightbox__btn afj-lightbox__close" id="afj-lbClose" aria-label="Close image viewer">&#10006;</button>' +
      '<button type="button" class="afj-lightbox__btn afj-lightbox__prev" id="afj-lbPrev" aria-label="Previous image">&#9664;</button>' +
      '<img id="afj-lbImg" alt="">' +
      '<button type="button" class="afj-lightbox__btn afj-lightbox__next" id="afj-lbNext" aria-label="Next image">&#9654;</button>' +
      '<p class="afj-lightbox__count" id="afj-lbCount" aria-live="polite"></p>';
    document.body.appendChild(box);
  }

  /* Builds the tile strip from TILES. A tile is skipped if its section is
     not on the page, so the strip can never point at nothing. */
  function buildTileStrip(root, panelsWrap) {
    var strip = document.createElement('div');
    strip.className = 'afj-tabs__strip';
    var tabs = [], panels = [];
    TILES.forEach(function (t) {
      var panel = document.getElementById(t[0]);
      if (!panel) return;
      var a = document.createElement('a');
      a.className = 'afj-tab';
      a.href = '#' + t[0];
      var img = document.createElement('img');
      img.className = 'afj-tab__img';
      img.src = IMG_BASE + t[2] + IMG_Q;
      img.alt = '';
      img.width = 480; img.height = 320;
      img.loading = 'lazy'; img.decoding = 'async';
      var label = document.createElement('span');
      label.className = 'afj-tab__label';
      label.textContent = t[1];
      a.appendChild(img); a.appendChild(label);
      strip.appendChild(a);
      tabs.push(a); panels.push(panel);
    });
    if (!tabs.length) return null;
    root.insertBefore(strip, panelsWrap);
    return { strip: strip, tabs: tabs, panels: panels };
  }

  /* ---------- Accessible gallery lightbox ----------
     There is more than one rail on the page now, so the viewer keeps track of
     which rail was opened and steps only through that rail's slides. */
  function initLightbox() {
    buildLightbox();
    var box = document.getElementById('afj-lightbox');
    var rails = [].slice.call(document.querySelectorAll('.afj-rail'));
    if (!box || !rails.length) return;

    var img = document.getElementById('afj-lbImg');
    var count = document.getElementById('afj-lbCount');
    var closeBtn = document.getElementById('afj-lbClose');
    var prevBtn = document.getElementById('afj-lbPrev');
    var nextBtn = document.getElementById('afj-lbNext');

    var slides = [];        // the rail currently being viewed
    var index = 0;
    var lastFocused = null;

    function render() {
      var source = slides[index].querySelector('img');
      img.src = source.src;
      img.alt = source.alt || '';
      count.textContent = (index + 1) + ' of ' + slides.length;
    }

    function open(group, i) {
      slides = group;
      index = i;
      lastFocused = document.activeElement;
      render();
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function close() {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    function step(delta) {
      if (!slides.length) return;
      index = (index + delta + slides.length) % slides.length;
      render();
    }

    rails.forEach(function (rail) {
      var group = [].slice.call(rail.querySelectorAll('.afj-rail__item'));
      group.forEach(function (btn, i) {
        btn.addEventListener('click', function () { open(group, i); });
      });
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { step(-1); });
    nextBtn.addEventListener('click', function () { step(1); });

    box.addEventListener('click', function (e) {
      if (e.target === box) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;

      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
      } else if (e.key === 'Tab') {
        // Keep focus inside the dialog.
        var focusables = [closeBtn, prevBtn, nextBtn];
        var pos = focusables.indexOf(document.activeElement);
        e.preventDefault();
        var next = e.shiftKey ? pos - 1 : pos + 1;
        if (next < 0) next = focusables.length - 1;
        if (next >= focusables.length) next = 0;
        focusables[next].focus();
      }
    });
  }



  /* ---------- Copy buttons on the shareable messages ----------
     The messages themselves are plain selectable text in the HTML, so they
     can always be read and copied by hand. This only adds a one-tap button
     on top, and it has three fallbacks because the async clipboard needs a
     secure context and is blocked inside some CMS preview frames. */
  function initMessages() {
    var msgs = document.querySelectorAll('.afj-msg');
    if (!msgs.length) return;
    var link = (document.querySelector('link[rel="canonical"]') || {}).href || window.location.href;
    link = link.replace(/^http:/, 'https:');

    function copy(text) {
      if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function (resolve, reject) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        if (ok) { resolve(); } else { reject(); }
      });
    }

    Array.prototype.forEach.call(msgs, function (card) {
      var quote = card.querySelector('.afj-msg__text');
      if (!quote) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'afj-msg__copy';
      btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">content_copy</span>' +
                      '<span class="afj-msg__copyTxt">Copy message</span>';

      var live = document.createElement('span');
      live.className = 'afj-sr';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');

      var txt = btn.querySelector('.afj-msg__copyTxt');
      var reset;
      btn.addEventListener('click', function () {
        var body = quote.textContent.trim() + '\n\n' + link;
        copy(body).then(function () {
          btn.classList.add('is-done');
          txt.textContent = 'Copied';
          live.textContent = 'Message copied, with the page link.';
        }, function () {
          txt.textContent = 'Select the text to copy';
          live.textContent = 'Copying was blocked. Select the message text and copy it.';
          var r = document.createRange();
          r.selectNodeContents(quote);
          var s = window.getSelection();
          s.removeAllRanges(); s.addRange(r);
        });
        clearTimeout(reset);
        reset = setTimeout(function () {
          btn.classList.remove('is-done');
          txt.textContent = 'Copy message';
          live.textContent = '';
        }, 4000);
      });

      card.appendChild(btn);
      card.appendChild(live);
    });
  }

  /* ---------- Section tiles: anchors upgraded to tabs ----------
     The markup ships as plain anchor links pointing at the sections, which
     all sit on the page. If this script never runs, that is exactly what you
     get: a grid of links and every section readable. Only once we are sure
     every tile resolves to a real panel do we add the tab roles and start
     hiding things, so content is never hidden by markup alone.

     Two viewing modes:
       one  - a tablist, one panel at a time, prev/next under each
       all  - every panel shown, tiles go back to being jump links
     ------------------------------------------------------------------- */
  function initTabs() {
    var root = document.getElementById('afj-tabs');
    if (!root) return;

    var panelsWrap = root.querySelector('.afj-tabs__panels');
    if (!panelsWrap) return;
    var built = buildTileStrip(root, panelsWrap);
    if (!built) return;
    var strip = built.strip, tabs = built.tabs, panels = built.panels;

    var current = 0;
    var mode = 'one';

    function label(i) {
      var el = tabs[i].querySelector('.afj-tab__label');
      return el ? el.textContent : 'Section ' + (i + 1);
    }

    /* the all-vs-one toggle */
    var bar = document.createElement('div');
    bar.className = 'afj-tabs__bar';
    var allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'afj-tabs__all';
    allBtn.setAttribute('aria-pressed', 'false');
    allBtn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">view_agenda</span>' +
                       '<span class="afj-tabs__allTxt">Show all sections</span>';
    bar.appendChild(allBtn);
    root.insertBefore(bar, strip);
    var allTxt = allBtn.querySelector('.afj-tabs__allTxt');

    /* previous / next under every panel */
    panels.forEach(function (panel, i) {
      var pager = document.createElement('nav');
      pager.className = 'afj-pager';
      pager.setAttribute('aria-label', 'Previous and next section');

      var prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'afj-pager__btn afj-pager__btn--prev';
      prev.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>' +
        '<span class="afj-pager__txt"><small>Previous</small><strong></strong></span>';

      var next = document.createElement('button');
      next.type = 'button';
      next.className = 'afj-pager__btn afj-pager__btn--next';
      next.innerHTML = '<span class="afj-pager__txt"><small>Next</small><strong></strong></span>' +
        '<span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>';

      if (i === 0) { prev.hidden = true; }
      else {
        prev.querySelector('strong').textContent = label(i - 1);
        prev.addEventListener('click', function () { select(i - 1, false, true); });
      }
      if (i === panels.length - 1) { next.hidden = true; }
      else {
        next.querySelector('strong').textContent = label(i + 1);
        next.addEventListener('click', function () { select(i + 1, false, true); });
      }

      pager.appendChild(prev);
      pager.appendChild(next);
      panel.appendChild(pager);
    });

    function applyTabRoles() {
      strip.setAttribute('role', 'tablist');
      strip.setAttribute('aria-label', 'Sections of this page');
      strip.setAttribute('aria-orientation', 'horizontal');
      tabs.forEach(function (t, i) {
        var p = panels[i];
        if (!t.id) t.id = 'afj-tab-' + p.id;
        t.setAttribute('role', 'tab');
        t.setAttribute('aria-controls', p.id);
        p.setAttribute('role', 'tabpanel');
        p.setAttribute('aria-labelledby', t.id);
        p.setAttribute('tabindex', '0');
      });
    }

    function clearTabRoles() {
      strip.removeAttribute('role');
      strip.removeAttribute('aria-label');
      strip.removeAttribute('aria-orientation');
      tabs.forEach(function (t, i) {
        t.removeAttribute('role');
        t.removeAttribute('aria-selected');
        t.removeAttribute('aria-controls');
        t.removeAttribute('tabindex');
        var p = panels[i];
        p.removeAttribute('role');
        p.removeAttribute('aria-labelledby');
        p.removeAttribute('tabindex');
        p.hidden = false;
      });
    }

    /* Opening a section one at a time means you have already chosen it, so
       its collapses start open - no second click to see what you asked for.
       In the all-sections view they close again, because there the point is
       to scan the whole page rather than read one part of it. */
    function setCollapses(panel, open) {
      var items = panel.querySelectorAll('details');
      Array.prototype.forEach.call(items, function (d) { d.open = open; });
    }

    function select(i, focusTab, scroll) {
      current = i;
      tabs.forEach(function (t, n) {
        var on = n === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
        panels[n].hidden = !on;
      });
      setCollapses(panels[i], true);
      if (focusTab) tabs[i].focus();
      if (tabs[i].scrollIntoView) {
        tabs[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
      if (scroll && root.scrollIntoView) {
        root.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
      if (window.history && history.replaceState) {
        history.replaceState(null, '', '#' + panels[i].id);
      }
    }

    function setMode(nextMode) {
      mode = nextMode;
      if (mode === 'all') {
        root.classList.add('afj-tabs--all');
        panels.forEach(function (p) { setCollapses(p, false); });
        clearTabRoles();
        allBtn.setAttribute('aria-pressed', 'true');
        allTxt.textContent = 'Show one at a time';
      } else {
        root.classList.remove('afj-tabs--all');
        applyTabRoles();
        allBtn.setAttribute('aria-pressed', 'false');
        allTxt.textContent = 'Show all sections';
        select(current, false, false);
      }
    }

    allBtn.addEventListener('click', function () { setMode(mode === 'all' ? 'one' : 'all'); });

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function (e) {
        if (mode === 'all') return;
        e.preventDefault();
        select(i, false, true);
      });
    });

    strip.addEventListener('keydown', function (e) {
      if (mode !== 'one') return;
      var i = tabs.indexOf(document.activeElement);
      if (i === -1) return;
      var to = null;
      if (e.key === 'ArrowRight') to = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') to = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = tabs.length - 1;
      if (to === null) return;
      e.preventDefault();
      select(to, true, false);
    });

    function fromHash() {
      if (!window.location.hash) return -1;
      var id = window.location.hash.slice(1);
      for (var i = 0; i < panels.length; i++) if (panels[i].id === id) return i;
      return -1;
    }

    root.classList.add('afj-tabs--on');
    applyTabRoles();
    var start = fromHash();
    select(start > -1 ? start : 0, false, false);

    window.addEventListener('hashchange', function () {
      var i = fromHash();
      if (i > -1 && mode === 'one' && i !== current) select(i, false, false);
    });
  }

  function init() {
    initMessages();
    initSocialIcons();
    initLightbox();
    initTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();