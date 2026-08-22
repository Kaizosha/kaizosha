(() => {
  "use strict";

  const root = document.documentElement;

  root.classList.add("product-page-booting");
  window.addEventListener(
    "DOMContentLoaded",
    () => {
      window.setTimeout(() => {
        root.classList.remove("product-page-booting");
      }, 0);
    },
    { once: true },
  );
})();
