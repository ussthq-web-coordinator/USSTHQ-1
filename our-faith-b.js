/* ========================================================================
   Our Faith - section tiles
   The tiles ship as plain anchor links and every section stays on the page,
   so if this file never loads the page is the full document with a grid of
   links at the top. Nothing here hides content by markup alone.
   ======================================================================== */
(function () {
  'use strict';

  var IMG_BASE = 'https://salvationarmysouth.widen.net/content/';
  var IMG_Q = '?w=480&h=320&position=c&color=ffffffff&quality=55&u=ukifzm';

  var TILES = [
    ['church', 'A Worldwide Church', 'zpp60ezrel/jpeg/song-book-pew-cross-right.jpeg'],
    ['discover', 'Discover Jesus', 'kawnybwf1n/jpeg/Womens%20Ministries%20Photo-022.jpeg'],
    ['who', 'Who Is Jesus?', 'kv0kuztlmg/jpeg/Charleston_SC_Hurricane_Matthew_120.jpeg'],
    ['army', 'Jesus & The Army', 'swepmkcyvh/jpeg/HOUSTON_Hill-Drive-Canteen-26.jpeg'],
    ['believe', 'What We Believe', 'okpwwq98tx/jpeg/_TSA2746.jpeg'],
    ['christian', 'Being a Christian', 'rxyags9tqo/jpeg/_TSA9111-1-DeNoiseAI-clear%20copy.jpeg'],
    ['serve', 'Serving Like Jesus', 'wqstogaykh/jpeg/20230713%20-%202023-050_Camp%20Hidden%20Lake%20-%201818.jpeg'],
    ['love', 'Loving Like Jesus', 'ob2k4mqiro/jpeg/AugustaAreaCommand2022-6404.jpeg'],
    ['life', 'Jesus for My Life', 'bhcs1b6txo/jpeg/_TSA1236.jpeg'],
    ['community', 'Our Community', 'hcxf7jpx0y/jpeg/20220719-Camp%20Grandview-170.jpeg'],
    ['sunday', 'Join Us Sunday', 'vuflzj7rpt/jpeg/ga_yc2010_0008.jpeg'],
  ];

  function buildTileStrip(root, panelsWrap) {
    var strip = document.createElement('div');
    strip.className = 'faith-tabs__strip';
    var tabs = [], panels = [];
    TILES.forEach(function (t) {
      var panel = document.getElementById(t[0]);
      if (!panel) return;
      var a = document.createElement('a');
      a.className = 'faith-tab';
      a.href = '#' + t[0];
      var img = document.createElement('img');
      img.className = 'faith-tab__img';
      img.src = IMG_BASE + t[2] + IMG_Q;
      img.alt = '';
      img.width = 480; img.height = 320;
      img.loading = 'lazy'; img.decoding = 'async';
      var label = document.createElement('span');
      label.className = 'faith-tab__label';
      label.textContent = t[1];
      a.appendChild(img); a.appendChild(label);
      strip.appendChild(a);
      tabs.push(a); panels.push(panel);
    });
    if (!tabs.length) return null;
    root.insertBefore(strip, panelsWrap);
    return { strip: strip, tabs: tabs, panels: panels };
  }

  function initTabs() {
    var root = document.getElementById('faith-tabs');
    if (!root) return;
    var panelsWrap = root.querySelector('.faith-tabs__panels');
    if (!panelsWrap) return;
    var built = buildTileStrip(root, panelsWrap);
    if (!built) return;
    var strip = built.strip, tabs = built.tabs, panels = built.panels;

    var current = 0;
    var mode = 'one';

    function label(i) {
      var el = tabs[i].querySelector('.faith-tab__label');
      return el ? el.textContent : 'Section ' + (i + 1);
    }

    var bar = document.createElement('div');
    bar.className = 'faith-tabs__bar';
    var allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'faith-tabs__all';
    allBtn.setAttribute('aria-pressed', 'false');
    allBtn.innerHTML = '<span class="faith-tabs__allTxt">Show all sections</span>';
    bar.appendChild(allBtn);
    root.insertBefore(bar, strip);
    var allTxt = allBtn.querySelector('.faith-tabs__allTxt');

    panels.forEach(function (panel, i) {
      var pager = document.createElement('nav');
      pager.className = 'faith-pager';
      pager.setAttribute('aria-label', 'Previous and next section');

      var prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'faith-pager__btn faith-pager__btn--prev';
      prev.innerHTML = '<span class="faith-pager__txt"><small>Previous</small><strong></strong></span>';

      var next = document.createElement('button');
      next.type = 'button';
      next.className = 'faith-pager__btn faith-pager__btn--next';
      next.innerHTML = '<span class="faith-pager__txt"><small>Next</small><strong></strong></span>';

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
        if (!t.id) t.id = 'faith-tab-' + p.id;
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
        /* The first section is what the page shows on arrival, so it needs no
           hash to describe it - a bare URL already means 'the top of the page'.
           Writing one would also mean a plain visit silently rewrote the
           address bar. Every other section still gets its anchor so it stays
           linkable. pathname + search rather than '#', which some browsers
           keep as a dangling hash. */
        if (i === 0) {
          history.replaceState(null, '', location.pathname + location.search);
        } else {
          history.replaceState(null, '', '#' + panels[i].id);
        }
      }
    }

    function setMode(nextMode) {
      mode = nextMode;
      if (mode === 'all') {
        root.classList.add('faith-tabs--all');
        clearTabRoles();
        allBtn.setAttribute('aria-pressed', 'true');
        allTxt.textContent = 'Show one at a time';
      } else {
        root.classList.remove('faith-tabs--all');
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
      /* The hash may name something inside a panel rather than the panel
         itself. A hidden element cannot be scrolled to, so without this the
         link would quietly do nothing - fall back to whichever panel holds it. */
      var el = document.getElementById(id);
      if (el) {
        for (var j = 0; j < panels.length; j++) if (panels[j].contains(el)) return j;
      }
      return -1;
    }

    root.classList.add('faith-tabs--on');
    applyTabRoles();
    var start = fromHash();
    select(start > -1 ? start : 0, false, false);

    window.addEventListener('hashchange', function () {
      var i = fromHash();
      if (i > -1 && mode === 'one' && i !== current) select(i, false, true);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
  } else {
    initTabs();
  }
})();
