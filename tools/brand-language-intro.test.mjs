import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(
  new URL("../assets/scripts/brand-language-intro.js", import.meta.url),
  "utf8",
);

const renderingPattern =
  /rendering\("([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)", \["([^"]+)", "([^"]+)", "([^"]+)"\](?:, "(rtl)")?\),/gu;

const renderings = [...source.matchAll(renderingPattern)].map((match) => ({
  id: match[1],
  script: match[2],
  language: match[3],
  lang: match[4],
  units: match.slice(5, 8),
  direction: match[8] ?? "ltr",
}));

const scheduledLanguages = [
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
];

test("catalog contains only the 22 scheduled Indian languages and Japanese", () => {
  assert.equal(renderings.length, 25);
  assert.equal(new Set(renderings.map(({ id }) => id)).size, 25);
  assert.deepEqual(
    new Set(renderings.map(({ language }) => language)),
    new Set([...scheduledLanguages, "ja"]),
  );
  assert.equal(new Set(renderings.map(({ script }) => script)).size, 15);
  assert.deepEqual(
    renderings.filter(({ language }) => language === "ja").map(({ id }) => id),
    ["ja-hira", "ja-kana", "ja-jpan"],
  );
});

test("renderings have valid locale metadata, direction and normalized units", () => {
  for (const rendering of renderings) {
    const locale = new Intl.Locale(rendering.lang);

    assert.equal(locale.language, rendering.language, rendering.id);
    assert.equal(locale.region, rendering.language === "ja" ? "JP" : "IN");
    assert.equal(
      rendering.direction,
      rendering.script === "Arab" ? "rtl" : "ltr",
      rendering.id,
    );
    assert.equal(rendering.units.length, 3, rendering.id);

    for (const unit of rendering.units) {
      assert(unit.length > 0, rendering.id);
      assert.equal(unit, unit.normalize("NFC"), rendering.id);
    }
  }
});

test("every animated mark keeps three distinct allowed languages and scripts", () => {
  const timers = new Map();
  let timerId = 0;
  let seed = 17;

  const glyphs = Array.from({ length: 3 }, () => ({
    dataset: {},
    dir: "ltr",
    lang: "",
    parentElement: { getBoundingClientRect: () => ({ width: 120 }) },
    textContent: "",
    animate: () => ({ cancel() {} }),
    getBoundingClientRect() {
      return { width: Array.from(this.textContent).length * 12 };
    },
  }));
  const mark = {
    dataset: {},
    querySelectorAll: () => glyphs,
  };
  const media = { matches: false, addEventListener() {} };
  const window = {
    addEventListener() {},
    clearTimeout(id) {
      timers.delete(id);
    },
    matchMedia: () => media,
    setTimeout(callback) {
      timerId += 1;
      timers.set(timerId, callback);
      return timerId;
    },
  };
  const document = {
    addEventListener() {},
    body: { dataset: {} },
    querySelectorAll: () => [mark],
    visibilityState: "visible",
  };
  const random = Object.create(Math);
  random.random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };

  vm.runInNewContext(source, {
    Array,
    document,
    Math: random,
    Object,
    Set,
    Uint32Array,
    WeakMap,
    window,
  });

  const allowed = new Set([...scheduledLanguages, "ja"]);
  const verify = () => {
    const languages = glyphs.map(({ lang }) => new Intl.Locale(lang).language);
    const scripts = glyphs.map(({ dataset }) => dataset.brandScript);

    assert.equal(new Set(languages).size, 3);
    assert.equal(new Set(scripts).size, 3);
    languages.forEach((language) => assert(allowed.has(language), language));
  };

  assert.equal(mark.dataset.languagePoolSize, "25");
  verify();

  for (let index = 0; index < 500; index += 1) {
    const next = timers.entries().next().value;
    assert(next, `missing timer at transition ${index}`);
    timers.delete(next[0]);
    next[1]();
    verify();
  }
});
