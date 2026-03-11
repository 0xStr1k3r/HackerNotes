/* markdown-loader.js — Load/render notes in viewer.html */
(function() {
  'use strict';

  const params  = new URLSearchParams(window.location.search);
  const noteId  = params.get('note');

  if (!noteId) { showError(); return; }

  // Update breadcrumb
  const nav = document.getElementById('breadcrumb-nav');
  if (nav) {
    const parts  = noteId.split('/');
    const folder = parts[0];
    let catName  = folder;
    for (const [name] of Object.entries(NAV)) {
      if (CAT_FOLDER[name] === folder) { catName = name; break; }
    }
    nav.innerHTML = `
      <a href="index.html">Home</a>
      <span style="color:var(--text-muted);padding:0 6px">›</span>
      <a href="path.html?p=${folder}">${catName}</a>
      <span style="color:var(--text-muted);padding:0 6px">›</span>
      <span style="color:var(--text-secondary)">${parts[parts.length-1].replace(/-/g,' ')}</span>`;
  }

  // ── Configure Marked (v9 compatible) ────────────────────────────
  const renderer = new marked.Renderer();

  // Code block renderer — compatible with both marked v8 and v9
  renderer.code = function(codeOrToken, lang) {
    // v9 passes a token object; v8 passes (code, lang)
    let code = codeOrToken, language = lang || 'text';
    if (typeof codeOrToken === 'object' && codeOrToken !== null) {
      code     = codeOrToken.text || '';
      language = codeOrToken.lang || 'text';
    }
    language = (language || 'text').split(/\s/)[0]; // strip extra attrs

    let highlighted = escapeHtml(code);
    try {
      if (language && Prism.languages[language]) {
        highlighted = Prism.highlight(code, Prism.languages[language], language);
      }
    } catch(e) { highlighted = escapeHtml(code); }

    return `<div class="code-block-wrap">
      <span class="code-lang-label">${language}</span>
      <button class="copy-btn" onclick="HN.copyCode(this)">Copy</button>
      <pre class="language-${language}"><code class="language-${language}">${highlighted}</code></pre>
    </div>`;
  };

  marked.use({ renderer, breaks: true, gfm: true });

  // ── Fetch and render ─────────────────────────────────────────────
  fetch(`notes/${noteId}.md`)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    })
    .then(md => renderNote(md))
    .catch(err => {
      console.error('Note load failed:', err);
      showError();
    });

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function renderNote(md) {
    const loading = document.getElementById('loading-state');
    const wrap    = document.getElementById('note-wrap');
    const body    = document.getElementById('note-body');
    if (!body) return;

    // Parse markdown
    let html;
    try {
      html = marked.parse(md);
    } catch(e) {
      console.error('Marked parse error:', e);
      html = '<pre>' + escapeHtml(md) + '</pre>';
    }

    // Sanitize
    if (typeof DOMPurify !== 'undefined') {
      html = DOMPurify.sanitize(html, {
        ADD_TAGS: ['pre','code'],
        ADD_ATTR: ['class','id','onclick'],
        FORCE_BODY: true
      });
    }

    body.innerHTML = html;

    // Add slugified IDs to headings
    body.querySelectorAll('h1,h2,h3,h4').forEach((h, i) => {
      if (!h.id) {
        const slug = h.textContent
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `h-${i}`;
        h.id = slug;
      }
    });

    // Auto-hide sidebar if in autohide mode
    if (window.HN && window.HN.getSidebarMode && window.HN.getSidebarMode() === 'autohide') {
      const sidebar = document.getElementById('viewer-sidebar');
      const peek    = document.getElementById('sidebar-peek');
      if (sidebar) sidebar.classList.add('hidden');
      if (peek)    peek.classList.add('visible');
    }

    // Build sidebar
    if (window.HN) {
      if (window.HN.buildSidebar) window.HN.buildSidebar(noteId);
    }

    // Prev/next nav
    buildNoteNav();

    // Mermaid diagrams
    if (typeof mermaid !== 'undefined') {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose'
        });
        const diagrams = body.querySelectorAll('code.language-mermaid');
        diagrams.forEach(el => {
          const pre = el.closest('pre') || el.parentElement;
          const wrap = pre.closest('.code-block-wrap') || pre;
          const div = document.createElement('div');
          div.className = 'mermaid';
          div.textContent = el.textContent;
          wrap.replaceWith(div);
        });
        mermaid.run({ nodes: document.querySelectorAll('.mermaid') });
      } catch(e) { console.warn('Mermaid error:', e); }
    }

    // Show content
    if (loading) loading.hidden = true;
    if (wrap)    wrap.hidden = false;

    // Page title from first H1
    const h1 = body.querySelector('h1');
    if (h1) document.title = h1.textContent + ' — HackerNotes';
  }

  function buildNoteNav() {
    const navEl = document.getElementById('note-nav');
    if (!navEl) return;
    const all  = getAllNotes();
    const idx  = all.findIndex(n => n.id === noteId);
    if (idx < 0) return;

    const prev = idx > 0             ? all[idx - 1] : null;
    const next = idx < all.length-1  ? all[idx + 1] : null;

    navEl.innerHTML = '';
    if (prev) {
      const a = document.createElement('a');
      a.href = `viewer.html?note=${prev.id}`;
      a.innerHTML = `<div class="prev-label">← Previous</div><div class="note-title">${prev.title}</div>`;
      navEl.appendChild(a);
    } else {
      navEl.appendChild(document.createElement('span'));
    }
    if (next) {
      const a = document.createElement('a');
      a.href = `viewer.html?note=${next.id}`;
      a.className = 'next-link';
      a.innerHTML = `<div class="next-label">Next →</div><div class="note-title">${next.title}</div>`;
      navEl.appendChild(a);
    }
  }

  function showError() {
    const loading = document.getElementById('loading-state');
    const errEl   = document.getElementById('error-state');
    if (loading) loading.hidden = true;
    if (errEl)   errEl.hidden   = false;
  }

  // Copy code handler
  window.HN = window.HN || {};
  window.HN.copyCode = function(btn) {
    const code = btn.parentElement.querySelector('code');
    if (!code) return;
    navigator.clipboard.writeText(code.textContent).then(() => {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1800);
    }).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = code.textContent;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
    });
  };
})();
