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

`i-web` is the new spatial-story sibling and participates in shared-design sync.
Its `i.kaizosha.org` catalog record is deliberately marked
`data-product-pending="deployment"` until the separate Cloudflare Worker and
custom domain are connected and verified. Pending records are omitted from the
public rotation, avoiding a broken destination. Remove that attribute after
verification. Story records use `data-product-kind="story"`, so their labels and
handoff are not treated as software products. The existing product navigation
ring is unchanged while the story domain is pending.
