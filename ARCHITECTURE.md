# Kaizōsha Site Architecture

Kaizōsha is a static, multi-route company website. HTML owns content and
metadata, two small stylesheets own the interface, and three dependency-free
scripts provide optional pointer motion, homepage product arrangements, and
document scroll context.

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
The brand line appears in the homepage company introduction, description
metadata, and the Organization `slogan` field.

## Shared layers

- `assets/styles/brand.css` defines the three-part Kaizōsha icon used on the
  homepage.
- `assets/styles/markdown.css` owns the drafting grid, framed shells,
  system themes, typography, markdown grammar, counters, interactions,
  accessibility states, and responsive rules for every route.
- `assets/scripts/site-motion.js` eases the background grid toward the pointer
  on fine-pointer devices. Pages do not depend on it for layout or content, and
  it disables itself for reduced-motion and touch contexts.
- `assets/scripts/home-products.js` runs only on the homepage. It closes the
  native modal company introduction with a reduced-motion-aware transition,
  restores focus when it closes, reopens it from the centered mark, fills the
  four cells from the source-order product catalog, keeps each name,
  description, metadata line, and GitHub repository paired while shuffling,
  announces user-requested arrangements, balances repeats when the catalog is
  shorter than the grid, and keeps a stable previous/next history. It also owns
  the expanded-product state for hover, keyboard focus, touch, Close, and
  Escape; CSS owns the geometry and transition.
  Candidate scoring strongly avoids the same product in the same recent slot
  and favors products that have appeared less recently as the catalog grows.
- `assets/scripts/document-navigation.js` runs only on document pages. A
  requestAnimationFrame-throttled scroll check marks the current section and
  the sticky state; layout and navigation remain functional without it.
- `assets/media/social/kaizosha-social-card-crafted-2026.png` mirrors the
  framed README language for social previews without affecting page load.
- HTML `data-file` attributes provide the decorative file labels rendered by
  CSS.
- Every indexable route has a canonical URL, unique title and description,
  page-specific social metadata, and JSON-LD. The homepage identifies the
  organization, while document pages add matching breadcrumb data.
- There are no frontend dependencies, runtime APIs, forms, databases, accounts,
  or authentication flows.

## Layout architecture

Document pages use one framed vertical flow:

```text
file bar → sticky back row → sticky current section → section copy → related links
```

Section copy uses a centered `96ch` maximum measure without a second border or
container. At 860px and below, the shell removes its outer side borders. At
640px and below, type, sticky row heights, mark dimensions, data rows, and the
footer adapt to the smaller canvas. Document pages keep balanced block gutters
at rest; on wider screens, the file bar, document navigation, and current
section form one continuous sticky stack beneath a fixed grid gutter. The
homepage uses a fixed viewport frame containing a real 2×2 product grid,
centered logo button, dismissible company introduction, top arrangement
controls, and bottom status bar. Product cells stay equal at rest. An active
cell grows from its physical quadrant by animating the shared column and row
tracks from `50% / 50%` to `100% / 0%`; it does not become a positioned overlay.
The other three cells are pushed and compressed toward the canvas edges while
the central logo scales toward the diagonally opposite corner—the direction in
which the selected cell expands—on the same timing curve. The active surface
inverts to the theme's foreground tone; its copy, rules, product-name label,
and actions reverse roles to remain legible in both system themes. Centered
content uses a broad reading measure, while narrow screens allow it to use the
full available width. Source-order product names remain direct repository links
when scripting is unavailable.

## Build and Cloudflare handoff

`tools/build-site.sh` recreates the ignored `dist/` directory from an explicit
allowlist. It copies the five public HTML routes, two stylesheets, all three
script controllers, required metadata files, icon, crafted social card, and
security configuration. Development files are never copied into the public
bundle.

`wrangler.jsonc` serves `dist/client/` through the Worker at
`dist/server/index.js`. The Worker handles HTTPS and canonical-route redirects,
GET/HEAD method restriction, versioned-asset caching, short HTML caching,
English content headers, no-index headers for missing pages, and security
headers.
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
4. Keep pointer motion isolated to `site-motion.js`, product arrangement logic
   isolated to `home-products.js`, and document scroll state isolated to
   `document-navigation.js`; source-order products and document navigation must
   remain usable when scripting is unavailable.
5. Update immutable asset query versions whenever asset contents change.
6. Keep the build allowlist explicit; never copy the whole repository.
7. Keep `_headers` and `tools/sites-static-worker.js` aligned.
8. Run `tools/build-site.sh` and inspect `dist/client/` before publishing.
9. Keep each indexable route's visible heading, metadata, canonical URL,
   structured data, and sitemap entry consistent.
