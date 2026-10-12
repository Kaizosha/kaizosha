# App working models

The generator adds one Anatomy explainer to each product site's about section.
The compiled SVG is part of the HTML. The sites load copied controller and
stylesheet files from their own origins. Production needs no frontend build.

To regenerate all five models from this repository, run:

```sh
node tools/anatomy/build.mjs
node tools/anatomy/build.mjs --check
```

The first command updates the sibling Together, Sekai, Hush, Morph, and ModScan
repositories. Review those changes in each repository before publishing.
The check command exits with an error when a generated file needs an update.

To verify the pages, install Playwright and its Chromium browser in your
development environment, then run:

```sh
node tools/anatomy/verify.mjs
```

Set `NODE_PATH` to your existing package directory if Playwright is installed
outside this repository. The check serves each site with its existing Content
Security Policy, checks four viewport widths, and verifies static SVG without
JavaScript. Screenshots are saved in the workspace's `.audit/anatomy-shots`.

The model registry owns the sample data and allowed actions. SVG parts have
`data-model-part` names and projected movement vectors. The shared controller
derives the readout and target poses from the same state. It moves those parts
with SVG attributes and stops work when the figure is hidden.

The diagrams are illustrative product explainers. They do not request device
permissions, send prompts, read files, or delete dependencies. ModScan's real
CLI deletion behavior remains documented on its product page.

The vendored [Anatomy](https://github.com/wheresryan22/anatomy) iso-kit is pinned
to commit `689dcf966e63d92be10a5d593c6e19e10acd4422`. Its MIT license is preserved
in `kit/LICENSE`. The kit runs only during generation. Product pages do not
download it or depend on a third-party renderer.
