(() => {
  'use strict';

  const cues = [
    ['The path follows the water.', 'El sendero sigue el agua.'],
    ['We can hear the waves below.', 'Podemos oír las olas abajo.'],
    ['The light changes by the minute.', 'La luz cambia a cada minuto.'],
    ["Let's stay here a little longer.", 'Quedémonos aquí un poco más.']
  ];
  const contexts = {
    microphone: {
      title: "Tomorrow's meeting",
      label: 'Spoken note',
      body: "Tomorrow's meeting is at 10. Bring the draft and decide who will send the follow-up.",
      prompt: 'Turn this note into a short meeting checklist.',
      response: 'Meet at 10. Bring the draft. Choose one person to send the follow-up.'
    },
    text: {
      title: "Tomorrow's meeting",
      label: 'meeting-notes.txt',
      body: "Tomorrow's meeting is at 10. Bring the draft and decide who will send the follow-up.",
      prompt: 'Turn this note into a short meeting checklist.',
      response: 'Meet at 10. Bring the draft. Choose one person to send the follow-up.'
    },
    capture: {
      title: 'Calendar capture',
      label: 'Calendar capture',
      body: 'Thursday · 10:00–10:30 · Launch review. Agenda: release checklist, open items, and next steps.',
      prompt: 'What should I prepare for this meeting?',
      response: 'Bring the release checklist and a list of open items. Be ready to confirm owners and agree on the next steps.'
    }
  };
  const article = {
    title: 'A slower way to see the coast',
    deck: 'An afternoon on the path above the water.',
    body: 'We left the car by the old harbor and took the narrow path along the cliffs. Every bend opened a different view. With no schedule to keep, we stopped to listen to the waves.',
    editedTitle: 'Walking the coast without a schedule'
  };
  const inventory = [
    { id: '0', name: 'journal', path: '/sample/projects/journal/node_modules', size: 64, age: 12 },
    { id: '1', name: 'atlas', path: '/sample/projects/atlas/node_modules', size: 180, age: 45 },
    { id: '2', name: 'studio', path: '/sample/projects/studio/node_modules', size: 320, age: 90 },
    { id: '3', name: 'sandbox', path: '/sample/projects/sandbox/node_modules', size: 96, age: 7 }
  ];
  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, Number(value) || 0));
  const clock = value => `0:${String(Math.floor(value)).padStart(2, '0')}`;
  const layerNames = ['particles', 'boundaries', 'routes', 'labels'];
  const sorts = {
    size: (a, b) => b.size - a.size,
    date: (a, b) => b.age - a.age,
    name: (a, b) => a.name.localeCompare(b.name),
    path: (a, b) => a.path.localeCompare(b.path)
  };
  const filters = {
    all: () => true,
    active: (project, state) => !state.removed.includes(project.id),
    deleted: (project, state) => state.removed.includes(project.id),
    large: project => project.size > 100,
    old: project => project.age > 30
  };
  const sortedProjects = state => [...inventory].sort(sorts[state.sort]);
  const matchingProjects = state => sortedProjects(state).filter(project => filters[state.filter](project, state));
  const selectMatching = state => {
    const projects = matchingProjects(state);
    return { ...state, selected: projects.some(project => project.id === state.selected) ? state.selected : projects[0]?.id ?? '' };
  };
  const registry = {
    together: {
      initial: () => ({ time: 0, playing: false, translation: 'off' }),
      reduce(state, action) {
        if (action.type === 'reset') return this.initial();
        if (action.type === 'time') return { ...state, time: clamp(action.value, 0, 12), playing: false };
        if (action.type === 'translation') return { ...state, translation: action.value === 'es' ? 'es' : 'off' };
        if (action.type === 'play') return { ...state, time: state.time >= 12 ? 0 : state.time, playing: !state.playing };
        if (action.type === 'pause') return { ...state, playing: false };
        if (action.type === 'tick' && state.playing) {
          const time = clamp(state.time + Math.max(0, Number(action.value) || 0), 0, 12);
          return { ...state, time, playing: time < 12 };
        }
        return state;
      },
      view(state) {
        const cue = cues[Math.min(3, Math.floor(state.time / 3))];
        const translated = state.translation === 'es';
        return {
          phase: state.playing ? 'playing' : 'paused',
          texts: {
            playbackState: state.playing ? 'Playing' : 'Paused', playbackSymbol: state.playing ? 'Ⅱ' : '▶',
            elapsed: clock(state.time), remaining: `−${clock(12 - state.time)}`,
            sourceCaption: cue[0], translatedCaption: cue[1], translationLanguage: translated ? 'Spanish' : 'Off'
          },
          regions: { translatedCaption: translated },
          progress: { playbackProgress: { value: state.time, max: 12 } },
          readout: `${state.time.toFixed(1)} / 12 s · ${cue[0]}${translated ? ` · ${cue[1]}` : ' · Translation off.'}`,
          values: { time: `${state.time.toFixed(1)} s` },
          controls: {
            time: { value: state.time }, translation: { value: state.translation },
            play: { text: state.playing ? 'Pause' : 'Play', pressed: state.playing }
          }
        };
      }
    },
    sekai: {
      initial: () => ({ latitude: 12, longitude: 10, count: 4096, particles: true, boundaries: true, routes: true, labels: true }),
      reduce(state, action) {
        if (action.type === 'reset') return this.initial();
        if (action.type === 'latitude') return { ...state, latitude: clamp(action.value, -70, 70) };
        if (action.type === 'longitude') return { ...state, longitude: clamp(action.value, -180, 180) };
        if (action.type === 'density') return { ...state, count: [256, 1024, 4096].includes(Number(action.value)) ? Number(action.value) : 4096 };
        if (layerNames.includes(action.type)) return { ...state, [action.type]: !state[action.type] };
        return state;
      },
      view(state) {
        const latitude = `${Math.abs(state.latitude)}° ${state.latitude < 0 ? 'S' : 'N'}`;
        const longitude = `${Math.abs(state.longitude)}° ${state.longitude < 0 ? 'W' : 'E'}`;
        return {
          phase: 'globe', globe: { ...state },
          texts: {
            camera: `${latitude} · ${longitude}`, density: `${state.count.toLocaleString('en-US')} points`,
            presentation: state.particles && state.boundaries ? 'Both' : state.particles ? 'Particles' : state.boundaries ? 'Boundaries' : 'None', routes: state.routes ? 'On' : 'Off',
            labels: state.labels ? 'On' : 'Off', projection: 'Orthographic', previewCount: state.count.toLocaleString('en-US')
          },
          readout: `${latitude} · ${longitude} · ${state.count.toLocaleString('en-US')} preview points. ${layerNames.map(layer => `${layer[0].toUpperCase()}${layer.slice(1)} ${state[layer] ? 'on' : 'off'}`).join(' · ')}.`,
          values: { latitude, longitude },
          controls: {
            latitude: { value: state.latitude }, longitude: { value: state.longitude }, density: { value: state.count },
            ...Object.fromEntries(layerNames.map(layer => [layer, { pressed: state[layer] }]))
          }
        };
      }
    },
    hush: {
      initial: () => ({ source: 'text', stage: 'input' }),
      reduce(state, action) {
        if (action.type === 'reset') return this.initial();
        if (action.type === 'source' && Object.hasOwn(contexts, action.value)) return { source: action.value, stage: 'input' };
        if (action.type === 'review' && state.stage === 'input') return { ...state, stage: 'reviewed' };
        if (action.type === 'ask' && state.stage === 'reviewed') return { ...state, stage: 'asked' };
        if (action.type === 'save' && state.stage === 'asked') return { ...state, stage: 'saved' };
        return state;
      },
      view(state) {
        const context = contexts[state.source];
        const hasConversation = ['asked', 'saved'].includes(state.stage);
        const statuses = { input: 'Review the sample context to begin.', reviewed: 'Context reviewed. Ask to see the sample response.', asked: 'Prerecorded sample response.', saved: 'Shown in history.' };
        return {
          phase: state.stage,
          texts: {
            modelName: 'Apple On-Device', contextTitle: context.title, contextLabel: context.label, contextBody: context.body,
            conversationTitle: "Tomorrow's meeting", prompt: context.prompt, response: context.response,
            composer: state.stage === 'reviewed' ? context.prompt : 'Message Hush…', chatStatus: statuses[state.stage]
          },
          regions: { welcome: !hasConversation, context: true, conversation: hasConversation, saved: state.stage === 'saved' },
          readout: `${context.title} · ${statuses[state.stage]} Responses are prerecorded sample content.`,
          controls: {
            source: { value: state.source }, review: { disabled: state.stage !== 'input' },
            ask: { disabled: state.stage !== 'reviewed' }, save: { disabled: state.stage !== 'asked' }
          }
        };
      }
    },
    morph: {
      initial: () => ({ stage: 'original' }),
      reduce(state, action) {
        if (action.type === 'reset' || action.type === 'undo' && state.stage !== 'original') return this.initial();
        if (action.type === 'edit' && state.stage === 'original') return { stage: 'draft' };
        if (action.type === 'keep' && state.stage === 'draft') return { stage: 'kept' };
        return state;
      },
      view(state) {
        const edited = state.stage !== 'original';
        return {
          phase: state.stage,
          texts: {
            articleTitle: edited ? article.editedTitle : article.title,
            articleDeck: article.deck,
            articleBody: article.body,
            editorStatus: state.stage === 'draft' ? 'Review changes' : 'Ready',
            editPrompt: 'Make the title clearer and add a short summary.',
            activity: state.stage === 'original' ? 'Tell Morph what to change.' : state.stage === 'draft' ? 'Clarified the title and added a short summary.' : 'Changes kept on this sample page.'
          },
          regions: { decision: state.stage === 'draft', editedSummary: edited },
          readout: state.stage === 'original' ? 'Original sample article. Edit previews a clearer title and a short summary.' : state.stage === 'draft' ? 'Sample title changed and summary added. Keep the changes or Undo to restore the original.' : 'Changes kept. Undo restores the original sample article.',
          controls: { edit: { disabled: edited }, keep: { disabled: state.stage !== 'draft' }, undo: { disabled: !edited } }
        };
      }
    },
    modscan: {
      initial: () => ({ selected: '2', sort: 'size', filter: 'all', removed: [] }),
      reduce(state, action) {
        if (action.type === 'reset') return this.initial();
        if (action.type === 'filter') return selectMatching({ ...state, filter: Object.hasOwn(filters, action.value) ? action.value : 'all' });
        if (action.type === 'sort') return selectMatching({ ...state, sort: Object.hasOwn(sorts, action.value) ? action.value : 'size' });
        if (action.type === 'select' && matchingProjects(state).some(project => project.id === String(action.value))) return { ...state, selected: String(action.value) };
        if (action.type === 'remove' && state.selected && !state.removed.includes(state.selected)) return selectMatching({ ...state, removed: [...state.removed, state.selected] });
        return state;
      },
      view(state) {
        const visible = matchingProjects(state);
        const selected = inventory.find(project => project.id === state.selected);
        const active = inventory.filter(project => !state.removed.includes(project.id));
        const freed = inventory.filter(project => state.removed.includes(project.id)).reduce((sum, project) => sum + project.size, 0);
        const activeSize = active.reduce((sum, project) => sum + project.size, 0);
        const deleted = selected && state.removed.includes(selected.id);
        const sortNames = { size: 'size ↓', date: 'modified ↓', name: 'project A–Z', path: 'path A–Z' };
        const filterNames = { all: 'all', active: 'active', deleted: 'deleted', large: '>100 MB', old: '>30 days' };
        return {
          phase: `${active.length}-active`,
          texts: {
            sort: sortNames[state.sort], filter: filterNames[state.filter], activeCount: String(active.length),
            activeSize: `${activeSize} MB`, freedSize: `${freed} MB`, selectedProject: selected?.name ?? 'No project selected',
            selectedPath: selected?.path ?? 'No matching sample projects', selectedSize: selected ? `${selected.size} MB` : '—',
            selectedModified: selected ? `${selected.age} days ago` : '—', selectedStatus: selected ? deleted ? 'Deleted' : 'Available' : 'Empty',
            scanStatus: `Showing ${visible.length} of 4 modules (${state.filter} filter)`, emptyState: 'No matching sample modules.'
          },
          regions: { emptyState: !visible.length },
          readout: `${active.length} sample projects active · ${activeSize} MB active · ${freed} MB freed. ${selected ? `${selected.name} · ${selected.size} MB · ${deleted ? 'Deleted' : 'Available'}.` : 'No matching sample projects.'}`,
          controls: {
            select: { value: state.selected, disabled: !visible.length }, filter: { value: state.filter },
            sort: { value: state.sort }, remove: { disabled: !selected || deleted }
          },
          projects: sortedProjects(state).map(project => ({ ...project, visible: visible.some(item => item.id === project.id), selected: project.id === state.selected, deleted: state.removed.includes(project.id), status: state.removed.includes(project.id) ? 'Deleted' : 'Available' }))
        };
      }
    }
  };

