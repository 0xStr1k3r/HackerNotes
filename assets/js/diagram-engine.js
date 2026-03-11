// ===== HACKERNOTES - DIAGRAM ENGINE =====
'use strict';

// Mermaid global config
if (typeof mermaid !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
      primaryColor:       '#21262d',
      primaryTextColor:   '#e6edf3',
      primaryBorderColor: '#30363d',
      lineColor:          '#58a6ff',
      secondaryColor:     '#161b22',
      tertiaryColor:      '#0d1117',
      edgeLabelBackground:'#161b22',
      nodeTextColor:      '#e6edf3',
      clusterBkg:         '#161b22',
      titleColor:         '#39d353'
    },
    flowchart:  { htmlLabels: true, curve: 'basis' },
    sequence:   { actorMargin: 50, useMaxWidth: true },
    fontFamily: "'Segoe UI', system-ui, sans-serif"
  });
}

// Re-render any mermaid blocks inside element
function renderDiagrams(el) {
  if (typeof mermaid === 'undefined') return;
  const blocks = el.querySelectorAll('.mermaid:not([data-processed])');
  if (blocks.length) mermaid.init(undefined, blocks);
}
