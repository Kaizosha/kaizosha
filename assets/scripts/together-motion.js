(() => {
  const root = document.documentElement;
  const player = document.querySelector("[data-player-demo]");
  const motionItems = [...document.querySelectorAll("[data-motion]")];
  const scrollScenes = [...document.querySelectorAll("[data-scroll-scene]")];
  const signalStory = document.querySelector("[data-signal-story]");
  const storyNodes = signalStory
    ? [...signalStory.querySelectorAll("[data-story-node]")]
    : [];
  const storyLabels = signalStory
    ? [...signalStory.querySelectorAll("[data-story-label]")]
    : [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let scrollFrame = null;
  let scrollMotionBound = false;

  root.classList.add("motion-ready");

  function clamp(value, minimum = 0, maximum = 1) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function updateSignalStory(progress) {
    if (!signalStory || storyNodes.length === 0) return;

    const settledProgress = clamp(progress);
    const finalIndex = storyNodes.length - 1;
    const activeIndex = Math.min(
      finalIndex,
      Math.floor(settledProgress * storyNodes.length)
    );

    signalStory.style.setProperty(
      "--story-progress",
      settledProgress.toFixed(4)
    );
    signalStory.style.setProperty(
      "--story-x",
      `${(settledProgress * 100).toFixed(2)}%`
    );
    signalStory.dataset.storyStep = String(activeIndex);

    storyNodes.forEach((node, index) => {
      const threshold = finalIndex === 0 ? 0 : index / finalIndex;
      node.classList.toggle("is-passed", settledProgress + 0.025 >= threshold);
      node.classList.toggle("is-active", index === activeIndex);
    });

    storyLabels.forEach((label, index) => {
      const threshold = finalIndex === 0 ? 0 : index / finalIndex;
      const active = index === activeIndex;
      label.classList.toggle("is-passed", settledProgress + 0.025 >= threshold);
      label.classList.toggle("is-active", active);

      if (active) {
        label.setAttribute("aria-current", "step");
      } else {
        label.removeAttribute("aria-current");
      }
    });
  }

  function settleScrollScenes() {
    root.style.setProperty("--page-progress", "1");
    root.style.setProperty("--page-y", "100%");

    scrollScenes.forEach((scene) => {
      scene.style.setProperty("--scene-progress", "1");
      scene.style.setProperty("--scene-shift", "0px");
      scene.style.setProperty("--scene-x", "100%");
      scene.style.setProperty("--scene-angle", "18deg");
      scene.style.setProperty("--scene-angle-reverse", "-18deg");
      scene.classList.add("is-scroll-active");
    });

    updateSignalStory(1);
  }

  function updateScrollScenes() {
    scrollFrame = null;

    if (reducedMotion.matches) {
      settleScrollScenes();
      return;
    }

    const viewportHeight = window.innerHeight || 1;
    const scrollRange = Math.max(
      1,
      document.documentElement.scrollHeight - viewportHeight
    );
    const pageProgress = clamp(window.scrollY / scrollRange);
    const measurements = scrollScenes.map((scene) => ({
      scene,
      rect: scene.getBoundingClientRect(),
    }));

    root.style.setProperty("--page-progress", pageProgress.toFixed(4));
    root.style.setProperty("--page-y", `${(pageProgress * 100).toFixed(2)}%`);

    measurements.forEach(({ scene, rect }) => {
      const revealStart = viewportHeight * 0.88;
      const revealEnd = viewportHeight * 0.28;
      const progress = clamp(
        (revealStart - rect.top) / Math.max(1, revealStart - revealEnd)
      );
      const angle = -18 + progress * 36;

      scene.style.setProperty("--scene-progress", progress.toFixed(4));
      scene.style.setProperty("--scene-shift", `${((1 - progress) * 32).toFixed(2)}px`);
      scene.style.setProperty("--scene-x", `${(progress * 100).toFixed(2)}%`);
      scene.style.setProperty("--scene-angle", `${angle.toFixed(2)}deg`);
      scene.style.setProperty("--scene-angle-reverse", `${(-angle).toFixed(2)}deg`);
      scene.classList.toggle(
        "is-scroll-active",
        rect.bottom > 0 && rect.top < viewportHeight
      );

      if (scene === signalStory) {
        const storyDistance = Math.max(1, rect.height - viewportHeight);
        const storyProgress = window.innerWidth <= 900
          ? 1
          : clamp(-rect.top / storyDistance);
        updateSignalStory(storyProgress);
      }
    });
  }

  function requestScrollUpdate() {
    if (scrollFrame !== null) return;
    scrollFrame = window.requestAnimationFrame(updateScrollScenes);
  }

  function bindScrollMotion() {
    if (scrollMotionBound) return;
    scrollMotionBound = true;
    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate, { passive: true });
    window.addEventListener("pageshow", requestScrollUpdate, { passive: true });
    window.visualViewport?.addEventListener("resize", requestScrollUpdate, {
      passive: true,
    });
  }

  function unbindScrollMotion() {
    if (!scrollMotionBound) return;
    scrollMotionBound = false;
    window.removeEventListener("scroll", requestScrollUpdate);
    window.removeEventListener("resize", requestScrollUpdate);
    window.removeEventListener("pageshow", requestScrollUpdate);
    window.visualViewport?.removeEventListener("resize", requestScrollUpdate);

    if (scrollFrame !== null) {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = null;
    }
  }

  function updateScrollPreference() {
    if (reducedMotion.matches) {
      unbindScrollMotion();
      settleScrollScenes();
      return;
    }

    bindScrollMotion();
    requestScrollUpdate();
  }

  if (scrollScenes.length) {
    root.classList.add("scroll-motion-ready");
    updateScrollScenes();
    updateScrollPreference();
    reducedMotion.addEventListener("change", updateScrollPreference);
    document.fonts?.ready.then(requestScrollUpdate);
  }

  if ("IntersectionObserver" in window) {
    const motionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-in-view", entry.isIntersecting);
        });
      },
      { threshold: 0.12 }
    );

    motionItems.forEach((item) => motionObserver.observe(item));
  } else {
    motionItems.forEach((item) => item.classList.add("is-in-view"));
  }

  if (!player) return;

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
      ? "Player motion reduced"
      : userPaused
        ? "Resume player motion"
        : "Pause player motion";

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

  player.addEventListener("pointerenter", () => {
    pointerPaused = true;
    clearTimer();
  });

  player.addEventListener("pointerleave", () => {
    pointerPaused = false;
    scheduleNext();
  });

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

  reducedMotion.addEventListener("change", () => {
    updatePauseControl(false);
    scheduleNext();
  });

  if ("IntersectionObserver" in window) {
    const playerObserver = new IntersectionObserver(
      ([entry]) => {
        playerVisible = entry.isIntersecting && entry.intersectionRatio >= 0.45;
        scheduleNext();
      },
      { threshold: [0, 0.45, 1] }
    );

    playerObserver.observe(player);
  }

  activateMode(modes[activeIndex], false);
  updatePauseControl(false);
  scheduleNext();
})();
