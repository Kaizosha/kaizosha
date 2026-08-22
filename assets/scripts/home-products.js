(() => {
  "use strict";

  const returnProducts = new Map([
    ["together", "Together"],
    ["sekai", "Sekai"],
    ["hush", "Hush"],
    ["modscan", "ModScan"],
    ["morph", "Morph"],
  ]);
  const returnSlots = new Set([
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ]);
  const directoryUrl = new URL(window.location.href);
  const savedDirectoryReturn = window.history.state?.kaizoshaReturn;
  const hasDirectoryReturnQuery =
    directoryUrl.searchParams.get("handoff") === "return";
  const requestedProductKey = String(
    hasDirectoryReturnQuery
      ? directoryUrl.searchParams.get("product") ?? ""
      : savedDirectoryReturn?.product ?? "",
  ).toLowerCase();
  const requestedSlot = hasDirectoryReturnQuery
    ? directoryUrl.searchParams.get("slot")
    : savedDirectoryReturn?.slot;
  const requestedScroll = Number.parseFloat(
    String(
      hasDirectoryReturnQuery
        ? directoryUrl.searchParams.get("scroll") ?? "0"
        : savedDirectoryReturn?.scroll ?? "0",
    ),
  );
  const directoryReturn =
    returnProducts.has(requestedProductKey) && returnSlots.has(requestedSlot)
      ? {
          product: returnProducts.get(requestedProductKey),
          slot: requestedSlot,
          scroll:
            Number.isFinite(requestedScroll) && requestedScroll > 0
              ? Math.min(requestedScroll, 1000000)
              : 0,
        }
      : null;
  let isRestoringDirectoryReturn = Boolean(directoryReturn);

  const getMergedHistoryState = () =>
    window.history.state && typeof window.history.state === "object"
      ? { ...window.history.state }
      : {};

  const clearDirectoryReturnState = () => {
    const state = getMergedHistoryState();

    if (!("kaizoshaReturn" in state)) {
      return;
    }

    delete state.kaizoshaReturn;
    window.history.replaceState(state, "", window.location.href);
  };

  const saveDirectoryReturnState = ({ product, slot, scroll = 0 }) => {
    const state = getMergedHistoryState();

    state.kaizoshaReturn = {
      version: 1,
      product,
      slot,
      scroll: Math.max(0, Math.round(scroll * 100) / 100),
    };

    return state;
  };

  const intro = document.querySelector("[data-home-intro]");
  const introClose = intro?.querySelector("[data-home-intro-close]");
  const introTitle = intro?.querySelector("[data-home-intro-title]");
  const introOpen = document.querySelector("[data-home-intro-open]");
  let closeProductDetails = () => {};

  if (directoryReturn) {
    intro?.removeAttribute("open");
  }

  const syncIntroState = () => {
    introOpen?.setAttribute("aria-expanded", String(Boolean(intro?.open)));
  };

  const focusIntroTitle = () => {
    window.requestAnimationFrame(() => {
      if (intro?.open) {
        introTitle?.focus({ preventScroll: true });
      }
    });
  };

  const showIntro = () => {
    if (!intro) {
      return;
    }

    isRestoringDirectoryReturn = false;
    clearDirectoryReturnState();

    if (intro.open) {
      return;
    }

    intro.classList.remove("is-closing");

    if (typeof intro.showModal === "function") {
      intro.showModal();
    } else {
      intro.setAttribute("open", "");
    }

    syncIntroState();
    focusIntroTitle();
  };

  intro?.addEventListener("close", () => {
    intro.classList.remove("is-closing");
    syncIntroState();
    introOpen?.focus({ preventScroll: true });
  });

  if (intro && introClose && typeof intro.close === "function") {
    introClose.addEventListener("click", (event) => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      if (reducedMotion.matches) {
        return;
      }

      event.preventDefault();
      intro.classList.add("is-closing");

      window.setTimeout(() => {
        intro.close("explore");
      }, 180);
    });
  }

  introOpen?.addEventListener("click", () => {
    closeProductDetails({ immediate: true });
    showIntro();
  });

  if (intro?.open && typeof intro.showModal === "function") {
    intro.removeAttribute("open");
    intro.showModal();
  }

  syncIntroState();
  focusIntroTitle();

  const productGrid = document.querySelector(".home-products[data-products]");
  const controls = document.querySelector("[data-product-controls]");
  const previousButton = document.querySelector("[data-products-previous]");
  const nextButton = document.querySelector("[data-products-next]");
  const productStatus = document.querySelector("[data-products-status]");
  const homeMain = productGrid?.closest(".home-main");
  const homeLogo = document.querySelector(".home-logo");

  if (
    !productGrid ||
    !controls ||
    !previousButton ||
    !nextButton ||
    !homeMain ||
    !homeLogo
  ) {
    return;
  }

  if (directoryReturn) {
    homeMain.classList.add("is-directory-return");
    homeMain.style.animation = "none";
  }

  const cellRecords = Array.from(
    productGrid.querySelectorAll(".product-cell[data-product-slot]"),
  )
    .map((cell) => {
      const content = cell.querySelector(".product-cell__content");
      const nameLink = cell.querySelector(".product-cell__name");
      const detail = cell.querySelector(".product-cell__detail");
      const eyebrow = cell.querySelector(".product-cell__eyebrow");
      const description = cell.querySelector(".product-cell__description");
      const meta = cell.querySelector(".product-cell__meta");
      const closeButton = cell.querySelector("[data-product-close]");
      const exploreLink = cell.querySelector(".product-cell__explore");
      const scrollCue = cell.querySelector("[data-product-scroll-cue]");

      if (
        !content ||
        !nameLink ||
        !detail ||
        !eyebrow ||
        !description ||
        !meta ||
        !closeButton ||
        !exploreLink ||
        !scrollCue
      ) {
        return null;
      }

      return {
        cell,
        content,
        nameLink,
        detail,
        eyebrow,
        description,
        meta,
        closeButton,
        exploreLink,
        scrollCue,
      };
    })
    .filter(Boolean);

  const sourceCatalog = cellRecords.map((record, index) => ({
    name: record.nameLink.textContent.trim(),
    url: record.nameLink.href,
    description: record.description.textContent.trim(),
    meta: record.meta.textContent.trim(),
    sequence: String(index + 1).padStart(2, "0"),
  }));
  const catalogTemplate = document.querySelector(
    "template[data-product-catalog]",
  );
  const additionalCatalog = Array.from(
    catalogTemplate?.content.querySelectorAll(
      "[data-product-catalog-item]",
    ) ?? [],
  ).map((item, index) => ({
    name: item.dataset.productName?.trim() ?? "",
    url: item.dataset.productUrl?.trim() ?? "",
    description: item.dataset.productDescription?.trim() ?? "",
    meta: item.dataset.productMeta?.trim() ?? "",
    sequence: String(sourceCatalog.length + index + 1).padStart(2, "0"),
  }));
  const catalog = [...sourceCatalog, ...additionalCatalog].filter(
    (product) =>
      product.name && product.url && product.description && product.meta,
  );
  const productsByName = new Map(
    catalog.map((product) => [product.name, product]),
  );
  const products = Array.from(productsByName.keys());

  const getDestinationLabel = (url) => {
    try {
      return new URL(url).hostname.toLowerCase() === "github.com"
        ? "on GitHub"
        : "website";
    } catch {
      return "website";
    }
  };

  if (!cellRecords.length || !products.length) {
    return;
  }

  const shuffle = (items) => {
    const result = [...items];

    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }

    return result;
  };

  const buildCandidate = () => {
    if (products.length >= cellRecords.length) {
      return shuffle(products).slice(0, cellRecords.length);
    }

    const candidate = [];

    while (candidate.length < cellRecords.length) {
      const batch = shuffle(products);

      if (
        candidate.length &&
        batch.length > 1 &&
        candidate[candidate.length - 1] === batch[0]
      ) {
        batch.push(batch.shift());
      }

      candidate.push(...batch);
    }

    return candidate.slice(0, cellRecords.length);
  };

  const arrangementsMatch = (first, second) =>
    first.length === second.length &&
    first.every((product, index) => product === second[index]);

  const scoreCandidate = (candidate, reference, history, focusIndex) => {
    let score = Math.random();

    candidate.forEach((product, slotIndex) => {
      if (reference) {
        score += product === reference[slotIndex] ? -160 : 48;
      }

      history.forEach((page, pageIndex) => {
        const distance = Math.abs(pageIndex - focusIndex);

        if (distance > 4) {
          return;
        }

        const recency = 5 - distance;

        if (page[slotIndex] === product) {
          score -= recency * 20;
        }

        if (page.includes(product)) {
          score -= recency * 3;
        }
      });
    });

    if (history.some((page) => arrangementsMatch(page, candidate))) {
      score -= 400;
    }

    return score;
  };

  const createArrangement = (reference, history, focusIndex) => {
    const attemptCount = Math.max(120, products.length * 24);
    let bestCandidate = buildCandidate();
    let bestScore = scoreCandidate(
      bestCandidate,
      reference,
      history,
      focusIndex,
    );

    for (let attempt = 1; attempt < attemptCount; attempt += 1) {
      const candidate = buildCandidate();
      const candidateScore = scoreCandidate(
        candidate,
        reference,
        history,
        focusIndex,
      );

      if (candidateScore > bestScore) {
        bestCandidate = candidate;
        bestScore = candidateScore;
      }
    }

    return bestCandidate;
  };

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const detailHideTimers = new Map();
  const scrollHandoffThreshold = 220;
  const touchHandoffThreshold = 120;
  const handoffFrameCompletion = 0.82;
  const handoffNavigationDelay = 160;
  let activeRecord = null;
  let isNavigatingToProduct = false;
  let scrollHandoffProgress = 0;
  let scrollHandoffResetTimer = null;
  let handoffFrameOrigin = null;
  let handoffFrameResetTimer = null;
  let suppressFocusActivation = false;
  let touchHandoffRecord = null;
  let touchHandoffStartX = 0;
  let touchHandoffStartY = 0;
  let isDirectoryReturnGuarded = Boolean(directoryReturn);
  let directoryReturnGuardTimer = null;

  const armDirectoryReturnGuard = (delay = 550) => {
    isDirectoryReturnGuarded = true;

    if (directoryReturnGuardTimer !== null) {
      window.clearTimeout(directoryReturnGuardTimer);
    }

    directoryReturnGuardTimer = window.setTimeout(() => {
      isDirectoryReturnGuarded = false;
      directoryReturnGuardTimer = null;
    }, delay);
  };

  const clearScrollHandoffReset = () => {
    if (scrollHandoffResetTimer !== null) {
      window.clearTimeout(scrollHandoffResetTimer);
      scrollHandoffResetTimer = null;
    }
  };

  const clearHandoffFrameReset = () => {
    if (handoffFrameResetTimer !== null) {
      window.clearTimeout(handoffFrameResetTimer);
      handoffFrameResetTimer = null;
    }
  };

  const getHandoffFrameTarget = () => {
    const bodyStyle = window.getComputedStyle(document.body);
    const viewportWidth =
      window.visualViewport?.width ?? document.documentElement.clientWidth;
    const viewportHeight =
      window.visualViewport?.height ?? document.documentElement.clientHeight;
    const horizontalPadding =
      Number.parseFloat(bodyStyle.paddingLeft) +
      Number.parseFloat(bodyStyle.paddingRight);
    const verticalPadding =
      Number.parseFloat(bodyStyle.paddingTop) +
      Number.parseFloat(bodyStyle.paddingBottom);

    return {
      width: Math.max(0, viewportWidth - horizontalPadding),
      height: Math.max(0, viewportHeight - verticalPadding),
    };
  };

  const rebaseHandoffFrameOrigin = () => {
    const handoffWidth = homeMain.style.getPropertyValue(
      "--handoff-frame-width",
    );
    const handoffHeight = homeMain.style.getPropertyValue(
      "--handoff-frame-height",
    );

    homeMain.style.removeProperty("--handoff-frame-width");
    homeMain.style.removeProperty("--handoff-frame-height");

    const frame = homeMain.getBoundingClientRect();

    if (handoffWidth) {
      homeMain.style.setProperty("--handoff-frame-width", handoffWidth);
    }

    if (handoffHeight) {
      homeMain.style.setProperty("--handoff-frame-height", handoffHeight);
    }

    handoffFrameOrigin = {
      width: frame.width,
      height: frame.height,
    };
  };

  const updateHandoffFrame = (progress) => {
    clearHandoffFrameReset();
    homeMain.classList.remove("is-handoff-resetting");

    if (!handoffFrameOrigin) {
      const frame = homeMain.getBoundingClientRect();

      handoffFrameOrigin = {
        width: frame.width,
        height: frame.height,
      };
    }

    const target = getHandoffFrameTarget();
    const frameProgress = Math.min(1, progress / handoffFrameCompletion);
    const width =
      handoffFrameOrigin.width +
      (target.width - handoffFrameOrigin.width) *
        frameProgress;
    const height =
      handoffFrameOrigin.height +
      (target.height - handoffFrameOrigin.height) *
        frameProgress;

    homeMain.classList.add("is-handoff-preview");
    homeMain.style.setProperty("--handoff-frame-width", `${width}px`);
    homeMain.style.setProperty("--handoff-frame-height", `${height}px`);
  };

  const resetHandoffFrame = () => {
    clearHandoffFrameReset();
    homeMain.classList.remove("is-handoff-preview");
    homeMain.classList.remove("is-wheel-handoff");

    if (reducedMotion.matches) {
      handoffFrameOrigin = null;
      homeMain.classList.remove("is-handoff-resetting");
      homeMain.style.removeProperty("--handoff-frame-width");
      homeMain.style.removeProperty("--handoff-frame-height");
      return;
    }

    homeMain.classList.add("is-handoff-resetting");
    homeMain.style.removeProperty("--handoff-frame-width");
    homeMain.style.removeProperty("--handoff-frame-height");
    handoffFrameResetTimer = window.setTimeout(() => {
      handoffFrameOrigin = null;
      homeMain.classList.remove("is-handoff-resetting");
      handoffFrameResetTimer = null;
    }, 220);
  };

  const setScrollHandoffProgress = (record, value) => {
    const progress = Math.min(1, Math.max(0, value));

    scrollHandoffProgress = progress;

    if (record) {
      record.scrollCue.style.setProperty(
        "--scroll-handoff-progress",
        String(progress),
      );
    }

    if (progress > 0 && (!reducedMotion.matches || progress === 1)) {
      updateHandoffFrame(progress);
    }
  };

  const resetScrollHandoff = (record = activeRecord) => {
    clearScrollHandoffReset();
    setScrollHandoffProgress(record, 0);
    resetHandoffFrame();
  };

  const scheduleScrollHandoffReset = (record, delay = 1100) => {
    clearScrollHandoffReset();
    scrollHandoffResetTimer = window.setTimeout(() => {
      if (activeRecord === record && !isNavigatingToProduct) {
        resetScrollHandoff(record);
      }
    }, delay);
  };

  const clearTouchHandoff = () => {
    touchHandoffRecord = null;
    touchHandoffStartX = 0;
    touchHandoffStartY = 0;
  };

  const getHandoffScrollState = (record) => {
    const overflowY = window.getComputedStyle(record.content).overflowY;
    const hasScrollableContent =
      /^(auto|scroll)$/.test(overflowY) &&
      record.content.scrollHeight > record.content.clientHeight + 2;
    const isAtContentEnd =
      record.content.scrollTop + record.content.clientHeight >=
      record.content.scrollHeight - 2;

    return { hasScrollableContent, isAtContentEnd };
  };

  const canHandoffToWebsite = (record, target) =>
    Boolean(
        record &&
        !intro?.open &&
        !isNavigatingToProduct &&
        !isDirectoryReturnGuarded &&
        getDestinationLabel(record.nameLink.href) === "website" &&
        record.cell.contains(target) &&
        !target.closest?.("a, button"),
    );

  const openProductWebsite = (record) => {
    if (isNavigatingToProduct) {
      return;
    }

    isNavigatingToProduct = true;
    clearTouchHandoff();
    clearScrollHandoffReset();
    setScrollHandoffProgress(record, 1);
    homeMain.classList.add("is-navigating-product");
    void homeMain.offsetHeight;

    if (productStatus) {
      productStatus.textContent = `Opening ${record.cell.dataset.productName} website.`;
    }

    const navigate = () => {
      const destination = new URL(record.nameLink.href);
      const handoffScrollTop = Math.max(0, record.content.scrollTop);

      if (
        destination.hostname.endsWith(".kaizosha.org") &&
        destination.hostname !== "kaizosha.org"
      ) {
        destination.searchParams.set("slot", record.cell.dataset.productSlot);

        if (handoffScrollTop > 0) {
          destination.searchParams.set(
            "scroll",
            String(Math.round(handoffScrollTop * 100) / 100),
          );
        }

        window.history.replaceState(
          saveDirectoryReturnState({
            product: record.cell.dataset.productName,
            slot: record.cell.dataset.productSlot,
            scroll: handoffScrollTop,
          }),
          "",
          window.location.href,
        );
      }

      window.location.assign(destination.href);
    };

    window.requestAnimationFrame(() => {
      if (reducedMotion.matches) {
        window.requestAnimationFrame(navigate);
        return;
      }

      window.setTimeout(navigate, handoffNavigationDelay);
    });
  };

  const clearDetailHide = (record) => {
    const timer = detailHideTimers.get(record);

    if (timer) {
      window.clearTimeout(timer);
      detailHideTimers.delete(record);
    }
  };

  const hideDetail = (record, immediate) => {
    clearDetailHide(record);

    if (immediate || reducedMotion.matches) {
      record.detail.hidden = true;
      record.cell.classList.remove("is-directory-return-origin");
      return;
    }

    const timer = window.setTimeout(() => {
      if (activeRecord !== record) {
        record.detail.hidden = true;
        record.cell.classList.remove("is-directory-return-origin");
      }

      detailHideTimers.delete(record);
    }, 620);

    detailHideTimers.set(record, timer);
  };

  const deactivateProduct = ({
    focus = false,
    immediate = false,
    announce = false,
  } = {}) => {
    const record = activeRecord;

    if (!record || isNavigatingToProduct) {
      return;
    }

    clearTouchHandoff();
    resetScrollHandoff(record);

    if (focus) {
      suppressFocusActivation = true;
      record.nameLink.focus({ preventScroll: true });
    }

    activeRecord = null;
    record.nameLink.setAttribute("aria-expanded", "false");
    record.detail.setAttribute("aria-hidden", "true");
    record.cell.classList.remove("is-active");
    productGrid.classList.remove("has-active");
    delete homeMain.dataset.activeProduct;
    delete homeMain.dataset.activeSlot;
    hideDetail(record, immediate);

    if (!isRestoringDirectoryReturn) {
      clearDirectoryReturnState();
    }

    if (announce && productStatus) {
      productStatus.textContent = `${record.cell.dataset.productName} details closed.`;
    }

    if (focus) {
      window.requestAnimationFrame(() => {
        suppressFocusActivation = false;
      });
    }
  };

  closeProductDetails = deactivateProduct;

  const activateProduct = (record, { announce = false } = {}) => {
    if (intro?.open || activeRecord === record || isNavigatingToProduct) {
      return;
    }

    if (activeRecord) {
      deactivateProduct({ immediate: true });
    }

    clearDetailHide(record);
    record.detail.hidden = false;
    record.detail.removeAttribute("aria-hidden");
    void record.detail.offsetWidth;

    activeRecord = record;
    resetScrollHandoff(record);
    homeLogo.classList.add("is-ready");
    homeMain.dataset.activeProduct = record.cell.dataset.productName;
    homeMain.dataset.activeSlot = record.cell.dataset.productSlot;
    productGrid.classList.add("has-active");
    record.cell.classList.add("is-active");
    record.nameLink.setAttribute("aria-expanded", "true");

    if (announce && productStatus) {
      productStatus.textContent = `${record.cell.dataset.productName} product details shown.`;
    }
  };

  const renderCell = (record, product) => {
    const destinationLabel = getDestinationLabel(product.url);
    const hasWebsiteHandoff = destinationLabel === "website";

    record.cell.classList.remove("is-directory-return-origin");
    record.cell.dataset.productName = product.name;
    record.nameLink.textContent = product.name;
    record.nameLink.href = product.url;
    record.nameLink.setAttribute(
      "aria-label",
      `View ${product.name} ${destinationLabel} (opens in a new tab)`,
    );
    record.nameLink.setAttribute("aria-expanded", "false");
    record.eyebrow.textContent = `product / ${product.sequence}`;
    record.description.textContent = product.description;
    record.meta.textContent = product.meta;
    record.closeButton.setAttribute(
      "aria-label",
      `Close ${product.name} details`,
    );
    record.exploreLink.href = product.url;
    record.exploreLink.setAttribute(
      "aria-label",
      `Explore ${product.name} ${destinationLabel} (opens in a new tab)`,
    );
    record.scrollCue.textContent = finePointer.matches
      ? `[ SCROLL TO OPEN ${product.name} ↓ ]`
      : `[ SWIPE UP TO OPEN ${product.name} ↑ ]`;
    record.scrollCue.hidden = !hasWebsiteHandoff;
    record.scrollCue.style.setProperty("--scroll-handoff-progress", "0");
    record.detail.setAttribute("aria-hidden", "true");
    record.detail.hidden = true;
  };

  const syncScrollCues = () => {
    cellRecords.forEach((record) => {
      const productName = record.cell.dataset.productName;

      if (!productName || record.scrollCue.hidden) {
        return;
      }

      record.scrollCue.textContent = finePointer.matches
        ? `[ SCROLL TO OPEN ${productName} ↓ ]`
        : `[ SWIPE UP TO OPEN ${productName} ↑ ]`;
    });
  };

  finePointer.addEventListener?.("change", syncScrollCues);

  homeLogo.addEventListener(
    "animationend",
    (event) => {
      if (event.target === homeLogo && event.animationName === "mark-in") {
        homeLogo.classList.add("is-ready");
      }
    },
    { once: true },
  );

  cellRecords.forEach((record) => {
    record.cell.addEventListener("pointerenter", (event) => {
      if (finePointer.matches && event.pointerType !== "touch") {
        activateProduct(record);
      }
    });

    record.cell.addEventListener("focusin", () => {
      if (!suppressFocusActivation) {
        activateProduct(record, { announce: true });
      }
    });

    record.nameLink.addEventListener("click", (event) => {
      if (event.detail > 0 && !finePointer.matches) {
        event.preventDefault();
        activateProduct(record, { announce: true });
      }
    });

    record.closeButton.addEventListener("click", () => {
      deactivateProduct({ focus: true, announce: true });
    });
  });

  homeMain.addEventListener("pointerleave", () => {
    if (
      finePointer.matches &&
      activeRecord &&
      !isNavigatingToProduct &&
      !activeRecord.cell.contains(document.activeElement)
    ) {
      deactivateProduct();
    }
  });

  homeMain.addEventListener(
    "wheel",
    (event) => {
      const record = activeRecord;

      if (
        !record ||
        intro?.open ||
        isNavigatingToProduct ||
        !finePointer.matches ||
        getDestinationLabel(record.nameLink.href) !== "website" ||
        event.target.closest?.("a, button")
      ) {
        return;
      }

      const multiplier =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? window.innerHeight
            : 1;
      const deltaX = event.deltaX * multiplier;
      const deltaY = event.deltaY * multiplier;

      if (isDirectoryReturnGuarded) {
        if (deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX)) {
          event.preventDefault();
          armDirectoryReturnGuard();
        }

        return;
      }

      if (deltaY <= 0 || Math.abs(deltaY) <= Math.abs(deltaX)) {
        if (deltaY < 0) {
          resetScrollHandoff(record);
        }

        return;
      }

      const { hasScrollableContent, isAtContentEnd } =
        getHandoffScrollState(record);

      if (hasScrollableContent && !isAtContentEnd) {
        return;
      }

      event.preventDefault();
      clearScrollHandoffReset();
      homeMain.classList.add("is-wheel-handoff");
      setScrollHandoffProgress(
        record,
        scrollHandoffProgress + deltaY / scrollHandoffThreshold,
      );

      if (scrollHandoffProgress >= 1) {
        openProductWebsite(record);
        return;
      }

      scheduleScrollHandoffReset(record);
    },
    { passive: false },
  );

  homeMain.addEventListener(
    "touchstart",
    (event) => {
      const record = activeRecord;

      if (
        event.touches.length !== 1 ||
        !canHandoffToWebsite(record, event.target)
      ) {
        clearTouchHandoff();
        return;
      }

      const touch = event.touches[0];
      const { hasScrollableContent, isAtContentEnd } =
        getHandoffScrollState(record);

      if (hasScrollableContent && !isAtContentEnd) {
        clearTouchHandoff();
        resetScrollHandoff(record);
        return;
      }

      resetScrollHandoff(record);
      homeMain.classList.remove("is-wheel-handoff");
      touchHandoffRecord = record;
      touchHandoffStartX = touch.clientX;
      touchHandoffStartY = touch.clientY;
    },
    { passive: true },
  );

  homeMain.addEventListener(
    "touchmove",
    (event) => {
      const record = touchHandoffRecord;

      if (
        event.touches.length !== 1 ||
        record !== activeRecord ||
        !canHandoffToWebsite(record, event.target)
      ) {
        if (record && !isNavigatingToProduct) {
          resetScrollHandoff(record);
        }
        clearTouchHandoff();
        return;
      }

      const touch = event.touches[0];
      const deltaX = touch.clientX - touchHandoffStartX;
      const deltaY = touchHandoffStartY - touch.clientY;

      if (deltaY <= 0 || Math.abs(deltaY) <= Math.abs(deltaX)) {
        resetScrollHandoff(record);
        return;
      }

      setScrollHandoffProgress(record, deltaY / touchHandoffThreshold);
    },
    { passive: true },
  );

  homeMain.addEventListener("touchend", (event) => {
    const record = touchHandoffRecord;
    const shouldOpen =
      record === activeRecord &&
      scrollHandoffProgress >= 1 &&
      canHandoffToWebsite(record, event.target);

    clearTouchHandoff();

    if (shouldOpen) {
      openProductWebsite(record);
    } else if (record && !isNavigatingToProduct) {
      resetScrollHandoff(record);
    }
  });

  homeMain.addEventListener("touchcancel", () => {
    const record = touchHandoffRecord;

    clearTouchHandoff();

    if (record && !isNavigatingToProduct) {
      resetScrollHandoff(record);
    }
  });

  const syncActiveHandoffFrame = () => {
    if (
      scrollHandoffProgress > 0 &&
      (!reducedMotion.matches || scrollHandoffProgress === 1)
    ) {
      rebaseHandoffFrameOrigin();
      updateHandoffFrame(scrollHandoffProgress);
    }
  };

  window.addEventListener("resize", syncActiveHandoffFrame);
  window.visualViewport?.addEventListener("resize", syncActiveHandoffFrame);

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted && !isNavigatingToProduct) {
      return;
    }

    isNavigatingToProduct = false;
    clearTouchHandoff();
    clearScrollHandoffReset();
    clearHandoffFrameReset();
    scrollHandoffProgress = 0;
    handoffFrameOrigin = null;
    homeMain.classList.remove(
      "is-handoff-preview",
      "is-handoff-resetting",
      "is-wheel-handoff",
      "is-navigating-product",
    );
    homeMain.style.removeProperty("--handoff-frame-width");
    homeMain.style.removeProperty("--handoff-frame-height");
    homeMain.removeAttribute("aria-busy");

    if (activeRecord) {
      activeRecord.scrollCue.style.setProperty(
        "--scroll-handoff-progress",
        "0",
      );
    }

    if (productStatus) {
      productStatus.textContent = "";
    }

    if (directoryReturn) {
      armDirectoryReturnGuard();
    }
  });

  window.addEventListener("pagehide", () => {
    if (!activeRecord || !window.history.state?.kaizoshaReturn) {
      return;
    }

    window.history.replaceState(
      saveDirectoryReturnState({
        product: activeRecord.cell.dataset.productName,
        slot: activeRecord.cell.dataset.productSlot,
        scroll: activeRecord.content.scrollTop,
      }),
      "",
      window.location.href,
    );
  });

  productGrid.addEventListener("focusout", () => {
    const record = activeRecord;

    window.requestAnimationFrame(() => {
      if (
        record &&
        activeRecord === record &&
        !record.cell.contains(document.activeElement)
      ) {
        deactivateProduct();
      }
    });
  });

  homeMain.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeRecord && !isNavigatingToProduct) {
      event.preventDefault();
      deactivateProduct({ focus: true, announce: true });
    }
  });

  const sourceArrangement = cellRecords.map((record) =>
    record.nameLink.textContent.trim(),
  );
  const createReturnArrangement = () => {
    const arrangement = [...sourceArrangement];
    const targetIndex = cellRecords.findIndex(
      (record) => record.cell.dataset.productSlot === directoryReturn?.slot,
    );
    const sourceIndex = arrangement.indexOf(directoryReturn?.product);

    if (targetIndex < 0) {
      return arrangement;
    }

    if (sourceIndex >= 0) {
      [arrangement[targetIndex], arrangement[sourceIndex]] = [
        arrangement[sourceIndex],
        arrangement[targetIndex],
      ];
    } else if (directoryReturn?.product) {
      arrangement[targetIndex] = directoryReturn.product;
    }

    return arrangement;
  };
  const initialArrangement = directoryReturn
    ? createReturnArrangement()
    : createArrangement(sourceArrangement, [], 0);
  const arrangementHistory = [initialArrangement];
  let historyIndex = 0;

  const render = (
    announce = false,
    { activateName = null, animate = true } = {},
  ) => {
    deactivateProduct({ immediate: true });

    cellRecords.forEach((record, index) => {
      const product = productsByName.get(
        arrangementHistory[historyIndex][index],
      );

      if (product) {
        renderCell(record, product);
      }
    });

    if (activateName) {
      const record = cellRecords.find(
        (candidate) => candidate.cell.dataset.productName === activateName,
      );

      if (record) {
        activateProduct(record);
      }
    }

    if (announce && productStatus) {
      productStatus.textContent = `Products shown: ${arrangementHistory[
        historyIndex
      ].join(", ")}.`;
    }

    productGrid.classList.remove("is-updating");

    if (animate) {
      void productGrid.offsetWidth;
      productGrid.classList.add("is-updating");
    }
  };

  previousButton.addEventListener("click", () => {
    if (historyIndex > 0) {
      historyIndex -= 1;
    } else {
      arrangementHistory.unshift(
        createArrangement(
          arrangementHistory[0],
          arrangementHistory,
          0,
        ),
      );
    }

    render(true);
  });

  nextButton.addEventListener("click", () => {
    if (historyIndex < arrangementHistory.length - 1) {
      historyIndex += 1;
    } else {
      arrangementHistory.push(
        createArrangement(
          arrangementHistory[historyIndex],
          arrangementHistory,
          historyIndex,
        ),
      );
      historyIndex += 1;
    }

    render(true);
  });

  controls.hidden = false;

  if (directoryReturn) {
    armDirectoryReturnGuard(650);
    render(false, {
      activateName: directoryReturn.product,
      animate: false,
    });

    const returnedRecord = cellRecords.find(
      (record) =>
        record.cell.dataset.productName === directoryReturn.product &&
        record.cell.dataset.productSlot === directoryReturn.slot,
    );
    const restoreScroll = () => {
      if (returnedRecord) {
        returnedRecord.content.scrollTop = directoryReturn.scroll;
      }
    };

    returnedRecord?.cell.classList.add("is-directory-return-origin");
    restoreScroll();
    window.requestAnimationFrame(restoreScroll);

    const cleanUrl = new URL(window.location.href);

    cleanUrl.searchParams.delete("handoff");
    cleanUrl.searchParams.delete("product");
    cleanUrl.searchParams.delete("slot");
    cleanUrl.searchParams.delete("scroll");

    const remainingQuery = cleanUrl.searchParams.toString();

    window.history.replaceState(
      saveDirectoryReturnState(directoryReturn),
      "",
      `${cleanUrl.pathname}${remainingQuery ? `?${remainingQuery}` : ""}${cleanUrl.hash}`,
    );

    void homeMain.offsetHeight;
    document.documentElement.classList.remove("directory-return-booting");
    isRestoringDirectoryReturn = false;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        homeMain.classList.remove("is-directory-return");
      });
    });
  } else {
    render();

    if (hasDirectoryReturnQuery) {
      const cleanUrl = new URL(window.location.href);
      const state = getMergedHistoryState();

      cleanUrl.searchParams.delete("handoff");
      cleanUrl.searchParams.delete("product");
      cleanUrl.searchParams.delete("slot");
      cleanUrl.searchParams.delete("scroll");
      delete state.kaizoshaReturn;

      const remainingQuery = cleanUrl.searchParams.toString();

      window.history.replaceState(
        state,
        "",
        `${cleanUrl.pathname}${remainingQuery ? `?${remainingQuery}` : ""}${cleanUrl.hash}`,
      );
    }

    document.documentElement.classList.remove("directory-return-booting");
  }
})();
