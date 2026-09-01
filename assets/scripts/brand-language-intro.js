(() => {
  "use strict";

  const rendering = (
    id,
    script,
    language,
    lang,
    units,
    direction = "ltr",
  ) => Object.freeze({ id, script, language, lang, units, direction });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const renderings = Object.freeze([
    rendering("as-beng", "Beng", "as", "as-Beng-IN", ["কাই", "জো", "শা"]),
    rendering("bn-beng", "Beng", "bn", "bn-Beng-IN", ["কাই", "জ়ো", "শা"]),
    rendering("brx-deva", "Deva", "brx", "brx-Deva-IN", ["काइ", "जो", "सा"]),
    rendering("doi-deva", "Deva", "doi", "doi-Deva-IN", ["काइ", "ज़ो", "शा"]),
    rendering("gu-gujr", "Gujr", "gu", "gu-Gujr-IN", ["કાઇ", "ઝો", "શા"]),
    rendering("hi-deva", "Deva", "hi", "hi-Deva-IN", ["काइ", "ज़ो", "शा"]),
    rendering("kn-knda", "Knda", "kn", "kn-Knda-IN", ["ಕೈ", "ಜೋ", "ಶ"]),
    rendering("ks-arab", "Arab", "ks", "ks-Arab-IN", ["کای", "زو", "شا"], "rtl"),
    rendering("kok-deva", "Deva", "kok", "kok-Deva-IN", ["काइ", "ज़ो", "शा"]),
    rendering("ml-mlym", "Mlym", "ml", "ml-Mlym-IN", ["കൈ", "സോ", "ഷ"]),
    rendering("mni-mtei", "Mtei", "mni", "mni-Mtei-IN", ["ꯀꯩ", "ꯖꯣ", "ꯁꯥ"]),
    rendering("mr-deva", "Deva", "mr", "mr-Deva-IN", ["काइ", "झो", "शा"]),
    rendering("mai-deva", "Deva", "mai", "mai-Deva-IN", ["काइ", "जो", "शा"]),
    rendering("ne-deva", "Deva", "ne", "ne-Deva-IN", ["काइ", "जो", "शा"]),
    rendering("or-orya", "Orya", "or", "or-Orya-IN", ["କାଇ", "ଜୋ", "ଶା"]),
    rendering("pa-guru", "Guru", "pa", "pa-Guru-IN", ["ਕਾਇ", "ਜ਼ੋ", "ਸ਼ਾ"]),
    rendering("sa-deva", "Deva", "sa", "sa-Deva-IN", ["कै", "जो", "शा"]),
    rendering("sat-olck", "Olck", "sat", "sat-Olck-IN", ["ᱠᱟᱭ", "ᱡᱳ", "ᱥᱟ"]),
    rendering("sd-arab", "Arab", "sd", "sd-Arab-IN", ["ڪائي", "زو", "شا"], "rtl"),
    rendering("ta-taml", "Taml", "ta", "ta-Taml-IN", ["கை", "ஜோ", "ஷ"]),
    rendering("te-telu", "Telu", "te", "te-Telu-IN", ["కై", "జో", "ష"]),
    rendering("ur-arab", "Arab", "ur", "ur-Arab-IN", ["کائی", "زو", "شا"], "rtl"),
    rendering("ja-hira", "Hira", "ja", "ja-Hira-JP", ["かい", "ぞう", "しゃ"]),
    rendering("ja-kana", "Kana", "ja", "ja-Kana-JP", ["カイ", "ゾー", "シャ"]),
    rendering("ja-jpan", "Jpan", "ja", "ja-Jpan-JP", ["改", "造", "社"]),
  ]);

  const initialStagger = 110;
  const minimumCycleDelay = 440;
  const cycleDelayRange = 420;
  const transitionDuration = 180;
  const recentHistoryLimit = 64;
  const widthClasses = [undefined, "wide", "extra-wide", "ultra-wide"];
  const markRecords = [];

  let intersectionObserver;
  let isPageActive = true;

  const randomIndex = (upperBound) => {
    if (window.crypto?.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return value[0] % upperBound;
    }

    return Math.floor(Math.random() * upperBound);
  };

  const shuffled = (values) => {
    const copy = [...values];

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = randomIndex(index + 1);
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }

    return copy;
  };

  const setWidthClass = (glyph, widthClass) => {
    if (widthClass) {
      glyph.dataset.brandTokenWidth = widthClass;
    } else {
      delete glyph.dataset.brandTokenWidth;
    }
  };

  const fitToken = (glyph) => {
    const parent = glyph.parentElement;
    const canMeasure =
      parent?.getBoundingClientRect && glyph.getBoundingClientRect;

    if (canMeasure) {
      const availableWidth = parent.getBoundingClientRect().width;

      if (availableWidth > 0) {
        for (const widthClass of widthClasses) {
          setWidthClass(glyph, widthClass);

          if (glyph.getBoundingClientRect().width <= availableWidth + 0.5) {
            return;
          }
        }

        return;
      }
    }

    const length = Array.from(glyph.textContent.normalize("NFC")).length;
    setWidthClass(glyph, widthClasses[Math.min(length - 1, 3)]);
  };

  const tripleKey = (forms) => forms.map(({ id }) => id).join("|");

  const trimRecentHistory = (record, limit = recentHistoryLimit) => {
    while (record.recentKeys.length > limit) {
      record.recentKeySet.delete(record.recentKeys.shift());
    }
  };

  const rememberTriple = (record) => {
    const key = tripleKey(record.currentForms);

    if (record.recentKeySet.has(key)) {
      return;
    }

    record.recentKeys.push(key);
    record.recentKeySet.add(key);
    trimRecentHistory(record);
  };

  const initialForms = () => {
    const selected = [];
    const scripts = new Set();
    const languages = new Set();

    shuffled(renderings).some((form) => {
      if (scripts.has(form.script) || languages.has(form.language)) {
        return false;
      }

      selected.push(form);
      scripts.add(form.script);
      languages.add(form.language);
      return selected.length === 3;
    });

    return selected;
  };

  const showForm = (record, unitIndex, form, animated, delay = 0) => {
    const glyph = record.glyphs[unitIndex];

    record.activeAnimations.get(glyph)?.cancel();
    glyph.textContent = form.units[unitIndex].normalize("NFC");
    glyph.lang = form.lang;
    glyph.dir = form.direction;
    glyph.dataset.brandScript = form.script;
    fitToken(glyph);
    record.currentForms[unitIndex] = form;

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
        delay,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "backwards",
      },
    );

    if (animation) {
      record.activeAnimations.set(glyph, animation);
    }
  };

  const showInitialMix = (record) => {
    record.currentForms = initialForms();

    record.currentForms.forEach((form, unitIndex) => {
      showForm(
        record,
        unitIndex,
        form,
        !reduceMotion.matches && document.visibilityState !== "hidden",
        unitIndex * initialStagger,
      );
    });

    rememberTriple(record);
  };

  const nextPreferredUnit = (record) => {
    if (record.unitBag.length === 0) {
      record.unitBag = shuffled([0, 1, 2]);
    }

    return record.unitBag.pop();
  };

  const possibleTransitions = (record) =>
    [0, 1, 2].flatMap((unitIndex) => {
      const otherForms = record.currentForms.filter(
        (_form, index) => index !== unitIndex,
      );
      const usedScripts = new Set(otherForms.map(({ script }) => script));
      const usedLanguages = new Set(
        otherForms.map(({ language }) => language),
      );

      return renderings
        .filter(
          (form) =>
            form.id !== record.currentForms[unitIndex].id &&
            form.units[unitIndex].normalize("NFC") !==
              record.currentForms[unitIndex].units[unitIndex].normalize("NFC") &&
            !usedScripts.has(form.script) &&
            !usedLanguages.has(form.language),
        )
        .map((form) => {
          const proposed = [...record.currentForms];
          proposed[unitIndex] = form;
          return { unitIndex, form, key: tripleKey(proposed) };
        });
    });

  const nextTransition = (record) => {
    const transitions = possibleTransitions(record);
    trimRecentHistory(
      record,
      Math.min(recentHistoryLimit, transitions.length),
    );

    const unseen = transitions.filter(
      ({ key }) => !record.recentKeySet.has(key),
    );
    const preferredUnit = nextPreferredUnit(record);
    const preferred = unseen.filter(
      ({ unitIndex }) => unitIndex === preferredUnit,
    );
    const choices = preferred.length > 0 ? preferred : unseen;

    return choices[randomIndex(choices.length)];
  };

  const shouldCycle = (record) =>
    isPageActive &&
    document.visibilityState !== "hidden" &&
    document.body.dataset.motionPaused !== "true" &&
    !reduceMotion.matches &&
    record.isIntersecting;

  const pauseRecord = (record) => {
    if (record.timer !== undefined) {
      window.clearTimeout(record.timer);
      record.timer = undefined;
    }

    record.glyphs.forEach((glyph) => {
      record.activeAnimations.get(glyph)?.cancel();
    });
  };

  const scheduleRecord = (record, delay = minimumCycleDelay) => {
    if (record.timer !== undefined || !shouldCycle(record)) {
      return;
    }

    record.timer = window.setTimeout(() => {
      record.timer = undefined;

      if (!shouldCycle(record)) {
        return;
      }

      const transition = nextTransition(record);

      if (transition) {
        showForm(record, transition.unitIndex, transition.form, true);
        rememberTriple(record);
      }

      scheduleRecord(
        record,
        minimumCycleDelay + randomIndex(cycleDelayRange),
      );
    }, delay);
  };

  const syncRecord = (record) => {
    if (shouldCycle(record)) {
      scheduleRecord(record);
    } else {
      pauseRecord(record);
    }
  };

  const initializeMarks = () => {
    document.querySelectorAll(".brand-lockup__mark").forEach((mark) => {
      const glyphs = Array.from(
        mark.querySelectorAll(".brand-lockup__glyph"),
      ).slice(0, 3);

      if (glyphs.length !== 3) {
        return;
      }

      const record = {
        mark,
        glyphs,
        currentForms: [],
        unitBag: [],
        recentKeys: [],
        recentKeySet: new Set(),
        activeAnimations: new WeakMap(),
        isIntersecting: !("IntersectionObserver" in window),
        timer: undefined,
      };

      mark.dataset.languageCycleReady = "true";
      mark.dataset.languagePoolSize = String(renderings.length);
      markRecords.push(record);
      showInitialMix(record);
    });
  };

  const syncAllRecords = () => {
    markRecords.forEach(syncRecord);
  };

  initializeMarks();

  if ("IntersectionObserver" in window) {
    intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const record = markRecords.find(({ mark }) => mark === entry.target);

        if (!record) {
          return;
        }

        record.isIntersecting =
          entry.isIntersecting && entry.intersectionRatio > 0;
        syncRecord(record);
      });
    });

    markRecords.forEach(({ mark }) => intersectionObserver.observe(mark));
  }

  syncAllRecords();

  const onMotionPreferenceChange = () => {
    syncAllRecords();
  };

  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", onMotionPreferenceChange);
  } else {
    reduceMotion.addListener?.(onMotionPreferenceChange);
  }

  document.addEventListener("visibilitychange", syncAllRecords);
  document.addEventListener("kaizosha:motionchange", syncAllRecords);
  window.addEventListener("resize", () => {
    markRecords.forEach(({ glyphs }) => glyphs.forEach(fitToken));
  });

  window.addEventListener("pagehide", () => {
    isPageActive = false;
    markRecords.forEach(pauseRecord);
  });

  window.addEventListener("pageshow", () => {
    isPageActive = true;
    syncAllRecords();
  });
})();
