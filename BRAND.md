# Kaizōsha Brand System

The public site uses one visible brand asset: the three-part Kaizōsha mark on
the homepage. Its bar and glyph geometry lives in
`assets/styles/brand.css`; its framed presentation lives in
`assets/styles/markdown.css`.

## Rules

- Keep the mark centered above the equal product grid and decorative to
  assistive technology; the homepage H1 provides the accessible company name.
- Render bars and glyphs with `currentColor` so the mark follows the system
  theme and can invert cleanly with its two-tone hover panel.
- Preserve the shared desktop and mobile proportions. Page styles may position
  the complete mark but must not redefine individual bars or glyphs.
- Use no accent color, gradient, glow, bevel, raster texture, or external logo
  library.
- Keep motion restrained to the shared entrance and panel transition, and
  respect reduced-motion preferences.
- Preserve the canonical text `Kaizōsha` in titles, metadata, structured data,
  and social previews.
