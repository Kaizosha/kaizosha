# Kaizōsha Site Architecture

This is a static, multi-route company website. The architecture is intentionally
small: HTML owns content and metadata, page styles own composition, shared
styles own the site contract, and only the interactions that need state use
JavaScript.

## Public routes

| Route | Role | Page family |
| --- | --- | --- |
| `/` | Company landing surface | `directory` |
| `/terms.html` | Terms of Service | `document` |
| `/privacy.html` | Privacy Policy | `document` |
| `/contact.html` | Company contact and support channels | `document` |
| `/404.html` | Direct recovery page for unknown routes | `error` |

The creator identity remains available in page metadata and structured data. It
is not a public route, homepage project, or legal-navigation item.

## Shared layers

- `assets/styles/brand.css` contains the approved Kaizōsha lockups.
- `assets/styles/site-system.css` contains shared tokens, focus behavior,
  responsive constraints, and document sizing.
- `assets/styles/home.css`, `legal-docs.css`, and `error.css`
  contain page-family composition only.
- `assets/scripts/legal-docs.js` maintains document table-of-contents state and
  the small expandable entries used by document pages.

## Build and Cloudflare handoff

`tools/build-site.sh` creates the ignored `dist/` directory. It copies the
allowlisted public routes and explicitly allowlisted styles, scripts, and
social preview image to `dist/client/`, then places the static Cloudflare
worker at `dist/server/index.js`. The asset allowlist prevents an accidental
private or development file from becoming public.

`wrangler.jsonc` is the Cloudflare deployment contract: it binds
`dist/client/` as `ASSETS`, uses `dist/server/index.js` as the Worker, routes
unknown paths to the custom `404.html`, and invokes the Worker before serving
assets so its security and cache headers apply consistently. Build with
`./tools/build-site.sh`, then deploy with Wrangler from the repository root.

The site has no application server, database, authentication layer, runtime
API, or client-side framework. Cloudflare serves the generated static client
through the existing worker setup. The worker applies long-lived immutable
caching to versioned assets, short stale-while-revalidate caching to HTML, and
security headers including CSP, HSTS, clickjacking protection, MIME sniffing
protection, and a restrictive Permissions Policy. No unrelated app/project
configuration is kept in this repository.

## Maintenance rules

1. Add or remove a public route in `tools/build-site.sh` and `sitemap.xml`
   together.
2. Keep the page-family declaration on every `<body>` in sync with
   `DESIGN_SYSTEM.md`. The creator identity is metadata only, not a public page.
3. Keep shared geometry in `site-system.css`; page styles should not redefine
   the brand lockup.
4. Keep the homepage free of project-list disclosures and leave legal links in
   the footer. Pointer devices reveal the entire footer on hover/focus; touch
   devices keep it visible.
5. When changing a CSS, JavaScript, or other immutable asset, update its cache
   query version in the HTML that references it.
6. Add public assets to the explicit allowlist in `tools/build-site.sh`; never
   copy the whole source tree to the client bundle.
7. Run `tools/build-site.sh` after route or asset changes and inspect the
   generated `dist/client/` tree before publishing.
