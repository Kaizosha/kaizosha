import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import * as kit from "./kit/iso-kit.mjs";
import { config } from "./controls.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const company = resolve(here, "../..");
const workspace = resolve(company, "..");
const check = process.argv.includes("--check");
const start = "<!-- anatomy:model:start -->";
const end = "<!-- anatomy:model:end -->";
const escape = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
let stale = false;
const previews = [];
const media = ['assets/media/together-coast.mp4', 'assets/media/together-coast.svg'];
function mediaVersion(asset) {
  const source = join(company, asset);
  if (!existsSync(source)) throw new Error(`Missing canonical media: ${source}`);
  return createHash('sha256').update(readFileSync(source)).digest('hex').slice(0, 12);
}
function copyMedia(asset, root) {
  const target = join(root, asset);
  const source = join(company, asset);
  if (check) {
    if (!existsSync(target) || !readFileSync(target).equals(readFileSync(source))) {
      console.error(`Out of date: ${target}`);
      stale = true;
    }
  } else {
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(source, target);
  }
}


function emit(path, content) {
  if (check) {
    if (!existsSync(path) || readFileSync(path, "utf8") !== content) {
      console.error(`Out of date: ${path}`);
      stale = true;
    }
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

const assets = ["assets/styles/product-model.css", "assets/scripts/product-model.js"];
const content = Object.fromEntries(assets.map(asset => [asset, readFileSync(join(company, asset), "utf8")]));
const renderer = readFileSync(join(here, "globe-render.js"), "utf8").replace(/\nif \(typeof module[^\n]+\n?$/, "\n");
content[assets[1]] = readFileSync(join(here, "controller.js"), "utf8").replace("  /* SEKAI_GLOBE_RENDERER */", renderer);
emit(join(company, assets[1]), content[assets[1]]);
const versions = Object.fromEntries(assets.map(asset => [asset, createHash("sha256").update(content[asset]).digest("hex").slice(0, 12)]));

for (const [id, model] of Object.entries(config)) {
  const { buildModel } = await import(`./models/${id}.mjs`);
  const scene = buildModel(kit);
  if (id === 'together') for (const asset of media) {
    scene.screen = scene.screen.replace(`/${asset}`, `/${asset}?v=${mediaVersion(asset)}`);
  }
  if (!scene.parts.length || new Set(scene.parts).size !== scene.parts.length) throw new Error(`${id} needs unique, purposeful interface parts`);
  if (!scene.screen || !scene.kind || !scene.identity?.sources?.length || scene.identity.regions.length < 3) throw new Error(`${id} needs a source-grounded app screen`);
  if (!scene.screen.includes(`data-app-name="${scene.identity.app}"`)) throw new Error(`${id} does not identify its app on screen`);
  for (const region of scene.identity.regions) {
    if (!scene.screen.includes(`data-app-region="${region}"`)) throw new Error(`${id} is missing its ${region} interface region`);
  }
  if (/\s(?:style|on\w+)\s*=/.test(scene.body + scene.screen)) throw new Error(`${id} has a blocked inline attribute`);
  if (/\b(?:NaN|Infinity|undefined)\b/.test(scene.body)) throw new Error(`${id} has invalid geometry`);
  const figure = `${start}
              <figure class="product-model iso" id="${id}-model" data-working-model="${id}" data-no-translate aria-labelledby="${id}-model-title">
                <div class="model-heading"><span>FIG ${String(Object.keys(config).indexOf(id) + 1).padStart(2, "0")}</span><h3 id="${id}-model-title">${escape(model.title)}</h3></div>
                <div class="model-plate">
                  <div class="app-scene" data-app-kind="${escape(scene.kind)}">
                    <svg class="iso-svg app-housing" viewBox="0 0 640 400" preserveAspectRatio="none" aria-hidden="true"><title>${escape(scene.label)}</title>${scene.body}</svg>
                    <div class="app-screen" data-app-surface="${id}">${scene.screen}</div>
                  </div>
                  <div class="model-footer"><span class="model-hint">${escape(model.hint)}</span><output data-model-readout aria-live="off">${escape(model.initialReadout)}</output></div>
                </div>
                <div class="model-controls" data-model-controls role="group" aria-label="Try the ${escape(id)} model" hidden>${model.controls}</div>
                <p class="model-status" data-model-status aria-live="polite" aria-atomic="true"></p>
                <figcaption>${escape(model.caption)}</figcaption>
              </figure>
              ${end}`;
  previews.push(figure);
  const root = join(workspace, `${id}-web`);
  const index = join(root, "index.html");
  let html = readFileSync(index, "utf8");
  if (!html.includes("data-model-link")) {
    const explore = html.match(/<a class="product-cell__explore"[^>]*>[^<]*<\/a>/)?.[0];
    if (!explore) throw new Error(`${id} has no Explore action`);
    html = html.replace(explore, `${explore}\n                  <a href="#${id}-model" data-model-link>[ TRY THE MODEL ↓ ]</a>`);
  }
  if (html.includes(start)) {
    const from = html.indexOf(start);
    const to = html.indexOf(end, from) + end.length;
    html = html.slice(0, from) + figure + html.slice(to);
  } else {
    const from = html.indexOf('id="about"');
    const to = html.indexOf("</section>", from);
    if (from < 0 || to < 0) throw new Error(`${id} has no about section`);
    html = html.slice(0, to) + figure + "\n              " + html.slice(to);
  }
  if (id === 'together') for (const asset of media) copyMedia(asset, root);
  for (const asset of assets) {
    const isStyle = asset.endsWith(".css");
    const tag = isStyle
      ? `    <link rel="stylesheet" href="/${asset}?v=${versions[asset]}">`
      : `    <script src="/${asset}?v=${versions[asset]}" defer></script>`;
    const pattern = new RegExp(`^.*(?:href|src)="/${asset.replaceAll(".", "\\.")}[^"\\n]*"[^\\n]*\\n?`, "m");
    html = pattern.test(html) ? html.replace(pattern, tag + "\n") : html.replace("  </head>", tag + "\n  </head>");
    emit(join(root, asset), content[asset]);
  }
  emit(index, html);
  emit(join(here, "manifests", `${id}.json`), JSON.stringify({ product: id, identity: scene.identity, atlas: scene.atlas, parts: scene.parts, projection: scene.projection }, null, 2) + "\n");
  console.log(`${id}: ${scene.identity.app} screen${check ? " checked" : " generated"}`);
}

if (stale) process.exitCode = 1;

if (!check) {
  emit(join(workspace, ".audit/anatomy-preview.html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kaizōsha app working models</title>
<link rel="stylesheet" href="../kaizosha-web/assets/styles/markdown.css"><link rel="stylesheet" href="../kaizosha-web/assets/styles/product-model.css?v=${versions[assets[0]]}"><link rel="stylesheet" href="anatomy-preview.css"><script src="../kaizosha-web/assets/scripts/product-model.js?v=${versions[assets[1]]}" defer></script></head>
<body class="model-preview"><main class="preview-shell"><header><p>KAIZŌSHA / PRODUCT STUDIES</p><h1>App working models</h1><p>Interactive previews based on the actual app interfaces. Sample content stays in this browser.</p><nav aria-label="Working models">${Object.keys(config).map(id => `<a href="#${id}-model">${escape(id)}</a>`).join(" ")}</nav></header>${previews.join("\n")}</main></body></html>\n`);
  emit(join(workspace, ".audit/anatomy-preview.css"), `.model-preview { padding: clamp(1rem,4vw,3rem); background: var(--surface); color: var(--ink); }\n.preview-shell { max-width: 58rem; margin-inline: auto; }\n.preview-shell h1 { font-size: clamp(1.5rem,4vw,2.5rem); letter-spacing: -.04em; }\n.preview-shell header { padding-block: 1rem; border-bottom: 1px solid var(--line); }\n.preview-shell header p { line-height: 1.8; color: var(--ink-muted); }\n.preview-shell nav { display: flex; flex-wrap: wrap; gap: .5rem 1.25rem; }\n.preview-shell nav a { color: inherit; text-decoration: underline; text-underline-offset: .25em; }\n.preview-shell .product-model { padding-block: 2rem; border-bottom: 1px solid var(--line); scroll-margin-top: 1rem; }\n`);
}
