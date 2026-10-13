export function appFrame(k, { kind, title }) {
  const projection = { origin: [14, 25], scale: 0.54, azimuth: 90, elevation: 72 };
  const shell = { x: 0, y: 0, w: 900, d: 550, r: kind === 'tablet' ? 24 : 16 };
  const rim = k.insetPlan(shell, 15);
  const body = [
    k.solidSvg(k.slabOf(shell, 0, 22, projection, 10, 2), { tone: 'hi', crease: 'lo' }),
    k.lineSvg(k.planOutline(rim, 22, projection, 10), { tone: 'faint' })
  ].join('');
  return { body, projection, parts: [`${title} display housing`, `${title} display rim`] };
}
