# Kaizōsha Site Architecture

Kaizōsha is a static, multi-route company website. HTML owns content and
metadata, two small stylesheets own the complete interface, and the public site
runs without client-side JavaScript.

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
  typography, markdown grammar, counters, interactions, accessibility states,
  and responsive rules for every route.
- `assets/media/social/kaizosha-social-card-crafted-2026.png` mirrors the
  framed README language for social previews without affecting page load.
- HTML `data-file` attributes provide the decorative file labels rendered by
  CSS.
- There are no public scripts, frontend dependencies, runtime APIs, forms,
  databases, accounts, or authentication flows.

## Layout architecture

Document pages use a three-column CSS grid:

```text
equal flexible rail | 72ch reading column | equal flexible rail
```

At 860px and below, the shell collapses to one column and removes its redundant
outer borders. At 640px and below, type, mark dimensions, data rows, and the
footer adapt to the smaller canvas. The homepage uses a fixed viewport frame
with CSS-only guide lines and a nested logo panel; it contains no interactive
directory behavior.

## Build and Cloudflare handoff

`tools/build-site.sh` recreates the ignored `dist/` directory from an
explicit allowlist. It copies the five public HTML routes, two stylesheets,
required metadata files, icon, crafted social card, and security configuration.
Development files are never copied into the public bundle.

`wrangler.jsonc` serves `dist/client/` through the Worker at
`dist/server/index.js`. The Worker handles HTTPS redirects, GET/HEAD method
restriction, versioned-asset caching, short HTML caching, and security headers.
Because the site has no executable browser code, its Content Security Policy
sets scripts, connections, fonts, media, frames, forms, objects, and workers to
`none`; only same-origin styles, images, and the manifest are allowed.

The root `_headers` file mirrors static-response protections for Cloudflare
Pages-style asset delivery. The build copies it into `dist/client/`, so both
supported Cloudflare paths receive the restrictive policy and cache rules.

## Maintenance rules

1. Change public routes in `tools/build-site.sh` and `sitemap.xml` together.
2. Keep company and creator metadata in HTML even when it is not shown visually.
3. Keep all visible layout rules in `markdown.css` and icon geometry in
   `brand.css`.
4. Do not add client-side JavaScript for presentational behavior.
5. Update immutable asset query versions whenever asset contents change.
6. Keep the build allowlist explicit; never copy the whole repository.
7. Keep `_headers` and `tools/sites-static-worker.js` aligned.
8. Run `tools/build-site.sh` and inspect `dist/client/` before publishing.
