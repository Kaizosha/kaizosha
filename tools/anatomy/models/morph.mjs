export function buildModel(k) {
  const base = { x: -148, y: -75, w: 296, d: 181, r: 9 };
  const P = k.fitProjection([...k.boxCorners(base, -17, 0), [-110, -45, 135], [87, 43, 135]], 640, 400, { pad: 43, azimuth: 43, elevation: 32 });
  const parts = [];
  const S = (name, paths, opts = {}) => { parts.push(name); return k.solidSvg(paths, opts); };
  const L = (d, tone = 'lo', opts = {}) => k.lineSvg(d, { tone, ...opts });
  const slab = (name, p, z, h, tone = 'mid', opts = {}) => S(name, k.slabOf(p, z, h, P, 5, Math.min(0.8, h / 3)), { tone, inner: h > 9 ? L(k.sideSeam(p, z + h - 3, P, 5), 'faint') : '', ...opts });
  const cyl = (name, x, y, r, z, h, tone = 'mid', opts = {}) => S(name, k.cylinder(x, y, r, z, h, P, 32, Math.min(0.6, h / 3)), { tone, ...opts });
  const bolt = (name, x, y, z) => cyl(name, x, y, 1.4, z, 0.7) + L(k.ring(x, y, 0.7, z + 0.7, P, 16), 'lo') + k.dotsSvg([k.iso([x, y, z + 0.7], P)], { size: 0.45 });
  const moving = (name, delta, body) => { const [dx, dy] = k.axisVector(P, delta); return `<g data-model-part="${name}" data-dx="${dx.toFixed(3)}" data-dy="${dy.toFixed(3)}">${body}</g>`; };
  const out = [`<path class="iso-halo" d="${k.haloOf(base, -17, 12, P)}"/>`];
  k.corners(base, 24).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P)).forEach(([x, y], i) => out.push(cyl(`rubber press foot ${i + 1}`, x, y, 7, -17, 3, 'lo'), cyl(`foot seating flange ${i + 1}`, x, y, 5.5, -14, 3, 'lo')));
  out.push(slab('cast proof press base', base, -11, 11, 'lo'), L(k.planOutline(k.insetPlan(base, 5), 0, P), 'faint'));
  k.corners(base, 11).forEach(([x, y], i) => out.push(bolt(`base screw ${i + 1}`, x, y, 0)));
  const corners = [[-103, -43], [78, -43], [-103, 38], [78, 38]].sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P));
  corners.slice(0, 2).forEach(([x, y], i) => out.push(cyl(`rear guide foot ${i + 1}`, x, y, 8, 0, 6), cyl(`rear guide pillar ${i + 1}`, x, y, 4.6, 6, 105), cyl(`rear guide upper collar ${i + 1}`, x, y, 6, 111, 4)));
  [-31, 24].forEach((y, i) => out.push(slab(`draft slide rail ${i + 1}`, { x: -137, y, w: 264, d: 5, r: 1 }, 0, 13), L(k.lineOnTop([-137, y + 2.5], [127, y + 2.5], 13, P), 'faint')));
  out.push(slab('fixed master bed bolster', { x: -83, y: -20, w: 140, d: 40, r: 4 }, 13, 6, 'mid'), slab('fixed original master plate', { x: -78, y: -27, w: 130, d: 53, r: 2 }, 19, 5, 'hi'), L(k.planOutline({ x: -72, y: -21, w: 118, d: 41, r: 1 }, 24, P), 'faint'));
  [-15, 15].forEach((y, i) => out.push(bolt(`master bed retaining screw ${i + 1}`, -80, y, 19)));
  const draftPlan = { x: -5, y: -31, w: 66, d: 60, r: 1.5 };
  const draft = [slab('preview draft paper carrier', draftPlan, 24, 1.4, 'hi'), slab('draft carrier left jaw', { x: -5, y: -31, w: 3, d: 60, r: 0.5 }, 25.4, 1.6), slab('draft carrier right jaw', { x: 58, y: -31, w: 3, d: 60, r: 0.5 }, 25.4, 1.6), slab('draft carrier pull tab', { x: -18, y: -9, w: 13, d: 15, r: 1.5 }, 24, 3, 'mid')];
  [2, 52].forEach((x, i) => {
    draft.unshift(slab(`draft rear rail bushing ${i + 1}`, { x, y: -31, w: 6, d: 4, r: 0.7 }, 13, 11), slab(`draft front rail bushing ${i + 1}`, { x, y: 26, w: 6, d: 3, r: 0.7 }, 13, 11));
  });
  draft.push(L(k.planOutline({ x: 1, y: -17, w: 22, d: 32, r: 1 }, 25.4, P), 'faint'));
  [-13, -6, 1, 8, 15].forEach((y, i) => draft.push(L(k.lineOnTop([29, y], [55 - i % 2 * 9, y], 25.5, P), 'lo', { free: true })));
  out.push(moving('draft', [-143, 0, 0], draft.join('')));
  const press = [slab('moving press platen body', { x: -79, y: -29, w: 135, d: 57, r: 4 }, 61, 11, 'mid'), slab('moving press contact face', { x: -76, y: -26, w: 129, d: 51, r: 2 }, 59.4, 1.6, 'hi'), slab('platen upper reinforcing rib', { x: -66, y: -6, w: 108, d: 10, r: 2 }, 72, 7)];
  for (const [i, [x, y]] of corners.entries()) {
    const edgeX = x < 0 ? -77 : 54;
    const edgeY = y < 0 ? -27 : 26;
    const side = [[x - 6, y - 6], [x + 6, y - 6], [edgeX + 6, edgeY - 6], [edgeX + 6, edgeY + 6], [edgeX - 6, edgeY + 6], [x - 6, y + 6]];
    press.push(S(`platen guide outrigger ${i + 1}`, k.extrude(side, 63, 6, P, { bevel: 0.5 }), { tone: 'mid' }), cyl(`platen guide sleeve ${i + 1}`, x, y, 7, 61, 11), bolt(`platen sleeve cap screw ${i + 1}`, x, y, 72));
  }
  press.push(cyl('press drive ram lower seat', -10, 0, 12, 79, 4));
  out.push(moving('press', [0, 0, -35.4], press.join('')));
  const ramClip = k.cylinder(-10, 0, 8, 0, 106, P, 64).fill;
  out.push(`<defs><clipPath id="morph-visible-ram" clipPathUnits="userSpaceOnUse"><path d="${ramClip}"/></clipPath></defs><g clip-path="url(#morph-visible-ram)">${moving('press', [0, 0, -35.4], cyl('press sliding ram piston', -10, 0, 6, 83, 60, 'hi', { lit: true }))}</g>`);
  corners.slice(2).forEach(([x, y], i) => out.push(cyl(`front guide foot ${i + 1}`, x, y, 8, 0, 6), cyl(`front guide pillar ${i + 1}`, x, y, 4.6, 6, 105), cyl(`front guide upper collar ${i + 1}`, x, y, 6, 111, 4)));
  out.push(slab('press rear crosshead beam', { x: -115, y: -54, w: 205, d: 22, r: 3 }, 111, 9), slab('press front crosshead beam', { x: -115, y: 30, w: 205, d: 20, r: 3 }, 111, 9), slab('press central ram support bridge', { x: -21, y: -32, w: 22, d: 62, r: 2 }, 111, 9), cyl('ram lower gland sleeve', -10, 0, 9, 106, 5), cyl('ram gland flange', -10, 0, 13, 120, 4), cyl('ram pressure adjustment collar', -10, 0, 8, 124, 5), cyl('knurled pressure wheel', -10, 0, 17, 129, 4, 'hi'), L(k.knurl(-10, 0, 17, 129, 133, 72, P), 'lo'), L(k.ring(-10, 0, 12, 133, P, 56), 'faint'));
  corners.forEach(([x, y], i) => out.push(bolt(`crosshead retaining screw ${i + 1}`, x, y, 120)));
  const gauge = { x: 39, y: -52, w: 27, d: 19, r: 2 };
  out.push(slab('press depth gauge housing', gauge, 120, 2), cyl('press depth dial bezel', 52.5, -42.5, 9, 122, 3, 'hi'));
  const dial = k.radialTicks(52.5, -42.5, 7.5, 40, 5, 125, [0.8, 1.8], P);
  out.push(L(dial.minor, 'lo'), L(dial.major, 'mid'), L(k.lineOnTop([52.5, -42.5], [56.5, -46], 125.1, P), 'hi', { free: 'end' }), k.dotsSvg([k.iso([52.5, -42.5, 125.1], P)], { size: 0.8, tone: 'hi' }));
  [60, 95].forEach((y, i) => out.push(slab(`proof viewing tray slide rail ${i + 1}`, { x: -125, y, w: 254, d: 4, r: 1 }, 0, 9)));
  out.push(slab('proof viewing tray fixed floor', { x: -130, y: 58, w: 264, d: 42, r: 3 }, 9, 3, 'lo'), slab('proof tray rear fence', { x: -130, y: 56, w: 264, d: 3, r: 1 }, 9, 8), slab('proof tray left end stop', { x: -134, y: 58, w: 4, d: 42, r: 1 }, 9, 7), slab('proof tray right end stop', { x: 134, y: 58, w: 4, d: 42, r: 1 }, 9, 7));
  const proof = [slab('reversible proof carrier', { x: -94, y: 64, w: 145, d: 29, r: 2 }, 12, 1.4, 'hi'), slab('proof carrier leading jaw', { x: -94, y: 64, w: 3, d: 29, r: 0.5 }, 13.4, 1.5), slab('proof carrier trailing jaw', { x: 48, y: 64, w: 3, d: 29, r: 0.5 }, 13.4, 1.5), slab('proof carrier grip tongue', { x: -48, y: 93, w: 28, d: 5, r: 1.3 }, 12, 3)];
  proof.push(L(k.planOutline({ x: -85, y: 69, w: 33, d: 19, r: 1 }, 13.4, P), 'faint'));
  [69, 74, 79, 84, 88].forEach((y, i) => proof.push(L(k.lineOnTop([-42, y], [39 - i % 3 * 9, y], 13.5, P), 'mid', { free: true })));
  out.push(moving('proof', [58, 0, 0], proof.join('')));
  const ruler = { x: -128, y: 101, w: 256, d: 4, r: 0.8 };
  out.push(slab('proof inspection ruler strip', ruler, 0, 0.7, 'lo'));
  const ticks = k.topTicks(-124, 124, 4, 5, 101.15, 0.7, [1.2, 2.7], P);
  out.push(L(ticks.minor, 'lo'), L(ticks.major, 'mid'));
  return { body: out.join(''), projection: P, parts, label: 'A reversible four-post proof press with a fixed original master plate, a pull-out preview draft, a descending press, and a separate proof viewing tray.' };
}
