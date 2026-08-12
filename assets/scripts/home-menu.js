(() => {
  const body = document.body;
  const appMenu = document.getElementById("app-menu");
  const logoButton = document.getElementById("home-logo-button");

  if (!appMenu || !logoButton) return;

  let isOpen = false;

  function getFocusableItems() {
    return [...appMenu.querySelectorAll("a[href], button:not([disabled])")];
  }

  function openMenu(moveFocus = false) {
    body.classList.add("is-app-menu-open");
    appMenu.classList.add("is-open");
    appMenu.removeAttribute("inert");
    appMenu.setAttribute("aria-hidden", "false");
    logoButton.setAttribute("aria-expanded", "true");
    logoButton.setAttribute("aria-label", "Close projects");
    isOpen = true;

    if (moveFocus) {
      const [firstItem] = getFocusableItems();
      (firstItem || appMenu).focus({ preventScroll: true });
    }
  }

  function closeMenu(restoreFocus = false) {
    body.classList.remove("is-app-menu-open");
    appMenu.classList.remove("is-open");
    appMenu.setAttribute("inert", "");
    appMenu.setAttribute("aria-hidden", "true");
    logoButton.setAttribute("aria-expanded", "false");
    logoButton.setAttribute("aria-label", "Open projects");
    isOpen = false;
    if (restoreFocus) {
      logoButton.focus({ preventScroll: true });
    }
  }

  logoButton.addEventListener("click", (event) => {
    event.preventDefault();
    if (isOpen) closeMenu(true);
    else openMenu(true);
  });

  appMenu.addEventListener("click", (event) => {
    if (!event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key === "Tab" && isOpen) {
      const focusableItems = getFocusableItems();
      const firstItem = focusableItems[0];
      const lastItem = focusableItems[focusableItems.length - 1];

      if (!firstItem || !lastItem) {
        event.preventDefault();
        appMenu.focus({ preventScroll: true });
      } else if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus({ preventScroll: true });
      } else if (!appMenu.contains(document.activeElement)) {
        event.preventDefault();
        firstItem.focus({ preventScroll: true });
      }
    }
  });

})();
