import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const shots = join(workspace, ".audit/anatomy-shots");
mkdirSync(shots, { recursive: true });
const ids = ["together", "sekai", "hush", "morph", "modscan"];
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };
const servers = [];
const browser = await chromium.launch({ headless: true });

async function verifyBehavior(page, id) {
  const model = page.locator("[data-working-model]");
  const action = name => model.locator(`[data-model-action="${name}"]`);
  const output = () => model.locator("[data-model-readout]").textContent();
  const phase = () => model.getAttribute("data-model-phase");
  const reset = () => action("reset").click();
  if (id === "together") {
    assert.equal(await action("play").isDisabled(), true);
    await action("time").focus();
    await action("time").press("End");
    assert.match(await output(), /12\.0 \/ 12 s/);
    await action("time").press("Home");
    assert.match(await output(), /0\.0 \/ 12 s/);
    await action("translation").selectOption("es");
    assert.match(await output(), /Spanish: Bienvenido a la mesa\./);
    assert.notEqual(await model.locator('[data-model-part="translation"]').getAttribute("transform"), "translate(0.000 0.000)");
    await reset();
    assert.equal(await action("translation").inputValue(), "off");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await action("play").click();
    await page.waitForFunction(() => parseFloat(document.querySelector('[data-model-value="time"]').textContent) > 0.1);
    await action("play").click();
    const paused = await output();
    await page.waitForTimeout(250);
    assert.equal(await output(), paused, "paused transport stays still");
    await action("play").click();
    await page.locator("#product-title").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-working-model]').dataset.modelPhase === "paused");
    await model.scrollIntoViewIfNeeded();
    await reset();
  } else if (id === "sekai") {
    await action("particles").click();
    assert.equal(await action("particles").getAttribute("aria-pressed"), "false");
    assert.equal(await model.locator('[data-model-part="particles"]').first().isVisible(), false);
    assert.match(await output(), /2 of 3 layers visible/);
    await action("boundaries").focus();
    await action("boundaries").press("Space");
    await action("labels").click();
    assert.match(await output(), /0 of 3 layers visible/);
    await reset();
    assert.match(await output(), /3 of 3 layers visible/);
  } else if (id === "hush") {
    assert.equal(await action("ask").isDisabled(), true);
    await action("source").selectOption("capture");
    await action("review").click();
    assert.equal(await phase(), "reviewed");
    await action("ask").click();
    assert.match(await output(), /external provider/);
    await action("save").click();
    assert.equal(await phase(), "saved");
    assert.match(await output(), /local spool/);
    await action("source").selectOption("text");
    assert.equal(await phase(), "input");
    assert.equal(await action("save").isDisabled(), true);
    await reset();
    assert.equal(await action("source").inputValue(), "microphone");
  } else if (id === "morph") {
    assert.equal(await action("apply").isDisabled(), true);
    assert.equal(await action("undo").isDisabled(), true);
    await action("preview").click();
    assert.equal(await phase(), "preview");
    await action("apply").click();
    assert.equal(await phase(), "applied");
    assert.equal(await model.locator('[data-model-part="press"]').evaluateAll(nodes => nodes.every(node => node.getAttribute("transform") !== "translate(0.000 0.000)")), true);
    await action("undo").focus();
    await action("undo").press("Enter");
    assert.equal(await phase(), "original");
    assert.equal(await model.locator('[data-model-part="press"]').evaluateAll(nodes => nodes.every(node => node.getAttribute("transform") === "translate(0.000 0.000)")), true);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await action("preview").click();
    assert.equal(await action("apply").isDisabled(), true, "press waits for the preview carriage");
    await page.waitForFunction(() => !document.querySelector('[data-model-action="apply"]').disabled);
    await action("apply").click();
    assert.equal(await action("undo").isDisabled(), true, "undo waits for the press to settle");
    await page.waitForFunction(() => !document.querySelector('[data-model-action="undo"]').disabled);
    await action("undo").click();
    await page.waitForFunction(() => !document.querySelector('[data-model-action="preview"]').disabled);
  } else if (id === "modscan") {
    await action("filter").selectOption("large");
    assert.equal(await action("select").inputValue(), "1");
    await action("remove").click();
    assert.match(await output(), /3 sample projects active · 180 MB freed/);
    await action("remove").click();
    assert.match(await output(), /2 sample projects active · 500 MB freed/);
    assert.equal(await action("remove").isDisabled(), true);
    await action("filter").selectOption("all");
    await action("remove").click();
    await action("remove").click();
    assert.match(await output(), /0 sample projects active · 660 MB freed/);
    assert.equal(await action("remove").isDisabled(), true);
    await reset();
    assert.match(await output(), /4 sample projects active · 0 MB freed/);
  }
  assert.equal(await model.locator("[data-model-readout]").getAttribute("aria-live"), "off");
  console.log(`${id}: native controls, diagram state, guards and reset passed`);
}

