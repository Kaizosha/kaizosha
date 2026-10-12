(() => {
  'use strict';

  const cues = [
    ['Welcome to the bench.', 'Bienvenido a la mesa.'],
    ['Keep the original in view.', 'Mantén el original a la vista.'],
    ['Translate only when you choose.', 'Traduce solo cuando lo decidas.'],
    ['Make room for every voice.', 'Haz espacio para cada voz.']
  ];
  const sources = {
    microphone: 'A sample spoken note about tomorrow\'s meeting.',
    text: 'A sample text note with the meeting agenda.',
    capture: 'A sample screen capture of the meeting calendar.'
  };
  const inventory = [
    { id: '0', path: '/sample/projects/journal/node_modules', size: 64, age: 12 },
    { id: '1', path: '/sample/projects/atlas/node_modules', size: 180, age: 45 },
    { id: '2', path: '/sample/projects/studio/node_modules', size: 320, age: 90 },
    { id: '3', path: '/sample/projects/sandbox/node_modules', size: 96, age: 7 }
  ];
  const part = (fraction = 0, visible = true, active = false) => ({ fraction, visible, active });
  const matches = (project, filter) => filter === 'large' ? project.size > 100 : filter === 'old' ? project.age > 30 : true;
  const available = state => inventory.filter(project => !state.removed.includes(project.id) && matches(project, state.filter));
  const selectAvailable = state => {
    const projects = available(state);
    return { ...state, selected: projects.some(project => project.id === state.selected) ? state.selected : projects[0]?.id ?? '' };
  };
  const registry = {
    together: {
      initial: () => ({ time: 0, playing: false, translation: 'off' }),
      reduce(state, action) {
        if (action.type === 'reset') return this.initial();
        if (action.type === 'time') return { ...state, time: Math.max(0, Math.min(12, Number(action.value) || 0)), playing: false };
        if (action.type === 'translation') return { ...state, translation: action.value === 'es' ? 'es' : 'off' };
        if (action.type === 'play') return { ...state, time: state.time >= 12 ? 0 : state.time, playing: !state.playing };
        if (action.type === 'pause') return { ...state, playing: false };
        if (action.type === 'tick' && state.playing) {
          const time = Math.min(12, state.time + action.value);
          return { ...state, time, playing: time < 12 };
        }
        return state;
      },
      view(state) {
        const cue = cues[Math.min(3, Math.floor(state.time / 3))];
        const translated = state.translation === 'es';
        return {
          phase: state.playing ? 'playing' : 'paused',
          parts: { transport: part(state.time / 12), playhead: part(state.time / 12), translation: part(translated ? 1 : 0, true, translated) },
          readout: `${state.time.toFixed(1)} / 12 s · Original: ${cue[0]}${translated ? ` · Spanish: ${cue[1]}` : ' · Translation off.'}`,
          values: { time: `${state.time.toFixed(1)} s` },
          controls: {
            time: { value: state.time }, translation: { value: state.translation },
            play: { text: state.playing ? 'Pause' : 'Play', pressed: state.playing }
          }
        };
      }
    },
    sekai: {
      initial: () => ({ particles: true, boundaries: true, labels: true }),
      reduce(state, action) {
        if (action.type === 'reset') return this.initial();
        if (['particles', 'boundaries', 'labels'].includes(action.type)) return { ...state, [action.type]: !state[action.type] };
        return state;
      },
      view(state) {
        const layers = Object.keys(state);
        return {
          phase: `${layers.filter(layer => state[layer]).length}-layers`,
          parts: Object.fromEntries(layers.map(layer => [layer, part(0, state[layer], state[layer])])),
          readout: `Sample atlas · ${layers.filter(layer => state[layer]).length} of 3 layers visible. ${layers.map(layer => `${layer[0].toUpperCase()}${layer.slice(1)} ${state[layer] ? 'on' : 'off'}`).join(' · ')}.`,
          controls: Object.fromEntries(layers.map(layer => [layer, { pressed: state[layer] }]))
        };
      }
    },
    hush: {
      initial: () => ({ source: 'microphone', stage: 'input' }),
      reduce(state, action) {
        if (action.type === 'reset') return this.initial();
        if (action.type === 'source' && Object.hasOwn(sources, action.value)) return { source: action.value, stage: 'input' };
        if (action.type === 'review') return { ...state, stage: 'reviewed' };
        if (action.type === 'ask' && state.stage === 'reviewed') return { ...state, stage: 'asked' };
        if (action.type === 'save' && state.stage === 'asked') return { ...state, stage: 'saved' };
        return state;
      },
      view(state) {
        const stage = ['input', 'reviewed', 'asked', 'saved'].indexOf(state.stage);
        const messages = [
          'Review the sample context before asking.',
          'Sample context reviewed. Ready to ask an external provider.',
          'Sample request routed to the external provider. Sample answer ready.',
          'Sample session saved to the local spool in this model.'
        ];
        return {
          phase: state.stage,
          parts: {
            ...Object.fromEntries(Object.keys(sources).map(source => [source, part(state.source === source ? 1 : 0, true, state.source === source)])),
            review: part(stage >= 1 ? 1 : 0, true, stage === 1),
            request: part(stage >= 2 ? 1 : 0, true, stage >= 2), session: part(stage >= 3 ? 1 : 0, true, stage >= 3)
          },
          readout: `${sources[state.source]} ${messages[stage]}`,
          controls: {
            source: { value: state.source }, review: { disabled: state.stage === 'reviewed' },
            ask: { disabled: state.stage !== 'reviewed' }, save: { disabled: state.stage !== 'asked' }
          }
        };
      }
    },
    morph: {
      waitForMotion: ['preview', 'apply', 'undo'],
      initial: () => ({ stage: 'original' }),
      reduce(state, action) {
        if (action.type === 'reset' || action.type === 'undo' && state.stage === 'applied') return this.initial();
        if (action.type === 'preview' && state.stage === 'original') return { stage: 'preview' };
        if (action.type === 'apply' && state.stage === 'preview') return { stage: 'applied' };
        return state;
      },
      view(state) {
        const applied = state.stage === 'applied';
        const original = state.stage === 'original';
        return {
          phase: state.stage,
          parts: { draft: part(original ? 0 : 1, true, !original), press: part(applied ? 1 : 0, true, applied), proof: part(applied ? 1 : 0, true, applied) },
          readout: original ? 'Original plate ready. Preview a sample edit before applying.' : applied ? 'Sample edit applied. The proof is in the viewing tray. Undo restores the original.' : 'Sample edit previewed. The original plate remains fixed. Apply to make a proof.',
          controls: { preview: { disabled: !original }, apply: { disabled: state.stage !== 'preview' }, undo: { disabled: !applied } }
        };
      }
    },
    modscan: {
      initial: () => ({ selected: '0', filter: 'all', removed: [] }),
      reduce(state, action) {
        if (action.type === 'reset') return this.initial();
        if (action.type === 'filter') return selectAvailable({ ...state, filter: ['large', 'old'].includes(action.value) ? action.value : 'all' });
        if (action.type === 'select' && available(state).some(project => project.id === action.value)) return { ...state, selected: action.value };
        if (action.type === 'remove' && state.selected !== '') return selectAvailable({ ...state, removed: [...state.removed, state.selected] });
        return state;
      },
      view(state) {
        const projects = available(state);
        const selected = inventory.find(project => project.id === state.selected);
        const freed = inventory.filter(project => state.removed.includes(project.id)).reduce((sum, project) => sum + project.size, 0);
        return {
          phase: `${4 - state.removed.length}-active`,
          parts: Object.fromEntries(inventory.map(project => [`project-${project.id}`, part(state.removed.includes(project.id) ? 1 : state.selected === project.id ? 0.18 : 0, !state.removed.includes(project.id) && matches(project, state.filter), state.selected === project.id)])),
          readout: `${4 - state.removed.length} sample projects active · ${freed} MB freed in this model. ${selected ? `Selected ${selected.path} · ${selected.size} MB · ${selected.age} days old.` : 'No sample projects match this filter.'}`,
          controls: { select: { value: state.selected, disabled: !projects.length }, filter: { value: state.filter }, remove: { disabled: !selected } },
          projects: inventory.map(project => ({ id: project.id, visible: projects.includes(project) }))
        };
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = { registry, inventory };
  if (typeof document === 'undefined') return;

  const figures = [...document.querySelectorAll('[data-working-model]')];
  if (!figures.length) return;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const instances = [];
  let frameId = 0;
  let lastFrame = 0;
  let suspended = false;
  const setText = (node, value) => { if (node && node.textContent !== value) node.textContent = value; };
  const canMove = instance => !suspended && !document.hidden && instance.visible && !motionPreference.matches;
  const hasWork = () => instances.some(instance => canMove(instance) && (instance.animation || instance.state.playing));
  const schedule = () => {
    if (hasWork()) {
      if (!frameId) frameId = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frameId);
      frameId = 0;
      lastFrame = 0;
    }
  };
  const paintParts = (instance, fractions, finished) => {
    for (const [name, nodes] of instance.parts) {
      const target = instance.view.parts[name];
      if (!target) continue;
      const fraction = fractions[name] ?? target.fraction;
      instance.fractions[name] = fraction;
      for (const node of nodes) {
        const dx = Number(node.getAttribute('data-dx')) || 0;
        const dy = Number(node.getAttribute('data-dy')) || 0;
        node.setAttribute('transform', `translate(${(dx * fraction).toFixed(3)} ${(dy * fraction).toFixed(3)})`);
        node.setAttribute('data-active', String(target.active));
        if (target.visible || !finished && instance.animation?.moving[name]) node.removeAttribute('hidden');
        else node.setAttribute('hidden', '');
      }
    }
  };
  const paintControls = instance => {
    const view = instance.view;
    instance.figure.setAttribute('data-model-phase', view.phase);
    setText(instance.readout, view.readout);
    for (const [name, value] of Object.entries(view.values || {})) {
      for (const node of instance.figure.querySelectorAll(`[data-model-value="${name}"]`)) setText(node, value);
    }
    for (const control of instance.controls.querySelectorAll('[data-model-action]')) {
      const action = control.getAttribute('data-model-action');
      const config = view.controls[action] || {};
      const motionPending = instance.animation && instance.model.waitForMotion?.includes(action);
      control.disabled = Boolean(config.disabled || motionPending || action === 'play' && motionPreference.matches);
      if (config.value !== undefined) control.value = String(config.value);
      if (config.pressed !== undefined) control.setAttribute('aria-pressed', String(config.pressed));
      if (config.text) setText(control, config.text);
      if (action === 'play') control.title = motionPreference.matches ? 'Reduced motion is on. Use the time slider to explore.' : '';
    }
    if (view.projects) {
      const select = instance.controls.querySelector('[data-model-action="select"]');
      for (const project of view.projects) {
        const option = select.querySelector(`[value="${project.id}"]`);
        if (option) { option.hidden = !project.visible; option.disabled = !project.visible; }
      }
      const empty = select.querySelector('[value=""]');
      if (empty) empty.hidden = view.projects.some(project => project.visible);
      select.value = instance.state.selected;
    }
    for (const note of instance.controls.querySelectorAll('[data-model-motion-note]')) note.hidden = !motionPreference.matches;
  };
  const update = (instance, animate = false) => {
    instance.view = instance.model.view(instance.state);
    const to = Object.fromEntries(Object.entries(instance.view.parts).map(([name, target]) => [name, target.fraction]));
    const moving = Object.fromEntries(Object.entries(to).map(([name, value]) => [name, Math.abs((instance.fractions[name] ?? value) - value) > 0.001]));
    if (animate && !instance.state.playing && canMove(instance) && Object.values(moving).some(Boolean)) {
      instance.animation = { from: { ...instance.fractions }, to, moving, start: performance.now() };
      paintParts(instance, instance.fractions, false);
    } else {
      instance.animation = null;
      paintParts(instance, to, true);
    }
    paintControls(instance);
    schedule();
  };
  const dispatch = (instance, type, value, announce = true) => {
    instance.state = instance.model.reduce(instance.state, { type, value });
    update(instance, type !== 'time' && type !== 'play');
    if (announce) setText(instance.status, instance.view.readout);
  };
  const stop = instance => {
    if (instance.state.playing) instance.state = instance.model.reduce(instance.state, { type: 'pause' });
    update(instance);
  };
  function tick(now) {
    frameId = 0;
    const elapsed = lastFrame ? Math.min(0.1, (now - lastFrame) / 1000) : 0;
    lastFrame = now;
    for (const instance of instances) {
      if (!canMove(instance)) continue;
      if (instance.state.playing) {
        instance.state = instance.model.reduce(instance.state, { type: 'tick', value: elapsed });
        instance.view = instance.model.view(instance.state);
        paintControls(instance);
        paintParts(instance, Object.fromEntries(Object.entries(instance.view.parts).map(([name, target]) => [name, target.fraction])), true);
      } else if (instance.animation) {
        const animation = instance.animation;
        const progress = Math.min(1, (now - animation.start) / 420);
        const ease = 1 - Math.pow(1 - progress, 3);
        const fractions = Object.fromEntries(Object.entries(animation.to).map(([name, value]) => [name, (animation.from[name] ?? value) + (value - (animation.from[name] ?? value)) * ease]));
        paintParts(instance, fractions, progress === 1);
        if (progress === 1) {
          instance.animation = null;
          paintControls(instance);
        }
      }
    }
    schedule();
  }
  for (const figure of figures) {
    const model = registry[figure.getAttribute('data-working-model')];
    const controls = figure.querySelector('[data-model-controls]');
    const readout = figure.querySelector('[data-model-readout]');
    const status = figure.querySelector('[data-model-status]');
    if (!model || !controls || !readout || !status) continue;
    readout.setAttribute('aria-live', 'off');
    const bounds = figure.getBoundingClientRect();
    const instance = { figure, model, controls, readout, status, state: model.initial(), parts: new Map(), fractions: {}, animation: null, visible: bounds.bottom > 0 && bounds.top < window.innerHeight };
    for (const node of figure.querySelectorAll('[data-model-part]')) {
      const name = node.getAttribute('data-model-part');
      if (!instance.parts.has(name)) instance.parts.set(name, []);
      instance.parts.get(name).push(node);
    }
    instances.push(instance);
    update(instance);
    controls.hidden = false;
    controls.addEventListener('click', event => {
      const control = event.target.closest('button[data-model-action]');
      if (control && controls.contains(control) && !control.disabled) dispatch(instance, control.getAttribute('data-model-action'));
    });
    controls.addEventListener('input', event => {
      const control = event.target;
      if (control.matches('input[type="range"][data-model-action]')) dispatch(instance, control.getAttribute('data-model-action'), control.value, false);
    });
    controls.addEventListener('change', event => {
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
  const motionChanged = () => {
    for (const instance of instances) stop(instance);
    schedule();
  };
  motionPreference.addEventListener('change', motionChanged);
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
