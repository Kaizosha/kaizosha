(() => {
  "use strict";

  const intro = document.querySelector("[data-home-intro]");
  const introClose = intro?.querySelector("[data-home-intro-close]");
  const introTitle = intro?.querySelector("[data-home-intro-title]");
  const introOpen = document.querySelector("[data-home-intro-open]");
  let closeProductDetails = () => {};

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
    if (!intro || intro.open) {
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

  const cellRecords = Array.from(
    productGrid.querySelectorAll(".product-cell[data-product-slot]"),
  )
    .map((cell) => {
      const nameLink = cell.querySelector(".product-cell__name");
      const detail = cell.querySelector(".product-cell__detail");
      const eyebrow = cell.querySelector(".product-cell__eyebrow");
      const description = cell.querySelector(".product-cell__description");
      const meta = cell.querySelector(".product-cell__meta");
      const closeButton = cell.querySelector("[data-product-close]");
      const exploreLink = cell.querySelector(".product-cell__explore");

      if (
        !nameLink ||
        !detail ||
        !eyebrow ||
        !description ||
        !meta ||
        !closeButton ||
        !exploreLink
      ) {
        return null;
      }

      return {
        cell,
        nameLink,
        detail,
        eyebrow,
        description,
        meta,
        closeButton,
        exploreLink,
      };
    })
    .filter(Boolean);

  const catalog = cellRecords.map((record, index) => ({
    name: record.nameLink.textContent.trim(),
    url: record.nameLink.href,
    description: record.description.textContent.trim(),
    meta: record.meta.textContent.trim(),
    sequence: String(index + 1).padStart(2, "0"),
  }));
  const productsByName = new Map(
    catalog.map((product) => [product.name, product]),
  );
  const products = Array.from(productsByName.keys());

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
  let activeRecord = null;
  let suppressFocusActivation = false;

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
      return;
    }

    const timer = window.setTimeout(() => {
      if (activeRecord !== record) {
        record.detail.hidden = true;
      }

      detailHideTimers.delete(record);
    }, 420);

    detailHideTimers.set(record, timer);
  };

  const deactivateProduct = ({
    focus = false,
    immediate = false,
    announce = false,
  } = {}) => {
    const record = activeRecord;

    if (!record) {
      return;
    }

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
    if (intro?.open || activeRecord === record) {
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
    record.cell.dataset.productName = product.name;
    record.nameLink.textContent = product.name;
    record.nameLink.href = product.url;
    record.nameLink.setAttribute(
      "aria-label",
      `View ${product.name} on GitHub (opens in a new tab)`,
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
      `Explore ${product.name} on GitHub (opens in a new tab)`,
    );
    record.detail.setAttribute("aria-hidden", "true");
    record.detail.hidden = true;
  };

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
      !activeRecord.cell.contains(document.activeElement)
    ) {
      deactivateProduct();
    }
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
    if (event.key === "Escape" && activeRecord) {
      event.preventDefault();
      deactivateProduct({ focus: true, announce: true });
    }
  });

  const sourceArrangement = cellRecords.map((record) =>
    record.nameLink.textContent.trim(),
  );
  const history = [createArrangement(sourceArrangement, [], 0)];
  let historyIndex = 0;

  const render = (announce = false) => {
    deactivateProduct({ immediate: true });

    cellRecords.forEach((record, index) => {
      const product = productsByName.get(history[historyIndex][index]);

      if (product) {
        renderCell(record, product);
      }
    });

    if (announce && productStatus) {
      productStatus.textContent = `Products shown: ${history[historyIndex].join(", ")}.`;
    }

    productGrid.classList.remove("is-updating");
    void productGrid.offsetWidth;
    productGrid.classList.add("is-updating");
  };

  previousButton.addEventListener("click", () => {
    if (historyIndex > 0) {
      historyIndex -= 1;
    } else {
      history.unshift(createArrangement(history[0], history, 0));
    }

    render(true);
  });

  nextButton.addEventListener("click", () => {
    if (historyIndex < history.length - 1) {
      historyIndex += 1;
    } else {
      history.push(
        createArrangement(history[historyIndex], history, historyIndex),
      );
      historyIndex += 1;
    }

    render(true);
  });

  controls.hidden = false;
  render();
})();
