import test from "node:test";
import assert from "node:assert/strict";
import * as kit from "./kit/iso-kit.mjs";

const apps = {
  together: { app: "Together", kind: "tv", words: ["Source", "Translation", "video", "together-coast.mp4"] },
  sekai: { app: "Sekai", kind: "physical-globe", words: ["Presentation", "Density", "Natural Earth"] },
  hush: { app: "Hush", kind: "monitor", words: ["Seeing", "Listening", "Observation feed", "SAMPLE ACTIVITY", "Apple On-Device"] },
  morph: { app: "Morph", words: ["Morph", "Auto", "Edit", "Undo", "Keep"] },
  modscan: { app: "ModScan", words: ["MODSCAN", "NODE_MODULES", "STATUS", "PROJECT", "PATH", "SIZE", "MODIFIED"] }
};

for (const [id, expected] of Object.entries(apps)) {
  test(`${expected.app} model has its actual interface identity and workflow`, async () => {
    const { buildModel } = await import(`./models/${id}.mjs`);
    const scene = buildModel(kit);
    if (expected.kind) assert.equal(scene.kind, expected.kind);
    assert.equal(scene.identity?.app, expected.app, "The model must identify the native app, not an unrelated apparatus");
    assert.match(scene.screen, new RegExp(`data-app-name="${expected.app}"`));
    for (const word of expected.words) assert.equal(scene.screen.includes(word), true, `${expected.app} is missing its ${word} interface`);
    assert.equal(scene.identity.sources.length > 0, true);
    for (const region of scene.identity.regions) assert.equal(scene.screen.includes(`data-app-region="${region}"`), true);
    assert.doesNotMatch(scene.body + scene.screen, /\s(?:style|on\w+)\s*=/);
    assert.equal(new Set(scene.parts).size, scene.parts.length);
    if (id === "together") assert.match(scene.screen, /<video[^>]+muted[^>]+playsinline/);
    if (id === "sekai") { assert.match(scene.screen, /sekai-meridian/); assert.doesNotMatch(scene.screen, /sekai-inspector|sekai-windowbar/); }
    if (id === "hush") { assert.match(scene.screen, /hush-document/); assert.match(scene.screen, /hush-signals/); }
  });
}
