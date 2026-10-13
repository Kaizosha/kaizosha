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
  const model = page.locator('[data-working-model]');
  const surface = model.locator('[data-app-surface]');
  const action = name => model.locator(`[data-model-action="${name}"]`).first();
  const text = name => surface.locator(`[data-model-text="${name}"]`).first().textContent();
  const region = name => surface.locator(`[data-model-region="${name}"]`).first();
  const phase = () => model.getAttribute('data-model-phase');
  const reset = () => action('reset').click();
  assert.equal(await surface.getAttribute('data-app-surface'), id);
  if (id === 'together') {
    assert.equal(await action('play').isDisabled(), true);
    await action('time').focus();
    await action('time').press('End');
    assert.equal(await text('elapsed'), '0:12');
    assert.equal(await text('sourceCaption'), "Let's stay here a little longer.");
    await action('time').press('Home');
    await action('translation').selectOption('es');
    assert.equal(await region('translatedCaption').isVisible(), true);
    assert.equal(await text('translatedCaption'), 'El sendero sigue el agua.');
    await reset();
    assert.equal(await region('translatedCaption').isVisible(), false);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await surface.locator('[data-model-action="play"]').click();
    await page.waitForFunction(() => document.querySelector('[data-model-progress]').value > 0.1);
    await action('play').click();
    const paused = await model.locator('[data-model-readout]').textContent();
    await page.waitForTimeout(250);
    assert.equal(await model.locator('[data-model-readout]').textContent(), paused);
    await action('play').click();
    await page.locator('#product-title').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-working-model]').dataset.modelPhase === 'paused');
    await model.scrollIntoViewIfNeeded();
    await reset();
  } else if (id === 'sekai') {
    const particles = surface.locator('[data-globe-particles]');
    const original = await particles.getAttribute('d');
    assert.equal(original.length > 1000, true, 'Actual land geometry is rendered');
    await action('longitude').focus();
    await action('longitude').press('End');
    assert.notEqual(await particles.getAttribute('d'), original);
    await action('density').selectOption('256');
    assert.equal(await text('previewCount'), '256');
    await action('routes').click();
    assert.equal(await text('routes'), 'Off');
    await action('particles').click();
    assert.equal(await particles.getAttribute('d'), '');
    await reset();
    assert.equal(await particles.getAttribute('d'), original);
    assert.equal(await text('previewCount'), '4,096');
  } else if (id === 'hush') {
    assert.equal(await action('ask').isDisabled(), true);
    await action('source').selectOption('capture');
    await action('review').click();
    assert.equal(await phase(), 'reviewed');
    await surface.locator('[data-model-action="ask"]').click();
    assert.equal(await region('conversation').isVisible(), true);
    assert.match(await text('response'), /release checklist/);
    await action('save').click();
    assert.equal(await region('saved').isVisible(), true);
    await action('source').selectOption('microphone');
    assert.equal(await phase(), 'input');
    assert.equal(await region('conversation').isVisible(), false);
    await reset();
    assert.equal(await action('source').inputValue(), 'text');
  } else if (id === 'morph') {
    const original = await text('articleTitle');
    assert.equal(await action('undo').isDisabled(), true);
    await surface.locator('[data-model-action="edit"]').click();
    assert.equal(await phase(), 'draft');
    assert.equal(await text('articleTitle'), 'Walking the coast without a schedule');
    assert.equal(await region('editedSummary').isVisible(), true);
    assert.equal(await region('decision').isVisible(), true);
    await surface.locator('[data-model-action="undo"]').focus();
    await surface.locator('[data-model-action="undo"]').press('Enter');
    assert.equal(await phase(), 'original');
    assert.equal(await text('articleTitle'), original);
    assert.equal(await region('editedSummary').isVisible(), false);
    await action('edit').click();
    await action('keep').click();
    assert.equal(await phase(), 'kept');
    assert.equal(await text('articleTitle'), 'Walking the coast without a schedule');
    await model.locator('[data-model-controls] [data-model-action="undo"]').click();
    assert.equal(await text('articleTitle'), original);
  } else if (id === 'modscan') {
    assert.equal(await action('select').inputValue(), '2');
    assert.equal(await text('activeSize'), '660 MB');
    await action('remove').click();
    assert.equal(await text('activeCount'), '3');
    assert.equal(await text('activeSize'), '340 MB');
    assert.equal(await text('freedSize'), '320 MB');
    assert.equal(await surface.locator('[data-project-row="2"]').isVisible(), true);
    assert.equal(await surface.locator('[data-project-row="2"] [data-project-status]').textContent(), 'Deleted');
    assert.equal(await surface.locator('[data-project-row="2"]').evaluate(row => Number(getComputedStyle(row).opacity) < 1), true, 'Deleted rows are visibly muted');
    await action('filter').selectOption('deleted');
    assert.equal(await surface.locator('[data-project-row="2"]').isVisible(), true);
    assert.equal(await action('remove').isDisabled(), true);
    await action('filter').selectOption('all');
    for (const project of ['1', '3', '0']) {
      await action('select').selectOption(project);
      await action('remove').click();
    }
    assert.equal(await text('activeCount'), '0');
    assert.equal(await text('freedSize'), '660 MB');
    await action('filter').selectOption('active');
    assert.equal(await region('emptyState').isVisible(), true);
    await reset();
    assert.equal(await text('activeCount'), '4');
    assert.equal(await text('freedSize'), '0 MB');
  }
  assert.equal(await model.locator('[data-model-readout]').getAttribute('aria-live'), 'off');
  console.log(`${id}: visible app screen, native controls, content changes and reset passed`);
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
    assert.equal(await staticModel.locator(".app-housing").isVisible(), true, `${id} static housing`);
    assert.equal(await staticModel.locator("[data-model-controls]").isVisible(), false, `${id} unavailable controls hidden`);
    assert.equal(await staticModel.locator("[data-app-surface]").isVisible(), true, `${id} static app screen`);
    assert.equal(await staticModel.locator("[data-app-surface] button:not([disabled])").count(), 0, `${id} static actions disabled`);
    await still.close();
    console.log(`${id}: four widths, two themes, CSP, static fallback passed`);
  }
} finally {
  await browser.close();
  for (const server of servers) await new Promise(done => server.close(done));
}