function serve(root) {
  const csp = readFileSync(join(root, "_headers"), "utf8").match(/Content-Security-Policy: (.+)/)[1];
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!file.startsWith(root + "/") || !existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader("Content-Type", mime[extname(file)] || "application/octet-stream");
    res.setHeader("Content-Security-Policy", csp.replace("; upgrade-insecure-requests", ""));
    res.end(readFileSync(file));
  });
  servers.push(server);
  return new Promise(done => server.listen(0, "127.0.0.1", () => done(`http://127.0.0.1:${server.address().port}/`)));
}

try {
  for (const id of ids) {
    const url = await serve(join(workspace, id + "-web"));
    for (const width of [320, 390, 1024, 1440]) {
      const height = { 320: 720, 390: 844, 1024: 768, 1440: 900 }[width];
      const page = await browser.newPage({ viewport: { width, height }, colorScheme: "light", reducedMotion: "reduce" });
      const errors = [];
      page.on("pageerror", error => errors.push(String(error)));
      await page.route("https://**", route => route.abort());
      await page.goto(url, { waitUntil: "networkidle" });
      const model = page.locator("[data-working-model]");
      await model.scrollIntoViewIfNeeded();
      assert.equal(await model.count(), 1, `${id} model count`);
      assert.equal(await model.locator("[data-model-controls]").isVisible(), true, `${id} controls mounted`);
      const overflow = await page.evaluate(() => ({ page: document.documentElement.scrollWidth > innerWidth, model: (() => { const e = document.querySelector("[data-working-model]"); return e.scrollWidth > e.clientWidth + 1; })() }));
      assert.deepEqual(overflow, { page: false, model: false }, `${id} overflow at ${width}`);
      assert.deepEqual(errors, [], `${id} script errors at ${width}`);
      if (width === 390 || width === 1440) {
        await page.setViewportSize({ width, height: 1200 });
        await model.evaluate(element => element.scrollIntoView({ block: "center", behavior: "instant" }));
        await model.screenshot({ path: join(shots, `${id}-${width}-light.png`) });
      }
      if (width === 1440) {
        await page.emulateMedia({ colorScheme: "dark" });
        await model.screenshot({ path: join(shots, `${id}-1440-dark.png`) });
        await verifyBehavior(page, id);
      }
      await page.close();
    }
    const still = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    await still.goto(url);
    const staticModel = still.locator("[data-working-model]");
    await staticModel.scrollIntoViewIfNeeded();
    assert.equal(await staticModel.locator("svg").isVisible(), true, `${id} static SVG`);
    assert.equal(await staticModel.locator("[data-model-controls]").isVisible(), false, `${id} unavailable controls hidden`);
    await still.close();
    console.log(`${id}: four widths, two themes, CSP, static fallback passed`);
  }
} finally {
  await browser.close();
  for (const server of servers) await new Promise(done => server.close(done));
}
