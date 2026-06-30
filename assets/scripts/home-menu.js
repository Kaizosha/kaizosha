(() => {
  const body = document.body;
  const appMenu = document.getElementById("app-menu");
  const logoButton = document.getElementById("home-logo-button");

  if (!appMenu || !logoButton) return;

  const dragDistance = 280;
  const openThreshold = 0.35;
  const closeThreshold = 0.65;
  let startY = 0;
  let startProgress = 0;
  let pointerId = null;
  let isOpen = false;

  function setMenuProgress(value) {
    const progress = Math.max(0, Math.min(1, value));
    body.style.setProperty("--menu-progress", String(progress));
  }

  function openMenu() {
    body.classList.add("is-app-menu-open");
    body.classList.remove("is-app-menu-dragging");
    appMenu.classList.add("is-open");
    appMenu.setAttribute("aria-hidden", "false");
    logoButton.setAttribute("aria-expanded", "true");
    logoButton.setAttribute("aria-label", "Close projects");
    body.style.removeProperty("--menu-progress");
    isOpen = true;
  }

  function closeMenu(restoreFocus = false) {
    body.classList.remove("is-app-menu-open");
    body.classList.remove("is-app-menu-dragging");
    appMenu.classList.remove("is-open");
    appMenu.setAttribute("aria-hidden", "true");
    logoButton.setAttribute("aria-expanded", "false");
    logoButton.setAttribute("aria-label", "Open projects");
    body.style.removeProperty("--menu-progress");
    isOpen = false;
    if (restoreFocus) {
      logoButton.focus({ preventScroll: true });
    }
  }

  logoButton.addEventListener("pointerdown", (event) => {
    if (isOpen) return;
    event.preventDefault();
    pointerId = event.pointerId;
    startY = event.clientY;
    startProgress = 0;
    body.classList.add("is-app-menu-dragging");
    setMenuProgress(0);
  });

  logoButton.addEventListener("click", (event) => {
    if (event.detail !== 0 || isOpen) return;
    event.preventDefault();
    openMenu();
    appMenu.focus({ preventScroll: true });
  });

  logoButton.addEventListener("keydown", (event) => {
    if (isOpen) return;
    if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") {
      return;
    }

    event.preventDefault();
    openMenu();
    appMenu.focus({ preventScroll: true });
  });

  appMenu.addEventListener("pointerdown", (event) => {
    if (!isOpen || event.target.closest("a")) return;
    event.preventDefault();
    pointerId = event.pointerId;
    startY = event.clientY;
    startProgress = 1;
    body.classList.add("is-app-menu-dragging");
    body.style.setProperty("--menu-progress", "1");
  });

  document.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) return;
    event.preventDefault();
    const deltaY = event.clientY - startY;
    const progress = Math.max(
      0,
      Math.min(1, startProgress - deltaY / dragDistance)
    );
    setMenuProgress(progress);
  });

  document.addEventListener("pointerup", (event) => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    event.preventDefault();

    const deltaY = event.clientY - startY;
    const progress =
      parseFloat(body.style.getPropertyValue("--menu-progress")) ||
      startProgress;

    body.classList.remove("is-app-menu-dragging");

    if (!isOpen) {
      if (progress >= openThreshold || deltaY > -30) openMenu();
      else closeMenu();
      return;
    }

    if (
      progress <= closeThreshold ||
      deltaY > 30 ||
      (startProgress === 1 && Math.abs(deltaY) < 25)
    ) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeMenu(true);
    }
  });

  document.addEventListener("pointercancel", (event) => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    body.classList.remove("is-app-menu-dragging");
    if (isOpen) openMenu();
    else closeMenu();
  });
})();
