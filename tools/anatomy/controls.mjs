import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { registry } = require('./controller.js');
const button = (action, text, attrs = '') => `<button type="button" data-model-action="${action}"${attrs}>${text}</button>`;
const reset = button('reset', 'Reset', ' class="model-reset"');

export const config = {
  together: {
    title: 'Together on iPad',
    hint: 'Local sample video · original and translated captions',
    caption: 'The iPad player keeps the original captions in view. Scrub or play the twelve-second coastal sample, then select Spanish to add the translation.',
    controls: `<label class="model-range">Playback <span data-model-value="time">0.0 s</span><input type="range" min="0" max="12" step="0.1" value="0" data-model-action="time" aria-label="Sample video time in seconds"></label><div class="model-control-row">${button('play', 'Play', ' aria-pressed="false"')}<label>Translation<select data-model-action="translation"><option value="off">Off</option><option value="es">Spanish</option></select></label>${reset}</div><p class="model-motion-note" data-model-motion-note hidden>Reduced motion is on. Use the playback slider to explore the captions.</p>`
  },
  sekai: {
    title: 'Sekai globe',
    hint: 'Native atlas preview · geography and city routes',
    caption: 'Rotate the globe to explore land points from Sekai’s bundled Natural Earth atlas. Density changes the browser preview point count. Inspector layers show boundaries, city routes, and labels.',
    controls: `<div class="model-camera-controls"><label class="model-range">Longitude <span data-model-value="longitude">10°E</span><input type="range" min="-180" max="180" step="1" value="10" data-model-action="longitude" aria-label="Globe longitude in degrees"></label><label class="model-range">Latitude <span data-model-value="latitude">12°N</span><input type="range" min="-70" max="70" step="1" value="12" data-model-action="latitude" aria-label="Globe latitude in degrees"></label></div><div class="model-control-row"><label>Density<select data-model-action="density"><option value="256">256 preview points</option><option value="1024">1,024 preview points</option><option value="4096" selected>4,096 preview points</option></select></label><div class="model-control-row model-layer-controls" role="group" aria-label="Globe presentation layers">${button('particles', 'Particles', ' aria-pressed="true"')}${button('boundaries', 'Boundaries', ' aria-pressed="true"')}${button('routes', 'Routes', ' aria-pressed="true"')}${button('labels', 'Labels', ' aria-pressed="true"')}</div>${reset}</div>`
  },
  hush: {
    title: 'Hush for Mac',
    hint: 'Workspace · selected context · conversation',
    caption: 'The Mac workspace pairs its model picker and conversation sidebar with selected context. Review a sample, ask for the prerecorded response, and show the conversation in history.',
    controls: `<label>Sample context<select data-model-action="source"><option value="microphone">Spoken note</option><option value="text" selected>Text note</option><option value="capture">Calendar capture</option></select></label><div class="model-control-row">${button('review', 'Review context')}${button('ask', 'Ask', ' disabled')}${button('save', 'Show in history', ' disabled')}${reset}</div>`
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
