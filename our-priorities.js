/* ========================================================================
   All For Jesus - page behavior
   Wrapped in an IIFE so nothing leaks into the CMS global scope.
   ======================================================================== */
(function () {
  'use strict';

  /* ---------- Accessible gallery lightbox ----------
     There is more than one rail on the page now, so the viewer keeps track of
     which rail was opened and steps only through that rail's slides. */
  function initLightbox() {
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

    var strip = root.querySelector('.afj-tabs__strip');
    var tabs = [].slice.call(root.querySelectorAll('.afj-tab'));
    if (!strip || !tabs.length) return;

    var panels = tabs.map(function (t) {
      var href = t.getAttribute('href') || '';
      return href.charAt(0) === '#' ? document.getElementById(href.slice(1)) : null;
    });
    if (panels.some(function (p) { return !p; })) return;

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

    function select(i, focusTab, scroll) {
      current = i;
      tabs.forEach(function (t, n) {
        var on = n === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
        panels[n].hidden = !on;
      });
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
    initLightbox();
    initTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();