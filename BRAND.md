# Kaizōsha Brand System

The public site uses one visible brand construction: the three-part Kaizōsha
mark on the homepage. Its bar and glyph geometry lives in
`assets/styles/brand.css`; its framed presentation lives in
`assets/styles/markdown.css`.

`icon.png` is the transparent raster distribution asset. Use it only where a
browser, operating system, PWA manifest, or metadata consumer requires an image.
Visible site branding must use the semantic HTML and shared CSS construction.

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
- Keep `icon.png` fully transparent outside the bars and glyphs: no badge,
  canvas fill, outer border, shadow, or texture.
- Do not place `icon.png` in visible page content. Reserve it for favicons,
  touch icons, PWA installation, and machine-readable logo metadata.
- Use no accent color, gradient, glow, bevel, raster texture, or external logo
  library.
- Keep motion restrained to the shared entrance and panel transition, and
  respect reduced-motion preferences.
- Preserve the canonical text `Kaizōsha` in titles, metadata, structured data,
  and social previews.
- Preserve the line's title case. Use it only in the homepage company
  introduction, homepage descriptions, and the Organization `slogan`; never use
  it as a page title, navigation item, or product label.
