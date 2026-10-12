export function buildModel(k) {
  const base = { x: -149, y: -84, w: 298, d: 208, r: 9 };
  const P = k.fitProjection([...k.boxCorners(base, -17, 0), [-132, -71, 139], [132, 13, 139]], 640, 400, { pad: 40, azimuth: 46, elevation: 34 });
  const parts = [];
  const S = (name, paths, opts = {}) => { parts.push(name); return k.solidSvg(paths, opts); };
  const L = (d, tone = 'lo', opts = {}) => k.lineSvg(d, { tone, ...opts });
  const slab = (name, p, z, h, tone = 'mid', opts = {}) => S(name, k.slabOf(p, z, h, P, 5, Math.min(0.8, h / 3)), { tone, inner: h > 9 ? L(k.sideSeam(p, z + h - 3, P, 5), 'faint') : '', ...opts });
  const cyl = (name, x, y, r, z, h, tone = 'mid') => S(name, k.cylinder(x, y, r, z, h, P, 28, Math.min(0.5, h / 3)), { tone });
  const bolt = (name, x, y, z) => cyl(name, x, y, 1.35, z, 0.7) + L(k.ring(x, y, 0.7, z + 0.7, P, 16), 'lo') + k.dotsSvg([k.iso([x, y, z + 0.7], P)], { size: 0.45 });
  const out = [`<path class="iso-halo" d="${k.haloOf(base, -17, 12, P)}"/>`];
  k.corners(base, 23).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P)).forEach(([x, y], i) => out.push(cyl(`cabinet rubber foot ${i + 1}`, x, y, 7, -17, 3, 'lo'), cyl(`cabinet foot socket ${i + 1}`, x, y, 5.5, -14, 3, 'lo')));
  out.push(slab('dependency cabinet workbench', base, -11, 11, 'lo'), L(k.planOutline(k.insetPlan(base, 5), 0, P), 'faint'));
  k.corners(base, 11).forEach(([x, y], i) => out.push(bolt(`workbench screw ${i + 1}`, x, y, 0)));
  out.push(slab('cabinet bottom sill', { x: -133, y: -72, w: 266, d: 85, r: 3 }, 0, 9), slab('cabinet back wall', { x: -133, y: -72, w: 266, d: 5, r: 2 }, 9, 116), slab('cabinet left side', { x: -133, y: -67, w: 5, d: 80, r: 1.5 }, 9, 116));
  const xs = [-113, -55, 3, 61];
  xs.forEach((x, i) => {
    out.push(slab(`cartridge ${i + 1} left slide rail`, { x: x - 2, y: -62, w: 4, d: 173, r: 0.8 }, 9, 5, 'lo'), slab(`cartridge ${i + 1} right slide rail`, { x: x + 42, y: -62, w: 4, d: 173, r: 0.8 }, 9, 5, 'lo'), slab(`cartridge ${i + 1} rear stop`, { x: x - 2, y: -65, w: 48, d: 4, r: 0.8 }, 9, 11));
  });
  out.push(slab('removal tray recessed floor', { x: -128, y: 36, w: 256, d: 78, r: 4 }, 0, 9, 'lo'));
  xs.forEach((x, i) => out.push(slab(`removal tray lane ${i + 1}`, { x: x + 3, y: 38, w: 35, d: 70, r: 1.5 }, 9, 0.7, 'lo')));
  const sizes = [64, 180, 320, 96];
  const [dx, dy] = k.axisVector(P, [0, 84, 0]);
  sizes.forEach((mb, i) => {
    const x = xs[i];
    const z = 14;
    const h = mb * 0.2875;
    const p = { x, y: -60, w: 42, d: 65, r: 2.5 };
    const contents = [slab(`project ${i + 1} proportional specimen shell`, p, z, h - 1.4, 'hi', { lit: i === 2 }), slab(`project ${i + 1} top reinforcing rim`, { x: x + 1, y: -59, w: 40, d: 63, r: 2 }, z + h - 1.4, 1.4), slab(`project ${i + 1} front identification panel`, { x: x + 5, y: 4, w: 32, d: 1.4, r: 0.8 }, z + 3, Math.min(12, h - 4), 'lo'), slab(`project ${i + 1} handle left bracket`, { x: x + 9, y: 5.4, w: 3, d: 4, r: 0.6 }, z + 4, 3), slab(`project ${i + 1} handle right bracket`, { x: x + 30, y: 5.4, w: 3, d: 4, r: 0.6 }, z + 4, 3), slab(`project ${i + 1} front pull handle`, { x: x + 9, y: 9.4, w: 24, d: 2.4, r: 0.8 }, z + 4, 3)];
    contents.push(L(k.planOutline(k.insetPlan(p, 4), z + h, P), 'faint'));
    contents.push(bolt(`project ${i + 1} top left fastener`, x + 6, -53, z + h), bolt(`project ${i + 1} top right fastener`, x + 36, -2, z + h));
    for (let row = 0; row < 4; row++) contents.push(L(k.planOutline({ x: x + 10, y: -46 + row * 9, w: 22, d: 2.2, r: 1 }, z + h, P), 'lo'));
    [0, 1, 2].forEach(j => contents.push(L(k.lineOnTop([x + 7, -9 + j * 2.6], [x + 30 - j * 4, -9 + j * 2.6], z + h + 0.05, P), 'mid', { free: true })));
    out.push(`<g data-model-part="project-${i}" data-dx="${dx.toFixed(3)}" data-dy="${dy.toFixed(3)}">${contents.join('')}</g>`);
  });
  out.push(slab('cabinet right side', { x: 128, y: -67, w: 5, d: 80, r: 1.5 }, 9, 116), slab('cabinet top canopy', { x: -133, y: -72, w: 266, d: 85, r: 4 }, 125, 6), slab('cabinet upper front lintel', { x: -130, y: 8, w: 260, d: 5, r: 1 }, 119, 6));
  [[-123, -62], [123, -62], [-123, 3], [123, 3]].forEach(([x, y], i) => out.push(bolt(`cabinet canopy screw ${i + 1}`, x, y, 131)));
  out.push(slab('removal tray left rim', { x: -132, y: 35, w: 4, d: 81, r: 1.2 }, 9, 5), slab('removal tray right rim', { x: 128, y: 35, w: 4, d: 81, r: 1.2 }, 9, 5), slab('removal tray front stop', { x: -132, y: 114, w: 264, d: 4, r: 1.2 }, 9, 6));
  const scale = { x: -120, y: 119, w: 240, d: 4, r: 0.8 };
  out.push(slab('sample capacity ruler strip', scale, 0, 0.7, 'lo'));
  const ticks = k.topTicks(-116, 116, 4, 5, 119.1, 0.7, [1.2, 2.6], P);
  out.push(L(ticks.minor, 'lo'), L(ticks.major, 'mid'));
  [0, 1, 2, 3, 4].forEach(i => out.push(L(k.planOutline({ x: 17 + i * 13, y: -59, w: 3, d: 52, r: 1.5 }, 131, P), 'lo')));
  const identity = { x: -116, y: -55, w: 68, d: 20, r: 1 };
  out.push(slab('cabinet identity plate', identity, 131, 0.8, 'lo'), L(k.planOutline(k.insetPlan(identity, 2), 131.8, P), 'faint'));
  [5, 9, 13].forEach((dy, i) => out.push(L(k.lineOnTop([-110, -55 + dy], [-63 - i * 6, -55 + dy], 131.85, P), 'lo', { free: true })));
  out.push(bolt('cabinet identity plate rivet', -54, -51, 131.8));
  return { body: out.join(''), projection: P, parts, label: 'An open dependency specimen cabinet with four removable sample project cartridges whose heights are proportional to 64, 180, 320, and 96 megabytes, and a front sorting tray.' };
}
