(() => {
  const scene = document.querySelector("[data-i-scene]");
  const canvas = document.querySelector("[data-void-canvas]");

  if (!scene || !(canvas instanceof HTMLCanvasElement)) return;

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const strands = Array.from({ length: 24 }, (_, index) => ({
    seed: index + 1,
    side: index % 4,
    depth: 0.16 + seeded(index * 9.13) * 0.78,
    width: 0.45 + seeded(index * 5.77) * 2.1,
    speed: 0.000018 + seeded(index * 3.41) * 0.000034,
    phase: seeded(index * 7.29) * Math.PI * 2,
  }));
  const motes = Array.from({ length: 42 }, (_, index) => ({
    x: seeded(index * 2.73 + 9),
    y: seeded(index * 6.19 + 3),
    radius: 0.25 + seeded(index * 8.21 + 2) * 1.1,
    alpha: 0.025 + seeded(index * 4.07 + 4) * 0.075,
    phase: seeded(index * 1.87 + 5) * Math.PI * 2,
  }));

  let width = 0;
  let height = 0;
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;

  function seeded(value) {
    const number = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
    return number - Math.floor(number);
  }

  function resize() {
    const bounds = scene.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(performance.now());
  }

  function edgePoint(side, offset, overscan = 0) {
    if (side === 0) return { x: offset * width, y: -overscan };
    if (side === 1) return { x: width + overscan, y: offset * height };
    if (side === 2) return { x: offset * width, y: height + overscan };
    return { x: -overscan, y: offset * height };
  }

  function draw(time) {
    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);

    const centerX = width * 0.55 + pointerX * 0.18;
    const centerY = height * 0.49 + pointerY * 0.18;
    const glow = context.createRadialGradient(
      centerX,
      centerY,
      Math.min(width, height) * 0.03,
      centerX,
      centerY,
      Math.max(width, height) * 0.62
    );
    glow.addColorStop(0, "rgba(22, 24, 25, 0.66)");
    glow.addColorStop(0.24, "rgba(10, 11, 12, 0.42)");
    glow.addColorStop(0.7, "rgba(2, 2, 2, 0.2)");
    glow.addColorStop(1, "#000");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    context.save();
    context.globalCompositeOperation = "screen";
    context.lineCap = "round";

    strands.forEach((strand, index) => {
      const wave = Math.sin(time * strand.speed + strand.phase);
      const counterWave = Math.cos(time * strand.speed * 0.73 + strand.phase);
      const startOffset = 0.06 + seeded(strand.seed * 2.31) * 0.88;
      const endOffset = 0.08 + seeded(strand.seed * 4.79) * 0.84;
      const start = edgePoint(strand.side, startOffset, 24);
      const end = edgePoint((strand.side + 1 + (index % 2)) % 4, endOffset, 10);
      const pull = strand.depth;

      const controlOne = {
        x: start.x + (centerX - start.x) * (0.28 + pull * 0.2) + wave * width * 0.035,
        y: start.y + (centerY - start.y) * (0.2 + pull * 0.25) + counterWave * height * 0.04,
      };
      const controlTwo = {
        x: end.x + (centerX - end.x) * (0.38 + pull * 0.17) - counterWave * width * 0.04,
        y: end.y + (centerY - end.y) * (0.3 + pull * 0.2) - wave * height * 0.035,
      };

      const stroke = context.createLinearGradient(start.x, start.y, end.x, end.y);
      const alpha = 0.025 + strand.depth * 0.07;
      stroke.addColorStop(0, "rgba(82, 84, 85, 0)");
      stroke.addColorStop(0.44, `rgba(86, 88, 89, ${alpha})`);
      stroke.addColorStop(0.62, `rgba(148, 149, 148, ${alpha * 0.52})`);
      stroke.addColorStop(1, "rgba(70, 72, 73, 0)");

      context.beginPath();
      context.moveTo(start.x, start.y);
      context.bezierCurveTo(
        controlOne.x,
        controlOne.y,
        controlTwo.x,
        controlTwo.y,
        end.x,
        end.y
      );
      context.strokeStyle = stroke;
      context.lineWidth = strand.width;
      context.shadowColor = `rgba(110, 111, 112, ${alpha * 0.75})`;
      context.shadowBlur = 8 + strand.depth * 22;
      context.stroke();
    });

    context.shadowBlur = 0;
    context.setLineDash([2, 14, 1, 23]);
    context.lineWidth = 0.7;
    context.strokeStyle = "rgba(122, 124, 124, 0.07)";
    context.beginPath();
    context.ellipse(
      centerX,
      centerY,
      Math.max(width * 0.31, 160),
      Math.max(height * 0.4, 180),
      time * 0.000003,
      0,
      Math.PI * 2
    );
    context.stroke();
    context.setLineDash([]);

    motes.forEach((mote) => {
      const drift = reducedMotion.matches ? 0 : Math.sin(time * 0.00007 + mote.phase) * 7;
      context.beginPath();
      context.arc(mote.x * width + drift, mote.y * height - drift * 0.4, mote.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(210, 210, 205, ${mote.alpha})`;
      context.fill();
    });

    context.restore();
  }

  function animate(time) {
    pointerX += (targetX - pointerX) * 0.025;
    pointerY += (targetY - pointerY) * 0.025;
    scene.style.setProperty("--shift-x", `${pointerX * 0.12}px`);
    scene.style.setProperty("--shift-y", `${pointerY * 0.12}px`);
    draw(time);
    frame = reducedMotion.matches ? 0 : requestAnimationFrame(animate);
  }

  function start() {
    if (frame || reducedMotion.matches || document.hidden) {
      draw(performance.now());
      return;
    }
    frame = requestAnimationFrame(animate);
  }

  function stop() {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function handleMotionChange() {
    if (reducedMotion.matches) {
      stop();
      targetX = 0;
      targetY = 0;
      pointerX = 0;
      pointerY = 0;
      scene.style.setProperty("--shift-x", "0px");
      scene.style.setProperty("--shift-y", "0px");
      draw(performance.now());
    } else {
      start();
    }
  }

  scene.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches) return;
    targetX = (event.clientX / Math.max(width, 1) - 0.5) * 18;
    targetY = (event.clientY / Math.max(height, 1) - 0.5) * 12;
  });

  scene.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  window.addEventListener("resize", resize, { passive: true });
  reducedMotion.addEventListener?.("change", handleMotionChange);

  resize();
  start();
})();
