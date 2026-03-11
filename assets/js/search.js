// ===== HACKERNOTES - SEARCH =====
'use strict';

let lunrIndex = null;
let docsMap   = {};

async function buildSearchIndex() {
  const allNotes = getAllNotes();
  const docs = [];

  for (const note of allNotes) {
    try {
      const res = await fetch(`notes/${note.id}.md`);
      if (!res.ok) continue;
      const text = await res.text();
      const doc = {
        id:       note.id,
        title:    note.title,
        category: note.category,
        phase:    note.phase,
        body:     text.replace(/```[\s\S]*?```/g,'').replace(/[#*`>_\[\]]/g,' ').substring(0, 3000)
      };
      docs.push(doc);
      docsMap[doc.id] = doc;
    } catch (_) {}
  }

  lunrIndex = lunr(function() {
    this.ref('id');
    this.field('title',    { boost: 15 });
    this.field('category', { boost: 5  });
    this.field('phase',    { boost: 3  });
    this.field('body');
    docs.forEach(d => this.add(d));
  });

  return docs.length;
}

function runSearch(query) {
  if (!lunrIndex || !query.trim()) return [];
  try {
    return lunrIndex.search(query + '~1 ' + query + '*');
  } catch(_) {
    try { return lunrIndex.search(query); } catch(_) { return []; }
  }
}

function renderResults(query, results, container) {
  if (!results.length) {
    container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:40px 0">No results for "<strong>${esc(query)}</strong>"</p>`;
    return;
  }
  container.innerHTML = results.slice(0,20).map(r => {
    const doc = docsMap[r.ref];
    if (!doc) return '';
    const re  = new RegExp(`(${esc(query)})`, 'gi');
    const excerpt = doc.body.replace(re,'<mark>$1</mark>').substring(0,180);
    return `
      <a class="search-result" href="viewer.html?note=${doc.id}">
        <div class="result-title">${esc(doc.title)}</div>
        <div class="result-path">${esc(doc.category)} › ${esc(doc.phase)}</div>
        <div class="result-excerpt">${excerpt}…</div>
      </a>`;
  }).join('');
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function initSearch() {
  const input   = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const status  = document.getElementById('search-status');
  if (!input) return;

  status.textContent = '⏳ Building search index…';
  const count = await buildSearchIndex();
  status.textContent = `✅ ${count} notes indexed. Start typing to search.`;

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = input.value.trim();
      if (!q) { results.innerHTML = ''; return; }
      renderResults(q, runSearch(q), results);
    }, 200);
  });

  input.focus();
  const q = new URLSearchParams(window.location.search).get('q');
  if (q) { input.value = q; renderResults(q, runSearch(q), results); }
}
