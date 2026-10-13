import test from "node:test";
import assert from "node:assert/strict";
import * as kit from "./kit/iso-kit.mjs";

const apps = {
  together: { app: "Together", words: ["Source", "Translation", "Coast walk"] },
  sekai: { app: "Sekai", words: ["Presentation", "Density", "Natural Earth"] },
  hush: { app: "Hush", words: ["Chat", "My models", "Runtime", "Message Hush"] },
  morph: { app: "Morph", words: ["Morph", "Auto", "Edit", "Undo", "Keep"] },
  modscan: { app: "ModScan", words: ["MODSCAN", "NODE_MODULES", "STATUS", "PROJECT", "PATH", "SIZE", "MODIFIED"] }
};

for (const [id, expected] of Object.entries(apps)) {
  test(`${expected.app} model has its actual interface identity and workflow`, async () => {
    const { buildModel } = await import(`./models/${id}.mjs`);
    const scene = buildModel(kit);
    assert.equal(scene.identity?.app, expected.app, "The model must identify the native app, not an unrelated apparatus");
    assert.match(scene.screen, new RegExp(`data-app-name="${expected.app}"`));
    for (const word of expected.words) assert.equal(scene.screen.includes(word), true, `${expected.app} is missing its ${word} interface`);
    assert.equal(scene.identity.sources.length > 0, true);
    for (const region of scene.identity.regions) assert.equal(scene.screen.includes(`data-app-region="${region}"`), true);
    assert.doesNotMatch(scene.body + scene.screen, /\s(?:style|on\w+)\s*=/);
    assert.equal(new Set(scene.parts).size, scene.parts.length);
  });
}
