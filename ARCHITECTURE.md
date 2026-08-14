# Kaizōsha Site Architecture

Kaizōsha is a static, multi-route company website. HTML owns the content and
metadata, two small stylesheets own the entire visual system, and the public
site runs without client-side JavaScript.

## Public routes

| Route | Role | Page family |
| --- | --- | --- |
| `/` | Centered company identity | `directory` |
| `/terms.html` | Terms of Service | `document` |
| `/privacy.html` | Privacy Policy | `document` |
| `/contact.html` | Company contact channels | `document` |
| `/404.html` | Unknown-route recovery | `error` |

The creator identity remains in page metadata and structured data. It is not a
visible page, homepage link, or legal-navigation item.

## Shared layers

- `assets/styles/brand.css` draws the two-tone Kaizōsha icon used on the
  homepage.
- `assets/styles/markdown.css` owns layout, typography, markdown grammar,
  focus behavior, and responsive rules for every public route.
- There are no public scripts, frontend dependencies, runtime APIs, forms,
  databases, accounts, or authentication flows.

## Build and Cloudflare handoff

`tools/build-site.sh` creates the ignored `dist/` directory from an explicit
allowlist. It copies the five public HTML routes, two stylesheets, required
metadata files, the icon, and the social preview image. Development files are
never copied into the public bundle.

`wrangler.jsonc` serves `dist/client/` through the Worker generated at
`dist/server/index.js`. The Worker handles HTTPS redirects, GET/HEAD method
restriction, versioned-asset caching, short HTML caching, and security headers.
Because the site has no executable browser code, its Content Security Policy
sets scripts, connections, fonts, media, frames, forms, objects, and workers to
`none`; only same-origin styles, images, and the manifest are allowed.

## Maintenance rules

1. Change public routes in `tools/build-site.sh` and `sitemap.xml` together.
2. Keep creator metadata in the HTML even though it is not shown visually.
3. Keep all visible layout rules in `markdown.css` and the homepage icon in
   `brand.css`.
4. Do not add client-side JavaScript for presentational behavior.
5. Update immutable asset query versions whenever their contents change.
6. Keep the build allowlist explicit; never copy the whole repository.
7. Run `tools/build-site.sh` and inspect `dist/client/` before publishing.
