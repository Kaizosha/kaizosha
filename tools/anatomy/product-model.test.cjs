const test = require('node:test');
const assert = require('node:assert/strict');
const { registry } = require('../../assets/scripts/product-model.js');

test('Together scrub and translation use the same cue and physical positions', () => {
  const model = registry.together;
  let state = model.reduce(model.initial(), { type: 'time', value: 6 });
  state = model.reduce(state, { type: 'translation', value: 'es' });
  const view = model.view(state);
  assert.equal(view.parts.transport.fraction, 0.5);
  assert.equal(view.parts.playhead.fraction, 0.5);
  assert.equal(view.parts.translation.fraction, 1);
  assert.equal(view.readout, '6.0 / 12 s · Original: Translate only when you choose. · Spanish: Traduce solo cuando lo decidas.');
  assert.deepEqual(model.reduce(state, { type: 'reset' }), { time: 0, playing: false, translation: 'off' });
});

test('Together stops at the final cue and Play restarts the transport', () => {
  const model = registry.together;
  let state = model.reduce(model.initial(), { type: 'play' });
  state = model.reduce(state, { type: 'tick', value: 15 });
  assert.deepEqual(state, { time: 12, playing: false, translation: 'off' });
  assert.equal(model.view(state).parts.transport.fraction, 1);
  state = model.reduce(state, { type: 'play' });
  assert.deepEqual(state, { time: 0, playing: true, translation: 'off' });
  state = model.reduce(state, { type: 'time', value: -2 });
  assert.deepEqual(state, { time: 0, playing: false, translation: 'off' });
});

test('Sekai layer toggles change visibility and the reported layer count', () => {
  const model = registry.sekai;
  const state = model.reduce(model.initial(), { type: 'boundaries' });
  const view = model.view(state);
  assert.equal(view.parts.boundaries.visible, false);
  assert.equal(view.parts.labels.visible, true);
  assert.equal(view.readout, 'Sample atlas · 2 of 3 layers visible. Particles on · Boundaries off · Labels on.');
  assert.deepEqual(model.reduce(state, { type: 'reset' }), { particles: true, boundaries: true, labels: true });
});

test('Hush requires review before an external sample request and saves locally afterward', () => {
  const model = registry.hush;
  let state = model.reduce(model.initial(), { type: 'ask' });
  assert.equal(state.stage, 'input');
  state = model.reduce(state, { type: 'save' });
  assert.equal(state.stage, 'input');
  state = model.reduce(state, { type: 'source', value: 'capture' });
  assert.equal(model.view(state).parts.capture.fraction, 1);
  assert.equal(model.view(state).parts.microphone.fraction, 0);
  state = model.reduce(state, { type: 'review' });
  assert.equal(model.view(state).controls.ask.disabled, false);
  state = model.reduce(state, { type: 'ask' });
  assert.equal(model.view(state).parts.request.fraction, 1);
  assert.equal(model.view(state).parts.session.fraction, 0);
  state = model.reduce(state, { type: 'save' });
  assert.equal(model.view(state).parts.session.fraction, 1);
  assert.equal(model.view(state).readout, 'A sample screen capture of the meeting calendar. Sample session saved to the local spool in this model.');
  assert.deepEqual(model.reduce(state, { type: 'source', value: 'text' }), { source: 'text', stage: 'input' });
});

test('Morph Apply and Undo respect the preview and applied states', () => {
  const model = registry.morph;
  let state = model.reduce(model.initial(), { type: 'apply' });
  assert.deepEqual(state, { stage: 'original' });
  state = model.reduce(state, { type: 'preview' });
  assert.deepEqual(state, { stage: 'preview' });
  assert.equal(model.view(state).parts.press.fraction, 0);
  assert.equal(model.view(state).controls.apply.disabled, false);
  state = model.reduce(state, { type: 'apply' });
  assert.deepEqual(state, { stage: 'applied' });
  assert.equal(model.view(state).parts.press.fraction, 1);
  assert.equal(model.view(state).parts.proof.fraction, 1);
  state = model.reduce(state, { type: 'undo' });
  assert.deepEqual(state, { stage: 'original' });
  assert.equal(model.view(state).parts.proof.fraction, 0);
  assert.equal(model.view(state).controls.undo.disabled, true);
});

test('ModScan selection, filters, removal, and freed space use one sample inventory', () => {
  const model = registry.modscan;
  let state = model.reduce(model.initial(), { type: 'filter', value: 'large' });
  let view = model.view(state);
  assert.equal(state.selected, '1');
  assert.deepEqual(view.projects.filter(project => project.visible).map(project => project.id), ['1', '2']);
  assert.equal(view.readout, '4 sample projects active · 0 MB freed in this model. Selected /sample/projects/atlas/node_modules · 180 MB · 45 days old.');
  state = model.reduce(state, { type: 'remove' });
  view = model.view(state);
  assert.equal(view.parts['project-1'].visible, false);
  assert.equal(view.parts['project-1'].fraction, 1);
  assert.equal(view.readout, '3 sample projects active · 180 MB freed in this model. Selected /sample/projects/studio/node_modules · 320 MB · 90 days old.');
  state = model.reduce(state, { type: 'remove' });
  view = model.view(state);
  assert.equal(view.controls.remove.disabled, true);
  assert.equal(view.readout, '2 sample projects active · 500 MB freed in this model. No sample projects match this filter.');
  state = model.reduce(state, { type: 'filter', value: 'all' });
  assert.equal(state.selected, '0');
  assert.equal(model.view(state).parts['project-0'].visible, true);
  assert.deepEqual(model.reduce(state, { type: 'reset' }), { selected: '0', filter: 'all', removed: [] });
});

test('ModScan has exact old-project filtering and a stable empty state after all removals', () => {
  const model = registry.modscan;
  let state = model.reduce(model.initial(), { type: 'filter', value: 'old' });
  assert.deepEqual(model.view(state).projects.filter(project => project.visible).map(project => project.id), ['1', '2']);
  state = model.reduce(state, { type: 'filter', value: 'all' });
  for (let index = 0; index < 4; index++) state = model.reduce(state, { type: 'remove' });
  assert.equal(model.view(state).readout, '0 sample projects active · 660 MB freed in this model. No sample projects match this filter.');
  assert.deepEqual(model.reduce(state, { type: 'remove' }), state);
});
