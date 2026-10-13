const test = require('node:test');
const assert = require('node:assert/strict');
const { registry, inventory } = require('./controller.js');

test('Together scrub updates visible original and Spanish captions at the same cue', () => {
  const model = registry.together;
  let state = model.reduce(model.initial(), { type: 'time', value: 6 });
  state = model.reduce(state, { type: 'translation', value: 'es' });
  const view = model.view(state);
  assert.equal(view.texts.sourceCaption, 'The light changes by the minute.');
  assert.equal(view.texts.translatedCaption, 'La luz cambia a cada minuto.');
  assert.equal(view.texts.elapsed, '0:06');
  assert.equal(view.texts.remaining, '−0:06');
  assert.equal(view.texts.translationLanguage, 'Spanish');
  assert.equal(view.regions.translatedCaption, true);
  assert.deepEqual(view.progress.playbackProgress, { value: 6, max: 12 });
  const reset = model.view(model.reduce(state, { type: 'reset' }));
  assert.equal(reset.texts.sourceCaption, 'The path follows the water.');
  assert.equal(reset.texts.translationLanguage, 'Off');
  assert.equal(reset.regions.translatedCaption, false);
});

test('Together reaches the last caption and Play restarts the sample', () => {
  const model = registry.together;
  let state = model.reduce(model.initial(), { type: 'play' });
  state = model.reduce(state, { type: 'tick', value: 15 });
  assert.equal(model.view(state).texts.playbackState, 'Paused');
  assert.equal(model.view(state).texts.sourceCaption, "Let's stay here a little longer.");
  assert.equal(model.view(state).progress.playbackProgress.value, 12);
  state = model.reduce(state, { type: 'play' });
  assert.equal(model.view(state).texts.playbackState, 'Playing');
  assert.equal(model.view(state).texts.sourceCaption, 'The path follows the water.');
  state = model.reduce(state, { type: 'time', value: -2 });
  assert.equal(model.view(state).texts.elapsed, '0:00');
  assert.equal(model.view(state).texts.playbackState, 'Paused');
});

test('Sekai camera, density, and inspector layers produce a renderable globe view', () => {
  const model = registry.sekai;
  let state = model.reduce(model.initial(), { type: 'longitude', value: -74 });
  state = model.reduce(state, { type: 'latitude', value: 40 });
  state = model.reduce(state, { type: 'density', value: '4096' });
  state = model.reduce(state, { type: 'routes' });
  const view = model.view(state);
  assert.equal(view.texts.camera, '40° N · 74° W');
  assert.equal(view.texts.density, '4,096 points');
  assert.equal(view.texts.routes, 'Off');
  assert.deepEqual(view.globe, { latitude: 40, longitude: -74, count: 4096, particles: true, boundaries: true, routes: false, labels: true });
  assert.equal(model.view(model.reduce(state, { type: 'reset' })).texts.camera, '12° N · 10° E');
});

test('Sekai clamps native camera ranges and rejects unsupported preview densities', () => {
  const model = registry.sekai;
  let state = model.reduce(model.initial(), { type: 'longitude', value: 500 });
  state = model.reduce(state, { type: 'latitude', value: -90 });
  state = model.reduce(state, { type: 'density', value: '1000000' });
  assert.equal(model.view(state).texts.camera, '70° S · 180° E');
  assert.equal(model.view(state).texts.previewCount, '4,096');
});

test('Hush shows chosen context, review, sample conversation, and history', () => {
  const model = registry.hush;
  let state = model.initial();
  assert.equal(model.view(state).texts.modelName, 'Apple On-Device');
  assert.equal(model.view(state).texts.contextTitle, "Tomorrow's meeting");
  state = model.reduce(state, { type: 'ask' });
  assert.equal(model.view(state).regions.conversation, false);
  state = model.reduce(state, { type: 'source', value: 'capture' });
  assert.equal(model.view(state).texts.contextTitle, 'Calendar capture');
  assert.match(model.view(state).texts.contextBody, /10:00–10:30/);
  state = model.reduce(state, { type: 'review' });
  assert.equal(model.view(state).texts.composer, 'What should I prepare for this meeting?');
  assert.equal(model.view(state).controls.ask.disabled, false);
  state = model.reduce(state, { type: 'ask' });
  assert.equal(model.view(state).regions.welcome, false);
  assert.equal(model.view(state).regions.conversation, true);
  assert.equal(model.view(state).texts.response, 'Bring the release checklist and a list of open items. Be ready to confirm owners and agree on the next steps.');
  state = model.reduce(state, { type: 'save' });
  assert.equal(model.view(state).regions.saved, true);
  assert.equal(model.view(state).texts.chatStatus, 'Shown in history.');
});

test('Hush choosing a different sample clears the conversation and history', () => {
  const model = registry.hush;
  let state = model.reduce(model.initial(), { type: 'review' });
  state = model.reduce(state, { type: 'ask' });
  state = model.reduce(state, { type: 'save' });
  state = model.reduce(state, { type: 'source', value: 'text' });
  const view = model.view(state);
  assert.equal(view.texts.contextTitle, "Tomorrow's meeting");
  assert.equal(view.regions.conversation, false);
  assert.equal(view.regions.saved, false);
  assert.equal(view.regions.welcome, true);
  assert.equal(view.controls.ask.disabled, true);
});

