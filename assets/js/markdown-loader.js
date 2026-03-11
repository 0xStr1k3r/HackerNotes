// ===== HACKERNOTES - MARKDOWN LOADER =====
'use strict';

// Configure marked renderer (Mermaid + syntax highlight)
const renderer = new marked.Renderer();
const origCode  = renderer.code.bind(renderer);

renderer.code = function(code, lang) {
  if (lang === 'mermaid') {
    const id = 'mermaid-' + Math.random().toString(36).substr(2,8);
    return `<div class="diagram-wrap"><div class="mermaid" id="${id}">${escapeHtml(code)}</div></div>`;
  }
  // Wrap pre in div for copy button
  const highlighted = (lang && Prism.languages[lang])
    ? Prism.highlight(code, Prism.languages[lang], lang)
    : escapeHtml(code);
  return `<div class="pre-wrap">
    <button class="copy-btn" onclick="copyCode(this)">Copy</button>
    <pre><code class="language-${lang || 'text'}">${highlighted}</code></pre>
  </div>`;
};

marked.use({ renderer, breaks: true, gfm: true });

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Copy button handler
window.copyCode = function(btn) {
  const code = btn.nextElementSibling.querySelector('code').innerText;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 1500);
  });
};

// ---- Load a note ----
async function loadNote(path) {
  const container = document.getElementById('md-container');
  if (!container) return;
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const res = await fetch(`notes/${path}.md`);
    if (!res.ok) throw new Error('not found');
    const raw  = await res.text();
    const dirty = marked.parse(raw);
    const clean = DOMPurify.sanitize(dirty, { ADD_TAGS: ['div','span'], ADD_ATTR: ['class','id','onclick'] });

    container.innerHTML = `<div class="md-content">${buildTOC(raw)}${clean}</div>${buildNoteNav(path)}`;

    // Mermaid
    if (typeof mermaid !== 'undefined') {
      mermaid.init(undefined, container.querySelectorAll('.mermaid:not([data-processed])'));
    }

    const h1 = container.querySelector('h1');
    if (h1) document.title = h1.textContent + ' — HackerNotes';

  } catch (_) {
    container.innerHTML = `
      <div class="md-content">
        <h1>Note Not Found</h1>
        <p>The note <code>${path}</code> hasn't been written yet.</p>
        <p><a href="contributors/note-template.md">Want to contribute it?</a></p>
      </div>`;
  }
}

// Build simple TOC from h2 headings
function buildTOC(markdown) {
  const headings = [...markdown.matchAll(/^##\s+(.+)$/gm)].map(m => m[1]);
  if (headings.length < 3) return '';
  const items = headings.map(h => {
    const anchor = h.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g,'');
    return `<a href="#${anchor}">${h.replace(/[🧠🏗️📊⚙️🔴🛠️💥🔍🛡️📚]/gu,'').trim()}</a>`;
  }).join('');
  return `<div class="toc"><h4>📋 Contents</h4>${items}</div>`;
}

// Prev/next note navigation
function buildNoteNav(currentPath) {
  const all = getAllNotes();
  const idx = all.findIndex(n => n.id === currentPath);
  if (idx === -1) return '';
  const prev = all[idx - 1];
  const next = all[idx + 1];
  let html = '<div class="note-nav">';
  html += prev
    ? `<a class="prev" href="viewer.html?note=${prev.id}">← <span class="nav-title">${prev.title}</span></a>`
    : '<span></span>';
  html += next
    ? `<a class="next" href="viewer.html?note=${next.id}"><span class="nav-title">${next.title}</span> →</a>`
    : '';
  html += '</div>';
  return html;
}

function getNoteFromURL() {
  return new URLSearchParams(window.location.search).get('note');
}

function buildBreadcrumb(path) {
  const el = document.getElementById('breadcrumb');
  if (!el || !path) return;
  const note = getAllNotes().find(n => n.id === path);
  if (!note) return;
  el.innerHTML = `
    <a href="index.html">Home</a>
    <span>›</span>
    <a href="paths.html">${note.category}</a>
    <span>›</span>
    <span>${note.phase}</span>
    <span>›</span>
    <span>${note.title}</span>
  `;
}
