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
    rendering("ja-latn", "Latn", "ja", "ja-Latn", ["KAI", "ZŌ", "SHA"]),
    rendering("ja-ipa", "Latn", "ja", "ja-fonipa", ["kai", "zoː", "ɕa"]),
    rendering("ja-hira", "Hira", "ja", "ja-Hira", ["かい", "ぞう", "しゃ"]),
    rendering("ja-kana", "Kana", "ja", "ja-Kana", ["カイ", "ゾー", "シャ"]),
    rendering("ko-hang", "Hang", "ko", "ko-Hang", ["카이", "조", "샤"]),
    rendering("ru-cyrl", "Cyrl", "ru", "ru-Cyrl", ["КАЙ", "ДЗО", "ША"]),
    rendering("sr-cyrl", "Cyrl", "sr", "sr-Cyrl", ["КАЈ", "ЗО", "ША"]),
    rendering("mn-cyrl", "Cyrl", "mn", "mn-Cyrl", ["КАЙ", "ЗОО", "ША"]),
    rendering("ckb-arab", "Arab", "ckb", "ckb-Arab", ["کای", "زۆ", "شا"], "rtl"),
    rendering("he-hebr", "Hebr", "he", "he-Hebr", ["קַאי", "זוֹ", "שַׁה"], "rtl"),
    rendering("yi-hebr", "Hebr", "yi", "yi-Hebr", ["קײַ", "זאָ", "שאַ"], "rtl"),
    rendering("syr-syrc", "Syrc", "syr", "syr-Syrc", ["ܟܲܝ", "ܙܳ", "ܫܲ"], "rtl"),
    rendering("hi-deva", "Deva", "hi", "hi-Deva", ["काइ", "ज़ो", "शा"]),
    rendering("bn-beng", "Beng", "bn", "bn-Beng", ["কাই", "জ়ো", "শা"]),
    rendering("pa-guru", "Guru", "pa", "pa-Guru", ["ਕਾਇ", "ਜ਼ੋ", "ਸ਼ਾ"]),
    rendering("gu-gujr", "Gujr", "gu", "gu-Gujr", ["કાઇ", "ઝો", "શા"]),
    rendering("or-orya", "Orya", "or", "or-Orya", ["କାଇ", "ଜୋ", "ଶା"]),
    rendering("ta-taml", "Taml", "ta", "ta-Taml", ["கை", "ஜோ", "ஷ"]),
    rendering("te-telu", "Telu", "te", "te-Telu", ["కై", "జో", "ష"]),
    rendering("kn-knda", "Knda", "kn", "kn-Knda", ["ಕೈ", "ಜೋ", "ಶ"]),
    rendering("ml-mlym", "Mlym", "ml", "ml-Mlym", ["കൈ", "സോ", "ഷ"]),
    rendering("si-sinh", "Sinh", "si", "si-Sinh", ["කයි", "සෝ", "ෂ"]),
    rendering("th-thai", "Thai", "th", "th-Thai", ["ไค", "โซ", "ฉะ"]),
    rendering("lo-laoo", "Laoo", "lo", "lo-Laoo", ["ໄກ", "ໂຊ", "ຊະ"]),
    rendering("ka-geor", "Geor", "ka", "ka-Geor", ["კაი", "ზო", "შა"]),
    rendering("hy-armn", "Armn", "hy", "hy-Armn", ["ԿԱՅ", "ԶՈ", "ՇԱ"]),
    rendering("el-grek", "Grek", "el", "el-Grek", ["ΚΑΪ", "ΖΟ", "ΣΑ"]),
    rendering("am-ethi", "Ethi", "am", "am-Ethi", ["ካይ", "ዞ", "ሻ"]),
    rendering("dv-thaa", "Thaa", "dv", "dv-Thaa", ["ކައި", "ޒޯ", "ޝަ"], "rtl"),
    rendering("zh-bopo", "Bopo", "zh", "zh-Bopo", ["ㄎㄞ", "ㄗㄛ", "ㄕㄚ"]),
    rendering("zh-hans", "Hans", "zh", "zh-Hans", ["凯", "邹", "沙"]),
    rendering("zh-hant", "Hant", "zh", "zh-Hant", ["凱", "鄒", "沙"]),
    rendering("bo-tibt", "Tibt", "bo", "bo-Tibt", ["ཀཻ", "ཟོ", "ཤ"]),
    rendering("nqo-nkoo", "Nkoo", "nqo", "nqo-Nkoo", ["ߞߊߌ", "ߖ߭ߏ", "ߛ߭ߊ"], "rtl"),
    rendering("zgh-tfng", "Tfng", "zgh", "zgh-Tfng", ["ⴽⴰⵉ", "ⵣⵧ", "ⵛⴰ"]),
    rendering("eo-latn", "Latn", "eo", "eo-Latn", ["KAJ", "ZO", "ŜA"]),
    rendering("cs-latn", "Latn", "cs", "cs-Latn", ["KAJ", "ZÓ", "ŠA"]),
    rendering("hu-latn", "Latn", "hu", "hu-Latn", ["KAJ", "ZÓ", "SA"]),
    rendering("tr-latn", "Latn", "tr", "tr-Latn", ["KAY", "ZO", "ŞA"]),
    rendering("ro-latn", "Latn", "ro", "ro-Latn", ["CAI", "ZO", "ȘA"]),
    rendering("pl-latn", "Latn", "pl", "pl-Latn", ["KAJ", "ZO", "SZA"]),
    rendering("sq-latn", "Latn", "sq", "sq-Latn", ["KAJ", "ZO", "SHA"]),
    rendering("en-brai", "Brai", "en", "en-Brai", ["⠅⠁⠊", "⠵⠕", "⠎⠓⠁"]),
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
