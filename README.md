# Kaizōsha website

The dependency-free static company website for Kaizōsha. HTML owns content and
metadata, CSS owns the interface, and small plain-JavaScript controllers provide
progressive enhancement.

## Local preview

```sh
python3 tools/dev-server.py 5173
```

## Production build

```sh
./tools/build-site.sh
```

The build creates an ignored `dist/` directory containing the exact public
allowlist and a Cloudflare Worker entrypoint.

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

Synchronize those files to a sibling product repository with:

```sh
./tools/sync-shared-design.sh ../together-web
```

Use `--check` in place of synchronization to verify that a product site has not
drifted from the shared core.
