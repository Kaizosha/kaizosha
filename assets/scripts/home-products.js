(() => {
  "use strict";

  const intro = document.querySelector("[data-home-intro]");
  const introClose = intro?.querySelector("[data-home-intro-close]");
  const introTitle = intro?.querySelector("[data-home-intro-title]");
  const introOpen = document.querySelector("[data-home-intro-open]");

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

  if (!productGrid || !controls || !previousButton || !nextButton) {
    return;
  }

  const cells = Array.from(productGrid.querySelectorAll(".product-cell__name"));
  const productLinks = new Map(
    cells.map((cell) => [cell.textContent.trim(), cell.href]),
  );
  let products = [];

  try {
    products = JSON.parse(productGrid.dataset.products);
  } catch {
    products = [];
  }

  products = Array.from(
    new Set(
      products
        .filter((product) => typeof product === "string")
        .map((product) => product.trim())
        .filter((product) => product && productLinks.has(product)),
    ),
  );

  if (!cells.length || !products.length) {
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
    if (products.length >= cells.length) {
      return shuffle(products).slice(0, cells.length);
    }

    const candidate = [];

    while (candidate.length < cells.length) {
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

    return candidate.slice(0, cells.length);
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

  const sourceArrangement = cells.map((cell) => cell.textContent.trim());
  const history = [createArrangement(sourceArrangement, [], 0)];
  let historyIndex = 0;

  const render = (announce = false) => {
    cells.forEach((cell, index) => {
      const product = history[historyIndex][index];

      cell.textContent = product;
      cell.href = productLinks.get(product);
      cell.setAttribute(
        "aria-label",
        `View ${product} on GitHub (opens in a new tab)`,
      );
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
