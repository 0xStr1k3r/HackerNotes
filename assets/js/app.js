// ===== HACKERNOTES - APP CORE =====
'use strict';

// ---- HEADER active nav link ----
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.header-nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page);
  });
}

// ---- Keyboard shortcut: / to focus search ----
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    window.location.href = 'search.html';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initMobileSidebar?.();
});
