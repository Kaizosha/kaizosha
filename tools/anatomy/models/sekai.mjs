import { appFrame } from '../screen-frame.mjs';
import { atlasInformation, atlasLines, atlasPoints } from '../atlas-data.mjs';
import renderer from '../globe-render.js';

const initialGlobe = { latitude: 12, longitude: 10, count: 4096, particles: true, boundaries: true, routes: true, labels: true };

function globeSVG() {
  const pointJSON = JSON.stringify(atlasPoints);
  const lineJSON = JSON.stringify(atlasLines);
  const layers = Object.fromEntries(['particles', 'boundaries', 'routes', 'markers', 'labels'].map(name => [name, {
    d: '', innerHTML: '', setAttribute(name, value) { this[name] = value; }
  }]));
  renderer.renderGlobe({
    getAttribute: name => name === 'data-globe-points' ? pointJSON : lineJSON,
    querySelector: selector => layers[selector.replace('[data-globe-', '').replace(']', '')]
  }, initialGlobe);
  return `<svg class="sekai-globe" data-globe viewBox="0 0 400 320" role="img" aria-labelledby="sekai-globe-title" data-globe-points='${pointJSON}' data-globe-lines='${lineJSON}'>
    <title id="sekai-globe-title">Sekai globe with actual Natural Earth land particles, map unit boundaries, Chicago, Tokyo, Paris, and great circle routes.</title>
    <defs><clipPath id="sekai-globe-clip"><circle cx="200" cy="154" r="132"/></clipPath></defs>
    <circle class="sekai-sphere" cx="200" cy="154" r="132"/>
    <g class="sekai-graticule" clip-path="url(#sekai-globe-clip)" aria-hidden="true"><ellipse cx="200" cy="154" rx="65" ry="132"/><ellipse cx="200" cy="154" rx="112" ry="132"/><ellipse cx="200" cy="154" rx="132" ry="39"/><ellipse cx="200" cy="154" rx="132" ry="88"/></g>
    <g clip-path="url(#sekai-globe-clip)"><path class="sekai-land" data-globe-particles d="${layers.particles.d}"/><path class="sekai-boundaries" data-globe-boundaries d="${layers.boundaries.d}"/><path class="sekai-routes" data-globe-routes d="${layers.routes.d}"/><g class="sekai-markers" data-globe-markers>${layers.markers.innerHTML}</g></g>
    <g class="sekai-labels" data-globe-labels>${layers.labels.innerHTML}</g>
    <circle class="sekai-rim" cx="200" cy="154" r="132"/>
  </svg>`;
}

export function buildModel(k) {
  const frame = appFrame(k, { kind: 'globe', title: 'Sekai' });
  const screen = `<section class="sekai-app" aria-label="Sekai sample globe" data-app-name="Sekai">
    <header class="app-windowbar sekai-windowbar" data-app-region="navigation"><div><strong>Sekai</strong><span class="sekai-byline">by Kaizōsha</span></div><span class="app-demo-label">DEMO</span></header>
    <div class="sekai-workspace">
      <div class="sekai-viewport" data-app-region="globe">${globeSVG()}<p class="sekai-camera">CAMERA <span data-model-text="camera">12° N · 10° E</span></p></div>
      <aside class="sekai-inspector" aria-label="Sekai inspector" data-app-region="inspector"><h4>Customize</h4><dl>
        <div><dt>Source</dt><dd>All Land</dd></div>
        <div><dt>Presentation</dt><dd data-model-text="presentation">Both</dd></div>
        <div><dt>Density</dt><dd data-model-text="density">4,096 points</dd></div>
        <div><dt>Markers</dt><dd>Chicago · Tokyo · Paris</dd></div>
        <div><dt>Routes</dt><dd data-model-text="routes">On</dd></div>
        <div><dt>Labels</dt><dd data-model-text="labels">On</dd></div>
        <div><dt>Projection</dt><dd data-model-text="projection">Orthographic</dd></div>
      </dl><p class="sekai-route-note">Chicago → Tokyo<br>Paris → Tokyo</p></aside>
    </div>
    <footer class="sekai-atlas-credit" data-app-region="atlas-credit"><span><span data-model-text="previewCount">4,096</span> preview points · ${atlasInformation.nativeParticleCount.toLocaleString('en-US')} in native atlas</span><span>Made with Natural Earth ${atlasInformation.sourceVersion} · Public domain</span></footer>
  </section>`;
  return {
    ...frame,
    kind: 'globe',
    atlas: atlasInformation,
    screen,
    parts: [...frame.parts, 'native navigation bar', 'orthographic globe viewport', 'Natural Earth land particle layer', 'Natural Earth map unit boundary layer', 'great circle route layer', 'city marker layer', 'city label layer', 'Sekai inspector', 'atlas attribution'],
    label: 'Sekai globe and inspector with a real Natural Earth preview atlas, native city markers, great circle routes, and orthographic camera controls.',
    identity: {
      app: 'Sekai',
      platform: 'SwiftUI',
      sources: ['Sources/SekaiInspector/SekaiDemo.swift', 'Sources/SekaiInspector/SekaiInspector.swift', 'Sources/SekaiKit/Atlas/SekaiAtlas.swift', 'Sources/SekaiKit/Resources/SekaiWorld.sekaiatlas', 'Tools/SekaiAtlasBuilder/sources.json', 'THIRD_PARTY_NOTICES.md'],
      regions: ['navigation', 'globe', 'inspector', 'atlas-credit']
    }
  };
}