function renderGlobe(root, state) {
  if (!root) return;
  const points = JSON.parse(root.getAttribute('data-globe-points'));
  const lines = JSON.parse(root.getAttribute('data-globe-lines'));
  const radians = Math.PI / 180;
  const phi = state.latitude * radians;
  const lambda = state.longitude * radians;
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const sinLambda = Math.sin(lambda);
  const cosLambda = Math.cos(lambda);
  const rounded = value => Number(value.toFixed(2));
  const project = ([x, y, z]) => ({
    x: 200 + 132 * (-sinLambda * x + cosLambda * z),
    y: 154 - 132 * (-sinPhi * cosLambda * x + cosPhi * y - sinPhi * sinLambda * z),
    depth: cosPhi * cosLambda * x + sinPhi * y + cosPhi * sinLambda * z
  });
  const normalize = vector => {
    const length = Math.hypot(...vector);
    return vector.map(value => value / length);
  };
  const vector = (latitude, longitude) => {
    const lat = latitude * radians;
    const lon = longitude * radians;
    return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
  };
  const segment = (a, b) => {
    let from = project(a);
    let to = project(b);
    if (from.depth < 0 && to.depth < 0) return '';
    if ((from.depth < 0) !== (to.depth < 0)) {
      const fraction = from.depth / (from.depth - to.depth);
      const horizon = project(normalize(a.map((value, axis) => value + (b[axis] - value) * fraction)));
      if (from.depth < 0) from = horizon;
      else to = horizon;
    }
    return `M${rounded(from.x)} ${rounded(from.y)}L${rounded(to.x)} ${rounded(to.y)}`;
  };
  const particles = state.particles ? points.slice(0, Math.min(points.length, state.count)).map(point => {
    const position = project(point);
    return position.depth >= 0 ? `M${rounded(position.x)} ${rounded(position.y)}h.01` : '';
  }).join('') : '';
  const boundaries = state.boundaries ? lines.map(line => segment(line.slice(0, 3), line.slice(3, 6))).join('') : '';
  const places = [
    { name: 'Chicago', latitude: 41.8781, longitude: -87.6298 },
    { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
    { name: 'Paris', latitude: 48.8566, longitude: 2.3522 }
  ];
  const routes = state.routes ? [[0, 1], [2, 1]].map(([from, to]) => {
    const a = vector(places[from].latitude, places[from].longitude);
    const b = vector(places[to].latitude, places[to].longitude);
    const angle = Math.acos(Math.max(-1, Math.min(1, a.reduce((total, value, axis) => total + value * b[axis], 0))));
    const sine = Math.sin(angle);
    const arc = Array.from({ length: 65 }, (_, index) => {
      const fraction = index / 64;
      const start = Math.sin((1 - fraction) * angle) / sine;
      const end = Math.sin(fraction * angle) / sine;
      return a.map((value, axis) => value * start + b[axis] * end);
    });
    return arc.slice(1).map((point, index) => segment(arc[index], point)).join('');
  }).join('') : '';
  let markers = '';
  let labels = '';
  for (const place of places) {
    const position = project(vector(place.latitude, place.longitude));
    if (position.depth < 0) continue;
    const x = rounded(position.x);
    const y = rounded(position.y);
    markers += `<circle cx="${x}" cy="${y}" r="3.1"><title>${place.name}</title></circle>`;
    if (state.labels) {
      const left = x > 284;
      labels += `<text x="${rounded(x + (left ? -7 : 7))}" y="${rounded(y - 7)}" text-anchor="${left ? 'end' : 'start'}">${place.name}</text>`;
    }
  }
  for (const [name, value] of Object.entries({ particles, boundaries, routes })) {
    root.querySelector(`[data-globe-${name}]`).setAttribute('d', value);
  }
  root.querySelector('[data-globe-markers]').innerHTML = markers;
  root.querySelector('[data-globe-labels]').innerHTML = labels;
}



  if (typeof module !== 'undefined' && module.exports) module.exports = { registry, inventory, article, contexts, cues };
  if (typeof document === 'undefined') return;

  const figures = [...document.querySelectorAll('[data-working-model]')];
  if (!figures.length) return;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const instances = [];
  let frameId = 0;
  let lastFrame = 0;
  let suspended = false;
  const setText = (node, value) => { if (node && node.textContent !== String(value)) node.textContent = String(value); };
  const bindings = (figure, attribute) => {
    const result = new Map();
    for (const node of figure.querySelectorAll(`[${attribute}]`)) {
      const name = node.getAttribute(attribute);
      if (!result.has(name)) result.set(name, []);
      result.get(name).push(node);
    }
    return result;
  };
  const canPlay = instance => !suspended && !document.hidden && instance.visible && !motionPreference.matches;
  const schedule = () => {
    if (instances.some(instance => instance.kind === 'together' && instance.state.playing && canPlay(instance))) {
      if (!frameId) frameId = requestAnimationFrame(tick);
    } else {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      lastFrame = 0;
    }
  };
  const paint = instance => {
    const view = instance.model.view(instance.state);
    instance.view = view;
    instance.figure.setAttribute('data-model-phase', view.phase);
    setText(instance.readout, view.readout);
    for (const [name, value] of Object.entries(view.texts || {})) for (const node of instance.texts.get(name) || []) setText(node, value);
    for (const [name, visible] of Object.entries(view.regions || {})) for (const node of instance.regions.get(name) || []) node.hidden = !visible;
    for (const [name, value] of Object.entries(view.values || {})) for (const node of instance.values.get(name) || []) setText(node, value);
    for (const [name, config] of Object.entries(view.progress || {})) {
      for (const node of instance.progress.get(name) || []) {
        node.max = config.max;
        node.value = config.value;
      }
    }
    for (const control of instance.actions) {
      const action = control.getAttribute('data-model-action');
      const config = view.controls[action] || {};
      control.disabled = Boolean(config.disabled || action === 'play' && motionPreference.matches);
      if (config.value !== undefined && control.value !== String(config.value)) control.value = String(config.value);
      if (config.pressed !== undefined) control.setAttribute('aria-pressed', String(config.pressed));
      if (config.text) {
        if (control.hasAttribute('data-model-icon-action')) control.setAttribute('aria-label', config.text);
        else setText(control, config.text);
      }
      if (action === 'play') control.title = motionPreference.matches ? 'Reduced motion is on. Use the time slider to explore.' : '';
    }
    for (const note of instance.motionNotes) note.hidden = !motionPreference.matches;
    if (view.projects) {
      const projectControl = instance.actions.find(control => control.getAttribute('data-model-action') === 'select');
      for (const project of view.projects) {
        const row = instance.rows.get(project.id);
        if (row) {
          row.hidden = !project.visible;
          row.setAttribute('data-selected', String(project.selected));
          row.setAttribute('aria-selected', String(project.selected));
          row.setAttribute('data-deleted', String(project.deleted));
          for (const status of row.querySelectorAll('[data-project-status]')) setText(status, project.status);
        }
        const option = projectControl?.querySelector(`[value="${project.id}"]`);
        if (option) {
          option.hidden = !project.visible;
          option.disabled = !project.visible;
          setText(option, `${project.name} · ${project.size} MB${project.deleted ? ' · Deleted' : ''}`);
        }
      }
      const order = view.projects.map(project => project.id).join(',');
      if (instance.rowOrder !== order && instance.rows.size) {
        for (const project of view.projects) {
          const row = instance.rows.get(project.id);
          if (row) row.parentNode.appendChild(row);
        }
        instance.rowOrder = order;
      }
      if (projectControl) {
        const empty = projectControl.querySelector('[value=""]');
        if (empty) empty.hidden = view.projects.some(project => project.visible);
        projectControl.value = instance.state.selected;
      }
    }
    if (view.globe && instance.globe && typeof renderGlobe === 'function') renderGlobe(instance.globe, view.globe);
  };
  const dispatch = (instance, type, value, announce = true) => {
    if (type === 'play' && !canPlay(instance)) return;
    instance.state = instance.model.reduce(instance.state, { type, value });
    paint(instance);
    if (announce) setText(instance.status, instance.view.readout);
    schedule();
  };
  const stop = instance => {
    if (instance.kind === 'together' && instance.state.playing) instance.state = instance.model.reduce(instance.state, { type: 'pause' });
    paint(instance);
  };
  function tick(now) {
    frameId = 0;
    const elapsed = lastFrame ? Math.min(0.1, (now - lastFrame) / 1000) : 0;
    lastFrame = now;
    for (const instance of instances) {
      if (instance.kind !== 'together' || !instance.state.playing || !canPlay(instance)) continue;
      instance.state = instance.model.reduce(instance.state, { type: 'tick', value: elapsed });
      paint(instance);
    }
    schedule();
  }
  for (const figure of figures) {
    const kind = figure.getAttribute('data-working-model');
    const model = registry[kind];
    const controls = figure.querySelector('[data-model-controls]');
    const readout = figure.querySelector('[data-model-readout]');
    const status = figure.querySelector('[data-model-status]');
    if (!model || !controls || !readout || !status) continue;
    const bounds = figure.getBoundingClientRect();
    readout.setAttribute('aria-live', 'off');
    const instance = {
      kind, figure, model, controls, readout, status, state: model.initial(),
      visible: bounds.bottom > 0 && bounds.top < window.innerHeight,
      texts: bindings(figure, 'data-model-text'), regions: bindings(figure, 'data-model-region'),
      values: bindings(figure, 'data-model-value'), progress: bindings(figure, 'data-model-progress'),
      actions: [...figure.querySelectorAll('[data-model-action]')],
      motionNotes: [...figure.querySelectorAll('[data-model-motion-note]')],
      rows: new Map([...figure.querySelectorAll('[data-project-row]')].map(row => [row.getAttribute('data-project-row'), row])),
      globe: figure.querySelector('[data-globe]'), rowOrder: ''
    };
    instances.push(instance);
    paint(instance);
    controls.hidden = false;
    figure.addEventListener('click', event => {
      const control = event.target.closest('button[data-model-action]');
      if (control && figure.contains(control) && !control.disabled) dispatch(instance, control.getAttribute('data-model-action'), control.getAttribute('data-model-value'));
    });
    figure.addEventListener('input', event => {
      const control = event.target;
      if (control.matches('input[type="range"][data-model-action]')) dispatch(instance, control.getAttribute('data-model-action'), control.value, false);
    });
    figure.addEventListener('change', event => {
      const control = event.target;
      if (control.matches('select[data-model-action]')) dispatch(instance, control.getAttribute('data-model-action'), control.value);
      else if (control.matches('input[type="range"][data-model-action]')) setText(status, instance.view.readout);
    });
  }
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      const instance = instances.find(item => item.figure === entry.target);
      if (!instance) continue;
      instance.visible = entry.isIntersecting;
      if (!instance.visible) stop(instance);
    }
    schedule();
  }, { threshold: 0 }) : null;
  for (const instance of instances) observer?.observe(instance.figure);
  motionPreference.addEventListener('change', () => {
    for (const instance of instances) stop(instance);
    schedule();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) for (const instance of instances) stop(instance);
    schedule();
  });
  window.addEventListener('pagehide', () => {
    suspended = true;
    for (const instance of instances) stop(instance);
    observer?.disconnect();
    schedule();
  });
  window.addEventListener('pageshow', () => {
    suspended = false;
    for (const instance of instances) observer?.observe(instance.figure);
    schedule();
  });
})();
