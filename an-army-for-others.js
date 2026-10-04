(function () {
  'use strict';

  var root = document.querySelector('.afo');
  if (!root) return;

  var panels = [].slice.call(root.querySelectorAll('.afo-role-panel[id]'));
  var triggers = [].slice.call(root.querySelectorAll('[data-afo-role-target]'));
  var viewButtons = [].slice.call(root.querySelectorAll('[data-afo-role-view]'));
  var status = root.querySelector('[data-afo-role-status]');
  var panelIds = panels.map(function (panel) { return panel.id; });
  var currentId = null;
  var showAll = false;

  if (!panels.length || !triggers.length) return;

  root.classList.add('afo-role-enhanced');

  function render() {
    panels.forEach(function (panel) {
      var isVisible = showAll || panel.id === currentId;
      panel.hidden = false;
      panel.classList.toggle('afo-role-panel--visually-hidden', !isVisible);
      setPanelTabStops(panel, isVisible);
    });

    triggers.forEach(function (trigger) {
      var isSelected = trigger.getAttribute('data-afo-role-target') === currentId;
      if (isSelected) trigger.setAttribute('aria-current', 'location');
      else trigger.removeAttribute('aria-current');
    });

    viewButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-afo-role-view') === (showAll ? 'all' : 'single')));
    });

    if (status) {
      if (showAll) {
        status.textContent = currentId
          ? 'All eight role profiles are shown. ' + selectedRoleName() + ' is selected.'
          : 'All eight role profiles are shown in page order.';
      } else if (currentId) {
        status.textContent = 'Showing the ' + selectedRoleName() + ' profile. Choose another role or select All profiles.';
      } else {
        status.textContent = 'One profile at a time. No profile is selected. Choose a role or select All profiles. All profile text remains available to screen readers.';
      }
    }
  }

  function setPanelTabStops(panel, isVisible) {
    var focusables = panel.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    focusables.forEach(function (element) {
      var savedTabIndex = 'data-afo-original-tabindex';
      if (isVisible) {
        if (!element.hasAttribute(savedTabIndex)) return;
        var original = element.getAttribute(savedTabIndex);
        if (original) element.setAttribute('tabindex', original);
        else element.removeAttribute('tabindex');
        element.removeAttribute(savedTabIndex);
      } else if (!element.hasAttribute(savedTabIndex)) {
        element.setAttribute(savedTabIndex, element.getAttribute('tabindex') || '');
        element.setAttribute('tabindex', '-1');
      }
    });
  }

  function selectedRoleName() {
    var trigger = triggers.find(function (item) {
      return item.getAttribute('data-afo-role-target') === currentId;
    });
    var name = trigger && trigger.querySelector('.afo-roster__name');
    return name ? name.textContent.trim() : 'The selected';
  }

  function selectRole(id, scroll) {
    if (panelIds.indexOf(id) === -1) return false;

    currentId = id;
    render();

    if (window.location.hash !== '#' + currentId) {
      window.history.replaceState(null, '', '#' + currentId);
    }
    if (scroll) {
      var behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      panels.find(function (panel) { return panel.id === currentId; }).scrollIntoView({ behavior: behavior, block: 'start' });
    }

    return true;
  }

  render();

  viewButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      showAll = button.getAttribute('data-afo-role-view') === 'all';
      render();
    });
  });

  root.addEventListener('click', function (event) {
    var roleLink = event.target.closest('[data-afo-role-target]');
    if (roleLink && root.contains(roleLink)) {
      event.preventDefault();
      selectRole(roleLink.getAttribute('data-afo-role-target'), true);
      return;
    }

    var link = event.target.closest('a[href^="#"]');
    if (!link || !root.contains(link)) return;

    var id = link.hash.slice(1);
    if (!selectRole(id, true)) return;
    event.preventDefault();
  });

  var initialId = window.location.hash.slice(1);
  if (panelIds.indexOf(initialId) !== -1) selectRole(initialId, false);
  else render();
})();