export function buildModel(k) {
  const base = { x: -150, y: -78, w: 302, d: 184, r: 10 };
  const projection = k.fitProjection(k.boxCorners(base, -17, 50), 640, 400, { pad: 47, azimuth: 49, elevation: 35 });
  const P = projection;
  const parts = [];
  const solids = [];
  const at = (x, y, z) => k.iso([x, y, z], P);
  const line = (path, tone = "lo", free) => k.lineSvg(path, { tone, free });
  const dots = (points, size = 0.48, tone = "mid") => k.dotsSvg(points.map(([x, y, z]) => at(x, y, z)), { size, tone });
  const slab = (name, plan, z, h, tone = "mid", inner = "", lit = false) => {
    parts.push(name);
    solids.push({ name, kind: "slab", plan, z, h });
    return k.solidSvg(k.slabOf(plan, z, h, P, 5, h > 1 ? 0.7 : 0), { tone, inner, lit });
  };
  const round = (name, x, y, r, z, h, tone = "mid", inner = "", lit = false) => {
    parts.push(name);
    solids.push({ name, kind: "cylinder", x, y, r, z, h });
    return k.solidSvg(k.cylinder(x, y, r, z, h, P, r > 20 ? 72 : 28, h > 2 ? 0.5 : 0), { tone, inner, lit });
  };
  const screws = (plan, z, inset = 3) => {
    const points = k.corners(plan, inset);
    return line(points.map(([x, y]) => k.ring(x, y, 1.45, z, P, 18)).join(""), "lo") + dots(points.map(([x, y]) => [x, y, z]));
  };
  const knob = (name, x, y, r, z, h) => round(name, x, y, r, z, h, "mid", line(k.knurl(x, y, r, z, z + h, 28, P, 0), "lo")) + line(k.lineOnTop([x, y], [x + r, y], z + h, P), "hi", "start") + dots([[x, y, z + h]], 0.5);
  const move = (name, by, body) => {
    const [dx, dy] = k.axisVector(P, by);
    return `<g data-model-part="${name}" data-dx="${dx.toFixed(3)}" data-dy="${dy.toFixed(3)}">${body}</g>`;
  };
  const byDepth = (points) => points.toSorted((a, b) => k.depthOf(a, P) - k.depthOf(b, P));
  const out = [`<path class="iso-halo" d="${k.haloOf(base, -17, 6, P)}"/>`];
  for (const [index, [x, y]] of byDepth(k.corners(base, 21).map(([x, y]) => [x, y, -17])).entries()) {
    out.push(round(`Foot ${index + 1} flange`, x, y, 8, -17, 2, "lo"));
    out.push(round(`Foot ${index + 1} isolator`, x, y, 5.7, -15, 4, "lo"));
  }
  out.push(slab("Cast transport bed", base, -11, 11, "lo", line(k.sideSeam(base, -4, P, 5), "faint")));
  out.push(line(k.planOutline(k.insetPlan(base, 4), 0, P, 5), "lo"), screws(base, 0, 10));
  const deck = { x: -140, y: -70, w: 282, d: 128, r: 6 };
  out.push(slab("Reel deck", deck, 0, 5, "mid", line(k.sideSeam(deck, 2, P, 5), "faint")), screws(deck, 5, 9));
  const decoder = { x: -45, y: -59, w: 90, d: 31, r: 3 };
  out.push(slab("Caption decoder housing", decoder, 5, 7, "mid", line(k.sideSeam(decoder, 9, P, 5), "faint")));
  out.push(slab("Caption decoder lid", k.insetPlan(decoder, 0.5), 12, 1.2, "mid"), screws(decoder, 13.2, 4));
  out.push(slab("Decoder meter bezel", { x: -38, y: -52, w: 53, d: 18, r: 2 }, 13.2, 1.5, "hi"));
  const meter = { x: -35, y: -49, w: 47, d: 12, r: 1 };
  out.push(slab("Decoder meter face", meter, 14.7, 0.5, "lo"));
  const meterTicks = k.topTicks(-32, 9, 3, 4, -49, 15.2, [2, 4], P);
  out.push(line(meterTicks.minor), line(meterTicks.major, "mid"));
  out.push(line(k.lineOnTop([-12, -42], [-9, -46], 15.2, P), "hi", true));
  out.push(dots([[-12, -42, 15.2]], 0.7));
  for (const [i, y] of [-48, -36].entries()) {
    out.push(round(`Decoder trim ${i + 1} seat`, 30, y, 5, 13.2, 1.3, "lo"));
    out.push(knob(`Decoder trim ${i + 1} knob`, 30, y, 3.6, 14.5, 4));
  }
  for (const [index, [x, y]] of byDepth([[-94, -29, 5], [87, -29, 5]]).entries()) {
    const prefix = index === 0 ? "Source reel" : "Take-up reel";
    out.push(round(`${prefix} bearing seat`, x, y, 19, 5, 3, "lo"));
    out.push(round(`${prefix} spindle collar`, x, y, 11, 8, 5, "mid"));
    out.push(round(`${prefix} lower flange`, x, y, 40, 13, 2.5, "hi"));
    out.push(round(`${prefix} wound film pack`, x, y, 33, 15.5, 7, "lo", line(k.sideArc(x, y, 33, 18.5, P, 40), "faint")));
    out.push(round(`${prefix} upper flange`, x, y, 40, 22.5, 2, "hi"));
    out.push(line([37, 32, 13].map((r) => k.ring(x, y, r, 24.5, P, 72)).join(""), "lo"));
    for (let a = 0; a < 6; a++) {
      const angle = Math.PI * 2 * a / 6;
      const holeX = x + Math.cos(angle) * 23;
      const holeY = y + Math.sin(angle) * 23;
      out.push(line(k.ring(holeX, holeY, 6.2, 24.5, P, 30), "mid"));
      out.push(line(k.ring(holeX, holeY, 5.5, 24.5, P, 30), "faint"));
    }
    out.push(round(`${prefix} hub`, x, y, 11, 24.5, 4, "mid"));
    out.push(knob(`${prefix} threaded keeper`, x, y, 7, 28.5, 5));
    out.push(line(k.ring(x, y, 3.5, 33.5, P, 28), "lo"));
    out.push(dots(Array.from({ length: 6 }, (_, a) => [x + Math.sin(a * Math.PI / 3) * 9, y + Math.cos(a * Math.PI / 3) * 9, 28.5]), 0.45));
  }
  const tape = { x: -95, y: 15, w: 182, d: 7, r: 0.5 };
  out.push(slab("Film guide platen", { x: -101, y: 10, w: 194, d: 17, r: 2 }, 5, 7, "mid"));
  out.push(slab("Caption specimen film", tape, 12, 0.8, "hi"));
  out.push(line(k.lineOnTop([-95, 18.5], [87, 18.5], 12.8, P), "faint"));
  for (let x = -91; x < 87; x += 8) {
    out.push(line(k.planOutline({ x, y: 15.8, w: 2.7, d: 1.3, r: 0.25 }, 12.8, P, 2), "lo"));
    out.push(line(k.planOutline({ x, y: 19.9, w: 2.7, d: 1.3, r: 0.25 }, 12.8, P, 2), "lo"));
  }
  for (const [i, x] of [-103, -62, 57, 96].entries()) {
    out.push(round(`Guide roller ${i + 1} base`, x, 18, 5.5, 5, 7, "mid"));
    out.push(round(`Guide roller ${i + 1} bearing`, x, 18, 3.2, 12, 10, "hi"));
    out.push(round(`Guide roller ${i + 1} rim`, x, 18, 5, 22, 1.5, "mid"));
    out.push(dots([[x, 18, 23.5]], 0.5));
  }
  const head = { x: 109, y: 1, w: 21, d: 33, r: 3 };
  out.push(slab("Fixed capstan motor", head, 5, 11, "mid", line(k.sideSeam(head, 10, P, 5), "faint")), screws(head, 16, 4));
  out.push(round("Capstan bearing", 119, 18, 5.5, 16, 3, "lo"));
  out.push(round("Capstan flywheel", 119, 18, 4.5, 19, 7, "hi"));
  out.push(knob("Motor speed trim", 120, 7, 3.5, 16, 4));
  for (const y of [29, 47]) {
    const rail = { x: -109, y, w: 201, d: 4, r: 1.5 };
    out.push(slab(`Scanner rail ${y}`, rail, 5, 3, "mid"), dots([[-103, y + 2, 8], [86, y + 2, 8]], 0.45));
  }
  for (const x of [-117, 93]) {
    const stop = { x, y: 27, w: 8, d: 26, r: 1.5 };
    out.push(slab(`Scanner end stop ${x}`, stop, 5, 7, "mid"), screws(stop, 12, 2.6));
  }
  const transport = [];
  for (const [i, [x, y]] of [[-44, 29], [-19, 29], [-44, 47], [-19, 47]].entries()) {
    transport.push(slab(`Scanner bushing ${i + 1}`, { x, y, w: 8, d: 4, r: 1 }, 8, 4, "mid"));
    transport.push(dots([[x + 4, y + 2, 12]], 0.5));
  }
  const carriage = { x: -44, y: 25, w: 33, d: 29, r: 3 };
  transport.push(slab("Film scanner carriage", carriage, 12, 5, "mid", line(k.sideSeam(carriage, 14.5, P, 5), "faint")), screws(carriage, 17, 4));
  transport.push(slab("Scanner aperture frame", { x: -38, y: 29, w: 21, d: 15, r: 2 }, 17, 3, "hi"));
  transport.push(slab("Optical caption platen", { x: -35, y: 32, w: 15, d: 9, r: 1 }, 20, 0.8, "hi", "", true));
  transport.push(line(k.planOutline({ x: -32, y: 34, w: 9, d: 5, r: 0.6 }, 20.8, P, 3), "lo"));
  transport.push(slab("Scanner handle bridge", { x: -34, y: 50, w: 16, d: 4, r: 1 }, 17, 3, "mid"));
  out.push(move("transport", [62, 0, 0], transport.join("")));
  for (const [i, x] of [-100, 104].entries()) {
    out.push(round(`Deck selector ${i + 1} seat`, x, 44, 8, 5, 2, "lo"));
    out.push(knob(`Deck selector ${i + 1} knob`, x, 44, 6, 7, 5));
  }
  const dock = { x: -55, y: 62, w: 151, d: 25, r: 3 };
  out.push(slab("Translation drawer runners", dock, 0, 3, "lo"));
  for (const [i, x] of [-49, 85].entries()) out.push(slab(`Translation guide ${i + 1}`, { x, y: 53, w: 4, d: 33, r: 1 }, 3, 2, "mid"));
  const translation = [];
  const tray = { x: -43, y: 68, w: 124, d: 15, r: 2 };
  translation.push(slab("Translation tray floor", tray, 5, 2, "mid", line(k.sideSeam(tray, 6, P, 5), "faint")));
  translation.push(slab("Translation tray left rim", { x: -43, y: 68, w: 3, d: 15, r: 0.5 }, 7, 4, "mid"));
  translation.push(slab("Translation tray right rim", { x: 78, y: 68, w: 3, d: 15, r: 0.5 }, 7, 4, "mid"));
  translation.push(slab("Translation tray back rim", { x: -40, y: 68, w: 118, d: 3, r: 0.5 }, 7, 4, "mid"));
  translation.push(slab("Translated caption card", { x: -36, y: 72, w: 107, d: 8, r: 1 }, 7, 0.6, "hi"));
  for (const [y, w] of [[73.5, 82], [76, 95], [78.3, 64]]) translation.push(line(k.lineOnTop([-32, y], [-32 + w, y], 7.6, P), "lo", true));
  translation.push(slab("Translation pull left mount", { x: -8, y: 81, w: 4, d: 3, r: 0.6 }, 7, 4, "mid"));
  translation.push(slab("Translation pull right mount", { x: 23, y: 81, w: 4, d: 3, r: 0.6 }, 7, 4, "mid"));
  translation.push(slab("Translation pull", { x: -8, y: 82, w: 35, d: 3, r: 1 }, 11, 3, "hi"));
  out.push(move("translation", [0, -16, 0], translation.join("")));
  const ruler = { x: -112, y: 94, w: 230, d: 7, r: 1 };
  out.push(slab("Twelve second timeline strip", ruler, 0, 1, "lo"));
  const ticks = k.topTicks(-108, 108, 4.5, 4, 94, 1, [2.4, 4.7], P);
  out.push(line(ticks.minor, "lo"), line(ticks.major, "mid"));
  out.push(dots([[-109, 98, 1], [114, 98, 1]], 0.5));
  const playhead = [];
  playhead.push(slab("Playhead shoe", { x: -110.5, y: 91.5, w: 5, d: 12, r: 1 }, 1, 2.8, "hi"));
  playhead.push(slab("Playhead indicator", { x: -109.5, y: 88.5, w: 3, d: 7, r: 0.6 }, 3.8, 2.2, "hi"));
  playhead.push(line(k.lineOnTop([-108, 91], [-108, 102.5], 6, P), "hi", true));
  out.push(move("playhead", [216, 0, 0], playhead.join("")));
  return { body: out.join(""), projection, parts, solids, label: "A reel-to-reel caption bench with fixed source and take-up reels, a film scanner on twin rails, an optional translation drawer, and a playhead above a twelve-second ruler." };
}
