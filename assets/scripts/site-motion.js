(() => {
  "use strict";

  const motionSheet = Array.from(document.styleSheets).find((styleSheet) =>
    styleSheet.href?.includes("/assets/styles/markdown.css"),
  );
  const motionRule = (() => {
    if (!motionSheet) {
      return null;
    }

    try {
      return Array.from(motionSheet.cssRules).find(
        (rule) => rule.type === CSSRule.STYLE_RULE && rule.selectorText === ":root",
      );
    } catch {
      return null;
    }
  })();

  if (!motionRule) {
    return;
  }

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointerTravel = { x: 32, y: 24 };
  const current = { x: 0, y: 0 };
  const pointer = { x: 0, y: 0 };
  let animationFrame = null;
  let previousTime = 0;

  const writePosition = () => {
    motionRule.style.setProperty(
      "--grid-shift-x",
      `${current.x.toFixed(2)}px`,
    );
    motionRule.style.setProperty(
      "--grid-shift-y",
      `${current.y.toFixed(2)}px`,
    );
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
    const easing = 1 - Math.pow(0.88, frameDuration / 16.67);
    previousTime = time;

    current.x += (pointer.x - current.x) * easing;
    current.y += (pointer.y - current.y) * easing;

    if (
      Math.abs(pointer.x - current.x) < 0.02 &&
      Math.abs(pointer.y - current.y) < 0.02
    ) {
      current.x = pointer.x;
      current.y = pointer.y;
      writePosition();
      animationFrame = null;
      previousTime = 0;
      return;
    }

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
    requestAnimation();
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
      pointer.x = 0;
      pointer.y = 0;
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
