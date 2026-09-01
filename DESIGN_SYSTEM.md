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
4. Open the homepage with a compact company-introduction panel above the
   centered Kaizōsha mark. Four equal product cells fill the canvas behind it;
   a hovered, focused, or tapped product expands across that canvas and exposes
   its description and destination action.
5. Use the system monospace stack. Do not load web fonts or icon libraries.
   The story family may use a system serif for its literary title and a locally
   vendored renderer for the artwork; directory and product pages stay dependency-free.
6. Motion is restrained and structural: entrance, color inversion, focus, an
   unbounded multilingual mark cycle that changes one unit at a time, and a
   continuously drifting grid that responds to a fine pointer. Disable pointer
   motion and replace the mark cycle with one static multilingual mix for
   reduced-motion preferences.
7. Preserve semantic HTML, plain language, company metadata, creator metadata,
   legal content, browser zoom, keyboard access, and system accessibility
   preferences.

## Visual vocabulary

| Element | Treatment |
| --- | --- |
| Canvas | 48px two-tone drafting grid with continuous motion and subtle pointer drift |
| File bar | Inverted off-white row with `[ filename.md ]` |
| Reading shell | One 76rem maximum outer frame |
| Document navigation | Sticky `[ ← Back ]` row with the current document name |
| Section | Full-width ruled band, markdown heading, two-digit counter |
| Current section | One sticky inverted section band beneath document navigation |
| Data row | Bordered `-` entry with optional `>` support row |
| Link | Literal `[label](href)`, inverted on hover/focus |
| Metadata | Rendered like an HTML comment |
| Footer | Four equal related-link cells; text reveals on fine-pointer hover |
| Homepage grid | Four equal product cells on shared animated tracks; the selected cell pushes its siblings to the edges |
| Homepage mark | Centered fenced-code button whose three text units form a non-repeating mixed-language phonetic sequence while the page is visible, then moves toward the selected cell's expansion corner |
| Homepage introduction | Centered `COMPANY.md` panel with legal identity and `[ EXPLORE ]` |
| Homepage controls | Stable `[ PREV ] / [ NEXT ]` arrangement history |

## Page families

| Family | Pages | Visible structure |
| --- | --- | --- |
| `directory` | Homepage | Company introduction, equal product grid, centered Kaizōsha mark |
| `document` | Terms, Privacy, Contact | File bar, breadcrumb, full-width sections, related links |
| `error` | 404 | Framed `404.md` panel and one home link |
| `story` | i / Prologue | Equal-edge frame, real-time illustrated relief, numbered narrative, accessible reading mode |

Story pages preserve the system-theme file bars, one-pixel rules, real-text
multilingual mark, and two-tone UI palette. Original story illustrations may
retain a restrained content-specific palette, including muted manga cel colors
on paper. This exception applies to art, not the shared mark or navigation.
A perspective WebGL scene may frame, sculpt, and spatially layer that artwork;
the artwork itself is a credited raster asset. Distinguish illustrated relief
and drawn turnaround sheets from fully rigged 3D models. Character-development
pages use the document shell and actual text labels outside the artwork.
All narrative text remains semantic HTML above the art. No canvas-only content,
scroll hijacking, autoplay sound, accounts, or fake copy-protection is required.
Optional device motion needs an explicit user gesture, is processed locally,
and must have touch/pointer alternatives. Reduced motion, a page-wide pause,
reading mode, and a still-image fallback preserve access to every public word.

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
- Product takeover duration: `560ms` with a shared spring-like ease for the
  expanding cell and moving mark
- Wide-screen sticky document rows: `2.75rem` file bar + `3rem` navigation +
  `3.25rem` current section

