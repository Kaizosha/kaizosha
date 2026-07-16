(() => {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const darkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const canvases = [...document.querySelectorAll("canvas[data-art]")];
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  const scrollScenes = [...document.querySelectorAll("[data-scroll-scene]")];
  const pointerZones = [...document.querySelectorAll("[data-pointer-zone]")];
  const canvasStates = new Map();
  const sceneProgress = new WeakMap();
  const pointerStates = new Map();

  const clamp = (value, minimum = 0, maximum = 1) =>
    Math.min(maximum, Math.max(minimum, value));

  const lerp = (start, end, amount) => start + (end - start) * amount;

  const listenToMedia = (query, listener) => {
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", listener);
    } else if (typeof query.addListener === "function") {
      query.addListener(listener);
    }
  };

  root.classList.add("motion-ready");
  root.classList.toggle("motion-reduced", reducedMotion.matches);

  function roundedRect(context, x, y, width, height, radius) {
    const safeRadius = Math.min(Math.max(0, radius), width / 2, height / 2);

    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.lineTo(x + width - safeRadius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    context.lineTo(x + width, y + height - safeRadius);
    context.quadraticCurveTo(
      x + width,
      y + height,
      x + width - safeRadius,
      y + height
    );
    context.lineTo(x + safeRadius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    context.lineTo(x, y + safeRadius);
    context.quadraticCurveTo(x, y, x + safeRadius, y);
    context.closePath();
  }

  function strokeLine(context, points, color, width = 1, alpha = 1) {
    if (points.length < 2) return;

    context.save();
    context.strokeStyle = color;
    context.lineWidth = width;
    context.globalAlpha = alpha;
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => context.lineTo(x, y));
    context.stroke();
    context.restore();
  }

  function drawDot(context, x, y, radius, color, alpha = 1) {
    context.save();
    context.fillStyle = color;
    context.globalAlpha = alpha;
    context.beginPath();
    context.arc(x, y, Math.max(0, radius), 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function drawLabel(
    context,
    text,
    x,
    y,
    size,
    color,
    align = "left",
    alpha = 1
  ) {
    context.save();
    context.fillStyle = color;
    context.globalAlpha = alpha;
    context.font = `600 ${Math.max(8, size)}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    context.textAlign = align;
    context.textBaseline = "middle";
    context.fillText(text, x, y);
    context.restore();
  }

  function readToken(style, names, fallback) {
    for (const name of names) {
      const value = style.getPropertyValue(name).trim();
      if (value) return value;
    }
    return fallback;
  }

  let paletteRevision = 0;

  function getPalette(state) {
    if (state.palette && state.paletteRevision === paletteRevision) {
      return state.palette;
    }

    const style = window.getComputedStyle(state.canvas);
    const rootStyle = window.getComputedStyle(root);
    const isDark = darkScheme.matches;
    const fallbackInk = isDark ? "#edf7f5" : "#11211f";
    const fallbackMuted = isDark ? "#9aafab" : "#62716e";
    const fallbackLine = isDark ? "#38514d" : "#ccd8d5";
    const fallbackSurface = isDark ? "#172522" : "#f4f8f7";

    const fromCanvasOrRoot = (names, fallback) => {
      const local = readToken(style, names, "");
      return local || readToken(rootStyle, names, fallback);
    };

    state.palette = {
      accent: fromCanvasOrRoot(
        [
          "--signal",
          "--teal",
          "--accent",
          "--site-accent",
          "--color-accent",
          "--together-accent",
        ],
        isDark ? "#43d6c6" : "#087f73"
      ),
      ink: fromCanvasOrRoot(
        ["--ink", "--foreground", "--text", "--color-ink", "--site-ink"],
        style.color || fallbackInk
      ),
      muted: fromCanvasOrRoot(
        ["--muted", "--muted-ink", "--text-muted", "--color-muted"],
        fallbackMuted
      ),
      line: fromCanvasOrRoot(
        ["--line", "--border", "--hairline", "--color-line"],
        fallbackLine
      ),
      surface: fromCanvasOrRoot(
        ["--surface", "--card", "--paper", "--surface-strong"],
        fallbackSurface
      ),
    };
    state.paletteRevision = paletteRevision;
    return state.palette;
  }

  function canvasProgress(state) {
    const scene = state.scene;
    return scene ? sceneProgress.get(scene) ?? 0.5 : 0.5;
  }

  function canvasPointer(state) {
    const pointer = state.pointerZone
      ? pointerStates.get(state.pointerZone)
      : null;

    return pointer
      ? { x: pointer.x, y: pointer.y, distance: Math.hypot(pointer.x, pointer.y) }
      : { x: 0, y: 0, distance: 0 };
  }

  function drawGrid(context, width, height, palette, spacing, alpha = 0.2) {
    const offsetX = (width % spacing) / 2;
    const offsetY = (height % spacing) / 2;

    context.save();
    context.fillStyle = palette.line;
    context.globalAlpha = alpha;

    for (let y = offsetY; y <= height; y += spacing) {
      for (let x = offsetX; x <= width; x += spacing) {
        context.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
    }

    context.restore();
  }

  function drawHero(state, time) {
    const { context, width, height } = state;
    const palette = getPalette(state);
    const pointer = canvasPointer(state);
    const progress = canvasProgress(state);
    const mode =
      state.canvas.closest("[data-player]")?.dataset.activeMode ||
      state.canvas.closest("[data-player]")?.dataset.mode ||
      "transcribe";
    const reduced = reducedMotion.matches;
    const phase = reduced ? 0 : time * 0.00055;
    const minimum = Math.min(width, height);
    const pad = clamp(minimum * 0.075, 18, 56);
    const left = pad;
    const right = width - pad;
    const top = pad;
    const bottom = height - pad;
    const centerX = width * 0.5 + pointer.x * minimum * 0.018;
    const centerY = height * 0.5 + pointer.y * minimum * 0.018;
    const unit = clamp(minimum * 0.022, 4, 12);

    drawGrid(context, width, height, palette, clamp(minimum * 0.09, 22, 48), 0.22);

    // Three independent signals bend toward one shared center.
    for (let index = 0; index < 3; index += 1) {
      const laneY = lerp(top + unit * 2, bottom - unit * 2, index / 2);
      const bend = (index - 1) * minimum * 0.12;

      context.save();
      context.strokeStyle = index === 1 ? palette.accent : palette.line;
      context.lineWidth = index === 1 ? 1.8 : 1;
      context.globalAlpha = index === 1 ? 0.88 : 0.62;
      context.beginPath();
      context.moveTo(left, laneY);
      context.bezierCurveTo(
        width * 0.28,
        laneY,
        centerX - minimum * 0.18,
        centerY + bend,
        centerX,
        centerY
      );
      context.bezierCurveTo(
        centerX + minimum * 0.19,
        centerY - bend,
        width * 0.74,
        laneY,
        right,
        laneY
      );
      context.stroke();
      context.restore();
    }

    // A moving signal travels across the active route, while reduced motion
    // lands on a useful still rather than hiding the artwork.
    const travel = reduced ? 0.58 : (phase + progress * 0.38) % 1;
    const signalX = lerp(left, right, travel);
    const signalY = centerY + Math.sin(travel * Math.PI * 4) * unit * 0.72;
    drawDot(context, signalX, signalY, unit * 0.46, palette.accent, 0.22);
    drawDot(context, signalX, signalY, unit * 0.2, palette.accent, 1);

    // Central listening core.
    context.save();
    context.strokeStyle = palette.accent;
    context.lineWidth = 1.4;
    context.globalAlpha = 0.9;
    for (let ring = 0; ring < 3; ring += 1) {
      context.beginPath();
      context.arc(
        centerX,
        centerY,
        unit * (1.25 + ring * 0.95) + Math.sin(phase * 5 + ring) * unit * 0.08,
        0,
        Math.PI * 2
      );
      context.stroke();
      context.globalAlpha *= 0.48;
    }
    context.restore();
    drawDot(context, centerX, centerY, unit * 0.58, palette.ink, 0.96);

    const leftPanelWidth = clamp(width * 0.2, 72, 156);
    const panelHeight = clamp(height * 0.2, 58, 104);
    const panelY = clamp(centerY - panelHeight / 2, top, bottom - panelHeight);

    context.save();
    context.fillStyle = palette.surface;
    context.strokeStyle = mode === "transcribe" ? palette.accent : palette.line;
    context.lineWidth = 1;
    context.globalAlpha = 0.95;
    roundedRect(context, left, panelY, leftPanelWidth, panelHeight, unit * 0.8);
    context.fill();
    context.stroke();
    context.restore();

    const bars = width < 430 ? 9 : 13;
    for (let index = 0; index < bars; index += 1) {
      const x = left + unit * 1.25 + (index / Math.max(1, bars - 1)) * (leftPanelWidth - unit * 2.5);
      const wave =
        0.18 +
        Math.abs(Math.sin(index * 1.17 + phase * 7)) *
          (mode === "transcribe" ? 0.72 : 0.38);
      strokeLine(
        context,
        [
          [x, centerY - panelHeight * wave * 0.33],
          [x, centerY + panelHeight * wave * 0.33],
        ],
        index % 4 === 0 ? palette.accent : palette.muted,
        index % 4 === 0 ? 2 : 1,
        0.9
      );
    }

    const rightPanelWidth = clamp(width * 0.22, 78, 172);
    const rightPanelX = right - rightPanelWidth;
    context.save();
    context.fillStyle = palette.surface;
    context.strokeStyle = mode === "export" ? palette.accent : palette.line;
    context.lineWidth = 1;
    context.globalAlpha = 0.95;
    roundedRect(context, rightPanelX, panelY, rightPanelWidth, panelHeight, unit * 0.8);
    context.fill();
    context.stroke();
    context.restore();

    const rowCount = 3;
    for (let row = 0; row < rowCount; row += 1) {
      const rowY = panelY + panelHeight * (0.26 + row * 0.24);
      const rowWidth = rightPanelWidth * (row === 1 ? 0.52 : 0.7);
      strokeLine(
        context,
        [
          [rightPanelX + unit * 1.3, rowY],
          [rightPanelX + unit * 1.3 + rowWidth, rowY],
        ],
        row === 1 && mode === "translate" ? palette.accent : palette.muted,
        row === 1 ? 2 : 1,
        0.82
      );
    }

    if (width >= 360 && height >= 230) {
      drawLabel(
        context,
        mode === "translate" ? "A  →  あ" : mode === "export" ? "TXT  ↗" : "LIVE",
        mode === "transcribe" ? left + unit : rightPanelX + unit,
        panelY - unit * 1.45,
        clamp(unit * 0.82, 8, 11),
        palette.accent,
        "left",
        0.9
      );
    }

    // Pointer ghost: restrained enough to preserve the composition at any zoom.
    if (!reduced && pointer.distance > 0.04) {
      const ghostX = centerX + pointer.x * minimum * 0.19;
      const ghostY = centerY + pointer.y * minimum * 0.19;
      drawDot(context, ghostX, ghostY, unit * 0.18, palette.accent, 0.9);
      context.save();
      context.strokeStyle = palette.accent;
      context.globalAlpha = 0.3;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(ghostX, ghostY, unit * 0.72, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }
  }

  function activeEngineStep(state) {
    const engine = state.canvas.closest("[data-engine]");
    const stage = engine?.querySelector("[data-engine-stage], .engine-stage, .engine__stage");
    const value = stage?.dataset.activeStep || engine?.dataset.activeStep || "open";
    const steps = ["open", "listen", "translate", "export"];
    const index = steps.indexOf(value);
    return { value: index === -1 ? "open" : value, index: Math.max(0, index), steps };
  }

  function drawEngine(state, time) {
    const { context, width, height } = state;
    const palette = getPalette(state);
    const pointer = canvasPointer(state);
    const progress = canvasProgress(state);
    const active = activeEngineStep(state);
    const reduced = reducedMotion.matches;
    const phase = reduced ? 0.42 : time * 0.00042;
    const minimum = Math.min(width, height);
    const pad = clamp(minimum * 0.09, 18, 52);
    const horizontal = width >= 520;
    const labelSize = clamp(minimum * 0.032, 8, 11);
    const nodeRadius = clamp(minimum * 0.025, 5, 10);
    const positions = active.steps.map((_, index) => {
      const amount = index / (active.steps.length - 1);
      return horizontal
        ? {
            x: lerp(pad * 1.25, width - pad * 1.25, amount),
            y:
              height * 0.5 +
              Math.sin(amount * Math.PI * 2 - Math.PI / 2) * height * 0.13 +
              pointer.y * minimum * 0.012,
          }
        : {
            x:
              width * 0.43 +
              Math.sin(amount * Math.PI * 2) * width * 0.1 +
              pointer.x * minimum * 0.012,
            y: lerp(pad * 1.3, height - pad * 1.3, amount),
          };
    });

    drawGrid(context, width, height, palette, clamp(minimum * 0.12, 24, 46), 0.18);

    context.save();
    context.strokeStyle = palette.line;
    context.lineWidth = 1.2;
    context.globalAlpha = 0.9;
    context.beginPath();
    context.moveTo(positions[0].x, positions[0].y);
    positions.slice(1).forEach((point, index) => {
      const previous = positions[index];
      const controlScale = horizontal
        ? Math.abs(point.x - previous.x) * 0.48
        : Math.abs(point.y - previous.y) * 0.48;
      context.bezierCurveTo(
        previous.x + (horizontal ? controlScale : 0),
        previous.y + (horizontal ? 0 : controlScale),
        point.x - (horizontal ? controlScale : 0),
        point.y - (horizontal ? 0 : controlScale),
        point.x,
        point.y
      );
    });
    context.stroke();
    context.restore();

    positions.forEach((point, index) => {
      const isActive = index === active.index;
      const isComplete = index < active.index;
      const radius = nodeRadius * (isActive ? 1.22 : 0.88);

      if (isActive) {
        context.save();
        context.strokeStyle = palette.accent;
        context.lineWidth = 1;
        context.globalAlpha = 0.34;
        context.beginPath();
        context.arc(
          point.x,
          point.y,
          radius * (2.05 + Math.sin(phase * 8) * 0.08),
          0,
          Math.PI * 2
        );
        context.stroke();
        context.restore();
      }

      drawDot(
        context,
        point.x,
        point.y,
        radius,
        isActive || isComplete ? palette.accent : palette.surface,
        isActive ? 1 : isComplete ? 0.58 : 1
      );

      context.save();
      context.strokeStyle = isActive || isComplete ? palette.accent : palette.line;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.stroke();
      context.restore();

      const textX = horizontal ? point.x : point.x + nodeRadius * 2.35;
      const textY = horizontal ? point.y + nodeRadius * 3 : point.y;
      drawLabel(
        context,
        active.steps[index].toUpperCase(),
        textX,
        textY,
        labelSize,
        isActive ? palette.accent : palette.muted,
        horizontal ? "center" : "left",
        isActive ? 1 : 0.82
      );
    });

    // Draw the live packet on the segment leading into the active step.
    if (active.index > 0) {
      const from = positions[active.index - 1];
      const to = positions[active.index];
      const packetProgress = reduced ? 0.72 : (phase * 1.75 + progress * 0.25) % 1;
      const x = lerp(from.x, to.x, packetProgress);
      const y = lerp(from.y, to.y, packetProgress);
      drawDot(context, x, y, nodeRadius * 0.38, palette.accent, 1);
      drawDot(context, x, y, nodeRadius * 0.9, palette.accent, 0.15);
    }

    // A compact drawer anchors the composition without depending on fixed pixels.
    const drawerWidth = clamp(width * (horizontal ? 0.28 : 0.4), 92, 190);
    const drawerHeight = clamp(height * 0.16, 40, 66);
    const drawerX = horizontal
      ? clamp(width * 0.5 - drawerWidth / 2 + pointer.x * 5, pad, width - pad - drawerWidth)
      : clamp(width - pad - drawerWidth, pad, width - pad - drawerWidth);
    const drawerY = horizontal
      ? clamp(height - pad - drawerHeight, pad, height - pad - drawerHeight)
      : clamp(height * 0.5 - drawerHeight / 2, pad, height - pad - drawerHeight);

    context.save();
    context.fillStyle = palette.surface;
    context.strokeStyle = palette.line;
    context.globalAlpha = 0.94;
    context.lineWidth = 1;
    roundedRect(context, drawerX, drawerY, drawerWidth, drawerHeight, drawerHeight * 0.24);
    context.fill();
    context.stroke();
    context.restore();

    for (let line = 0; line < 3; line += 1) {
      const y = drawerY + drawerHeight * (0.3 + line * 0.2);
      const lineWidth = drawerWidth * (line === active.index % 3 ? 0.62 : 0.42);
      strokeLine(
        context,
        [
          [drawerX + drawerHeight * 0.28, y],
          [drawerX + drawerHeight * 0.28 + lineWidth, y],
        ],
        line === active.index % 3 ? palette.accent : palette.muted,
        line === active.index % 3 ? 2 : 1,
        0.85
      );
    }
  }

  function drawDevice(context, x, y, width, height, palette, active = false) {
    context.save();
    context.fillStyle = palette.surface;
    context.strokeStyle = active ? palette.accent : palette.ink;
    context.lineWidth = active ? 1.6 : 1.15;
    roundedRect(context, x, y, width, height, width * 0.16);
    context.fill();
    context.stroke();
    context.restore();

    strokeLine(
      context,
      [
        [x + width * 0.35, y + height * 0.1],
        [x + width * 0.65, y + height * 0.1],
      ],
      active ? palette.accent : palette.muted,
      1,
      0.8
    );

    const chipSize = width * 0.3;
    context.save();
    context.strokeStyle = palette.accent;
    context.lineWidth = 1;
    context.globalAlpha = 0.9;
    roundedRect(
      context,
      x + (width - chipSize) / 2,
      y + height * 0.42 - chipSize / 2,
      chipSize,
      chipSize,
      chipSize * 0.12
    );
    context.stroke();
    context.restore();
  }

  function drawPrivacy(state, time) {
    const { context, width, height } = state;
    const palette = getPalette(state);
    const pointer = canvasPointer(state);
    const progress = canvasProgress(state);
    const reduced = reducedMotion.matches;
    const phase = reduced ? 0.5 : time * 0.00048;
    const minimum = Math.min(width, height);
    const pad = clamp(minimum * 0.1, 14, 54);
    const horizontal = width >= 500 || width / Math.max(1, height) >= 1.45;
    const deviceWidth = clamp(minimum * 0.14, 28, 68);
    const deviceHeight = deviceWidth * 1.72;
    const points = horizontal
      ? {
          source: { x: pad + deviceWidth / 2, y: height * 0.5 },
          core: { x: width * 0.5, y: height * 0.5 },
          output: { x: width - pad - deviceWidth / 2, y: height * 0.5 },
        }
      : {
          source: { x: width * 0.5, y: pad + deviceHeight / 2 },
          core: { x: width * 0.5, y: height * 0.51 },
          output: { x: width * 0.5, y: height - pad - deviceHeight / 2 },
        };

    const parallaxX = pointer.x * minimum * 0.012;
    const parallaxY = pointer.y * minimum * 0.012;
    points.core.x += parallaxX;
    points.core.y += parallaxY;

    drawGrid(context, width, height, palette, clamp(minimum * 0.11, 23, 44), 0.16);

    const path = [points.source, points.core, points.output];
    context.save();
    context.strokeStyle = palette.line;
    context.lineWidth = 1.2;
    context.globalAlpha = 0.9;
    context.setLineDash([3, 7]);
    context.beginPath();
    context.moveTo(path[0].x, path[0].y);
    context.lineTo(path[1].x, path[1].y);
    context.lineTo(path[2].x, path[2].y);
    context.stroke();
    context.restore();

    drawDevice(
      context,
      points.source.x - deviceWidth / 2,
      points.source.y - deviceHeight / 2,
      deviceWidth,
      deviceHeight,
      palette,
      true
    );

    // The processor is deliberately drawn as a closed local loop.
    const coreRadius = clamp(minimum * 0.09, 18, 52);
    context.save();
    context.strokeStyle = palette.accent;
    context.lineWidth = 1.4;
    for (let ring = 0; ring < 3; ring += 1) {
      context.globalAlpha = 0.82 / (ring + 1);
      context.beginPath();
      context.arc(
        points.core.x,
        points.core.y,
        coreRadius * (0.6 + ring * 0.34),
        phase * (ring % 2 ? -1 : 1),
        phase * (ring % 2 ? -1 : 1) + Math.PI * (1.25 + ring * 0.18)
      );
      context.stroke();
    }
    context.restore();

    context.save();
    context.fillStyle = palette.surface;
    context.strokeStyle = palette.ink;
    context.lineWidth = 1;
    context.globalAlpha = 0.98;
    roundedRect(
      context,
      points.core.x - coreRadius * 0.33,
      points.core.y - coreRadius * 0.24,
      coreRadius * 0.66,
      coreRadius * 0.62,
      coreRadius * 0.12
    );
    context.fill();
    context.stroke();
    context.restore();

    context.save();
    context.strokeStyle = palette.accent;
    context.lineWidth = 1.4;
    context.beginPath();
    context.arc(
      points.core.x,
      points.core.y - coreRadius * 0.25,
      coreRadius * 0.2,
      Math.PI,
      Math.PI * 2
    );
    context.stroke();
    context.restore();

    // Output is a small document stack, never leaving the canvas safe area.
    const documentWidth = deviceWidth * 0.78;
    const documentHeight = deviceHeight * 0.62;
    for (let layer = 2; layer >= 0; layer -= 1) {
      const offset = layer * deviceWidth * 0.08;
      const x = points.output.x - documentWidth / 2 + offset;
      const y = points.output.y - documentHeight / 2 - offset;
      context.save();
      context.fillStyle = palette.surface;
      context.strokeStyle = layer === 0 ? palette.accent : palette.line;
      context.lineWidth = layer === 0 ? 1.4 : 1;
      roundedRect(context, x, y, documentWidth, documentHeight, deviceWidth * 0.08);
      context.fill();
      context.stroke();
      context.restore();
    }

    for (let row = 0; row < 3; row += 1) {
      strokeLine(
        context,
        [
          [points.output.x - documentWidth * 0.28, points.output.y - documentHeight * 0.2 + row * documentHeight * 0.2],
          [points.output.x + documentWidth * (row === 1 ? 0.1 : 0.28), points.output.y - documentHeight * 0.2 + row * documentHeight * 0.2],
        ],
        row === 1 ? palette.accent : palette.muted,
        row === 1 ? 1.6 : 1,
        0.85
      );
    }

    const packetAmount = reduced ? 0.64 : (phase * 1.9 + progress * 0.35) % 1;
    const segment = packetAmount < 0.5 ? 0 : 1;
    const localAmount = segment === 0 ? packetAmount * 2 : (packetAmount - 0.5) * 2;
    const from = path[segment];
    const to = path[segment + 1];
    const packetX = lerp(from.x, to.x, localAmount);
    const packetY = lerp(from.y, to.y, localAmount);
    drawDot(context, packetX, packetY, clamp(minimum * 0.012, 3, 6), palette.accent, 1);

    if (width >= 350 && height >= 280) {
      const size = clamp(minimum * 0.026, 8, 11);
      drawLabel(
        context,
        "ON DEVICE",
        points.core.x,
        horizontal ? points.core.y + coreRadius * 1.5 : points.core.y + coreRadius * 1.45,
        size,
        palette.accent,
        "center",
        0.9
      );
    }
  }

  function drawClosing(state, time) {
    const { context, width, height } = state;
    const palette = getPalette(state);
    const pointer = canvasPointer(state);
    const progress = canvasProgress(state);
    const reduced = reducedMotion.matches;
    const phase = reduced ? 0.18 : time * 0.00022;
    const minimum = Math.min(width, height);
    const pad = clamp(minimum * 0.09, 18, 52);
    const centerX = width * 0.5 + pointer.x * minimum * 0.028;
    const centerY = height * 0.5 + pointer.y * minimum * 0.022;
    const radiusX = Math.max(20, (width - pad * 2) * 0.38);
    const radiusY = Math.max(20, (height - pad * 2) * 0.3);
    const verticalBudget = Math.max(1, height * 0.5 - pad - radiusY);
    const maximumTilt = clamp((verticalBudget / radiusX) * 0.78, 0.035, 0.24);

    drawGrid(context, width, height, palette, clamp(minimum * 0.1, 22, 46), 0.14);

    // Interlocking orbits resolve into one shared point as the section scrolls.
    for (let orbit = 0; orbit < 6; orbit += 1) {
      const amount = orbit / 5;
      const angle =
        Math.sin(
          phase * 4 * (orbit % 2 ? -1 : 1) +
            amount * Math.PI * 1.2 +
            progress * 0.8
        ) * maximumTilt;

      context.save();
      context.translate(centerX, centerY);
      context.rotate(angle);
      context.strokeStyle = orbit === 2 || orbit === 3 ? palette.accent : palette.line;
      context.lineWidth = orbit === 2 || orbit === 3 ? 1.5 : 1;
      context.globalAlpha = orbit === 2 || orbit === 3 ? 0.72 : 0.5;
      context.beginPath();
      context.ellipse(
        0,
        0,
        radiusX * (0.46 + amount * 0.48),
        radiusY * (0.48 + (1 - amount) * 0.46),
        0,
        0,
        Math.PI * 2
      );
      context.stroke();
      context.restore();
    }

    const coreRadius = clamp(minimum * 0.07, 18, 40);
    drawDot(context, centerX, centerY, coreRadius * 1.35, palette.surface, 0.96);

    context.save();
    context.strokeStyle = palette.accent;
    context.lineWidth = 1.4;
    context.beginPath();
    context.arc(centerX, centerY, coreRadius * 1.34, 0, Math.PI * 2);
    context.stroke();
    context.restore();

    // Abstract play / continue mark.
    context.save();
    context.fillStyle = palette.accent;
    context.globalAlpha = 0.98;
    context.beginPath();
    context.moveTo(centerX - coreRadius * 0.24, centerY - coreRadius * 0.38);
    context.lineTo(centerX + coreRadius * 0.46, centerY);
    context.lineTo(centerX - coreRadius * 0.24, centerY + coreRadius * 0.38);
    context.closePath();
    context.fill();
    context.restore();

    const runnerAngle = phase * 5 + progress * Math.PI * 1.4;
    const runnerX = centerX + Math.cos(runnerAngle) * radiusX * 0.7;
    const runnerY = centerY + Math.sin(runnerAngle) * radiusY * 0.7;
    drawDot(context, runnerX, runnerY, clamp(minimum * 0.014, 3, 7), palette.accent, 1);
    drawDot(context, runnerX, runnerY, clamp(minimum * 0.032, 8, 15), palette.accent, 0.12);
  }

  const renderers = {
    hero: drawHero,
    engine: drawEngine,
    privacy: drawPrivacy,
    closing: drawClosing,
  };

  function resizeCanvas(state) {
    const bounds = state.canvas.getBoundingClientRect();
    const width = Math.max(1, bounds.width);
    const height = Math.max(1, bounds.height);
    const maximumPixels = 5_500_000;
    const budgetRatio = Math.sqrt(maximumPixels / Math.max(1, width * height));
    const ratio = Math.min(
      2.5,
      Math.max(1, window.devicePixelRatio || 1),
      Math.max(0.72, budgetRatio)
    );
    const pixelWidth = Math.max(1, Math.round(width * ratio));
    const pixelHeight = Math.max(1, Math.round(height * ratio));

    if (state.canvas.width !== pixelWidth || state.canvas.height !== pixelHeight) {
      state.canvas.width = pixelWidth;
      state.canvas.height = pixelHeight;
    }

    state.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    state.context.imageSmoothingEnabled = true;
    state.width = width;
    state.height = height;
    state.ratio = ratio;
    state.needsResize = false;
    state.dirty = true;
  }

  canvases.forEach((canvas) => {
    const context = canvas.getContext("2d", { alpha: true });
    const renderer = renderers[canvas.dataset.art];
    if (!context || !renderer) return;

    const pointerZone = canvas.closest("[data-pointer-zone]");
    const scene = canvas.closest("[data-scroll-scene]");
    const state = {
      canvas,
      context,
      renderer,
      pointerZone,
      scene,
      width: 1,
      height: 1,
      ratio: 1,
      visible: !("IntersectionObserver" in window),
      dirty: true,
      needsResize: true,
      palette: null,
      paletteRevision: -1,
    };

    if (!canvas.hasAttribute("aria-label") && !canvas.hasAttribute("aria-hidden")) {
      canvas.setAttribute("aria-hidden", "true");
    }

    canvasStates.set(canvas, state);
  });

  let animationFrame = 0;
  let scrollDirty = true;

  function scheduleFrame() {
    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(renderFrame);
    }
  }

  function markCanvasesDirty(scope = null) {
    canvasStates.forEach((state) => {
      if (!scope || scope.contains(state.canvas) || state.canvas === scope) {
        state.dirty = true;
      }
    });
    scheduleFrame();
  }

  function updateScrollScenes() {
    scrollDirty = false;
    const viewportHeight = Math.max(
      1,
      window.visualViewport?.height || window.innerHeight
    );
    const readings = scrollScenes.map((scene) => {
      const bounds = scene.getBoundingClientRect();
      const travel = Math.max(1, viewportHeight + bounds.height);
      const progress = reducedMotion.matches
        ? 0.5
        : clamp((viewportHeight - bounds.top) / travel);

      return { scene, progress };
    });

    readings.forEach(({ scene, progress }) => {
      sceneProgress.set(scene, progress);
      scene.style.setProperty("--scroll-progress", progress.toFixed(4));
      scene.style.setProperty("--scene-progress", progress.toFixed(4));
      scene.style.setProperty(
        "--scroll-progress-centered",
        (progress * 2 - 1).toFixed(4)
      );
      scene.style.setProperty(
        "--scene-progress-centered",
        (progress * 2 - 1).toFixed(4)
      );
    });

    canvasStates.forEach((state) => {
      if (state.scene) state.dirty = true;
    });
  }

  function updatePointers() {
    let pointersMoving = false;

    pointerStates.forEach((state, zone) => {
      const targetX = reducedMotion.matches ? 0 : state.targetX;
      const targetY = reducedMotion.matches ? 0 : state.targetY;
      const smoothing = reducedMotion.matches ? 1 : 0.14;
      const nextX = lerp(state.x, targetX, smoothing);
      const nextY = lerp(state.y, targetY, smoothing);
      const changed = Math.abs(nextX - state.x) + Math.abs(nextY - state.y) > 0.0004;

      state.x = Math.abs(nextX) < 0.0002 ? 0 : nextX;
      state.y = Math.abs(nextY) < 0.0002 ? 0 : nextY;
      pointersMoving ||= changed;

      if (!state.rendered || changed || state.renderedActive !== state.active) {
        zone.style.setProperty("--pointer-x", state.x.toFixed(4));
        zone.style.setProperty("--pointer-y", state.y.toFixed(4));
        zone.style.setProperty(
          "--pointer-position-x",
          `${((state.x + 1) * 50).toFixed(2)}%`
        );
        zone.style.setProperty(
          "--pointer-position-y",
          `${((state.y + 1) * 50).toFixed(2)}%`
        );
        zone.style.setProperty(
          "--pointer-distance",
          clamp(Math.hypot(state.x, state.y)).toFixed(4)
        );
        zone.style.setProperty("--pointer-active", state.active ? "1" : "0");
        state.rendered = true;
        state.renderedActive = state.active;
      }

      if (changed) markCanvasesDirty(zone);
    });

    return pointersMoving;
  }

  function renderFrame(time) {
    animationFrame = 0;

    if (scrollDirty) updateScrollScenes();
    const pointersMoving = updatePointers();
    let hasVisibleCanvas = false;

    canvasStates.forEach((state) => {
      if (!state.visible) return;
      if (state.needsResize) resizeCanvas(state);
      const shouldAnimate =
        !reducedMotion.matches && !document.hidden;
      const shouldDraw = state.dirty || shouldAnimate;

      hasVisibleCanvas = true;
      if (!shouldDraw || state.width <= 1 || state.height <= 1) return;

      state.context.clearRect(0, 0, state.width, state.height);
      state.context.lineCap = "round";
      state.context.lineJoin = "round";
      state.renderer(state, time);
      state.dirty = false;
    });

    if (
      pointersMoving ||
      (!reducedMotion.matches && !document.hidden && hasVisibleCanvas)
    ) {
      scheduleFrame();
    }
  }

  pointerZones.forEach((zone) => {
    const state = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false,
      renderedActive: null,
      rendered: false,
    };
    pointerStates.set(zone, state);
    zone.style.setProperty("--pointer-x", "0");
    zone.style.setProperty("--pointer-y", "0");
    zone.style.setProperty("--pointer-position-x", "50%");
    zone.style.setProperty("--pointer-position-y", "50%");
    zone.style.setProperty("--pointer-distance", "0");
    zone.style.setProperty("--pointer-active", "0");

    const updatePointer = (event) => {
      if (event.pointerType === "touch" || reducedMotion.matches) return;
      const bounds = zone.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      state.targetX = clamp((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      state.targetY = clamp((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      state.active = true;
      scheduleFrame();
    };

    zone.addEventListener("pointerenter", updatePointer, { passive: true });
    zone.addEventListener("pointermove", updatePointer, { passive: true });
    zone.addEventListener(
      "pointerleave",
      () => {
        state.targetX = 0;
        state.targetY = 0;
        state.active = false;
        scheduleFrame();
      },
      { passive: true }
    );
  });

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const state = canvasStates.get(entry.target);
        if (state) state.needsResize = true;
      });
      scheduleFrame();
    });

    canvasStates.forEach((state) => resizeObserver.observe(state.canvas));
  } else {
    window.addEventListener(
      "resize",
      () => {
        canvasStates.forEach((state) => {
          state.needsResize = true;
        });
        scrollDirty = true;
        scheduleFrame();
      },
      { passive: true }
    );
  }

  if ("IntersectionObserver" in window) {
    const canvasObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const state = canvasStates.get(entry.target);
          if (!state) return;
          state.visible = entry.isIntersecting;
          state.dirty = entry.isIntersecting;
          entry.target.classList.toggle("is-in-view", entry.isIntersecting);
          entry.target
            .closest("[data-player], [data-engine], [data-scroll-scene]")
            ?.classList.toggle("is-in-view", entry.isIntersecting);
        });
        scheduleFrame();
      },
      { rootMargin: "12% 0px", threshold: 0.01 }
    );

    canvasStates.forEach((state) => canvasObserver.observe(state.canvas));
  }

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          const repeats =
            entry.target.dataset.reveal === "repeat" ||
            entry.target.dataset.revealOnce === "false";

          if (repeats) {
            entry.target.classList.toggle("is-revealed", entry.isIntersecting);
          } else if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -7%", threshold: 0.08 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
  }

  function createLiveRegion(container, name) {
    const existing = container.querySelector(`[data-${name}-live]`);
    if (existing) return existing;

    const live = document.createElement("span");
    live.dataset[`${name}Live`] = "";
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    live.style.cssText =
      "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0";
    container.append(live);
    return live;
  }

  const playerDefaults = {
    transcribe: {
      kicker: "Live transcription",
      status: "Listening and shaping every word",
      description:
        "Together turns speech into a clean, searchable transcript while the recording plays.",
    },
    translate: {
      kicker: "Live translation",
      status: "Meaning, carried across languages",
      description:
        "Read a natural translation beside the original without losing your place in the conversation.",
    },
    export: {
      kicker: "Flexible export",
      status: "Ready for the way you work",
      description:
        "Move the transcript, translation, or captions into a format that is easy to keep and share.",
    },
  };

  function setupPlayer(player) {
    const supportedModes = ["transcribe", "translate", "export"];
    const buttons = [...player.querySelectorAll("[data-player-mode]")].filter(
      (button) => supportedModes.includes(button.dataset.playerMode)
    );
    if (!buttons.length) return;
    const modes = supportedModes.filter((mode) =>
      buttons.some((button) => button.dataset.playerMode === mode)
    );

    const findOutput = (attribute) =>
      [...player.querySelectorAll(`[${attribute}]`)].find(
        (element) => !element.matches("[data-player-mode]")
      );
    const kicker = findOutput("data-player-kicker");
    const status = findOutput("data-player-status");
    const description = findOutput("data-player-description");
    const live = createLiveRegion(player, "player");
    let activeMode =
      player.dataset.activeMode ||
      player.dataset.mode ||
      buttons.find((button) => button.getAttribute("aria-pressed") === "true")
        ?.dataset.playerMode ||
      buttons[0].dataset.playerMode;
    let timer = 0;
    let visible = !("IntersectionObserver" in window);
    let pointerPaused = false;
    let focusPaused = false;
    const autoplayEnabled = player.dataset.playerAutoplay === "true";

    const canAdvance = () =>
      autoplayEnabled &&
      visible &&
      !pointerPaused &&
      !focusPaused &&
      !reducedMotion.matches &&
      !document.hidden;

    const clearTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = 0;
    };

    const scheduleNext = () => {
      clearTimer();
      if (!canAdvance()) return;
      timer = window.setTimeout(() => {
        const index = modes.indexOf(activeMode);
        activate(modes[(index + 1) % modes.length], false);
        scheduleNext();
      }, 5600);
    };

    const activate = (mode, announce = false) => {
      if (!modes.includes(mode)) return;
      const button = buttons.find((item) => item.dataset.playerMode === mode);
      if (!button) return;

      activeMode = mode;
      player.dataset.mode = mode;
      player.dataset.activeMode = mode;

      buttons.forEach((item) => {
        const selected = item.dataset.playerMode === mode;
        item.setAttribute("aria-pressed", String(selected));
        if (item.getAttribute("role") === "tab") {
          item.setAttribute("aria-selected", String(selected));
          item.tabIndex = selected ? 0 : -1;
        }
        if (!item.hasAttribute("type") && item.tagName === "BUTTON") {
          item.setAttribute("type", "button");
        }
      });

      const fallback = playerDefaults[mode];
      const copy = {
        kicker:
          button.dataset.kicker || button.dataset.playerKicker || fallback.kicker,
        status:
          button.dataset.status || button.dataset.playerStatus || fallback.status,
        description:
          button.dataset.description ||
          button.dataset.playerDescription ||
          fallback.description,
      };

      if (kicker) kicker.textContent = copy.kicker;
      if (status) status.textContent = copy.status;
      if (description) description.textContent = copy.description;
      if (announce) {
        live.textContent = `${button.textContent.trim()}. ${copy.status}.`;
      }

      markCanvasesDirty(player);
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        activate(button.dataset.playerMode, true);
        scheduleNext();
      });

      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
          return;
        }

        event.preventDefault();
        const current = buttons.indexOf(button);
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? buttons.length - 1
              : (current + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) %
                buttons.length;
        buttons[next].focus();
        activate(buttons[next].dataset.playerMode, true);
        scheduleNext();
      });
    });

    player.addEventListener(
      "pointerenter",
      () => {
        pointerPaused = true;
        clearTimer();
      },
      { passive: true }
    );
    player.addEventListener(
      "pointerleave",
      () => {
        pointerPaused = false;
        scheduleNext();
      },
      { passive: true }
    );
    player.addEventListener("focusin", () => {
      focusPaused = true;
      clearTimer();
    });
    player.addEventListener("focusout", (event) => {
      if (player.contains(event.relatedTarget)) return;
      focusPaused = false;
      scheduleNext();
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
          scheduleNext();
        },
        { threshold: [0, 0.2, 0.7] }
      );
      observer.observe(player);
    }

    document.addEventListener("visibilitychange", scheduleNext);
    listenToMedia(reducedMotion, scheduleNext);
    activate(modes.includes(activeMode) ? activeMode : modes[0], false);
    scheduleNext();
  }

  function setupEngine(engine) {
    const supportedSteps = ["open", "listen", "translate", "export"];
    const buttons = [...engine.querySelectorAll("[data-engine-step]")].filter(
      (button) => supportedSteps.includes(button.dataset.engineStep)
    );
    if (!buttons.length) return;
    const steps = supportedSteps.filter((step) =>
      buttons.some((button) => button.dataset.engineStep === step)
    );

    const stage =
      engine.querySelector("[data-engine-stage], .engine-stage, .engine__stage") ||
      engine;
    const live = createLiveRegion(engine, "engine");
    const initial =
      stage.dataset.activeStep ||
      engine.dataset.activeStep ||
      buttons.find((button) => button.getAttribute("aria-pressed") === "true")
        ?.dataset.engineStep ||
      buttons[0].dataset.engineStep;

    const activate = (step, announce = false) => {
      if (!steps.includes(step)) return;
      stage.dataset.activeStep = step;
      engine.dataset.activeStep = step;
      engine.style.setProperty("--engine-step", String(steps.indexOf(step)));

      buttons.forEach((button) => {
        const selected = button.dataset.engineStep === step;
        button.setAttribute("aria-pressed", String(selected));
        if (button.getAttribute("role") === "tab") {
          button.setAttribute("aria-selected", String(selected));
          button.tabIndex = selected ? 0 : -1;
        }
        if (!button.hasAttribute("type") && button.tagName === "BUTTON") {
          button.setAttribute("type", "button");
        }
      });

      if (announce) {
        const button = buttons.find((item) => item.dataset.engineStep === step);
        live.textContent = `${button?.textContent.trim() || step} step selected.`;
      }

      markCanvasesDirty(engine);
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => activate(button.dataset.engineStep, true));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
          return;
        }

        event.preventDefault();
        const current = buttons.indexOf(button);
        const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? buttons.length - 1
              : (current + (forward ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next].focus();
        activate(buttons[next].dataset.engineStep, true);
      });
    });

    activate(steps.includes(initial) ? initial : steps[0], false);
  }

  document.querySelectorAll("[data-player]").forEach(setupPlayer);
  document.querySelectorAll("[data-engine]").forEach(setupEngine);

  window.addEventListener(
    "scroll",
    () => {
      scrollDirty = true;
      scheduleFrame();
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      scrollDirty = true;
      canvasStates.forEach((state) => {
        state.needsResize = true;
      });
      scheduleFrame();
    },
    { passive: true }
  );

  window.visualViewport?.addEventListener(
    "resize",
    () => {
      scrollDirty = true;
      scheduleFrame();
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      scrollDirty = true;
      markCanvasesDirty();
    }
  });

  const refreshTheme = () => {
    paletteRevision += 1;
    markCanvasesDirty();
  };

  listenToMedia(darkScheme, refreshTheme);
  listenToMedia(reducedMotion, () => {
    root.classList.toggle("motion-reduced", reducedMotion.matches);
    if (reducedMotion.matches) {
      revealItems.forEach((item) => item.classList.add("is-revealed"));
      pointerStates.forEach((state) => {
        state.targetX = 0;
        state.targetY = 0;
        state.active = false;
      });
    }
    scrollDirty = true;
    markCanvasesDirty();
  });

  const themeObserver = new MutationObserver(refreshTheme);
  themeObserver.observe(root, {
    attributes: true,
    attributeFilter: ["class", "style", "data-theme", "data-color-scheme"],
  });

  document.fonts?.ready.then(() => markCanvasesDirty());
  window.addEventListener("load", () => {
    scrollDirty = true;
    markCanvasesDirty();
  }, { once: true });

  scheduleFrame();
})();
