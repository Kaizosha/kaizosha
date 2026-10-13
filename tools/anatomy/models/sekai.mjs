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
  return `<svg class="sekai-globe" data-globe viewBox="0 0 400 410" role="img" aria-labelledby="sekai-globe-title" data-globe-points='${pointJSON}' data-globe-lines='${lineJSON}'>
    <title id="sekai-globe-title">Sekai globe with actual Natural Earth land particles, map unit boundaries, Chicago, Tokyo, Paris, and great circle routes.</title>
    <defs><clipPath id="sekai-globe-clip"><circle cx="200" cy="154" r="132"/></clipPath></defs>
    <ellipse class="sekai-meridian" cx="200" cy="154" rx="146" ry="158" transform="rotate(-22 200 154)"/>
    <path class="sekai-axis" d="M137 28 266 279"/>
    <circle class="sekai-sphere" cx="200" cy="154" r="132"/>
    <g class="sekai-graticule" clip-path="url(#sekai-globe-clip)" aria-hidden="true"><ellipse cx="200" cy="154" rx="65" ry="132"/><ellipse cx="200" cy="154" rx="112" ry="132"/><ellipse cx="200" cy="154" rx="132" ry="39"/><ellipse cx="200" cy="154" rx="132" ry="88"/></g>
    <g clip-path="url(#sekai-globe-clip)"><path class="sekai-land" data-globe-particles d="${layers.particles.d}"/><path class="sekai-boundaries" data-globe-boundaries d="${layers.boundaries.d}"/><path class="sekai-routes" data-globe-routes d="${layers.routes.d}"/><g class="sekai-markers" data-globe-markers>${layers.markers.innerHTML}</g></g>
    <g class="sekai-labels" data-globe-labels>${layers.labels.innerHTML}</g>
    <circle class="sekai-rim" cx="200" cy="154" r="132"/>
    <path class="sekai-support" d="M260 274 214 368"/>
    <ellipse class="sekai-base" cx="210" cy="378" rx="112" ry="18"/>
  </svg>`;
}

export function buildModel() {
  const screen = `<section class="sekai-object" aria-label="Sekai physical globe" data-app-name="Sekai">
    <header class="sekai-object-heading" data-app-region="navigation"><strong>Sekai</strong><span>by Kaizōsha · LOCAL SAMPLE</span></header>
    <div class="sekai-viewport" data-app-region="globe">${globeSVG()}<p class="sekai-camera">CAMERA <span data-model-text="camera">12° N · 10° E</span></p></div>
    <div class="sekai-object-details" data-app-region="settings"><span>Presentation <strong data-model-text="presentation">Both</strong></span><span>Density <strong data-model-text="density">4,096 points</strong></span><span>Routes <strong data-model-text="routes">On</strong></span><span>Labels <strong data-model-text="labels">On</strong></span></div>
    <footer class="sekai-atlas-credit" data-app-region="atlas-credit"><span><span data-model-text="previewCount">4,096</span> preview points · ${atlasInformation.nativeParticleCount.toLocaleString('en-US')} in native atlas</span><span>Natural Earth ${atlasInformation.sourceVersion} · Public domain</span></footer>
  </section>`;
  return {
    kind: 'physical-globe', body: '', projection: null, atlas: atlasInformation, screen,
    parts: ['Tilted meridian ring', 'Orthographic globe sphere', 'Natural Earth land particles', 'Natural Earth map boundaries', 'Great circle routes', 'City markers and labels', 'Slanted globe axis', 'Physical globe stand and base', 'Atlas attribution'],
    label: 'Sekai physical globe on a tilted meridian and stand, with a real Natural Earth preview atlas, city markers, great circle routes, and camera controls.',
    identity: {
      app: 'Sekai', platform: 'SwiftUI',
      sources: ['Sources/SekaiInspector/SekaiDemo.swift', 'Sources/SekaiInspector/SekaiInspector.swift', 'Sources/SekaiKit/Atlas/SekaiAtlas.swift', 'Sources/SekaiKit/Resources/SekaiWorld.sekaiatlas', 'Tools/SekaiAtlasBuilder/sources.json', 'THIRD_PARTY_NOTICES.md'],
      regions: ['navigation', 'globe', 'settings', 'atlas-credit']
    }
  };
}
