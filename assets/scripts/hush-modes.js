(() => {
  const tabs = Array.from(document.querySelectorAll("[data-mode]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));

  if (!tabs.length || !panels.length) return;

  const selectMode = (nextTab, moveFocus = false) => {
    const mode = nextTab.dataset.mode;

    tabs.forEach((tab) => {
      const selected = tab === nextTab;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      const selected = panel.dataset.panel === mode;
      panel.classList.toggle("is-active", selected);
      panel.hidden = !selected;
    });

    if (moveFocus) nextTab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectMode(tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      selectMode(tabs[nextIndex], true);
    });
  });
})();