test('Morph Edit changes the article title and displays summary and draft decisions', () => {
  const model = registry.morph;
  const original = model.view(model.initial());
  const draft = model.view(model.reduce(model.initial(), { type: 'edit' }));
  assert.equal(original.texts.articleTitle, 'A slower way to see the coast');
  assert.equal(original.texts.articleDeck, 'An afternoon on the path above the water.');
  assert.equal(draft.texts.articleTitle, 'Walking the coast without a schedule');
  assert.equal(draft.regions.editedSummary, true);
  assert.equal(draft.regions.decision, true);
  assert.equal(draft.texts.editorStatus, 'Review changes');
  assert.equal(draft.controls.keep.disabled, false);
  assert.equal(draft.controls.undo.disabled, false);
});

test('Morph Undo restores the original page from both draft and kept states', () => {
  const model = registry.morph;
  const draft = model.reduce(model.initial(), { type: 'edit' });
  const kept = model.reduce(draft, { type: 'keep' });
  assert.equal(model.view(kept).texts.articleTitle, 'Walking the coast without a schedule');
  assert.equal(model.view(kept).regions.decision, false);
  assert.equal(model.view(kept).regions.editedSummary, true);
  for (const state of [draft, kept]) {
    const view = model.view(model.reduce(state, { type: 'undo' }));
    assert.equal(view.texts.articleTitle, 'A slower way to see the coast');
    assert.equal(view.regions.editedSummary, false);
    assert.equal(view.controls.undo.disabled, true);
  }
  assert.equal(model.view(model.reduce(model.initial(), { type: 'keep' })).phase, 'original');
});

test('ModScan defaults to descending sizes and selects the largest sample', () => {
  const view = registry.modscan.view(registry.modscan.initial());
  assert.deepEqual(view.projects.map(project => project.name), ['studio', 'atlas', 'sandbox', 'journal']);
  assert.equal(view.texts.selectedProject, 'studio');
  assert.equal(view.texts.selectedPath, '/sample/projects/studio/node_modules');
  assert.equal(view.texts.activeCount, '4');
  assert.equal(view.texts.activeSize, '660 MB');
  assert.equal(view.texts.freedSize, '0 MB');
});

test('ModScan retains Deleted rows while updating active and freed totals', () => {
  const model = registry.modscan;
  let state = model.reduce(model.initial(), { type: 'remove' });
  let view = model.view(state);
  assert.equal(view.texts.activeCount, '3');
  assert.equal(view.texts.activeSize, '340 MB');
  assert.equal(view.texts.freedSize, '320 MB');
  assert.equal(view.texts.selectedStatus, 'Deleted');
  assert.equal(view.controls.remove.disabled, true);
  assert.equal(view.projects.find(project => project.id === '2').visible, true);
  assert.equal(view.projects.find(project => project.id === '2').status, 'Deleted');
  state = model.reduce(state, { type: 'remove' });
  assert.equal(model.view(state).texts.freedSize, '320 MB');
  state = model.reduce(state, { type: 'filter', value: 'deleted' });
  view = model.view(state);
  assert.deepEqual(view.projects.filter(project => project.visible).map(project => project.name), ['studio']);
  state = model.reduce(state, { type: 'filter', value: 'active' });
  view = model.view(state);
  assert.equal(view.texts.selectedProject, 'atlas');
  assert.deepEqual(view.projects.filter(project => project.visible).map(project => project.name), ['atlas', 'sandbox', 'journal']);
});

test('ModScan sort, strict filters, and empty states retain the same sample inventory', () => {
  const model = registry.modscan;
  let state = model.reduce(model.initial(), { type: 'filter', value: 'large' });
  assert.deepEqual(model.view(state).projects.filter(project => project.visible).map(project => project.size), [320, 180]);
  state = model.reduce(state, { type: 'filter', value: 'old' });
  assert.deepEqual(model.view(state).projects.filter(project => project.visible).map(project => project.age), [90, 45]);
  state = model.reduce(state, { type: 'filter', value: 'all' });
  state = model.reduce(state, { type: 'sort', value: 'name' });
  assert.deepEqual(model.view(state).projects.map(project => project.name), ['atlas', 'journal', 'sandbox', 'studio']);
  state = model.reduce(state, { type: 'filter', value: 'deleted' });
  assert.equal(model.view(state).regions.emptyState, true);
  assert.equal(model.view(state).controls.remove.disabled, true);
  state = model.reduce(state, { type: 'filter', value: 'active' });
  for (let index = 0; index < 4; index++) state = model.reduce(state, { type: 'remove' });
  const view = model.view(state);
  assert.equal(view.texts.activeCount, '0');
  assert.equal(view.texts.activeSize, '0 MB');
  assert.equal(view.texts.freedSize, '660 MB');
  assert.equal(view.regions.emptyState, true);
  assert.equal(view.controls.select.disabled, true);
  state = model.reduce(state, { type: 'filter', value: 'all' });
  assert.equal(model.view(state).projects.filter(project => project.visible && project.deleted).length, 4);
  assert.equal(inventory.length, 4);
});
