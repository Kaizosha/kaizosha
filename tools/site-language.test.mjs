import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(
  new URL("../assets/scripts/site-language.js", import.meta.url),
  "utf8",
);

const listeners = new Map();
const document = {
  addEventListener(type, listener) {
    listeners.set(type, listener);
  },
  readyState: "loading",
};
const window = {};

vm.runInNewContext(source, {
  AbortController,
  CustomEvent,
  Intl,
  Map,
  MutationObserver: class {},
  Object,
  Set,
  URL,
  document,
  navigator: { language: "en-US", languages: ["en-US"] },
  window,
});

const api = window.KaizoshaLanguage;

test("shared language system exposes the complete Indian schedule plus Japanese", () => {
  const indian = api.languagesForCountry("IN");

  assert.equal(indian.length, 23);
  assert.equal(new Set(indian).size, 23);
  assert(indian.includes("en"));
  assert(indian.includes("sa"));
  assert(indian.includes("mni"));
  assert(indian.includes("sat"));
  assert.deepEqual(Array.from(api.languagesForCountry("JP")), ["ja", "en"]);
  assert.equal(api.supportedLanguages.length, 31);
});

test("country suggestions cover India, Japan and supported international regions", () => {
  for (const country of [
    "IN",
    "JP",
    "US",
    "CA",
    "MX",
    "BR",
    "GB",
    "FR",
    "DE",
    "ES",
    "PT",
    "CH",
    "CN",
    "TW",
    "HK",
    "SG",
    "RU",
    "SA",
    "AE",
    "EG",
    "AU",
    "NZ",
  ]) {
    assert(api.supportedCountries.includes(country), country);
    assert(api.languagesForCountry(country).length > 0, country);
  }

  assert.deepEqual(Array.from(api.languagesForCountry("not-a-country")), [
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
  ]);
});

test("initialization remains deferred until the page DOM is ready", () => {
  assert.equal(typeof listeners.get("DOMContentLoaded"), "function");
  assert.equal(api.currentLanguage, "en");
  assert.equal(api.currentCountry, "INTL");
});

test("client uses the shared translation and locale endpoints", () => {
  assert.match(source, /https:\/\/i\.kaizosha\.org\/api\/translate/);
  assert.match(source, /https:\/\/i\.kaizosha\.org\/api\/locale/);
  assert.match(source, /Domain=\.kaizosha\.org/);
  assert.match(source, /MutationObserver/);
});
