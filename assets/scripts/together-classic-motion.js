(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionItems = [...document.querySelectorAll("[data-motion]")];
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  const scrollScenes = [...document.querySelectorAll("[data-scroll-scene]")];
  const pointerFields = [...document.querySelectorAll("[data-pointer-field]")];
  const player = document.querySelector("[data-player-demo]");

  root.classList.add("motion-ready");
  root.classList.toggle("motion-reduced", reducedMotion.matches);

  function listenForMotionPreference(listener) {
    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", listener);
    } else if (typeof reducedMotion.addListener === "function") {
      reducedMotion.addListener(listener);
    }
  }

  function clamp(value, minimum = 0, maximum = 1) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  // Keep looping set pieces active only while they can be seen.
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const motionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-in-view", entry.isIntersecting);
        });
      },
      { rootMargin: "8% 0px 8%", threshold: 0.08 }
    );

    motionItems.forEach((item) => motionObserver.observe(item));
  } else {
    motionItems.forEach((item) => item.classList.add("is-in-view"));
  }

  // Reveals run once by default. data-reveal="repeat" opts into replaying them.
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          const repeats =
            entry.target.dataset.reveal === "repeat" ||
            entry.target.dataset.revealOnce === "false";

          if (repeats) {
            entry.target.classList.toggle("is-revealed", entry.isIntersecting);
            return;
          }

          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.1 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
  }

  // The workflow chapters drive one shared signal diagram on larger screens.
  const workflowSystem = document.querySelector(".workflow-system");
  const workflowSteps = workflowSystem
    ? [...workflowSystem.querySelectorAll(".workflow-list > li")]
    : [];

  function activateWorkflowStep(step) {
    if (!workflowSystem || !workflowSteps.length) return;

    const activeStep = clamp(step, 1, workflowSteps.length);
    workflowSystem.dataset.activeStep = String(activeStep);
    workflowSteps.forEach((item, index) => {
      item.classList.toggle("is-active", index === activeStep - 1);
    });
  }

  activateWorkflowStep(1);

  if (workflowSteps.length && "IntersectionObserver" in window) {
    const workflowObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) return;
        activateWorkflowStep(workflowSteps.indexOf(visibleEntry.target) + 1);
      },
      { rootMargin: "-34% 0px -42%", threshold: [0.05, 0.25, 0.6] }
    );

    workflowSteps.forEach((step) => workflowObserver.observe(step));
  }

  // Scroll scenes expose normalized progress without owning their presentation.
  // 0 = entering the viewport, 1 = leaving it; centered progress runs -1 to 1.
  let sceneFrame = 0;

  function renderScrollScenes() {
    sceneFrame = 0;

    if (!scrollScenes.length) return;

    if (reducedMotion.matches) {
      scrollScenes.forEach((scene) => {
        scene.style.setProperty("--scene-progress", "0.5");
        scene.style.setProperty("--scene-progress-centered", "0");
        scene.style.setProperty("--scroll-progress", "0.5");
      });
      return;
    }

    const viewportHeight = Math.max(
      1,
      window.visualViewport?.height || window.innerHeight
    );

    // Read every rectangle first, then write styles so a frame never alternates
    // between layout reads and writes.
    const sceneValues = scrollScenes.map((scene) => {
      const bounds = scene.getBoundingClientRect();
      const travel = viewportHeight + Math.max(1, bounds.height);
      const progress = clamp((viewportHeight - bounds.top) / travel);

      return {
        scene,
        progress: progress.toFixed(4),
        centered: (progress * 2 - 1).toFixed(4),
      };
    });

    sceneValues.forEach(({ scene, progress, centered }) => {
      scene.style.setProperty("--scene-progress", progress);
      scene.style.setProperty("--scene-progress-centered", centered);
      scene.style.setProperty("--scroll-progress", progress);
    });
  }

  function scheduleScrollScenes() {
    if (!sceneFrame && scrollScenes.length) {
      sceneFrame = window.requestAnimationFrame(renderScrollScenes);
    }
  }

  // Pointer fields provide normalized local coordinates for CSS parallax.
  // Reads and writes are likewise split into a single animation frame.
  const pointerState = new WeakMap();
  let pointerFrame = 0;
  let activePointerFields = 0;

  function renderPointerFields() {
    pointerFrame = 0;
    const readings = [];

    pointerFields.forEach((field) => {
      const state = pointerState.get(field);
      if (!state?.active || reducedMotion.matches) return;

      const bounds = field.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const xPercent = clamp((state.clientX - bounds.left) / bounds.width);
      const yPercent = clamp((state.clientY - bounds.top) / bounds.height);
      const x = xPercent * 2 - 1;
      const y = yPercent * 2 - 1;

      readings.push({
        field,
        x: x.toFixed(4),
        y: y.toFixed(4),
        xPercent: `${(xPercent * 100).toFixed(2)}%`,
        yPercent: `${(yPercent * 100).toFixed(2)}%`,
        distance: clamp(Math.hypot(x, y), 0, 1).toFixed(4),
      });
    });

    readings.forEach(
      ({ field, x, y, xPercent, yPercent, distance }) => {
        field.style.setProperty("--pointer-x", x);
        field.style.setProperty("--pointer-y", y);
        field.style.setProperty("--pointer-position-x", xPercent);
        field.style.setProperty("--pointer-position-y", yPercent);
        field.style.setProperty("--pointer-distance", distance);
        field.style.setProperty("--pointer-active", "1");
      }
    );
  }

  function schedulePointerFields() {
    if (!pointerFrame && activePointerFields > 0) {
      pointerFrame = window.requestAnimationFrame(renderPointerFields);
    }
  }

  function resetPointerField(field) {
    field.style.setProperty("--pointer-x", "0");
    field.style.setProperty("--pointer-y", "0");
    field.style.setProperty("--pointer-position-x", "50%");
    field.style.setProperty("--pointer-position-y", "50%");
    field.style.setProperty("--pointer-distance", "0");
    field.style.setProperty("--pointer-active", "0");
  }

  function resetAllPointerFields() {
    activePointerFields = 0;
    pointerFields.forEach((field) => {
      const state = pointerState.get(field);
      if (state) state.active = false;
      resetPointerField(field);
    });
  }

  pointerFields.forEach((field) => {
    resetPointerField(field);
    pointerState.set(field, {
      active: false,
      clientX: 0,
      clientY: 0,
    });

    const capturePointer = (event) => {
      if (event.pointerType === "touch" || reducedMotion.matches) return;

      const state = pointerState.get(field);
      if (!state.active) activePointerFields += 1;
      state.active = true;
      state.clientX = event.clientX;
      state.clientY = event.clientY;
      schedulePointerFields();
    };

    field.addEventListener("pointerenter", capturePointer, { passive: true });
    field.addEventListener("pointermove", capturePointer, { passive: true });
    field.addEventListener(
      "pointerleave",
      () => {
        const state = pointerState.get(field);
        if (state.active) activePointerFields = Math.max(0, activePointerFields - 1);
        state.active = false;
        resetPointerField(field);
      },
      { passive: true }
    );
  });

  function scheduleInteractiveFrames() {
    scheduleScrollScenes();
    schedulePointerFields();
  }

  window.addEventListener("scroll", scheduleInteractiveFrames, {
    passive: true,
  });
  window.addEventListener("resize", scheduleInteractiveFrames, {
    passive: true,
  });
  window.visualViewport?.addEventListener("resize", scheduleInteractiveFrames, {
    passive: true,
  });
  window.addEventListener("load", scheduleInteractiveFrames, { once: true });

  scheduleScrollScenes();

  if (!player) {
    listenForMotionPreference(() => {
      root.classList.toggle("motion-reduced", reducedMotion.matches);
      resetAllPointerFields();
      scheduleInteractiveFrames();
    });
    return;
  }

  const modes = ["transcribe", "translate", "export"];
  const buttons = [...player.querySelectorAll("[data-demo-button]")];
  const pauseButton = player.querySelector("[data-demo-toggle]");
  const pauseLabel = pauseButton?.querySelector("span");
  const kicker = player.querySelector("[data-demo-kicker]");
  const status = player.querySelector("[data-demo-status]");
  const description = player.querySelector("[data-demo-description-output]");
  const liveRegion = player.querySelector("[data-demo-live]");

  let activeIndex = Math.max(0, modes.indexOf(player.dataset.demoMode));
  let timer = null;
  let playerVisible = !("IntersectionObserver" in window);
  let userPaused = false;
  let pointerPaused = false;
  let focusPaused = false;

  function clearTimer() {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  }

  function canAutoAdvance() {
    return (
      playerVisible &&
      !reducedMotion.matches &&
      !document.hidden &&
      !userPaused &&
      !pointerPaused &&
      !focusPaused
    );
  }

  function scheduleNext() {
    clearTimer();
    if (!canAutoAdvance()) return;

    timer = window.setTimeout(() => {
      activeIndex = (activeIndex + 1) % modes.length;
      activateMode(modes[activeIndex], false);
      scheduleNext();
    }, 5200);
  }

  function activateMode(mode, announce) {
    const nextIndex = modes.indexOf(mode);
    if (nextIndex === -1) return;

    activeIndex = nextIndex;
    player.dataset.demoMode = mode;

    const activeButton = buttons.find(
      (button) => button.dataset.demoButton === mode
    );

    buttons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.demoButton === mode)
      );
    });

    if (activeButton) {
      if (kicker) kicker.textContent = activeButton.dataset.demoKicker || "";
      if (status) status.textContent = activeButton.dataset.demoStatus || "";
      if (description) {
        description.textContent = activeButton.dataset.demoDescription || "";
      }
      if (announce && liveRegion) {
        liveRegion.textContent = `${activeButton.textContent.trim()}. ${
          activeButton.dataset.demoDescription || ""
        }`;
      }
    }
  }

  function updatePauseControl(announce) {
    player.classList.toggle("is-paused", userPaused || reducedMotion.matches);

    if (!pauseButton || !pauseLabel) return;

    pauseButton.setAttribute("aria-pressed", String(userPaused));
    pauseButton.disabled = reducedMotion.matches;
    pauseLabel.textContent = reducedMotion.matches
      ? "Motion reduced"
      : userPaused
        ? "Resume motion"
        : "Pause motion";

    if (announce && liveRegion) {
      liveRegion.textContent = userPaused
        ? "Together animation paused."
        : "Together animation resumed.";
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activateMode(button.dataset.demoButton, true);
      scheduleNext();
    });
  });

  pauseButton?.addEventListener("click", () => {
    userPaused = !userPaused;
    updatePauseControl(true);
    scheduleNext();
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

  document.addEventListener("visibilitychange", scheduleNext);

  listenForMotionPreference(() => {
    root.classList.toggle("motion-reduced", reducedMotion.matches);
    if (reducedMotion.matches) {
      revealItems.forEach((item) => item.classList.add("is-revealed"));
      motionItems.forEach((item) => item.classList.add("is-in-view"));
      resetAllPointerFields();
    }
    updatePauseControl(false);
    scheduleInteractiveFrames();
    scheduleNext();
  });

  if ("IntersectionObserver" in window) {
    const playerObserver = new IntersectionObserver(
      ([entry]) => {
        playerVisible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        scheduleNext();
      },
      { threshold: [0, 0.35, 1] }
    );

    playerObserver.observe(player);
  }

  activateMode(modes[activeIndex], false);
  updatePauseControl(false);
  scheduleNext();
})();
