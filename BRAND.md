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

While a homepage is visible, the three glyph units continuously and
independently choose real-text phonetic renderings of `KAI`, `ZŌ`, and `SHA`
in Latin, Japanese katakana, Korean Hangul, Georgian, Devanagari, Arabic, and
Cyrillic. They never settle back to the all-Japanese canonical mark while
JavaScript is active. These forms are brand transliterations, not word-for-word
translations. The randomized cycle starts automatically on every site load and
pauses while the page is hidden. Reduced-motion preferences receive one
randomized static multilingual mix instead of a cycle; the canonical `改`,
`造`, and `社` remain the no-JavaScript fallback.

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
  library.
- Keep motion restrained to the shared entrance, independently randomized
  multilingual glyph cycle, and panel transition. Pause the cycle offscreen,
  never interaction-trigger it, and respect reduced-motion preferences.
- Preserve the canonical text `Kaizōsha` in titles, metadata, structured data,
  and social previews.
- Preserve the line's title case. Use it only in the homepage company
  introduction, homepage descriptions, and the Organization `slogan`; never use
  it as a page title, navigation item, or product label.
