# Kaizōsha Design System

Kaizōsha uses a crafted, two-tone markdown interface. It should feel like a
working source file made deliberate: geometric, technical, modern, and quiet
without becoming visually empty.

## Principles

1. Use only the near-black and off-white tones defined in
   `assets/styles/markdown.css`. Their foreground/background roles follow the
   operating-system theme; muted states use opacity, not extra colors.
2. Build visual hierarchy with one-pixel frames, drafting grids, guide lines,
   numbered sections, file bars, and markdown grammar.
3. Use one outer document frame. Section bands span that frame, while copy sits
   in a centered, unboxed `96ch` maximum reading measure. Long documents keep a
   sticky back row and one current section band visible while scrolling.
4. Keep the homepage centered on the Kaizōsha mark. Four equal product cells
   fill the canvas behind it; product names remain plain text rather than app
   links or separate pages.
5. Use the system monospace stack. Do not load web fonts, icon libraries, or
   frontend dependencies.
6. Motion is restrained and structural: entrance, color inversion, focus, and
   slow pointer-driven grid drift. Disable pointer motion for touch and reduced
   motion preferences.
7. Preserve semantic HTML, plain language, company metadata, creator metadata,
   legal content, and keyboard access.

## Visual vocabulary

| Element | Treatment |
| --- | --- |
| Canvas | 48px two-tone drafting grid with subtle pointer drift |
| File bar | Inverted off-white row with `[ filename.md ]` |
| Reading shell | One 76rem maximum outer frame |
| Document navigation | Sticky `[ ← Back ]` row with the current document name |
| Section | Full-width ruled band, markdown heading, two-digit counter |
| Current section | One sticky inverted section band beneath document navigation |
| Data row | Bordered `-` entry with optional `>` support row |
| Link | Literal `[label](href)`, inverted on hover/focus |
| Metadata | Rendered like an HTML comment |
| Footer | Four equal related-link cells; text reveals on fine-pointer hover |
| Homepage grid | Four equal product cells with names aligned to the outer corners |
| Homepage mark | Centered fenced-code panel layered over the product grid |
| Homepage controls | Stable `[ PREV ] / [ NEXT ]` arrangement history |

## Page families

| Family | Pages | Visible structure |
| --- | --- | --- |
| `directory` | Homepage | Framed README canvas, equal product grid, centered Kaizōsha mark |
| `document` | Terms, Privacy, Contact | File bar, breadcrumb, full-width sections, related links |
| `error` | 404 | Framed `404.md` panel and one home link |

## Foundations

- Dark theme: `#101010` surface with `#f4f4ef` ink
- Light theme: `#f4f4ef` surface with `#101010` ink
- Lines: current ink at 28% and 11% opacity
- Type: system monospace stack
- Base size: `13px`; `12px` below 640px
- Reading width: `96ch` maximum, without a visible inner container
- Shell width: `76rem`
- Grid unit: `48px`
- Transition duration: `180ms`
- Wide-screen sticky document rows: `2.75rem` file bar + `3rem` navigation +
  `3.25rem` current section

The homepage shows product names as non-interactive text in four equal cells.
Its top bar owns arrangement controls, and its bottom-left bar owns compact
`[ T ] / [ P ] / [ C ]` links. The logo remains centered at every screen size,
and browser zoom is disabled only there through the homepage viewport metadata.
If the catalog has fewer products than cells, names repeat in balanced batches.

Document footer geometry uses four equal columns on desktop and two equal
columns on small screens. Fine-pointer devices reveal footer link text on
hover or keyboard focus; touch devices keep it visible.

Document pages keep equal outer spacing above and below the frame. On wide,
scrolling documents, the file bar, navigation, and current section remain one
continuous sticky stack beneath the fixed grid gutter. Below 860px, only the
inline gutter is removed; the balanced block gutter remains.

## Responsive and accessibility contract

- Required checks: `320x720`, `390x844`, `1024x768`, and `1440x900`.
- No public route may create horizontal overflow.
- Document sections must not introduce a second visible frame inside the shell.
- Text, email addresses, and literal link destinations may wrap without
  clipping.
- Every document page has one H1 and a skip link.
- Keyboard focus is always visible.
- Browser zoom remains available on document and error pages.
- Every page remains readable without hover, animation, or JavaScript.
- Light and dark palettes must follow `prefers-color-scheme` without a flash of
  the wrong theme.
- Motion collapses to near-zero when reduced motion is requested.

## New page checklist

1. Add a supported `data-page-family` value to `<body>`.
2. Add a descriptive `data-file` value to the framed `<main>`.
3. Load `markdown.css` and the deferred `site-motion.js`; load `brand.css` only
   when the Kaizōsha icon appears, `home-products.js` only on the homepage, and
   `document-navigation.js` only on document pages.
4. Use semantic headings, paragraphs, navigation, and links.
5. Keep content inside the balanced shell and shared reading measure.
6. Update immutable asset query versions when stylesheet contents change.
7. Add only allowlisted public files to `tools/build-site.sh`.
8. Build and test all supported viewports before publishing.
