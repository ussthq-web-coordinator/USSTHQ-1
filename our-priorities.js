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

  function init() {
    initLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();