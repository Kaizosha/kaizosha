(() => {
  "use strict";

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointerTravel = { x: 12, y: 8 };
  const current = { x: 0, y: 0 };
  const pointer = { x: 0, y: 0 };
  let animationFrame = null;
  let previousTime = 0;

  const writePosition = () => {
    document.documentElement.style.setProperty(
      "--grid-shift-x",
      `${current.x.toFixed(2)}px`,
    );
    document.documentElement.style.setProperty(
      "--grid-shift-y",
      `${current.y.toFixed(2)}px`,
    );
  };

  const getDrift = (time) => {
    const seconds = time / 1000;

    return {
      x:
        Math.sin(seconds * 0.09) * 8 +
        Math.cos(seconds * 0.043) * 3,
      y:
        Math.cos(seconds * 0.075) * 5 +
        Math.sin(seconds * 0.052) * 2,
    };
  };

  const shouldAnimate = () =>
    !reducedMotion.matches && !document.hidden;

  const stopAnimation = () => {
    if (animationFrame !== null) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    previousTime = 0;
  };

  const animate = (time) => {
    if (!shouldAnimate()) {
      stopAnimation();
      return;
    }

    const frameDuration = previousTime ? Math.min(time - previousTime, 50) : 16.67;
    const easing = 1 - Math.pow(0.93, frameDuration / 16.67);
    const drift = getDrift(time);
    previousTime = time;

    current.x += (drift.x + pointer.x - current.x) * easing;
    current.y += (drift.y + pointer.y - current.y) * easing;

    writePosition();
    animationFrame = window.requestAnimationFrame(animate);
  };

  const requestAnimation = () => {
    if (animationFrame === null && shouldAnimate()) {
      previousTime = 0;
      animationFrame = window.requestAnimationFrame(animate);
    }
  };

  const resetPointer = () => {
    pointer.x = 0;
    pointer.y = 0;
  };

  const handlePointer = (event) => {
    if (!finePointer.matches || reducedMotion.matches) {
      return;
    }

    pointer.x =
      (event.clientX / window.innerWidth - 0.5) * pointerTravel.x * 2;
    pointer.y =
      (event.clientY / window.innerHeight - 0.5) * pointerTravel.y * 2;
    requestAnimation();
  };

  const syncPreferences = () => {
    if (reducedMotion.matches) {
      resetPointer();
      current.x = 0;
      current.y = 0;
      stopAnimation();
      writePosition();
      return;
    }

    if (!finePointer.matches) {
      resetPointer();
    }

    requestAnimation();
  };

  window.addEventListener("pointermove", handlePointer, { passive: true });
  window.addEventListener("blur", resetPointer);
  document.documentElement.addEventListener("pointerleave", resetPointer);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      requestAnimation();
    }
  });
  finePointer.addEventListener("change", syncPreferences);
  reducedMotion.addEventListener("change", syncPreferences);

  syncPreferences();
})();
