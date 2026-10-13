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

if (typeof module !== 'undefined') module.exports = { renderGlobe };