The homepage first presents the legal company identity, location, focused
software profile, domain email, and one Explore action in a dismissible markdown
panel. Clicking the centered mark reopens that panel. Product names begin as
direct product-destination links in four equal cells underneath. Hovering a cell,
focusing its link, or tapping its name expands that product across the grid;
the selected block grows continuously from its original quadrant into one
same-tone canvas by resizing the grid tracks themselves; it never stacks above
the other product cells. Only interactive labels and controls invert on hover,
keyboard focus, or press. Sibling cells are physically compressed toward the
outer edges while the mark shrinks and travels from center in the same
diagonal direction as the expanding block. For example, a top-right product
expands toward bottom-left and sends the mark to bottom-left. Its product name
uses a reversed two-tone label for persistent contrast. Expanded information
anchors to the horizontal side opposite the mark; long description copy remains
left-aligned for readability. It reveals a description, metadata comment, Close
control, and destination Explore action. Fine-pointer users can scroll downward,
and touch users can deliberately swipe upward, over an expanded website-backed
product to fill an inline handoff rule and open that site in the same tab.
While that intent accumulates, the outer frame grows into the viewport's
equal-edge content box; it reaches the final geometry before navigation
commits. The handoff waits until overflowing details reach their end. Each
Kaizōsha product site opens in that same full-edge frame, carries the active
quadrant into its destination, and repeats the directory's first-view copy,
actions, bars, mark, and cue before its longer content begins. The destination
applies the incoming quadrant, carried scroll offset, and input-specific cue
before its body can paint, so a cold load cannot flash the default layout.
Product-site chrome identifies its own document instead of repeating generic
company metadata: the top-left file label reads `[ PRODUCT / README.md ]`,
while the bottom-right status carries the canonical product sequence, product
name, and current public version or development state. Product privacy links
open the product's own policy; Terms and Contact remain company-wide links.
Repository destinations keep their explicit Explore action only. Escape closes
an expanded product.
Its top bar owns arrangement controls; the bottom-left bar spells out Terms,
Privacy, and Contact above 640px and uses `[ T ] / [ P ] / [ C ]` at smaller
sizes. The logo returns to center when product detail closes. Browser zoom
remains available on every page, and the homepage frame yields to short or
magnified viewports without clipping. If the catalog has fewer products than
cells, names repeat in balanced batches.

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
- Every public page has one H1, one main landmark, and a skip link.
- Keyboard focus uses a two-pixel indicator, and standalone controls provide at
  least a 24px target in each axis.
- Browser zoom remains available on every page through at least 200%.
- Every page remains readable without hover, animation, or JavaScript.
- The multilingual mark cycle uses real text from Japanese and India’s 22
  scheduled languages, including Sanskrit. It keeps all three unit widths fixed
  and shows three different languages and scripts at once. It changes one unit
  at a time, avoids recent complete-mark repeats, never returns to an
  all-Japanese resting state, pauses offscreen, and remains hidden from
  assistive technology behind the stable Kaizōsha control label. Reduced motion
  shows one randomized static mix, while `改 造 社` remains the
  no-JavaScript fallback.
- Product detail is available through fine-pointer hover, keyboard focus, and
  touch activation; Close and Explore remain explicit controls.
- Scroll handoff is supplementary, appears only for website destinations, uses
  downward wheel intent or a deliberate upward touch swipe, and waits until
  overflowing detail content reaches its end. A cancelled gesture restores the
  resting frame; a committed gesture paints the full-edge frame before leaving.
- The compact active-product mark keeps its fenced-code labels clear of the
  brand glyph at mobile widths.
- Light and dark palettes must follow `prefers-color-scheme` without a flash of
  the wrong theme.
- Increased-contrast and forced-color preferences strengthen or simplify the
  same interface without hiding controls.
- Motion collapses to near-zero when reduced motion is requested.

## New page checklist

1. Add a supported `data-page-family` value to `<body>`.
2. Add a descriptive `data-file` value to the framed `<main>`.
3. Load `markdown.css` and the deferred `site-motion.js`; when the constructed
   Kaizōsha mark appears, load both `brand.css` and the deferred
   `brand-language-intro.js`. Load `home-products.js` only on the homepage and
   `document-navigation.js` only on document pages.
4. Use semantic headings, paragraphs, navigation, links, a main landmark, and a
   keyboard-accessible skip link.
5. Keep content inside the balanced shell and shared reading measure.
6. Update immutable asset query versions when stylesheet contents change.
7. Keep repository-root files safe for direct Cloudflare static publishing.
   The main site uses Pages; current product sites use Workers Builds. Neither
   requires a frontend compilation step. A new Worker needs its own Git connection.
8. Keep canonical URLs, descriptions, structured data, sitemap dates, and
   visible page content aligned.
9. Test all supported viewports before publishing.
