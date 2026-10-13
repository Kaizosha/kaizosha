import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { registry } = require('./controller.js');
const button = (action, text, attrs = '') => `<button type="button" data-model-action="${action}"${attrs}>${text}</button>`;
const reset = button('reset', 'Reset', ' class="model-reset"');

export const config = {
  together: {
    title: 'Together television',
    hint: 'Local coastal video · original and translated captions',
    caption: 'Play the local coastal video on the television. English captions stay visible; select Spanish or Japanese on the TV to add a translation. The timeline seeks the actual video.',
    controls: `<p class="model-motion-note" data-model-motion-note hidden>Reduced motion is on. Use the television timeline to explore the captions.</p>${reset}`
  },
  sekai: {
    title: 'Sekai globe',
    hint: 'Native atlas preview · geography and city routes',
    caption: 'Rotate the globe to explore land points from Sekai’s bundled Natural Earth atlas. Density changes the browser preview point count. Controls below the globe show boundaries, city routes, and labels.',
    controls: `<div class="model-camera-controls"><label class="model-range">Longitude <span data-model-value="longitude">10°E</span><input type="range" min="-180" max="180" step="1" value="10" data-model-action="longitude" aria-label="Globe longitude in degrees"></label><label class="model-range">Latitude <span data-model-value="latitude">12°N</span><input type="range" min="-70" max="70" step="1" value="12" data-model-action="latitude" aria-label="Globe latitude in degrees"></label></div><div class="model-control-row"><label>Density<select data-model-action="density"><option value="256">256 preview points</option><option value="1024">1,024 preview points</option><option value="4096" selected>4,096 preview points</option></select></label><div class="model-control-row model-layer-controls" role="group" aria-label="Globe presentation layers">${button('particles', 'Particles', ' aria-pressed="true"')}${button('boundaries', 'Boundaries', ' aria-pressed="true"')}${button('routes', 'Routes', ' aria-pressed="true"')}${button('labels', 'Labels', ' aria-pressed="true"')}</div>${reset}</div>`
  },
  hush: {
    title: 'Hush monitor',
    hint: 'Local sample desktop activity · seeing and listening',
    caption: 'Hush’s sample monitor follows a document edit, a related email, and a spoken note. Play or step through the local example to see the observed activity and its useful summary. This demo does not capture your screen or microphone.',
    controls: `<div class="model-control-row">${button('play', 'Play sample', ' aria-pressed="false"')}${button('next', 'Next activity')}${reset}</div><p class="model-motion-note" data-model-motion-note hidden>Reduced motion is on. Use Next activity to explore each sample event.</p>`
  },
  morph: {
    title: 'Morph in Safari',
    hint: 'Live editor · sample page · reversible changes',
    caption: 'The live editor changes the sample article beside it. Edit adds a clearer heading and a short summary. Keep retains the draft, and Undo restores the original page.',
    controls: `<div class="model-control-row">${button('edit', 'Edit')}${button('undo', 'Undo', ' disabled')}${button('keep', 'Keep', ' disabled')}${reset}</div>`
  },
  modscan: {
    title: 'ModScan terminal',
    hint: 'Sample dependency scan · no filesystem access',
    caption: 'The terminal lists four sample node_modules folders with their size and last modification. Sort, filter, and inspect the rows. Simulated removals retain a Deleted status and update the active and freed totals.',
    controls: `<div class="model-control-row model-inventory-controls"><label>Sort<select data-model-action="sort"><option value="size">Size · largest first</option><option value="date">Modified · oldest first</option><option value="name">Project · A–Z</option><option value="path">Path · A–Z</option></select></label><label>Filter<select data-model-action="filter"><option value="all">All</option><option value="active">Active</option><option value="deleted">Deleted</option><option value="large">Large · over 100 MB</option><option value="old">Old · over 30 days</option></select></label><label>Project<select data-model-action="select"><option value="" hidden disabled>No matching samples</option><option value="2" selected>studio · 320 MB</option><option value="1">atlas · 180 MB</option><option value="3">sandbox · 96 MB</option><option value="0">journal · 64 MB</option></select></label></div><div class="model-control-row">${button('remove', 'Remove selected sample')}${reset}</div>`
  }
};

for (const [id, item] of Object.entries(config)) item.initialReadout = registry[id].view(registry[id].initial()).readout;

export default config;
