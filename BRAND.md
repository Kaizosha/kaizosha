# Kaizōsha Brand System

The public site uses one visible brand construction: the three-part Kaizōsha
mark on the homepage. Its bar and glyph geometry lives in
`assets/styles/brand.css`; its framed presentation lives in
`assets/styles/markdown.css`.

`icon.svg` is the transparent browser icon. Its bars are vector rectangles and
its `改`, `造`, and `社` glyphs remain actual SVG `<text>` elements. It follows the
browser's light or dark system theme. `icon.png` is the transparent raster
fallback for Apple touch icons, PWA clients, and metadata consumers that require
PNG. Visible site branding must use the semantic HTML and shared CSS
construction.

While a homepage is visible, the three glyph units continuously choose
real-text phonetic renderings of `KAI`, `ZŌ`, and `SHA` from a curated catalog
of 43 forms representing 38 languages across 32 writing systems. Every visible
mix uses three different languages and scripts. One unit changes at a time,
recent complete marks are not repeated, and the randomized sequence continues
without an endpoint. It never settles back to the all-Japanese canonical mark
while JavaScript is active. These forms are brand transliterations, not
word-for-word translations.
The cycle starts automatically with a new mix on every site load, pauses when
the mark is offscreen or the page is hidden, and resumes without resetting.
The catalog stays embedded in the static site so the sequence never depends on
a translation service, network request, font download, or tracking endpoint.
Reduced-motion preferences receive one randomized static multilingual mix;
the canonical `改`, `造`, and `社` remain the no-JavaScript fallback.

The brand line is `From Me Comes The Future`. Its public use is limited to the
homepage company introduction, homepage description metadata, and the
Organization `slogan` field.

## Rules

- Keep the mark centered above the equal product grid and decorative to
  assistive technology; the homepage H1 provides the accessible company name.
- Render bars and glyphs with `currentColor` so the mark follows the system
  theme and can invert cleanly with its two-tone hover panel.
- Preserve the shared desktop and mobile proportions. Page styles may position
  the complete mark but must not redefine individual bars or glyphs.
- Keep every bar at the website's compact `3:1` height-to-width ratio, keep the
  gap between bars at one-half of a bar width, and leave the glyph row close to
  the bars. Raster exports must use the same geometry instead of stretching the
  bars to fill the icon canvas.
- Keep `icon.svg` and `icon.png` fully transparent outside the bars and glyphs:
  no badge, canvas fill, outer border, shadow, or texture.
- Keep the Japanese glyphs as real `<text>` elements in `icon.svg`; do not
  convert them to traced paths.
- Do not place either icon in visible page content. Reserve them for browser
  icons, touch icons, PWA installation, and machine-readable logo metadata.
- Use no accent color, gradient, glow, bevel, raster texture, or external logo
  library in the brand mark. Original story artwork is content, not a logo;
  it may use monochrome tonal depth without replacing the constructed mark.
- Keep motion restrained to the shared entrance, unbounded one-unit-at-a-time
  multilingual glyph cycle, and panel transition. Keep the three visible
  languages and scripts distinct, pause the cycle offscreen, never
  interaction-trigger it, and respect reduced-motion preferences.
- A page-level motion pause also pauses the multilingual mark. Set
  `body[data-motion-paused="true"]` and dispatch `kaizosha:motionchange` when
  the pause state changes. Reading mode must not leave decorative motion running.
- Preserve the canonical text `Kaizōsha` in titles, metadata, structured data,
  and social previews.
- Preserve the line's title case. Use it only in the homepage company
  introduction, homepage descriptions, and the Organization `slogan`; never use
  it as a page title, navigation item, or product label.
