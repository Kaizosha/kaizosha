(() => {
  const root = document.documentElement;
  const player = document.querySelector("[data-player-demo]");
  const motionItems = [...document.querySelectorAll("[data-motion]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const listenToMedia = (query, listener) => {
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", listener);
    } else if (typeof query.addListener === "function") {
      query.addListener(listener);
    }
  };

  root.classList.add("motion-ready");

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

  listenToMedia(reducedMotion, () => {
    updatePauseControl(false);
    scheduleNext();
  });

  if ("IntersectionObserver" in window) {
    const playerObserver = new IntersectionObserver(
      ([entry]) => {
        playerVisible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        scheduleNext();
      },
      { threshold: [0, 0.15, 1] }
    );

    playerObserver.observe(player);
  }

  activateMode(modes[activeIndex], false);
  updatePauseControl(false);
  scheduleNext();
})();
