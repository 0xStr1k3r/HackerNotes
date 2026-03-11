/* app.js — Core: theme, sidebar mode, keyboard shortcuts */
(function() {
  'use strict';

  // ── THEME ──────────────────────────────────────────
  const THEME_KEY       = 'hn-theme';
  const SIDEBAR_KEY     = 'hn-sidebar-mode';

  function getTheme()   { return localStorage.getItem(THEME_KEY) || 'dark'; }
  function getSidebarMode() { return localStorage.getItem(SIDEBAR_KEY) || 'normal'; }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '🌙' : '☀️';
  }

  function toggleTheme() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  // ── SIDEBAR MODE ──────────────────────────────────
  function applySidebarMode(mode) {
    const sidebar    = document.getElementById('viewer-sidebar');
    const peek       = document.getElementById('sidebar-peek');
    const btnNormal  = document.getElementById('mode-normal');
    const btnAuto    = document.getElementById('mode-autohide');
    if (!sidebar) return;

    if (mode === 'autohide') {
      sidebar.classList.add('hidden');
      if (peek) peek.classList.add('visible');
      if (btnNormal) btnNormal.classList.remove('active');
      if (btnAuto)   btnAuto.classList.add('active');
    } else {
      sidebar.classList.remove('hidden');
      if (peek) peek.classList.remove('visible');
      if (btnNormal) btnNormal.classList.add('active');
      if (btnAuto)   btnAuto.classList.remove('active');
    }
  }

  function setSidebarMode(mode) {
    localStorage.setItem(SIDEBAR_KEY, mode);
    applySidebarMode(mode);
  }

  // ── INIT ──────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    // Apply saved theme
    applyTheme(getTheme());

    // Theme toggle button
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // Sidebar mode buttons
    const btnNormal = document.getElementById('mode-normal');
    const btnAuto   = document.getElementById('mode-autohide');
    const peek      = document.getElementById('sidebar-peek');
    const closeBtn  = document.getElementById('sidebar-close');

    if (btnNormal) btnNormal.addEventListener('click', () => setSidebarMode('normal'));
    if (btnAuto)   btnAuto.addEventListener('click', () => setSidebarMode('autohide'));

    // Peek button shows sidebar temporarily
    if (peek) {
      peek.addEventListener('click', () => {
        const sidebar = document.getElementById('viewer-sidebar');
        if (sidebar) {
          sidebar.classList.remove('hidden');
          peek.classList.remove('visible');
        }
      });
    }

    // Close button hides sidebar (only active in autohide mode)
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (getSidebarMode() === 'autohide') {
          const sidebar = document.getElementById('viewer-sidebar');
          const peek    = document.getElementById('sidebar-peek');
          if (sidebar) sidebar.classList.add('hidden');
          if (peek)    peek.classList.add('visible');
        }
      });
    }

    // Apply sidebar mode on viewer page
    applySidebarMode(getSidebarMode());

    // Keyboard shortcut: / → focus search
    document.addEventListener('keydown', function(e) {
      if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        const si = document.querySelector('.search-input');
        if (si) { si.focus(); return; }
        window.location.href = 'search.html';
      }
    });
  });

  // Expose for use in other scripts
  window.HN = window.HN || {};
  window.HN.getTheme       = getTheme;
  window.HN.getSidebarMode = getSidebarMode;
  window.HN.applySidebarMode = applySidebarMode;
})();
