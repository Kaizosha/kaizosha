# Kaizōsha website

The dependency-free static company website for Kaizōsha. HTML owns content and
metadata, CSS owns the interface, and small plain-JavaScript controllers provide
progressive enhancement.

## Local preview

```sh
python3 tools/dev-server.py 5173
```

## Cloudflare Pages

The repository root is the deployable website. Connect this repository to a
Cloudflare Pages project with framework preset `None`, production branch
`main`, no build command, and build output directory `.`. Every push to `main`
publishes the committed static files directly; there is no generated output or
manual deployment command.

## Shared design

This repository is the source of truth for the design files shared by Kaizōsha
product sites:

- `BRAND.md`
- `DESIGN_SYSTEM.md`
- `icon.svg`
- `icon.png`
- `assets/styles/brand.css`
- `assets/styles/markdown.css`
- `assets/scripts/brand-language-intro.js`
- `assets/scripts/document-navigation.js`
- `assets/scripts/site-motion.js`

Synchronize those files to every known sibling product repository with:

```sh
./tools/sync-shared-design.sh
```

Pass one or more repository paths to target a subset, and use `--check` before
the paths to verify that product sites have not drifted from the shared core.

## Story catalog

`i-web` is the motion-manhwa sibling. Its visible directory record is marked
`data-product-kind="story"`, `data-product-sequence="06"`, and
`data-product-featured`, so it appears in the first arrangement on every visit.
Prev / Next still rotates through all six products and stories. Stable sequence
attributes keep labels independent of a tile's position.

Scrolling or activating Explore expands the frame and continues into `i` in the
same tab. The receiving card preserves the copy, slot, internal scroll position,
multilingual text mark, and story-specific top/bottom bars. Modified clicks keep
ordinary new-tab behavior. Further native scrolling reveals the manhwa.

`assets/styles/story-entry.css` is a matching two-site contract: keep the copy in
`i-web` identical when editing it. The ordinary shared-design sync deliberately
does not add this story-only enhancement to other product sites. No build or
deployment command was introduced.

Optional controller checks: `node --test tools/*.test.mjs`.
