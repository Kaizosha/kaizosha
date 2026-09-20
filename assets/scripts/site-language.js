(() => {
  "use strict";

  const translationEndpoint = "https://i.kaizosha.org/api/translate";
  const localeEndpoint = "https://i.kaizosha.org/api/locale";
  const languageCookie = "kaizosha_language";
  const countryCookie = "kaizosha_country";
  const cacheVersion = "v1";
  const cookieLifetime = 60 * 60 * 24 * 365;

  const language = (
    code,
    name,
    nativeName,
    locale,
    target,
    model = "indic",
    direction = "ltr",
  ) => Object.freeze({
    code,
    name,
    nativeName,
    locale,
    target,
    model,
    direction,
  });

  const languages = Object.freeze({
    en: language("en", "English", "English", "en", null, "identity"),
    as: language("as", "Assamese", "অসমীয়া", "as-IN", "asm_Beng"),
    bn: language("bn", "Bengali", "বাংলা", "bn-IN", "ben_Beng"),
    brx: language("brx", "Bodo", "बर’", "brx-IN", "brx_Deva"),
    doi: language("doi", "Dogri", "डोगरी", "doi-IN", "doi_Deva"),
    gu: language("gu", "Gujarati", "ગુજરાતી", "gu-IN", "guj_Gujr"),
    hi: language("hi", "Hindi", "हिन्दी", "hi-IN", "hin_Deva"),
    kn: language("kn", "Kannada", "ಕನ್ನಡ", "kn-IN", "kan_Knda"),
    ks: language("ks", "Kashmiri", "کٲشُر", "ks-Arab-IN", "kas_Arab", "indic", "rtl"),
    kok: language("kok", "Konkani", "कोंकणी", "kok-IN", "gom_Deva"),
    ml: language("ml", "Malayalam", "മലയാളം", "ml-IN", "mal_Mlym"),
    mni: language("mni", "Manipuri", "ꯃꯤꯇꯩ ꯂꯣꯟ", "mni-Mtei-IN", "mni_Mtei"),
    mr: language("mr", "Marathi", "मराठी", "mr-IN", "mar_Deva"),
    mai: language("mai", "Maithili", "मैथिली", "mai-IN", "mai_Deva"),
    ne: language("ne", "Nepali", "नेपाली", "ne-IN", "npi_Deva"),
    or: language("or", "Odia", "ଓଡ଼ିଆ", "or-IN", "ory_Orya"),
    pa: language("pa", "Punjabi", "ਪੰਜਾਬੀ", "pa-IN", "pan_Guru"),
    sa: language("sa", "Sanskrit", "संस्कृतम्", "sa-IN", "san_Deva"),
    sat: language("sat", "Santali", "ᱥᱟᱱᱛᱟᱲᱤ", "sat-Olck-IN", "sat_Olck"),
    sd: language("sd", "Sindhi", "سنڌي", "sd-Arab-IN", "snd_Arab", "indic", "rtl"),
    ta: language("ta", "Tamil", "தமிழ்", "ta-IN", "tam_Taml"),
    te: language("te", "Telugu", "తెలుగు", "te-IN", "tel_Telu"),
    ur: language("ur", "Urdu", "اردو", "ur-IN", "urd_Arab", "indic", "rtl"),
    ja: language("ja", "Japanese", "日本語", "ja-JP", "ja", "global"),
    es: language("es", "Spanish", "Español", "es", "es", "global"),
    fr: language("fr", "French", "Français", "fr", "fr", "global"),
    de: language("de", "German", "Deutsch", "de", "de", "global"),
    pt: language("pt", "Portuguese", "Português", "pt", "pt", "global"),
    zh: language("zh", "Chinese", "中文", "zh", "zh", "global"),
    ru: language("ru", "Russian", "Русский", "ru", "ru", "global"),
    ar: language("ar", "Arabic", "العربية", "ar", "ar", "global", "rtl"),
  });

  const indiaLanguages = Object.freeze([
    "en",
    "as",
    "bn",
    "brx",
    "doi",
    "gu",
    "hi",
    "kn",
    "ks",
    "kok",
    "ml",
    "mni",
    "mr",
    "mai",
    "ne",
    "or",
    "pa",
    "sa",
    "sat",
    "sd",
    "ta",
    "te",
    "ur",
  ]);

  const country = (code, name, nativeName, languageCodes) =>
    Object.freeze({ code, name, nativeName, languageCodes });

  const countries = Object.freeze({
    INTL: country("INTL", "International", "Worldwide", [
      "en",
      "ja",
      "es",
      "fr",
      "de",
      "pt",
      "zh",
      "ru",
      "ar",
      "hi",
    ]),
    IN: country("IN", "India", "भारत", indiaLanguages),
    JP: country("JP", "Japan", "日本", ["ja", "en"]),
    US: country("US", "United States", "United States", ["en", "es"]),
    CA: country("CA", "Canada", "Canada", ["en", "fr"]),
    MX: country("MX", "Mexico", "México", ["es", "en"]),
    BR: country("BR", "Brazil", "Brasil", ["pt", "en"]),
    GB: country("GB", "United Kingdom", "United Kingdom", ["en"]),
    FR: country("FR", "France", "France", ["fr", "en"]),
    DE: country("DE", "Germany", "Deutschland", ["de", "en"]),
    ES: country("ES", "Spain", "España", ["es", "en"]),
    PT: country("PT", "Portugal", "Portugal", ["pt", "en"]),
    CH: country("CH", "Switzerland", "Schweiz / Suisse", ["de", "fr", "en"]),
    CN: country("CN", "China", "中国", ["zh", "en"]),
    TW: country("TW", "Taiwan", "台灣", ["zh", "en"]),
    HK: country("HK", "Hong Kong", "香港", ["zh", "en"]),
    SG: country("SG", "Singapore", "Singapore", ["en", "zh", "ta"]),
    RU: country("RU", "Russia", "Россия", ["ru", "en"]),
    SA: country("SA", "Saudi Arabia", "السعودية", ["ar", "en"]),
    AE: country("AE", "United Arab Emirates", "الإمارات", ["ar", "en"]),
    EG: country("EG", "Egypt", "مصر", ["ar", "en"]),
    AU: country("AU", "Australia", "Australia", ["en"]),
    NZ: country("NZ", "New Zealand", "New Zealand", ["en"]),
  });

  const normalizeLanguage = (value) => {
    if (!value) {
      return undefined;
    }

    const normalized = String(value).toLowerCase().replaceAll("_", "-");
    const exact = Object.keys(languages).find(
      (code) => normalized === code || normalized.startsWith(`${code}-`),
    );

    return exact;
  };

  const normalizeCountry = (value) => {
    const code = String(value || "").toUpperCase();
    return countries[code] ? code : "INTL";
  };

  const browserCountry = () => {
    for (const localeName of navigator.languages || [navigator.language]) {
      try {
        const locale = new Intl.Locale(localeName);
        if (locale.region) {
          return normalizeCountry(locale.region);
        }
      } catch (_error) {
        // Ignore a malformed browser locale and continue to the next one.
      }
    }

    return "INTL";
  };

  const browserLanguage = () => {
    for (const localeName of navigator.languages || [navigator.language]) {
      const code = normalizeLanguage(localeName);
      if (code) {
        return code;
      }
    }

    return "en";
  };

  const readCookie = (name) => {
    const prefix = `${name}=`;
    const entry = document.cookie
      .split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith(prefix));
    return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined;
  };

  const writeCookie = (name, value) => {
    const host = window.location.hostname;
    const domain =
      host === "kaizosha.org" || host.endsWith(".kaizosha.org")
        ? "; Domain=.kaizosha.org"
        : "";
    const secure = window.location.protocol === "https:" ? "; Secure" : "";

    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${cookieLifetime}; SameSite=Lax${domain}${secure}`;

    try {
      window.localStorage.setItem(name, value);
    } catch (_error) {
      // Cookies remain the cross-site source of truth when storage is unavailable.
    }
  };

  const readPreference = (name) => {
    const cookieValue = readCookie(name);
    if (cookieValue) {
      return cookieValue;
    }

    try {
      return window.localStorage.getItem(name) || undefined;
    } catch (_error) {
      return undefined;
    }
  };

  const readTranslationCache = (code) => {
    try {
      const value = window.localStorage.getItem(
        `kaizosha_translation_${cacheVersion}_${code}`,
      );
      const parsed = value ? JSON.parse(value) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_error) {
      return {};
    }
  };

  const writeTranslationCache = (code, cache) => {
    try {
      const entries = Object.entries(cache).slice(-600);
      window.localStorage.setItem(
        `kaizosha_translation_${cacheVersion}_${code}`,
        JSON.stringify(Object.fromEntries(entries)),
      );
    } catch (_error) {
      // Translation still works when private browsing blocks local storage.
    }
  };

  const ignoredSelector = [
    "[data-language-ui]",
    "[data-no-translate]",
    "[translate='no']",
    ".brand-lockup",
    "script",
    "style",
    "noscript",
    "template",
    "svg",
    "canvas",
    "code",
    "pre",
    "kbd",
    "samp",
  ].join(",");

  const protectedNames = new Set([
    "i",
    "Hush",
    "Kaizosha",
    "Kaizōsha",
    "Metal",
    "ModScan",
    "Morph",
    "Sekai",
    "SwiftUI",
    "Together",
  ]);

  const canTranslateNode = (node) => {
    const parent = node.parentElement;
    const text = node.data?.trim();
    return (
      parent &&
      text &&
      /\p{L}/u.test(text) &&
      !protectedNames.has(text) &&
      !parent.closest(ignoredSelector)
    );
  };

  const splitWhitespace = (value) => {
    const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/u);
    return {
      before: match?.[1] || "",
      core: match?.[2] || value,
      after: match?.[3] || "",
    };
  };

  let currentLanguage = "en";
  let currentCountry = "INTL";
  let detectedCountry = "INTL";
  let observer;
  let refreshTimer;
  let translationRun = 0;
  let trigger;
  let dialog;
  let countrySelect;
  let languageSelect;
  let status;
  const records = new Map();

  const scanRecords = () => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) =>
          canTranslateNode(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT,
      },
    );
    const seen = new Set();
    let node = walker.nextNode();

    while (node) {
      seen.add(node);
      if (!records.has(node)) {
        const parts = splitWhitespace(node.data);
        records.set(node, {
          node,
          original: node.data,
          core: parts.core,
          before: parts.before,
          after: parts.after,
          translated: undefined,
        });
      }
      node = walker.nextNode();
    }

    records.forEach((_record, recordNode) => {
      if (!seen.has(recordNode) || !recordNode.isConnected) {
        records.delete(recordNode);
      }
    });
  };

  const restoreEnglish = () => {
    observer?.disconnect();
    records.forEach((record) => {
      record.node.data = record.original;
      record.translated = undefined;
    });
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    observeChanges();
  };

  const uniqueStrings = () => [
    ...new Set(
      [...records.values()]
        .map(({ core }) => core.trim())
        .filter((value) => value.length > 0),
    ),
  ];

  const makeBatches = (values) => {
    const batches = [];
    let batch = [];
    let length = 0;

    values.forEach((value) => {
      if (batch.length >= 32 || length + value.length > 10_000) {
        batches.push(batch);
        batch = [];
        length = 0;
      }
      batch.push(value);
      length += value.length;
    });

    if (batch.length > 0) {
      batches.push(batch);
    }

    return batches;
  };

  const fetchTranslations = async (code, values) => {
    const response = await fetch(translationEndpoint, {
      method: "POST",
      mode: "cors",
      cache: "no-store",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: code, texts: values }),
    });

    if (!response.ok) {
      throw new Error(`Translation request failed with ${response.status}`);
    }

    const payload = await response.json();
    if (
      !Array.isArray(payload.translations) ||
      payload.translations.length !== values.length
    ) {
      throw new Error("Translation response did not match the page content");
    }

    return payload.translations;
  };

  const updateTrigger = (busy = false) => {
    if (!trigger) {
      return;
    }

    const selected = languages[currentLanguage] || languages.en;
    trigger.textContent = busy ? "[ … ]" : `[ ${selected.code.toUpperCase()} ]`;
    trigger.setAttribute(
      "aria-label",
      busy
        ? `Translating this page to ${selected.name}`
        : `Language: ${selected.name}. Open language picker`,
    );
    trigger.title = busy ? "Translating…" : `${selected.name} / Language`;
  };

  const applyLanguage = async (code, { announce = true } = {}) => {
    const selected = languages[code] || languages.en;
    const run = ++translationRun;
    currentLanguage = selected.code;
    scanRecords();

    if (selected.code === "en") {
      restoreEnglish();
      updateTrigger();
      if (announce && status) {
        status.textContent = "Showing the original English edition.";
      }
      document.dispatchEvent(
        new CustomEvent("kaizosha:languagechange", {
          detail: { language: "en", country: currentCountry },
        }),
      );
      return;
    }

    updateTrigger(true);
    if (status) {
      status.textContent = `Translating to ${selected.name}…`;
    }

    const cache = readTranslationCache(selected.code);
    const originals = uniqueStrings();
    const missing = originals.filter((value) => !cache[value]);

    try {
      for (const batch of makeBatches(missing)) {
        const translated = await fetchTranslations(selected.code, batch);
        batch.forEach((value, index) => {
          cache[value] = translated[index];
        });
      }

      if (run !== translationRun) {
        return;
      }

      writeTranslationCache(selected.code, cache);
      observer?.disconnect();
      records.forEach((record) => {
        const translated = cache[record.core.trim()];
        if (!translated) {
          return;
        }
        record.translated = `${record.before}${translated}${record.after}`;
        record.node.data = record.translated;
      });
      document.documentElement.lang = selected.locale;
      document.documentElement.dir = selected.direction;
      observeChanges();
      updateTrigger();

      if (status) {
        status.textContent = `${selected.nativeName} is active across Kaizōsha sites.`;
      }
      document.dispatchEvent(
        new CustomEvent("kaizosha:languagechange", {
          detail: { language: selected.code, country: currentCountry },
        }),
      );
    } catch (_error) {
      if (run !== translationRun) {
        return;
      }
      currentLanguage = "en";
      restoreEnglish();
      updateTrigger();
      if (status) {
        status.textContent =
          "Translation is temporarily unavailable. The original English edition remains visible.";
      }
    }
  };

  const scheduleRefresh = (mutations = []) => {
    if (currentLanguage === "en") {
      return;
    }

    const relevant = mutations.filter(
      ({ target }) => !target.parentElement?.closest?.("[data-language-ui]"),
    );
    if (mutations.length > 0 && relevant.length === 0) {
      return;
    }

    relevant.forEach(({ type, target }) => {
      if (type !== "characterData" || !records.has(target)) {
        return;
      }

      const record = records.get(target);
      if (target.data === record.translated || target.data === record.original) {
        return;
      }

      const parts = splitWhitespace(target.data);
      record.original = target.data;
      record.core = parts.core;
      record.before = parts.before;
      record.after = parts.after;
      record.translated = undefined;
    });

    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      scanRecords();
      applyLanguage(currentLanguage, { announce: false });
    }, 180);
  };

  const observeChanges = () => {
    if (!observer || !document.body) {
      return;
    }
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  };

  const populateCountries = () => {
    countrySelect.replaceChildren();
    const automatic = document.createElement("option");
    automatic.value = "AUTO";
    automatic.textContent = `Automatic (${countries[detectedCountry].name})`;
    countrySelect.append(automatic);

    Object.values(countries).forEach((entry) => {
      const option = document.createElement("option");
      option.value = entry.code;
      option.textContent =
        entry.name === entry.nativeName
          ? entry.name
          : `${entry.name} / ${entry.nativeName}`;
      countrySelect.append(option);
    });

    countrySelect.value =
      readPreference(countryCookie) === "AUTO" ? "AUTO" : currentCountry;
  };

  const populateLanguages = (countryCode, selectedCode = currentLanguage) => {
    const resolvedCountry =
      countryCode === "AUTO" ? detectedCountry : normalizeCountry(countryCode);
    const suggested = countries[resolvedCountry].languageCodes;
    const remaining = Object.keys(languages).filter(
      (code) => !suggested.includes(code),
    );
    languageSelect.replaceChildren();

    const addGroup = (label, codes) => {
      const group = document.createElement("optgroup");
      group.label = label;
      codes.forEach((code) => {
        const entry = languages[code];
        const option = document.createElement("option");
        option.value = code;
        option.textContent =
          entry.name === entry.nativeName
            ? entry.name
            : `${entry.name} / ${entry.nativeName}`;
        group.append(option);
      });
      languageSelect.append(group);
    };

    addGroup(`Suggested for ${countries[resolvedCountry].name}`, suggested);
    addGroup("All supported languages", remaining);
    languageSelect.value = languages[selectedCode] ? selectedCode : "en";
  };

  const openDialog = () => {
    populateCountries();
    populateLanguages(countrySelect.value, currentLanguage);
    trigger.setAttribute("aria-expanded", "true");
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    countrySelect.focus();
  };

  const closeDialog = () => {
    trigger.setAttribute("aria-expanded", "false");
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    trigger.focus();
  };

  const createInterface = () => {
    trigger = document.createElement("button");
    trigger.className = "site-language-control";
    trigger.type = "button";
    trigger.dataset.languageUi = "";
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", "site-language-dialog");
    trigger.setAttribute("aria-expanded", "false");

    dialog = document.createElement("dialog");
    dialog.className = "site-language-dialog";
    dialog.id = "site-language-dialog";
    dialog.dataset.languageUi = "";
    dialog.setAttribute("aria-labelledby", "site-language-title");

    const form = document.createElement("form");
    form.method = "dialog";
    form.innerHTML = `
      <header class="site-language-dialog__bar">
        <span id="site-language-title">[ COUNTRY / LANGUAGE ]</span>
        <span aria-hidden="true">KAIZŌSHA</span>
      </header>
      <div class="site-language-dialog__body">
        <p class="site-language-dialog__intro">Choose a country for local suggestions, then choose the language you want across every Kaizōsha site.</p>
        <div class="site-language-dialog__fields">
          <label>Country / region<select name="country" data-language-country></select></label>
          <label>Language<select name="language" data-language-select></select></label>
        </div>
        <p class="site-language-dialog__note">Automatic translation is generated on Cloudflare. Product names and code stay original. English remains the source edition for legal text.</p>
        <p class="site-language-dialog__status" data-language-status role="status" aria-live="polite"></p>
      </div>
      <footer class="site-language-dialog__actions">
        <button type="button" data-language-cancel>[ CANCEL ]</button>
        <button type="submit">[ APPLY ]</button>
      </footer>
    `;
    dialog.append(form);
    document.body.append(trigger, dialog);

    countrySelect = dialog.querySelector("[data-language-country]");
    languageSelect = dialog.querySelector("[data-language-select]");
    status = dialog.querySelector("[data-language-status]");

    trigger.addEventListener("click", openDialog);
    dialog.querySelector("[data-language-cancel]").addEventListener(
      "click",
      closeDialog,
    );
    dialog.addEventListener("close", () => {
      trigger.setAttribute("aria-expanded", "false");
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        closeDialog();
      }
    });
    countrySelect.addEventListener("change", () => {
      populateLanguages(countrySelect.value, languageSelect.value);
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const countryPreference = countrySelect.value;
      currentCountry =
        countryPreference === "AUTO"
          ? detectedCountry
          : normalizeCountry(countryPreference);
      currentLanguage = normalizeLanguage(languageSelect.value) || "en";
      writeCookie(countryCookie, countryPreference);
      writeCookie(languageCookie, currentLanguage);
      closeDialog();
      applyLanguage(currentLanguage);
    });

    updateTrigger();
  };

  const detectCountry = async () => {
    const fallback = browserCountry();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2500);

    try {
      const response = await fetch(localeEndpoint, {
        mode: "cors",
        cache: "no-store",
        credentials: "omit",
        signal: controller.signal,
      });
      if (!response.ok) {
        return fallback;
      }
      const payload = await response.json();
      return normalizeCountry(payload.country);
    } catch (_error) {
      return fallback;
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const initialize = async () => {
    if (!document.body || document.querySelector("[data-language-ui]")) {
      return;
    }

    observer = new MutationObserver(scheduleRefresh);
    scanRecords();
    createInterface();
    observeChanges();

    const parameters = new URL(window.location.href).searchParams;
    const requestedLanguage = normalizeLanguage(parameters.get("lang"));
    const requestedCountry = parameters.get("country");
    if (requestedLanguage) {
      writeCookie(languageCookie, requestedLanguage);
    }
    if (requestedCountry) {
      writeCookie(countryCookie, normalizeCountry(requestedCountry));
    }

    detectedCountry = await detectCountry();
    const savedCountry = readPreference(countryCookie) || "AUTO";
    currentCountry =
      savedCountry === "AUTO"
        ? detectedCountry
        : normalizeCountry(savedCountry);
    currentLanguage =
      requestedLanguage ||
      normalizeLanguage(readPreference(languageCookie)) ||
      browserLanguage();

    updateTrigger();
    await applyLanguage(currentLanguage, { announce: false });
  };

  window.KaizoshaLanguage = Object.freeze({
    open: () => dialog && openDialog(),
    get currentCountry() {
      return currentCountry;
    },
    get currentLanguage() {
      return currentLanguage;
    },
    languagesForCountry: (code) => [
      ...countries[normalizeCountry(code)].languageCodes,
    ],
    supportedCountries: Object.freeze(Object.keys(countries)),
    supportedLanguages: Object.freeze(Object.keys(languages)),
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
