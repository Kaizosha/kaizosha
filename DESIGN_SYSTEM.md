# Kaizōsha Design System

Kaizōsha uses a crafted, two-tone markdown interface. It should feel like a
working source file made deliberate: geometric, technical, modern, and quiet
without becoming visually empty.

## Principles

1. Use only the near-black surface and off-white ink defined in
   `assets/styles/markdown.css`. Muted states use opacity, not extra colors.
2. Build visual hierarchy with one-pixel frames, drafting grids, guide lines,
   numbered sections, file bars, and markdown grammar.
3. Keep document copy inside a centered `72ch` reading column. On wide screens,
   the empty left and right rails must remain mathematically equal.
4. Keep the homepage semantically limited to the centered Kaizōsha mark. Its
   frame, file label, guides, and status line are decorative CSS—not navigation
   or an app directory.
5. Use the system monospace stack. Do not load web fonts, icon libraries, or
   presentational JavaScript.
6. Motion is short and structural: one restrained entrance, color inversion,
   and focus transitions. Honor `prefers-reduced-motion`.
7. Preserve semantic HTML, plain language, company metadata, creator metadata,
   legal content, and keyboard access.

## Visual vocabulary

| Element | Treatment |
| --- | --- |
| Canvas | 48px near-black/off-white drafting grid |
| File bar | Inverted off-white row with `[ filename.md ]` |
| Reading shell | 76rem maximum frame with equal side rails |
| Section | One-pixel box, markdown heading, two-digit counter |
| Data row | Bordered `-` entry with optional `>` support row |
| Link | Literal `[label](href)`, inverted on hover/focus |
| Metadata | Rendered like an HTML comment |
| Footer | Four equal related-link cells; text reveals on fine-pointer hover |
| Homepage mark | Centered fenced-code panel inside the README frame |

## Page families

| Family | Pages | Visible structure |
| --- | --- | --- |
| `directory` | Homepage | Framed README canvas with centered Kaizōsha mark only |
| `document` | Terms, Privacy, Contact | File bar, breadcrumb, boxed sections, related links |
| `error` | 404 | Framed `404.md` panel and one home link |

## Foundations

- Surface: `#101010`
- Ink: `#f4f4ef`
- Lines: off-white at 28% and 11% opacity
- Type: system monospace stack
- Base size: `13px`; `12px` below 640px
- Reading width: `72ch`
- Shell width: `76rem`
- Grid unit: `48px`
- Transition duration: `180ms`

The homepage has no footer, slogan, project list, app links, controls, or click
behavior. Its logo remains centered at every screen size and browser zoom is
disabled only there through the homepage viewport metadata.

Document footer geometry uses four equal columns on desktop and two equal
columns on small screens. Fine-pointer devices reveal footer link text on
hover or keyboard focus; touch devices keep it visible.

## Responsive and accessibility contract

- Required checks: `320x720`, `390x844`, `1024x768`, and `1440x900`.
- No public route may create horizontal overflow.
- The desktop document rails must have equal measured widths.
- Text, email addresses, and literal link destinations may wrap without
  clipping.
- Every document page has one H1 and a skip link.
- Keyboard focus is always visible.
- Browser zoom remains available on document and error pages.
- Every page remains readable without hover, animation, or JavaScript.
- Motion collapses to near-zero when reduced motion is requested.

## New page checklist

1. Add a supported `data-page-family` value to `<body>`.
2. Add a descriptive `data-file` value to the framed `<main>`.
3. Load `markdown.css`; load `brand.css` only when the Kaizōsha icon appears.
4. Use semantic headings, paragraphs, navigation, and links.
5. Keep content inside the balanced shell and shared reading measure.
6. Update immutable asset query versions when stylesheet contents change.
7. Add only allowlisted public files to `tools/build-site.sh`.
8. Build and test all supported viewports before publishing.
