# App working models

The generator adds an interactive app preview to each product site's about
section. Each preview uses the app's native interface as its design source.
Anatomy draws the display housing. HTML keeps the screen's text and controls
readable at phone widths.

The previews show these app interfaces:

- Together's player, caption layers, language pills, and timeline.
- Sekai's globe and inspector, with land points and boundaries from its native
  atlas.
- Hush's Mac workspace, model picker, context card, conversation, and composer.
- Morph's Safari live editor beside an article, with Edit, Undo, and Keep.
- ModScan's terminal inventory, status rows, filters, and storage totals.

The models use sample content. Hush shows prerecorded responses, Morph edits a
sample article, and ModScan removes entries from a sample inventory. These
actions stay in the browser.

## Source files

`models/*.mjs` defines each screen, its Anatomy housing, and the native source
paths that informed its design. `manifests/*.json` records those paths and the
screen's named regions. `app-identity.test.mjs` checks that each model contains
its app name and recognizable interface regions.

`controller.js` owns the sample data, state transitions, and screen updates.
`controls.mjs` defines the controls outside each screen. `build.mjs` inserts
`globe-render.js` into the controller and writes
`assets/scripts/product-model.js`. Edit the source controller rather than its
compiled copy.

`assets/styles/product-model.css` is the shared stylesheet. The generator
copies the script and stylesheet to each product repository and embeds each
screen in its `index.html`. The sites load these assets from their own origins.
Production needs no frontend build. Without JavaScript, each screen remains
visible and the external sample controls stay hidden.

Together advances its timeline only after Play. Playback pauses when the model
leaves the viewport or the document becomes hidden. Reduced motion disables
automatic playback while keeping manual timeline controls available.

## Generate and verify

Run these commands from `kaizosha-web`:

```sh
node tools/anatomy/build.mjs
node tools/anatomy/build.mjs --check
node --test tools/anatomy/*.test.cjs tools/anatomy/*.test.mjs
```

The first command updates the sibling Together, Sekai, Hush, Morph, and ModScan
repositories and the workspace's `.audit/anatomy-preview.html` gallery. The
check command exits with an error when a generated file needs an update. The
tests verify app identity and the sample actions, including reset behavior.

To verify the rendered pages, install Playwright and its Chromium browser in
your development environment, then run:

```sh
node tools/anatomy/verify.mjs
```

Set `NODE_PATH` to your existing package directory if Playwright is installed
outside this repository. The check serves each site with its Content Security
Policy, tests sample interactions, and checks widths of 320, 390, 1024, and 1440
pixels. It also checks light and dark themes, reduced motion, overflow, script
errors, and the static fallback without JavaScript. Screenshots are saved in
the workspace's `.audit/anatomy-shots`.

## Sekai atlas data

`atlas-data.mjs` contains 4,096 land points in native atlas rank order and 4,094
coarse boundary segments. `atlas-source.json` records the source version,
hashes, sampling rule, and Natural Earth public domain credit.

To reproduce those files from the native Sekai atlas, pass its path as the
first argument:

```sh
node tools/anatomy/extract-atlas.mjs /path/to/SekaiWorld.sekaiatlas
node tools/anatomy/build.mjs
```

The extractor requires a version 1 Sekai atlas. An optional second argument
sets the output path for `atlas-data.mjs`. The extractor writes
`atlas-source.json` in the same directory. Product pages use the extracted
data embedded in their globe SVG and do not load the native atlas file.

## Anatomy version

The vendored [Anatomy](https://github.com/wheresryan22/anatomy) iso-kit is pinned
to commit `689dcf966e63d92be10a5d593c6e19e10acd4422`. Its MIT license is preserved
in `kit/LICENSE`. The kit runs only during generation. Product pages do not
download it or depend on a third-party renderer.
