# Kaizōsha Site Architecture

This is a static, multi-route company website. The architecture is intentionally
small: HTML owns content and metadata, page styles own composition, shared
styles own the site contract, and only the interactions that need state use
JavaScript.

## Public routes

| Route | Role | Page family |
| --- | --- | --- |
| `/` | Project directory and company landing surface | `directory` |
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
- `assets/scripts/home-menu.js` manages the homepage project disclosure and
  keyboard focus trap. The disclosure opens and closes without animation.
- `assets/scripts/legal-docs.js` maintains document table-of-contents state and
  the small expandable entries used by document pages.

## Build and Cloudflare handoff

`tools/build-site.sh` creates the ignored `dist/` directory. It copies the
allowlisted public routes, the favicon/manifest/robots/sitemap files, and the
`assets/` directory to `dist/client/`, then places the static Cloudflare
worker at `dist/server/index.js`.

The site has no application server, database, authentication layer, runtime
API, or client-side framework. Cloudflare serves the generated static client
through the existing worker setup. No unrelated app/project configuration is
kept in this repository.

## Maintenance rules

1. Add or remove a public route in `tools/build-site.sh` and `sitemap.xml`
   together.
2. Keep the page-family declaration on every `<body>` in sync with
   `DESIGN_SYSTEM.md`. The creator identity is metadata only, not a public page.
3. Keep shared geometry in `site-system.css`; page styles should not redefine
   the brand lockup.
4. Keep the homepage project list limited to active company projects and leave
   legal links in the footer.
5. Run `tools/build-site.sh` after route or asset changes and inspect the
   generated `dist/client/` tree before publishing.
