/* navigation.js — Build phased sidebar for viewer.html */
(function() {
  'use strict';

  function buildSidebar(activeNoteId) {
    const container = document.getElementById('sidebar-content');
    const pathLabel = document.getElementById('sidebar-path-name');
    if (!container) return;

    // Determine which category/path we're in from activeNoteId
    // e.g. "web-pentesting/01-foundations/dns"
    const pathFolder = activeNoteId ? activeNoteId.split('/')[0] : null;

    let catName = null, catData = null;
    for (const [name, data] of Object.entries(NAV)) {
      if (CAT_FOLDER[name] === pathFolder) { catName = name; catData = data; break; }
    }
    if (!catData) return;

    if (pathLabel) pathLabel.textContent = catName;

    catData.phases.forEach((phase, pi) => {
      const hasActive = phase.notes.some(n => n.id === activeNoteId);

      const group  = document.createElement('div');
      group.className = 'sb-phase-group';

      const title = document.createElement('div');
      title.className = 'sb-phase-title' + (hasActive ? ' open' : '');
      title.innerHTML = `<span>${phase.phase}</span><span class="sb-arrow">›</span>`;

      const notesList = document.createElement('div');
      notesList.className = 'sb-phase-notes' + (hasActive ? ' open' : '');

      phase.notes.forEach(note => {
        const a = document.createElement('a');
        a.className = 'sb-note-link' + (note.id === activeNoteId ? ' active' : '');
        a.href = `viewer.html?note=${note.id}`;
        a.innerHTML = `<span class="sb-dot"></span>${note.title}`;
        notesList.appendChild(a);
      });

      title.addEventListener('click', () => {
        const open = notesList.classList.toggle('open');
        title.classList.toggle('open', open);
      });

      group.appendChild(title);
      group.appendChild(notesList);
      container.appendChild(group);
    });

    // Scroll active link into view
    setTimeout(() => {
      const active = container.querySelector('.sb-note-link.active');
      if (active) active.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 100);
  }

  // TOC builder
  function buildTOC(contentEl) {
    const tocList = document.getElementById('toc-list');
    if (!tocList) return;

    const headings = contentEl.querySelectorAll('h2, h3');
    if (!headings.length) return;

    headings.forEach((h, i) => {
      if (!h.id) h.id = 'h-' + i;
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      a.className = h.tagName === 'H2' ? 'toc-h2' : 'toc-h3';
      tocList.appendChild(a);
    });

    // Highlight active heading on scroll
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          tocList.querySelectorAll('a').forEach(a => a.classList.remove('active'));
          const active = tocList.querySelector(`a[href="#${e.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-60px 0px -70% 0px' });

    headings.forEach(h => observer.observe(h));
  }

  window.HN = window.HN || {};
  window.HN.buildSidebar = buildSidebar;
  window.HN.buildTOC     = buildTOC;
})();
