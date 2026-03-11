// ===== HACKERNOTES - NAVIGATION BUILDER =====
'use strict';

function buildSidebar(containerId, activePath) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  Object.entries(NAV).forEach(([category, data]) => {
    const catSection = document.createElement('div');
    catSection.className = 'sidebar-section';

    // Category header
    const catEl = document.createElement('div');
    catEl.className = 'sidebar-category';
    catEl.innerHTML = `
      <span class="cat-icon">${data.icon}</span>
      <span>${category}</span>
      <span class="arrow">▾</span>
    `;

    const phasesWrap = document.createElement('div');
    phasesWrap.className = 'sidebar-phases';

    // Check if active path belongs to this category
    const folder = CAT_FOLDER[category];
    const isActiveCategory = activePath && activePath.startsWith(folder + '/');
    if (!isActiveCategory) phasesWrap.classList.add('hidden');

    data.phases.forEach(phase => {
      const phaseEl = document.createElement('div');
      phaseEl.className = 'sidebar-phase';

      const phaseLabelEl = document.createElement('div');
      phaseLabelEl.className = 'sidebar-phase-label';
      phaseLabelEl.textContent = phase.phase;

      const linksEl = document.createElement('div');
      linksEl.className = 'sidebar-links';

      phase.notes.forEach(note => {
        const a = document.createElement('a');
        a.href = `viewer.html?note=${note.id}`;
        a.textContent = note.title;
        if (activePath && activePath === note.id) {
          a.classList.add('active');
        }
        linksEl.appendChild(a);
      });

      phaseEl.appendChild(phaseLabelEl);
      phaseEl.appendChild(linksEl);
      phasesWrap.appendChild(phaseEl);
    });

    catEl.addEventListener('click', () => {
      catEl.classList.toggle('collapsed');
      phasesWrap.classList.toggle('hidden');
    });

    catSection.appendChild(catEl);
    catSection.appendChild(phasesWrap);
    container.appendChild(catSection);
  });
}

function initMobileSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}
