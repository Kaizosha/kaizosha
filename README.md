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
- `icon.png`
- `assets/styles/brand.css`
- `assets/styles/markdown.css`
- `assets/scripts/document-navigation.js`
- `assets/scripts/site-motion.js`

Synchronize those files to every known sibling product repository with:

```sh
./tools/sync-shared-design.sh
```

Pass one or more repository paths to target a subset, and use `--check` before
the paths to verify that product sites have not drifted from the shared core.
