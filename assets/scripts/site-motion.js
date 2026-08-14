(() => {
  "use strict";

  const motionSheet = Array.from(document.styleSheets).find((styleSheet) =>
    styleSheet.href?.includes("/assets/styles/markdown.css"),
  );
  const motionRule = motionSheet
    ? Array.from(motionSheet.cssRules).find(
        (rule) => rule instanceof CSSStyleRule && rule.selectorText === ":root",
      )
    : null;

  if (!motionRule) {
    return;
  }

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const travel = { x: 12, y: 8 };
  const current = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let animationFrame = 0;
  let previousTime = 0;

  const writePosition = () => {
    motionRule.style.setProperty("--grid-shift-x", `${current.x.toFixed(2)}px`);
    motionRule.style.setProperty("--grid-shift-y", `${current.y.toFixed(2)}px`);
  };

  const animate = (time) => {
    const frameDuration = previousTime
      ? Math.min(time - previousTime, 50)
      : 16.67;
    const easing = 1 - Math.pow(0.96, frameDuration / 16.67);
    previousTime = time;

    current.x += (target.x - current.x) * easing;
    current.y += (target.y - current.y) * easing;

    if (
      Math.abs(target.x - current.x) < 0.02 &&
      Math.abs(target.y - current.y) < 0.02
    ) {
      current.x = target.x;
      current.y = target.y;
      writePosition();
      animationFrame = 0;
      previousTime = 0;
      return;
    }

    writePosition();
    animationFrame = window.requestAnimationFrame(animate);
  };

  const requestAnimation = () => {
    if (!animationFrame) {
      previousTime = 0;
      animationFrame = window.requestAnimationFrame(animate);
    }
  };

  const reset = () => {
    target.x = 0;
    target.y = 0;
    requestAnimation();
  };

  const handlePointer = (event) => {
    if (!finePointer.matches || reducedMotion.matches) {
      return;
    }

    target.x = (event.clientX / window.innerWidth - 0.5) * travel.x * 2;
    target.y = (event.clientY / window.innerHeight - 0.5) * travel.y * 2;
    requestAnimation();
  };

  const syncPreferences = () => {
    if (!finePointer.matches || reducedMotion.matches) {
      target.x = 0;
      target.y = 0;
      current.x = 0;
      current.y = 0;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      previousTime = 0;
      writePosition();
    }
  };

  window.addEventListener("pointermove", handlePointer, { passive: true });
  window.addEventListener("blur", reset);
  document.documentElement.addEventListener("pointerleave", reset);
  finePointer.addEventListener("change", syncPreferences);
  reducedMotion.addEventListener("change", syncPreferences);
})();
