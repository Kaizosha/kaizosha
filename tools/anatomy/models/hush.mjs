export function buildModel(k) {
  const base = { x: -149, y: -83, w: 300, d: 183, r: 10 };
  const projection = k.fitProjection(k.boxCorners(base, -17, 67), 640, 400, { pad: 47, azimuth: 47, elevation: 39 });
  const P = projection;
  const parts = [];
  const solids = [];
  const line = (path, tone = "lo", free) => k.lineSvg(path, { tone, free });
  const at = (x, y, z) => k.iso([x, y, z], P);
  const dots = (points, size = 0.48, tone = "mid") => k.dotsSvg(points.map(([x, y, z]) => at(x, y, z)), { size, tone });
  const slab = (name, plan, z, h, tone = "mid", inner = "", lit = false) => {
    parts.push(name);
    solids.push({ name, kind: "slab", plan, z, h });
    return k.solidSvg(k.slabOf(plan, z, h, P, 5, h > 1 ? 0.7 : 0), { tone, inner, lit });
  };
  const round = (name, x, y, r, z, h, tone = "mid", inner = "") => {
    parts.push(name);
    solids.push({ name, kind: "cylinder", x, y, r, z, h });
    return k.solidSvg(k.cylinder(x, y, r, z, h, P, r > 20 ? 64 : 28, h > 2 ? 0.5 : 0), { tone, inner });
  };
  const screws = (plan, z, inset = 3) => {
    const points = k.corners(plan, inset);
    return line(points.map(([x, y]) => k.ring(x, y, 1.3, z, P, 18)).join("")) + dots(points.map(([x, y]) => [x, y, z]));
  };
  const knob = (name, x, y, r, z, h) => round(name, x, y, r, z, h, "mid", line(k.knurl(x, y, r, z, z + h, 24, P, 0))) + line(k.lineOnTop([x, y], [x, y - r], z + h, P), "hi", "start") + dots([[x, y, z + h]], 0.5);
  const move = (name, by, body) => {
    const [dx, dy] = k.axisVector(P, by);
    return `<g data-model-part="${name}" data-dx="${dx.toFixed(3)}" data-dy="${dy.toFixed(3)}">${body}</g>`;
  };
  const out = [`<path class="iso-halo" d="${k.haloOf(base, -17, 6, P)}"/>`];
  const feet = k.corners(base, 22).toSorted((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  feet.forEach(([x, y], i) => {
    out.push(round(`Console foot ${i + 1} flange`, x, y, 7.5, -17, 2, "lo"));
    out.push(round(`Console foot ${i + 1} pad`, x, y, 5.5, -15, 4, "lo"));
  });
  out.push(slab("Cast mixing desk chassis", base, -11, 11, "lo", line(k.sideSeam(base, -4, P, 5), "faint")));
  out.push(line(k.planOutline(k.insetPlan(base, 4), 0, P, 5)), screws(base, 0, 9));
  const deck = { x: -138, y: -74, w: 183, d: 126, r: 5 };
  out.push(slab("Input console deck", deck, 0, 8, "mid", line(k.sideSeam(deck, 4, P, 5), "faint")), screws(deck, 8, 8));
  out.push(slab("Console rear connector rail", { x: -129, y: -66, w: 163, d: 12, r: 2 }, 8, 3, "mid"));
  for (const [i, x] of [-112, -61, -10].entries()) {
    out.push(round(`Input jack ${i + 1} seat`, x, -60, 5, 11, 2, "lo"));
    out.push(round(`Input jack ${i + 1} collar`, x, -60, 3.4, 13, 3, "mid"));
    out.push(line(k.ring(x, -60, 1.7, 16, P, 20), "hi"));
  }
  const channels = [
    { name: "microphone", x: -121, title: "Microphone" },
    { name: "text", x: -70, title: "Text" },
    { name: "capture", x: -19, title: "Capture" },
  ];
  for (const channel of channels) {
    const { x, title } = channel;
    const strip = { x, y: -48, w: 38, d: 92, r: 2.5 };
    out.push(slab(`${title} channel plate`, strip, 8, 1.4, "lo"));
    out.push(line(k.planOutline(k.insetPlan(strip, 2.5), 9.4, P, 5), "faint"));
    out.push(knob(`${title} gain knob`, x + 10, -39, 4.2, 9.4, 5));
    out.push(knob(`${title} trim knob`, x + 27, -39, 3.2, 9.4, 4));
    for (const [i, railX] of [x + 5, x + 30].entries()) {
      const rail = { x: railX, y: -22, w: 3, d: 61, r: 1 };
      out.push(slab(`${title} carriage guide ${i + 1}`, rail, 9.4, 2.8, "mid"));
      out.push(dots([[railX + 1.5, -19, 12.2], [railX + 1.5, 36, 12.2]], 0.45));
    }
    out.push(slab(`${title} upper stop`, { x: x + 4, y: -25, w: 30, d: 3, r: 0.8 }, 9.4, 4, "mid"));
    out.push(slab(`${title} lower stop`, { x: x + 4, y: 39, w: 30, d: 3, r: 0.8 }, 9.4, 4, "mid"));
    const scale = { x: x + 17, y: -20, w: 3, d: 58, r: 0.3 };
    out.push(slab(`${title} level scale`, scale, 9.4, 0.6, "lo"));
    const ticks = k.topTicks(-17, 36, 4, 4, x + 17, 10, [1.1, 2.5], P, "y");
    out.push(line(ticks.minor), line(ticks.major, "mid"));
    const carriage = [];
    for (const [i, railX] of [x + 5, x + 30].entries()) carriage.push(slab(`${title} bushing ${i + 1}`, { x: railX, y: -14, w: 3, d: 11, r: 0.8 }, 12.2, 3, "mid"));
    const sled = { x: x + 3, y: -15, w: 32, d: 15, r: 2 };
    carriage.push(slab(`${title} input carriage`, sled, 15.2, 4, "hi"), screws(sled, 19.2, 3));
    if (channel.name === "microphone") {
      carriage.push(round("Microphone capsule socket", x + 19, -7.5, 5, 19.2, 3, "mid"));
      carriage.push(round("Microphone capsule", x + 19, -7.5, 6.4, 22.2, 15, "hi", line(k.sideArc(x + 19, -7.5, 6.4, 27.2, P, 28), "faint")));
      carriage.push(round("Microphone grille cap", x + 19, -7.5, 6.4, 37.2, 1.7, "mid"));
      carriage.push(dots(Array.from({ length: 12 }, (_, i) => [x + 19 + Math.cos(i * Math.PI / 6) * 4.5, -7.5 + Math.sin(i * Math.PI / 6) * 4.5, 38.9]), 0.45, "lo"));
      carriage.push(line(k.ring(x + 19, -7.5, 2.5, 38.9, P, 24), "faint"));
    } else if (channel.name === "text") {
      carriage.push(slab("Text platen", { x: x + 8, y: -13, w: 22, d: 11, r: 1 }, 19.2, 2, "mid"));
      carriage.push(slab("Text specimen card", { x: x + 9.5, y: -12, w: 19, d: 9, r: 0.6 }, 21.2, 0.7, "hi"));
      for (const [i, width] of [15, 12, 14].entries()) carriage.push(line(k.lineOnTop([x + 11, -10.7 + i * 2.2], [x + 11 + width, -10.7 + i * 2.2], 21.9, P), "lo", true));
      carriage.push(slab("Text paper retaining bar", { x: x + 9, y: -3, w: 20, d: 1.7, r: 0.5 }, 21.2, 1.7, "mid"));
    } else {
      carriage.push(slab("Capture sensor frame", { x: x + 7, y: -13, w: 24, d: 11, r: 1 }, 19.2, 3.5, "mid"));
      carriage.push(slab("Capture specimen glass", { x: x + 10, y: -11, w: 18, d: 7, r: 0.7 }, 22.7, 0.6, "hi"));
      carriage.push(line(k.planOutline({ x: x + 12, y: -10, w: 14, d: 5, r: 0.4 }, 23.3, P, 3), "lo"));
      carriage.push(dots([[x + 15, -7.5, 23.3], [x + 19, -7.5, 23.3], [x + 23, -7.5, 23.3]], 0.5, "lo"));
    }
    out.push(move(channel.name, [0, 31, 0], carriage.join("")));
  }
  const provider = { x: 101, y: -66, w: 38, d: 43, r: 4 };
  out.push(slab("External provider connector base", provider, 0, 5, "lo"));
  out.push(slab("External provider connector shell", k.insetPlan(provider, 2), 5, 24, "mid", line(k.sideSeam(k.insetPlan(provider, 2), 21, P, 5), "faint")));
  out.push(slab("Provider socket bezel", { x: 101, y: -47, w: 7, d: 18, r: 1.3 }, 9, 14, "hi"));
  out.push(slab("Provider socket recess", { x: 100, y: -44.5, w: 1, d: 13, r: 0.3 }, 12, 8, "lo"));
  out.push(screws(k.insetPlan(provider, 2), 29, 4));
  for (const y of [-56, -51, -46]) out.push(line(k.planOutline({ x: 115, y, w: 17, d: 1.5, r: 0.5 }, 29, P, 3), "faint"));
  for (const [i, y] of [-45, -28].entries()) {
    out.push(slab(`Provider dispatch rail ${i + 1}`, { x: 39, y, w: 66, d: 3, r: 1 }, 0, 5, "mid"));
    out.push(dots([[43, y + 1.5, 5], [101, y + 1.5, 5]], 0.45));
  }
  const request = [];
  const requestPlan = { x: 42, y: -46, w: 23, d: 21, r: 2 };
  request.push(slab("Request dispatch carriage", requestPlan, 5, 4, "mid", line(k.sideSeam(requestPlan, 7, P, 5), "faint")));
  request.push(slab("Request packet case", { x: 45, y: -43, w: 17, d: 15, r: 1.5 }, 9, 6, "hi"));
  request.push(slab("Request packet lid", { x: 45, y: -43, w: 17, d: 15, r: 1.5 }, 15, 1.6, "hi"));
  request.push(screws({ x: 45, y: -43, w: 17, d: 15, r: 1.5 }, 16.6, 3));
  request.push(slab("Request connector tongue", { x: 62, y: -41, w: 5, d: 11, r: 0.7 }, 10, 4, "mid"));
  out.push(move("request", [34, 0, 0], request.join("")));
  const local = { x: 71, y: 35, w: 69, d: 56, r: 5 };
  out.push(slab("Local session recorder base", local, 0, 5, "lo"), screws(local, 5, 7));
  out.push(round("Local spool bearing seat", 111, 61, 14, 5, 4, "mid"));
  out.push(round("Local spool lower flange", 111, 61, 21, 9, 2, "hi"));
  out.push(round("Local session spool", 111, 61, 16, 11, 9, "mid", line(k.sideArc(111, 61, 16, 15, P, 36), "faint")));
  out.push(round("Local spool upper flange", 111, 61, 21, 20, 2, "hi"));
  out.push(line(k.ring(111, 61, 18, 22, P, 56)));
  const spoolTicks = k.radialTicks(111, 61, 18, 30, 5, 22, [1.2, 2.5], P);
  out.push(line(spoolTicks.minor), line(spoolTicks.major, "mid"));
  out.push(round("Local spool hub", 111, 61, 7, 22, 4, "mid"));
  out.push(knob("Local spool keeper", 111, 61, 4.7, 26, 4));
  for (const [i, y] of [48, 66].entries()) out.push(slab(`Local archive feed rail ${i + 1}`, { x: 43, y, w: 47, d: 3, r: 1 }, 0, 5, "mid"));
  const session = [];
  session.push(slab("Session archive shoe", { x: 44, y: 46, w: 20, d: 23, r: 2 }, 5, 3, "mid"));
  session.push(slab("Local session cartridge", { x: 47, y: 49, w: 14, d: 17, r: 1.5 }, 8, 7, "hi"));
  session.push(slab("Session cartridge keeper", { x: 47, y: 49, w: 14, d: 17, r: 1.5 }, 15, 1.3, "mid"));
  session.push(line(k.planOutline({ x: 50, y: 52, w: 8, d: 11, r: 0.7 }, 16.3, P, 3), "lo"));
  session.push(dots([[51, 54, 16.3], [56, 61, 16.3]], 0.5));
  out.push(move("session", [26, 0, 0], session.join("")));
  const reviewDock = { x: -126, y: 58, w: 153, d: 32, r: 3 };
  out.push(slab("Context review drawer bed", reviewDock, 0, 3, "lo"));
  for (const [i, x] of [-122, 19].entries()) out.push(slab(`Review drawer runner ${i + 1}`, { x, y: 50, w: 4, d: 40, r: 1 }, 3, 2, "mid"));
  const review = [];
  const tray = { x: -117, y: 63, w: 130, d: 22, r: 2.5 };
  review.push(slab("Review tray floor", tray, 5, 2.5, "mid", line(k.sideSeam(tray, 6.2, P, 5), "faint")));
  review.push(slab("Review tray left rim", { x: -117, y: 63, w: 3, d: 22, r: 0.5 }, 7.5, 4, "mid"));
  review.push(slab("Review tray right rim", { x: 10, y: 63, w: 3, d: 22, r: 0.5 }, 7.5, 4, "mid"));
  review.push(slab("Review tray rear rim", { x: -114, y: 63, w: 124, d: 3, r: 0.5 }, 7.5, 4, "mid"));
  review.push(slab("Reviewed context specimen", { x: -108, y: 68, w: 110, d: 12, r: 1 }, 7.5, 0.7, "hi", "", true));
  for (const [i, w] of [93, 82, 61].entries()) review.push(line(k.lineOnTop([-104, 70.5 + i * 3], [-104 + w, 70.5 + i * 3], 8.2, P), "lo", true));
  review.push(slab("Review pull left bracket", { x: -74, y: 83, w: 4, d: 3, r: 0.7 }, 7.5, 4, "mid"));
  review.push(slab("Review pull right bracket", { x: -39, y: 83, w: 4, d: 3, r: 0.7 }, 7.5, 4, "mid"));
  review.push(slab("Review drawer pull", { x: -74, y: 84, w: 39, d: 3, r: 1 }, 11.5, 3, "hi"));
  out.push(move("review", [0, 10, 0], review.join("")));
  return { body: out.join(""), projection, parts, solids, label: "A context mixing desk with microphone, text, and capture channel carriages, a review drawer, a separate external provider connector, and a local session spool." };
}
