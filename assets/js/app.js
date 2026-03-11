/* app.js — Core: multi-theme, sidebar mode, keyboard shortcuts */
(function() {
  'use strict';

  const THEME_KEY   = 'hn-theme';
  const SIDEBAR_KEY = 'hn-sidebar-mode';

  const THEMES = [
    { id: 'dark',      label: 'Dark',      color: '#0a0c12', accent: '#4facde' },
    { id: 'light',     label: 'Light',     color: '#f8fafc', accent: '#2b6cb0' },
    { id: 'matrix',    label: 'Matrix',    color: '#050a05', accent: '#00e676' },
    { id: 'cyberpunk', label: 'Cyber',     color: '#07050f', accent: '#00e5ff' },
    { id: 'purple',    label: 'Purple',    color: '#09060f', accent: '#a78bfa' },
    { id: 'blood',     label: 'Blood',     color: '#0f0606', accent: '#ff4757' },
    { id: 'amber',     label: 'Amber',     color: '#0c0800', accent: '#f59e0b' }
  ];

  function getTheme() { return localStorage.getItem(THEME_KEY) || 'dark'; }
  function getSidebarMode() { return localStorage.getItem(SIDEBAR_KEY) || 'normal'; }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('.theme-swatch').forEach(el => {
      el.classList.toggle('active', el.dataset.themeId === theme);
    });
  }

  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  }

  // ── BUILD THEME PANEL ─────────────────────────────
  function buildThemePanel() {
    // Remove any old panel
    const old = document.getElementById('theme-panel');
    if (old) old.remove();

    const panel = document.createElement('div');
    panel.className = 'theme-panel';
    panel.id = 'theme-panel';

    const current = getTheme();

    const swatchHtml = THEMES.map(t => `
      <button class="theme-swatch${t.id === current ? ' active' : ''}"
              data-theme-id="${t.id}"
              title="${t.label}">
        <div class="swatch-circle" style="background: linear-gradient(135deg, ${t.color} 40%, ${t.accent})"></div>
        <span class="swatch-label">${t.label}</span>
      </button>
    `).join('');

    panel.innerHTML = `
      <div class="theme-panel-title">🎨 Choose Theme</div>
      <div class="theme-swatches">${swatchHtml}</div>
      <div class="theme-divider"></div>
      <div class="theme-row">
        <span>Sidebar mode</span>
        <div class="sidebar-mode-bar">
          <button id="mode-normal" class="mode-btn">Normal</button>
          <button id="mode-autohide" class="mode-btn">Auto-hide</button>
        </div>
      </div>
    `;

    // Attach to body so it escapes any stacking context
    document.body.appendChild(panel);

    // Swatch click
    panel.querySelectorAll('.theme-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        setTheme(btn.dataset.themeId);
        panel.querySelectorAll('.theme-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Sidebar mode buttons inside panel
    const btnN = panel.querySelector('#mode-normal');
    const btnA = panel.querySelector('#mode-autohide');
    if (btnN) btnN.addEventListener('click', () => setSidebarMode('normal'));
    if (btnA) btnA.addEventListener('click', () => setSidebarMode('autohide'));
    updateModeBtns();
  }

  function updateModeBtns() {
    const mode = getSidebarMode();
    document.querySelectorAll('#mode-normal').forEach(btn => {
      btn.classList.toggle('active', mode === 'normal');
    });
    document.querySelectorAll('#mode-autohide').forEach(btn => {
      btn.classList.toggle('active', mode === 'autohide');
    });
  }

  // ── SIDEBAR MODE ──────────────────────────────────
  function applySidebarMode(mode) {
    const sidebar = document.getElementById('viewer-sidebar');
    const peek    = document.getElementById('sidebar-peek');
    if (!sidebar) return;
    if (mode === 'autohide') {
      sidebar.classList.add('hidden');
      if (peek) peek.classList.add('visible');
    } else {
      sidebar.classList.remove('hidden');
      if (peek) peek.classList.remove('visible');
    }
    updateModeBtns();
  }

  function setSidebarMode(mode) {
    localStorage.setItem(SIDEBAR_KEY, mode);
    applySidebarMode(mode);
  }

  // ── INIT ──────────────────────────────────────────
  // Apply theme BEFORE DOMContentLoaded to avoid flash
  applyTheme(getTheme());

  document.addEventListener('DOMContentLoaded', function() {
    buildThemePanel();

    // Settings button toggle
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const p = document.getElementById('theme-panel');
        if (!p) return;
        // Position panel below button
        const rect = settingsBtn.getBoundingClientRect();
        p.style.top  = (rect.bottom + 8) + 'px';
        p.style.right = (window.innerWidth - rect.right) + 'px';
        p.classList.toggle('open');
      });
    }

    // Close panel on outside click
    document.addEventListener('click', function(e) {
      const p = document.getElementById('theme-panel');
      if (p && p.classList.contains('open')) {
        if (!p.contains(e.target) && e.target.id !== 'settings-btn') {
          p.classList.remove('open');
        }
      }
    });

    // Peek button
    const peek = document.getElementById('sidebar-peek');
    if (peek) {
      peek.addEventListener('click', () => {
        const sidebar = document.getElementById('viewer-sidebar');
        if (sidebar) {
          sidebar.classList.remove('hidden');
          peek.classList.remove('visible');
        }
      });
    }

    // Close sidebar button
    const closeBtn = document.getElementById('sidebar-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (getSidebarMode() === 'autohide') {
          const sidebar = document.getElementById('viewer-sidebar');
          const pk      = document.getElementById('sidebar-peek');
          if (sidebar) sidebar.classList.add('hidden');
          if (pk)      pk.classList.add('visible');
        }
      });
    }

    // Apply sidebar mode on viewer page
    applySidebarMode(getSidebarMode());

    // Keyboard shortcut: / → search
    document.addEventListener('keydown', function(e) {
      if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        const si = document.querySelector('.search-input');
        if (si) { si.focus(); return; }
        window.location.href = 'search.html';
      }
    });
  });

  // Expose
  window.HN = window.HN || {};
  window.HN.getTheme         = getTheme;
  window.HN.getSidebarMode   = getSidebarMode;
  window.HN.applySidebarMode = applySidebarMode;
})();
