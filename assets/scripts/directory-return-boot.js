(() => {
  "use strict";

  const root = document.documentElement;

  try {
    const products = new Set([
      "together",
      "sekai",
      "hush",
      "modscan",
      "morph",
    ]);
    const slots = new Set([
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
    ]);
    const currentUrl = new URL(window.location.href);
    const savedReturn = window.history.state?.kaizoshaReturn;
    const hasReturnQuery =
      currentUrl.searchParams.get("handoff") === "return";
    const product = String(
      hasReturnQuery
        ? currentUrl.searchParams.get("product") ?? ""
        : savedReturn?.product ?? "",
    ).toLowerCase();
    const slot = hasReturnQuery
      ? currentUrl.searchParams.get("slot")
      : savedReturn?.slot;

    if (products.has(product) && slots.has(slot)) {
      root.classList.add("directory-return-booting");
    }
  } catch {
    root.classList.remove("directory-return-booting");
  }

  window.addEventListener(
    "DOMContentLoaded",
    () => {
      window.setTimeout(() => {
        root.classList.remove("directory-return-booting");
      }, 0);
    },
    { once: true },
  );
})();
