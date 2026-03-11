/* diagram-zoom.js — Zoom & pan controls for Mermaid diagrams */
(function() {
  'use strict';

  window.HN = window.HN || {};

  /**
   * Call after mermaid.run() completes.
   * Wraps every .mermaid SVG with a zoom/pan container.
   */
  window.HN.initDiagramZoom = function() {
    document.querySelectorAll('.mermaid').forEach(el => {
      // Skip if already wrapped
      if (el.closest('.diagram-zoom-wrap')) return;

      const svg = el.querySelector('svg');
      if (!svg) return;

      // State
      let scale  = 1;
      let tx     = 0;
      let ty     = 0;
      let dragging = false;
      let startX = 0, startY = 0;

      // Wrapper
      const wrap = document.createElement('div');
      wrap.className = 'diagram-zoom-wrap';

      // Inner scroll area
      const inner = document.createElement('div');
      inner.className = 'diagram-zoom-inner';

      // Controls bar
      const controls = document.createElement('div');
      controls.className = 'diagram-controls';
      controls.innerHTML = `
        <button class="dz-btn" data-action="in"  title="Zoom in">＋</button>
        <button class="dz-btn" data-action="out" title="Zoom out">－</button>
        <button class="dz-btn" data-action="reset" title="Reset">⊙</button>
        <span class="dz-hint">scroll to zoom · drag to pan</span>
      `;

      // Move the mermaid el inside inner
      el.parentNode.insertBefore(wrap, el);
      inner.appendChild(el);
      wrap.appendChild(controls);
      wrap.appendChild(inner);

      function applyTransform() {
        el.style.transform = `scale(${scale}) translate(${tx}px, ${ty}px)`;
        el.style.transformOrigin = 'top center';
        // Adjust inner height so container doesn't collapse
        const svgEl = el.querySelector('svg');
        if (svgEl) {
          const h = svgEl.getBoundingClientRect().height;
          // let it overflow — inner is overflow:visible, wrap clips
        }
      }

      function zoomBy(delta, cx, cy) {
        const prev  = scale;
        scale = Math.min(4, Math.max(0.3, scale + delta));
        applyTransform();
      }

      function resetView() {
        scale = 1; tx = 0; ty = 0;
        applyTransform();
      }

      // Button clicks
      controls.addEventListener('click', function(e) {
        const btn = e.target.closest('.dz-btn');
        if (!btn) return;
        const action = btn.dataset.action;
        if (action === 'in')    zoomBy(+0.25);
        if (action === 'out')   zoomBy(-0.25);
        if (action === 'reset') resetView();
      });

      // Mouse wheel zoom
      inner.addEventListener('wheel', function(e) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        zoomBy(delta);
      }, { passive: false });

      // Drag to pan
      inner.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        dragging = true;
        startX   = e.clientX - tx * scale;
        startY   = e.clientY - ty * scale;
        inner.style.cursor = 'grabbing';
        e.preventDefault();
      });

      document.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        tx = (e.clientX - startX) / scale;
        ty = (e.clientY - startY) / scale;
        applyTransform();
      });

      document.addEventListener('mouseup', function() {
        if (dragging) {
          dragging = false;
          inner.style.cursor = 'grab';
        }
      });

      // Touch pan support
      let lastTouchX = 0, lastTouchY = 0;
      inner.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
          lastTouchX = e.touches[0].clientX;
          lastTouchY = e.touches[0].clientY;
        }
      }, { passive: true });

      inner.addEventListener('touchmove', function(e) {
        if (e.touches.length === 1) {
          const dx = (e.touches[0].clientX - lastTouchX) / scale;
          const dy = (e.touches[0].clientY - lastTouchY) / scale;
          tx += dx; ty += dy;
          lastTouchX = e.touches[0].clientX;
          lastTouchY = e.touches[0].clientY;
          applyTransform();
          e.preventDefault();
        }
      }, { passive: false });

      inner.style.cursor = 'grab';
      applyTransform();
    });
  };
})();
