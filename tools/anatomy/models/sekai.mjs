export function buildModel(k) {
  const base = { x: -150, y: -78, w: 306, d: 164, r: 9 };
  const P = k.fitProjection([...k.boxCorners(base, -17, 0), [-52, -18, 172], [133, 39, 64]], 640, 400, { pad: 46, azimuth: 45, elevation: 33 });
  const parts = [];
  const S = (name, paths, opts = {}) => { parts.push(name); return k.solidSvg(paths, opts); };
  const slab = (name, plan, z, h, tone = 'mid', opts = {}) => S(name, k.slabOf(plan, z, h, P, 5, Math.min(0.8, h / 3)), { tone, inner: h > 8 ? k.lineSvg(k.sideSeam(plan, z + h - 3, P, 5), { tone: 'faint' }) : '', ...opts });
  const cyl = (name, x, y, r, z, h, tone = 'mid', opts = {}) => S(name, k.cylinder(x, y, r, z, h, P, 32, Math.min(0.6, h / 3)), { tone, ...opts });
  const L = (d, tone = 'lo', opts = {}) => k.lineSvg(d, { tone, ...opts });
  const at = p => k.iso(p, P);
  const bolt = (name, x, y, z) => cyl(name, x, y, 1.35, z, 0.7, 'mid') + L(k.ring(x, y, 0.7, z + 0.7, P, 16), 'lo') + k.dotsSvg([at([x, y, z + 0.7])], { size: 0.45 });
  const moving = (name, body) => `<g data-model-part="${name}" data-dx="0" data-dy="0">${body}</g>`;
  const out = [`<path class="iso-halo" d="${k.haloOf(base, -17, 12, P)}"/>`];
  k.corners(base, 24).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P)).forEach(([x, y], i) => {
    out.push(cyl(`rubber foot ${i + 1}`, x, y, 7.5, -17, 3, 'lo'), cyl(`foot socket ${i + 1}`, x, y, 6, -14, 3, 'lo'));
  });
  out.push(slab('cast instrument base', base, -11, 11, 'lo'), L(k.planOutline(k.insetPlan(base, 5), 0, P), 'faint'));
  k.corners(base, 11).forEach(([x, y], i) => out.push(bolt(`base screw ${i + 1}`, x, y, 0)));
  const ruler = { x: -130, y: 70, w: 260, d: 7, r: 1 };
  out.push(slab('calibration ruler strip', ruler, 0, 0.8, 'lo'));
  const ticks = k.topTicks(-126, 126, 4, 5, 70.2, 0.8, [2.3, 4.7], P);
  out.push(L(ticks.minor, 'lo'), L(ticks.major, 'mid'));
  const label = { x: -23, y: 47, w: 48, d: 15, r: 1 };
  out.push(slab('instrument identity plate', label, 0, 0.8, 'lo'), L(k.planOutline(k.insetPlan(label, 1.8), 0.8, P), 'faint'));
  [5, 8, 11].forEach((dy, i) => out.push(L(k.lineOnTop([label.x + 5, label.y + dy], [label.x + 35 - i * 5, label.y + dy], 0.9, P), 'lo', { free: true })));
  out.push(bolt('identity plate left rivet', -19, 58, 0.8), bolt('identity plate right rivet', 21, 51, 0.8));
  out.push(cyl('azimuth foot flange', -52, -18, 27, 0, 5, 'mid'), cyl('azimuth turntable', -52, -18, 24, 5, 4, 'hi'));
  const dial = k.radialTicks(-52, -18, 22, 60, 5, 9, [1.2, 2.8], P);
  out.push(L(dial.minor, 'lo'), L(dial.major, 'mid'), L(k.ring(-52, -18, 18, 9, P, 64), 'faint'));
  out.push(cyl('globe pedestal lower collar', -52, -18, 8, 9, 5), cyl('globe pedestal stem', -52, -18, 5, 14, 30), cyl('globe pedestal upper saddle', -52, -18, 9, 44, 5));
  out.push(cyl('azimuth adjustment socket', -121, -41, 8, 0, 3), cyl('azimuth adjustment knob', -121, -41, 6.5, 3, 6, 'hi'), L(k.knurl(-121, -41, 6.5, 3, 9, 40, P), 'lo'), L(k.ring(-121, -41, 3.7, 9, P, 32), 'faint'));
  const G = { ...P, origin: at([-52, -18, 105]), elevation: 72 };
  const band = (from, to, outer, inner) => {
    const ring = [];
    for (let i = 0; i <= 64; i++) { const a = from + (to - from) * i / 64; ring.push([outer * Math.cos(a), outer * Math.sin(a)]); }
    for (let i = 64; i >= 0; i--) { const a = from + (to - from) * i / 64; ring.push([inner * Math.cos(a), inner * Math.sin(a)]); }
    return ring;
  };
  out.push(S('rear meridian gimbal band', k.extrude(band(Math.PI, Math.PI * 2, 64, 61), 0, 3, G, { convex: false, bevel: 0.4 }), { tone: 'mid' }));
  out.push(S('round atlas specimen globe', k.extrude(k.circleRing(0, 0, 57, 112), 0, 4, G, { bevel: 0.8 }), { tone: 'hi', lit: true }));
  const ellipse = (rx, ry, cy = 0) => Array.from({ length: 97 }, (_, i) => { const a = i * Math.PI * 2 / 96; return [rx * Math.cos(a), cy + ry * Math.sin(a)]; });
  out.push(L(k.onTop(ellipse(54, 54), 4.05, G, true), 'lo'));
  [14, 33, 48].forEach(rx => out.push(L(k.onTop(ellipse(rx, 54), 4.05, G, true), 'faint')));
  [-30, 0, 30].forEach(y => out.push(L(k.onTop(ellipse(Math.sqrt(54 * 54 - y * y), 5.5, y), 4.05, G, true), 'faint')));
  const lands = [
    [[-38, -17], [-27, -35], [-8, -39], [5, -26], [-1, -9], [-14, -1], [-19, 19], [-31, 28], [-39, 13], [-32, 1]],
    [[16, -18], [34, -25], [44, -7], [37, 8], [23, 7], [14, 25], [4, 29], [3, 10]],
    [[22, 34], [30, 30], [37, 34], [29, 42]]
  ];
  out.push(moving('boundaries', lands.map((ring, i) => S(`geographic boundary stencil ${i + 1}`, k.extrude(ring, 4.1, 0.45, G, { convex: false }), { tone: 'mid', crease: 'faint' })).join('')));
  const particlePoints = [];
  for (let y = -33; y <= 26; y += 6) for (let x = -35; x <= 38; x += 6) {
    if ((x < -9 && ((x + 25) ** 2 / 220 + (y + 6) ** 2 / 840 < 1)) || (x > 7 && ((x - 25) ** 2 / 280 + y ** 2 / 650 < 1))) particlePoints.push(k.iso([x, y, 4.65], G));
  }
  out.push(moving('particles', k.dotsSvg(particlePoints, { size: 0.65, tone: 'hi' })));
  out.push(moving('labels', [[-20, -11], [27, 1], [26, 36]].map(([x, y], i) => {
    const plan = { x: x - 6, y: y - 2.5, w: 12, d: 5, r: 0.7 };
    return S(`atlas annotation tab ${i + 1}`, k.slabOf(plan, 4.7, 0.4, G, 3), { tone: 'lo' }) + L(k.lineOnTop([x - 3.5, y], [x + 3.5, y], 5.15, G), 'mid', { free: true });
  }).join('')));
  out.push(S('front meridian gimbal band', k.extrude(band(0, Math.PI, 64, 61), 0, 3, G, { convex: false, bevel: 0.4 }), { tone: 'mid' }));
  [-62.5, 62.5].forEach((x, i) => {
    out.push(S(`meridian pivot ${i + 1}`, k.cylinder(x, 0, 4, 3, 2.8, G, 28, 0.5), { tone: 'mid' }), L(k.ring(x, 0, 2.2, 5.8, G, 24), 'lo'));
  });
  const rack = { x: 49, y: -44, w: 87, d: 81, r: 3 };
  out.push(slab('stencil rack bottom plinth', rack, 0, 5), slab('stencil rack rear wall', { x: 49, y: -44, w: 87, d: 4, r: 1 }, 5, 53), slab('stencil rack left upright', { x: 49, y: -40, w: 4, d: 76, r: 1 }, 5, 53));
  ['particles', 'boundaries', 'labels'].forEach((name, i) => {
    const z = 11 + i * 15;
    out.push(slab(`${name} fixed shelf`, { x: 53, y: -39, w: 79, d: 71, r: 1 }, z - 3, 2, 'lo'));
    const tray = { x: 57, y: -35, w: 71, d: 65, r: 2 };
    const contents = [slab(`${name} inspection drawer floor`, tray, z, 1.2, 'hi'), slab(`${name} drawer front`, { x: 56, y: 29, w: 73, d: 3, r: 1 }, z, 7), slab(`${name} pull left mount`, { x: 78, y: 32, w: 3, d: 4, r: 0.6 }, z + 1, 3), slab(`${name} pull right mount`, { x: 103, y: 32, w: 3, d: 4, r: 0.6 }, z + 1, 3), slab(`${name} drawer pull`, { x: 78, y: 35, w: 28, d: 2, r: 0.8 }, z + 1, 3)];
    contents.push(L(k.planOutline(k.insetPlan(tray, 4), z + 1.2, P), 'faint'));
    if (i === 0) contents.push(k.dotsSvg(k.dotGrid(64, -27, 10, 8, 5.8, z + 1.25, P), { size: 0.45, tone: 'mid' }));
    if (i === 1) contents.push(L(k.onTop([[64, -21], [77, -26], [88, -16], [102, -23], [120, -10], [112, 10], [94, 19], [81, 7], [67, 9]], z + 1.25, P, true), 'mid'));
    if (i === 2) [0, 1, 2].forEach(j => contents.push(L(k.planOutline({ x: 64 + j * 17, y: -21 + j * 7, w: 14, d: 7, r: 1 }, z + 1.25, P), 'mid')));
    out.push(moving(name, `<g transform="${k.translateAlong(P, [0, 23, 0])}">${contents.join('')}</g>`));
  });
  out.push(slab('stencil rack right upright', { x: 132, y: -40, w: 4, d: 76, r: 1 }, 5, 53), slab('stencil rack top lintel', { x: 49, y: -44, w: 87, d: 81, r: 3 }, 58, 4));
  k.corners(rack, 6).forEach(([x, y], i) => out.push(bolt(`rack top screw ${i + 1}`, x, y, 62)));
  out.push(slab('atlas cartridge dock', { x: -133, y: 24, w: 61, d: 30, r: 3 }, 0, 5), slab('cartridge rear stop', { x: -131, y: 24, w: 57, d: 3, r: 1 }, 5, 12), slab('cartridge left guide', { x: -133, y: 27, w: 3, d: 27, r: 1 }, 5, 6), slab('cartridge right guide', { x: -75, y: 27, w: 3, d: 27, r: 1 }, 5, 6));
  const cart = { x: -128, y: 29, w: 51, d: 22, r: 2 };
  out.push(slab('docked atlas cartridge shell', cart, 5, 10, 'hi'), L(k.planOutline(k.insetPlan(cart, 3), 15, P), 'faint'), slab('atlas cartridge grip', { x: -114, y: 50, w: 24, d: 4, r: 1 }, 7, 5));
  [0, 1, 2, 3].forEach(i => out.push(slab(`atlas contact terminal ${i + 1}`, { x: -120 + i * 10, y: 28, w: 4, d: 2, r: 0.3 }, 10, 2, 'mid')));
  return { body: out.join(''), projection: P, parts, label: 'A supported atlas globe instrument with an original geographic specimen, three stencil inspection drawers, and a docked atlas cartridge.' };
}
