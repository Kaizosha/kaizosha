(() => {
  const root = document.documentElement;
  const demo = document.querySelector("[data-pinch-demo]");
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

  if (!demo) return;

  const modes = ["summary", "explain"];
  const buttons = [...demo.querySelectorAll("[data-demo-button]")];
  const pauseButton = demo.querySelector("[data-demo-toggle]");
  const pauseLabel = pauseButton?.querySelector("span");
  const kicker = demo.querySelector("[data-demo-kicker]");
  const status = demo.querySelector("[data-demo-status]");
  const description = demo.querySelector("[data-demo-description-output]");
  const liveRegion = demo.querySelector("[data-demo-live]");
  const wordCount = demo.querySelector("[data-word-count]");
  const countLabel = demo.querySelector("[data-count-label]");

  let activeIndex = Math.max(0, modes.indexOf(demo.dataset.demoMode));
  let timer = null;
  let demoVisible = !("IntersectionObserver" in window);
  let userPaused = false;
  let pointerPaused = false;
  let focusPaused = false;

  const modeDetails = {
    summary: { count: "Whole page", label: "condensed" },
    explain: { count: "Selected text", label: "explained" },
  };

  function clearTimer() {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  }

  function canAutoAdvance() {
    return (
      demoVisible &&
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
    }, 5800);
  }

  function activateMode(mode, announce) {
    const nextIndex = modes.indexOf(mode);
    if (nextIndex === -1) return;

    activeIndex = nextIndex;
    demo.dataset.demoMode = mode;

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

    const details = modeDetails[mode];
    if (wordCount && details) wordCount.textContent = details.count;
    if (countLabel && details) countLabel.textContent = details.label;
  }

  function updatePauseControl(announce) {
    demo.classList.toggle("is-paused", userPaused || reducedMotion.matches);

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
        ? "TL;Pinch animation paused."
        : "TL;Pinch animation resumed.";
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

  demo.addEventListener("pointerenter", () => {
    pointerPaused = true;
    clearTimer();
  });

  demo.addEventListener("pointerleave", () => {
    pointerPaused = false;
    scheduleNext();
  });

  demo.addEventListener("focusin", () => {
    focusPaused = true;
    clearTimer();
  });

  demo.addEventListener("focusout", (event) => {
    if (demo.contains(event.relatedTarget)) return;
    focusPaused = false;
    scheduleNext();
  });

  document.addEventListener("visibilitychange", scheduleNext);

  listenToMedia(reducedMotion, () => {
    updatePauseControl(false);
    scheduleNext();
  });

  if ("IntersectionObserver" in window) {
    const demoObserver = new IntersectionObserver(
      ([entry]) => {
        demoVisible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        scheduleNext();
      },
      { threshold: [0, 0.15, 1] }
    );

    demoObserver.observe(demo);
  }

  activateMode(modes[activeIndex], false);
  updatePauseControl(false);
  scheduleNext();
})();
