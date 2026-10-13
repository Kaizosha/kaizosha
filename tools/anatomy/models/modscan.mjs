import { appFrame } from '../screen-frame.mjs';

const projects = [
  { id: '2', name: 'studio', size: 320, age: 90 },
  { id: '1', name: 'atlas', size: 180, age: 45 },
  { id: '3', name: 'sandbox', size: 96, age: 7 },
  { id: '0', name: 'journal', size: 64, age: 12 }
];

export function buildModel(k) {
  const frame = appFrame(k, { kind: 'terminal', title: 'ModScan' });
  const rows = projects.map(project => `<tr data-project-row="${project.id}" data-selected="${project.id === '2'}" aria-selected="${project.id === '2'}"><td class="terminal-status" data-project-status>Available</td><th scope="row">${project.name}</th><td class="terminal-path">/sample/projects/${project.name}/node_modules</td><td class="terminal-size">${project.size} MB</td><td class="terminal-modified">${project.age} days ago</td></tr>`).join('');
  const screen = `<section class="modscan-app" aria-label="ModScan sample terminal" data-app-name="ModScan">
    <header class="app-windowbar terminal-windowbar" data-app-region="window"><span class="terminal-command">$ modscan</span><span class="app-demo-label">SAMPLE</span></header>
    <div class="terminal-workspace">
      <div class="terminal-heading" data-app-region="header"><strong>MODSCAN</strong><p>Sort <span data-model-text="sort">size ↓</span><span aria-hidden="true"> | </span>Filter <span data-model-text="filter">all</span></p></div>
      <dl class="terminal-stats" data-app-region="statistics"><div><dt>NODE_MODULES</dt><dd data-model-text="activeCount">4</dd></div><div><dt>Size</dt><dd data-model-text="activeSize">660 MB</dd></div><div><dt>Freed</dt><dd data-model-text="freedSize">0 MB</dd></div></dl>
      <p class="terminal-scan-status" data-model-text="scanStatus">Showing 4 of 4 modules (all filter)</p>
      <div class="terminal-table-wrap" data-app-region="inventory"><table class="terminal-table" aria-label="Sample node_modules inventory"><thead><tr><th scope="col">STATUS</th><th scope="col">PROJECT</th><th scope="col" class="terminal-path">PATH</th><th scope="col" class="terminal-size">SIZE</th><th scope="col" class="terminal-modified">MODIFIED</th></tr></thead><tbody>${rows}</tbody></table><p class="terminal-empty" data-model-region="emptyState" hidden>No matching sample modules.</p></div>
      <section class="terminal-selection" aria-label="Selected project" data-app-region="selection"><div><span>SELECTED</span><strong data-model-text="selectedProject">studio</strong><span data-model-text="selectedStatus">Available</span></div><p data-model-text="selectedPath">/sample/projects/studio/node_modules</p><p><span data-model-text="selectedSize">320 MB</span><span aria-hidden="true"> · </span><span data-model-text="selectedModified">90 days ago</span></p></section>
      <footer class="terminal-footer" data-app-region="sample-note"><span>SAMPLE INVENTORY</span><span>Removal changes this preview only.</span></footer>
    </div>
  </section>`;
  return {
    ...frame,
    kind: 'terminal',
    screen,
    parts: [...frame.parts, 'terminal window header', 'MODSCAN sort and filter header', 'active node_modules statistics', 'retained status inventory table', 'selected project detail', 'sample inventory footer'],
    label: 'ModScan terminal with its native header, live inventory statistics, sortable project table, status rows, and selected node_modules path.',
    identity: {
      app: 'ModScan',
      platform: 'Node.js terminal',
      sources: ['index.js'],
      regions: ['window', 'header', 'statistics', 'inventory', 'selection', 'sample-note']
    }
  };
}
