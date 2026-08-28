(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const tokenPools = [
    [
      { text: "KAI", lang: "ja-Latn" },
      { text: "カイ", lang: "ja" },
      { text: "카이", lang: "ko" },
      { text: "კაი", lang: "ka" },
      { text: "काइ", lang: "hi" },
      { text: "كاي", lang: "ar", direction: "rtl" },
      { text: "КАЙ", lang: "ru" },
    ],
    [
      { text: "ZŌ", lang: "ja-Latn" },
      { text: "ゾウ", lang: "ja" },
      { text: "조", lang: "ko" },
      { text: "ზო", lang: "ka" },
      { text: "ज़ो", lang: "hi" },
      { text: "زو", lang: "ar", direction: "rtl" },
      { text: "ДЗО", lang: "ru" },
    ],
    [
      { text: "SHA", lang: "ja-Latn" },
      { text: "シャ", lang: "ja" },
      { text: "샤", lang: "ko" },
      { text: "შა", lang: "ka" },
      { text: "शा", lang: "hi" },
      { text: "شا", lang: "ar", direction: "rtl" },
      { text: "ША", lang: "ru" },
    ],
  ];
  const initialDelay = 140;
  const unitStagger = 110;
  const minimumCycleDelay = 560;
  const cycleDelayRange = 520;
  const transitionDuration = 180;
  const scheduledChanges = new Set();
  const glyphRecords = [];
  const activeAnimations = new WeakMap();

  let isInitialized = false;
  let isCycling = false;

  const randomIndex = (upperBound) => {
    if (window.crypto?.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return value[0] % upperBound;
    }

    return Math.floor(Math.random() * upperBound);
  };

  const nextToken = (record) => {
    const pool = tokenPools[record.unitIndex];
    const choices = pool.filter((token) => token.text !== record.currentText);
    return choices[randomIndex(choices.length)];
  };

  const showToken = (record, token, animated = true) => {
    const { glyph } = record;

    activeAnimations.get(glyph)?.cancel();
    glyph.textContent = token.text;
    glyph.lang = token.lang;
    glyph.dir = token.direction ?? "ltr";
    glyph.dataset.brandTokenWidth = "wide";
    record.currentText = token.text;

    if (!animated) {
      return;
    }

    const animation = glyph.animate?.(
      [
        { opacity: 0, transform: "translateY(0.16em)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: transitionDuration,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    );

    if (animation) {
      activeAnimations.set(glyph, animation);
    }
  };

  const scheduleChange = (record, delay) => {
    const timer = window.setTimeout(() => {
      scheduledChanges.delete(timer);

      if (!isCycling) {
        return;
      }

      showToken(record, nextToken(record));
      scheduleChange(
        record,
        minimumCycleDelay + randomIndex(cycleDelayRange),
      );
    }, delay);

    scheduledChanges.add(timer);
  };

  const initializeMarks = () => {
    if (isInitialized) {
      return glyphRecords.length > 0;
    }

    isInitialized = true;

    document.querySelectorAll(".brand-lockup__mark").forEach((mark) => {
      const glyphs = Array.from(
        mark.querySelectorAll(".brand-lockup__glyph"),
      ).slice(0, tokenPools.length);

      if (glyphs.length !== tokenPools.length) {
        return;
      }

      mark.dataset.languageCycleReady = "true";

      glyphs.forEach((glyph, unitIndex) => {
        glyphRecords.push({
          glyph,
          unitIndex,
          currentText: glyph.textContent,
        });
      });
    });

    return glyphRecords.length > 0;
  };

  const pauseCycling = () => {
    isCycling = false;
    scheduledChanges.forEach((timer) => window.clearTimeout(timer));
    scheduledChanges.clear();
    glyphRecords.forEach(({ glyph }) => activeAnimations.get(glyph)?.cancel());
  };

  const showRandomStaticMix = () => {
    if (!initializeMarks()) {
      return;
    }

    glyphRecords.forEach((record) => {
      showToken(record, nextToken(record), false);
    });
  };

  const startCycling = () => {
    if (
      isCycling ||
      document.visibilityState === "hidden" ||
      !initializeMarks()
    ) {
      return;
    }

    if (reduceMotion.matches) {
      showRandomStaticMix();
      return;
    }

    isCycling = true;
    glyphRecords.forEach((record) => {
      scheduleChange(record, initialDelay + record.unitIndex * unitStagger);
    });
  };

  const syncMotionPreference = () => {
    pauseCycling();

    if (document.visibilityState === "hidden") {
      return;
    }

    if (reduceMotion.matches) {
      showRandomStaticMix();
    } else {
      startCycling();
    }
  };

  syncMotionPreference();

  reduceMotion.addEventListener?.("change", syncMotionPreference);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      pauseCycling();
    } else {
      syncMotionPreference();
    }
  });

  window.addEventListener("pagehide", pauseCycling);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      syncMotionPreference();
    }
  });
})();
