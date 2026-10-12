import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { registry } = require('../../assets/scripts/product-model.js');

const button = (action, text, attrs = '') => `<button type="button" data-model-action="${action}"${attrs}>${text}</button>`;
const reset = button('reset', 'Reset', ' class="model-reset"');

export const config = {
  together: {
    title: 'Caption transport',
    hint: '12-second sample · scrub or play',
    caption: 'A reel bench keeps original captions in view. Scrub the sample or play its 12-second transport. Spanish translation engages only when selected.',
    controls: `<label class="model-range">Time <span data-model-value="time">0.0 s</span><input type="range" min="0" max="12" step="0.1" value="0" data-model-action="time" aria-label="Sample time in seconds"></label><div class="model-control-row">${button('play', 'Play', ' aria-pressed="false"')}<label>Translation<select data-model-action="translation"><option value="off">Off</option><option value="es">Spanish</option></select></label>${reset}</div><p class="model-motion-note" data-model-motion-note hidden>Reduced motion is on. Use the time slider to explore.</p>`
  },
  sekai: {
    title: 'Atlas instrument',
    hint: 'Three physical layers · toggle to inspect',
    caption: 'An atlas instrument holds separate particle, boundary, and label layers around a supported globe. This abstract specimen uses sample geography.',
    controls: `<div class="model-control-row model-layer-controls" role="group" aria-label="Atlas layers">${button('particles', 'Particles', ' aria-pressed="true"')}${button('boundaries', 'Boundaries', ' aria-pressed="true"')}${button('labels', 'Labels', ' aria-pressed="true"')}${reset}</div>`
  },
  hush: {
    title: 'Context console',
    hint: 'Select · review · ask · save',
    caption: 'Review a sample input before routing a sample request to an external provider. Save the sample answer to the local session spool. This model makes no network requests.',
    controls: `<label>Sample source<select data-model-action="source"><option value="microphone">Microphone</option><option value="text">Text</option><option value="capture">Capture</option></select></label><div class="model-control-row">${button('review', 'Review context')}${button('ask', 'Ask', ' disabled')}${button('save', 'Save session', ' disabled')}${reset}</div>`
  },
  morph: {
    title: 'Reversible proof press',
    hint: 'Original · preview · applied',
    caption: 'Draw out a sample draft, apply it in the proof press, then undo to restore the original. The master plate stays fixed through every state.',
    controls: `<div class="model-control-row">${button('preview', 'Preview')}${button('apply', 'Apply', ' disabled')}${button('undo', 'Undo', ' disabled')}${reset}</div>`
  },
  modscan: {
    title: 'Dependency cabinet',
    hint: 'Sample inventory · no disk access',
    caption: 'Four sample dependency cartridges are scaled to 64, 180, 320, and 96 MB. Filter, inspect, and remove samples to see the active count and freed space. This model never touches disk files.',
    controls: `<div class="model-control-row model-inventory-controls"><label>Filter<select data-model-action="filter"><option value="all">All samples</option><option value="large">Large · over 100 MB</option><option value="old">Old · over 30 days</option></select></label><label>Project<select data-model-action="select"><option value="" hidden disabled>No matching samples</option><option value="0">journal · 64 MB · 12 days</option><option value="1">atlas · 180 MB · 45 days</option><option value="2">studio · 320 MB · 90 days</option><option value="3">sandbox · 96 MB · 7 days</option></select></label></div><div class="model-control-row">${button('remove', 'Remove selected sample')}${reset}</div>`
  }
};

for (const [id, item] of Object.entries(config)) item.initialReadout = registry[id].view(registry[id].initial()).readout;

export default config;
