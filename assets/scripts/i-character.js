(() => {
  const scene = document.querySelector("[data-i-scene]");
  const character = document.querySelector("[data-character]");
  const sourceImage = document.querySelector("[data-character-source]");
  const canvas = document.querySelector("[data-character-canvas]");

  if (
    !scene ||
    !character ||
    !(sourceImage instanceof HTMLImageElement) ||
    !(canvas instanceof HTMLCanvasElement)
  ) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cutout = document.createElement("canvas");
  const cutoutContext = cutout.getContext("2d", { willReadFrequently: true });

  if (!cutoutContext) return;

  let width = 1;
  let height = 1;
  let frame = 0;
  let frameCount = 0;
  let prepared = false;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;

  function clamp(value, minimum = 0, maximum = 1) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function smoothstep(start, end, value) {
    const progress = clamp((value - start) / (end - start));
    return progress * progress * (3 - 2 * progress);
  }

  function ellipseMask(x, y, centerX, centerY, radiusX, radiusY, feather = 0.18) {
    const offsetX = (x - centerX) / radiusX;
    const offsetY = (y - centerY) / radiusY;
    const distanceSquared = offsetX * offsetX + offsetY * offsetY;

    if (distanceSquared <= 1) return 1;

    const outside = 1 + feather;
    if (distanceSquared >= outside * outside) return 0;

    return 1 - (Math.sqrt(distanceSquared) - 1) / feather;
  }

  function characterMask(x, y) {
    return Math.max(
      ellipseMask(x, y, 0.535, 0.36, 0.145, 0.185, 0.2),
      ellipseMask(x, y, 0.455, 0.41, 0.16, 0.14, 0.22),
      ellipseMask(x, y, 0.53, 0.59, 0.13, 0.255, 0.2),
      ellipseMask(x, y, 0.485, 0.77, 0.205, 0.255, 0.2),
      ellipseMask(x, y, 0.575, 0.7, 0.075, 0.21, 0.22)
    );
  }

  function prepareCutout() {
    if (prepared || !sourceImage.naturalWidth || !sourceImage.naturalHeight) return;

    cutout.width = sourceImage.naturalWidth;
    cutout.height = sourceImage.naturalHeight;
    cutoutContext.clearRect(0, 0, cutout.width, cutout.height);
    cutoutContext.drawImage(sourceImage, 0, 0);

    const imageData = cutoutContext.getImageData(0, 0, cutout.width, cutout.height);
    const pixels = imageData.data;

    for (let y = 0; y < cutout.height; y += 1) {
      const normalizedY = y / cutout.height;

      for (let x = 0; x < cutout.width; x += 1) {
        const index = (y * cutout.width + x) * 4;
        const normalizedX = x / cutout.width;
        const spatialMask = characterMask(normalizedX, normalizedY);

        if (spatialMask <= 0.001) {
          pixels[index + 3] = 0;
          continue;
        }

        const luminance =
          pixels[index] * 0.2126 +
          pixels[index + 1] * 0.7152 +
          pixels[index + 2] * 0.0722;
        const detail = smoothstep(42, 142, luminance);
        const alpha = Math.pow(spatialMask, 1.15) * detail;
        const monochrome = clamp((luminance - 24) * 1.62, 0, 255);

        pixels[index] = monochrome;
        pixels[index + 1] = monochrome;
        pixels[index + 2] = monochrome;
        pixels[index + 3] = Math.round(alpha * 255);
      }
    }

    cutoutContext.putImageData(imageData, 0, 0);
    prepared = true;
    resize();
    draw(performance.now());
    character.classList.add("is-ready");
    start();
  }

  function resize() {
    const bounds = scene.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    if (prepared) draw(performance.now());
  }

  function pseudoRandom(value) {
    const number = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
    return number - Math.floor(number);
  }

  function draw(time) {
    if (!prepared) return;

    context.clearRect(0, 0, width, height);

    const sourceWidth = cutout.width;
    const sourceHeight = cutout.height;
    const coverScale = Math.max(width / sourceWidth, height / sourceHeight);
    const breath = reducedMotion.matches ? 0 : Math.sin(time * 0.00047) * 0.006;
    const scale = coverScale * (1.055 + breath);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    const sway = reducedMotion.matches ? 0 : Math.sin(time * 0.00036) * 4.5;
    const float = reducedMotion.matches ? 0 : Math.sin(time * 0.00043 + 0.8) * 5.2;
    const drawX = (width - drawWidth) * 0.5 + sway + pointerX * 0.18;
    const drawY = (height - drawHeight) * 0.5 + float + pointerY * 0.16;
    const flickerPhase = reducedMotion.matches ? 1 : (time * 0.001) % 9.4;
    const flicker = flickerPhase < 0.075 ? 0.7 + flickerPhase * 4 : 1;
    const glitchPhase = reducedMotion.matches ? 1 : (time * 0.001) % 12.8;
    const glitch = glitchPhase < 0.11 ? 1 - glitchPhase / 0.11 : 0;

    context.save();
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 0.055;
    context.filter = "blur(7px)";
    context.drawImage(
      cutout,
      drawX + Math.sin(time * 0.0007) * 4,
      drawY + 2,
      drawWidth,
      drawHeight
    );
    context.restore();

    const sourceSliceHeight = 10;

    context.save();
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 0.96 * flicker;

    for (let sourceY = 0; sourceY < sourceHeight; sourceY += sourceSliceHeight) {
      const sliceHeight = Math.min(sourceSliceHeight, sourceHeight - sourceY);
      const normalizedY = (sourceY + sliceHeight * 0.5) / sourceHeight;
      const hairWeight = Math.exp(-Math.pow((normalizedY - 0.38) / 0.16, 2));
      const dressWeight = Math.exp(-Math.pow((normalizedY - 0.78) / 0.22, 2));
      const armWeight = Math.exp(-Math.pow((normalizedY - 0.66) / 0.13, 2));
      const hairMotion = reducedMotion.matches
        ? 0
        : Math.sin(time * 0.00105 + normalizedY * 15) * 2.1 * hairWeight;
      const dressMotion = reducedMotion.matches
        ? 0
        : Math.sin(time * 0.00073 + normalizedY * 10 + 1.4) * 1.65 * dressWeight;
      const armMotion = reducedMotion.matches
        ? 0
        : Math.sin(time * 0.00058 + normalizedY * 9) * 0.65 * armWeight;
      const glitchMotion =
        (pseudoRandom(sourceY * 0.73) - 0.5) * 15 * glitch;
      const targetY = drawY + sourceY * scale;

      context.drawImage(
        cutout,
        0,
        sourceY,
        sourceWidth,
        sliceHeight,
        drawX + hairMotion + dressMotion + armMotion + glitchMotion,
        targetY,
        drawWidth,
        sliceHeight * scale + 1
      );
    }

    context.restore();
  }

  function animate(time) {
    pointerX += (targetX - pointerX) * 0.035;
    pointerY += (targetY - pointerY) * 0.035;
    draw(time);
    frameCount += 1;
    canvas.dataset.frame = String(frameCount);
    frame = reducedMotion.matches ? 0 : requestAnimationFrame(animate);
  }

  function start() {
    if (!prepared || frame || document.hidden) return;
    if (reducedMotion.matches) {
      canvas.dataset.motion = "static";
      return;
    }
    canvas.dataset.motion = "running";
    frame = requestAnimationFrame(animate);
  }

  function stop() {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
    canvas.dataset.motion = "stopped";
  }

  function handleMotionChange() {
    stop();
    targetX = 0;
    targetY = 0;
    pointerX = 0;
    pointerY = 0;
    draw(performance.now());
    start();
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

  if (sourceImage.complete && sourceImage.naturalWidth) {
    prepareCutout();
  } else {
    sourceImage.addEventListener("load", prepareCutout, { once: true });
  }
})();
