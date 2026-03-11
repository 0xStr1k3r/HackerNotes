/* search.js — Lunr full-text search */
(function() {
  'use strict';

  const notes  = getAllNotes();
  let   idx    = null;

  // Build index
  const idxData = lunr(function() {
    this.ref('id');
    this.field('title', { boost: 10 });
    this.field('path');
    notes.forEach(n => this.add(n));
  });

  const input   = document.getElementById('search-input');
  const results = document.getElementById('search-results');

  function render(query) {
    results.innerHTML = '';
    if (!query || query.length < 2) { return; }
    let hits;
    try {
      hits = idxData.search(query + '*');
    } catch(e) {
      hits = idxData.search(query);
    }
    if (!hits.length) {
      results.innerHTML = '<div class="search-empty">No results found for "' + query + '"</div>';
      return;
    }
    hits.slice(0, 30).forEach(hit => {
      const note = notes.find(n => n.id === hit.ref);
      if (!note) return;
      const div  = document.createElement('div');
      div.className = 'search-result';
      const parts = note.id.split('/');
      const cat   = parts[0].replace(/-/g, ' ');
      const phase = parts.length > 1 ? parts[1].replace(/^\d+-/, '').replace(/-/g, ' ') : '';
      div.innerHTML = `
        <div class="result-title">${note.title}</div>
        <div class="result-path">${cat} › ${phase}</div>`;
      div.addEventListener('click', () => window.location.href = `viewer.html?note=${note.id}`);
      results.appendChild(div);
    });
  }

  if (input) {
    input.addEventListener('input', e => render(e.target.value.trim()));
    // Auto-search if query param
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { input.value = q; render(q); }
  }
})();
