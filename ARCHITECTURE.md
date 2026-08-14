# Kaizōsha Site Architecture

Kaizōsha is a static, multi-route company website. HTML owns content and
metadata, two small stylesheets own the interface, and one dependency-free
script provides optional pointer motion.

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

## Shared layers

- `assets/styles/brand.css` defines the three-part Kaizōsha icon used on the
  homepage.
- `assets/styles/markdown.css` owns the drafting grid, framed shells,
  system themes, typography, markdown grammar, counters, interactions,
  accessibility states, and responsive rules for every route.
- `assets/scripts/site-motion.js` eases the background grid toward the pointer
  on fine-pointer devices. Pages do not depend on it for layout or content, and
  it disables itself for reduced-motion and touch contexts.
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
smaller canvas. The homepage uses a fixed viewport frame with CSS-only guide
lines and a nested logo panel; it contains no interactive directory behavior.

## Build and Cloudflare handoff

`tools/build-site.sh` recreates the ignored `dist/` directory from an explicit
allowlist. It copies the five public HTML routes, two stylesheets, the motion
controller, required metadata files, icon, crafted social card, and security
configuration. Development files are never copied into the public bundle.

`wrangler.jsonc` serves `dist/client/` through the Worker at
`dist/server/index.js`. The Worker handles HTTPS redirects, GET/HEAD method
restriction, versioned-asset caching, short HTML caching, and security headers.
Its Content Security Policy allows only the same-origin deferred motion script,
styles, images, and manifest. Connections, fonts, media, frames, forms, objects,
workers, inline scripts, and script attributes remain disabled.

The root `_headers` file mirrors static-response protections for Cloudflare
Pages-style asset delivery. The build copies it into `dist/client/`, so both
supported Cloudflare paths receive the restrictive policy and cache rules.

## Maintenance rules

1. Change public routes in `tools/build-site.sh` and `sitemap.xml` together.
2. Keep company and creator metadata in HTML even when it is not shown visually.
3. Keep all visible layout rules in `markdown.css` and icon geometry in
   `brand.css`.
4. Keep pointer motion isolated to `site-motion.js`; content and navigation must
   continue to work when scripting is unavailable.
5. Update immutable asset query versions whenever asset contents change.
6. Keep the build allowlist explicit; never copy the whole repository.
7. Keep `_headers` and `tools/sites-static-worker.js` aligned.
8. Run `tools/build-site.sh` and inspect `dist/client/` before publishing.
