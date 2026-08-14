# Kaizōsha Site Architecture

Kaizōsha is a static, multi-route company website. HTML owns content and
metadata, two small stylesheets own the interface, and two dependency-free
scripts provide optional pointer motion and homepage product arrangements.

## Public routes

| Route | Role | Page family |
| --- | --- | --- |
| `/` | Centered company identity | `directory` |
| `/terms` | Terms of Service | `document` |
| `/privacy` | Privacy Policy | `document` |
| `/contact` | Company contact channels | `document` |
| `/404.html` | Unknown-route recovery | `error` |

The creator identity remains in page metadata and structured data. It is not a
visible page, homepage link, app item, or legal-navigation entry.
The internal brand line is likewise non-visual and appears only in homepage
description metadata and the Organization `slogan` field.

## Shared layers

- `assets/styles/brand.css` defines the three-part Kaizōsha icon used on the
  homepage.
- `assets/styles/markdown.css` owns the drafting grid, framed shells,
  system themes, typography, markdown grammar, counters, interactions,
  accessibility states, and responsive rules for every route.
- `assets/scripts/site-motion.js` eases the background grid toward the pointer
  on fine-pointer devices. Pages do not depend on it for layout or content, and
  it disables itself for reduced-motion and touch contexts.
- `assets/scripts/home-products.js` runs only on the homepage. It fills the four
  cells from the catalog embedded in `data-products`, balances repeats when the
  catalog is shorter than the grid, and keeps a stable previous/next history.
  Candidate scoring strongly avoids the same product in the same recent slot
  and favors products that have appeared less recently as the catalog grows.
- `assets/media/social/kaizosha-social-card-crafted-2026.png` mirrors the
  framed README language for social previews without affecting page load.
- HTML `data-file` attributes provide the decorative file labels rendered by
  CSS.
- There are no frontend dependencies, runtime APIs, forms, databases, accounts,
  or authentication flows.

## Layout architecture

Document pages use one framed vertical flow:

```text
file bar → breadcrumb → full-width section bands → related links
```

Section copy uses a centered `96ch` maximum measure without a second border or
container. At 860px and below, the shell removes its outer side borders. At
640px and below, type, mark dimensions, data rows, and the footer adapt to the
smaller canvas. The homepage uses a fixed viewport frame containing a real 2×2
product grid, centered logo overlay, top arrangement controls, and bottom
status bar. Product cells stay equal on every viewport and are not links.

## Build and Cloudflare handoff

`tools/build-site.sh` recreates the ignored `dist/` directory from an explicit
allowlist. It copies the five public HTML routes, two stylesheets, both script
controllers, required metadata files, icon, crafted social card, and security
configuration. Development files are never copied into the public bundle.

`wrangler.jsonc` serves `dist/client/` through the Worker at
`dist/server/index.js`. The Worker handles HTTPS redirects, GET/HEAD method
restriction, versioned-asset caching, short HTML caching, and security headers.
Its Content Security Policy allows only same-origin deferred scripts, styles,
images, and the manifest. Connections, fonts, media, frames, forms, objects,
workers, inline scripts, and script attributes remain disabled.

The root `_headers` file mirrors static-response protections for Cloudflare
Pages-style asset delivery. The build copies it into `dist/client/`, so both
supported Cloudflare paths receive the restrictive policy and cache rules.

## Maintenance rules

1. Change public routes in `tools/build-site.sh` and `sitemap.xml` together.
2. Keep company and creator metadata in HTML even when it is not shown visually.
3. Keep all visible layout rules in `markdown.css` and icon geometry in
   `brand.css`.
4. Keep pointer motion isolated to `site-motion.js` and product arrangement
   logic isolated to `home-products.js`; source-order products remain visible
   and legal navigation remains usable when scripting is unavailable.
5. Update immutable asset query versions whenever asset contents change.
6. Keep the build allowlist explicit; never copy the whole repository.
7. Keep `_headers` and `tools/sites-static-worker.js` aligned.
8. Run `tools/build-site.sh` and inspect `dist/client/` before publishing.
