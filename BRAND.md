# Kaizōsha Brand System

Use only the lockups below. Their structure and sizing live in
`assets/styles/brand.css`; page styles may set color variables, but should not
redefine the mark, wordmark, spacing, or typography.

## Approved Formats

| Format | Class | Use |
| --- | --- | --- |
| Wordmark only | `brand-lockup--wordmark` | Text-only credits, bylines, or narrow surfaces where the icon is already visible nearby |
| Icon only | `brand-lockup--icon` | Homepage project trigger, 404 identity, favicon, and app-icon contexts |
| Icon + wordmark | `brand-lockup--compact` | Sidebars, menus, document headers, and compact navigation |
| Icon + wordmark + descriptor | `brand-lockup--full` | Primary desktop site and product headers |

`brand-lockup--display` changes scale only. Use it with the icon-only format for
large identity moments; it is not a fifth lockup.

## Canonical Text

- Wordmark: `Kaizōsha`
- Descriptor: `Independent Software Studio`
- Keep the wordmark capitalized exactly as shown.

## Rules

- Keep the icon decorative with `aria-hidden="true"`; give its parent link or
  button an accessible name.
- Do not place the lockup inside a badge, pill, or decorative card.
- Do not add page-specific bar sizes, glyph sizes, letter spacing, or icon-to-text gaps.
- Let product themes supply the accent color through their existing CSS variables.
- Full product-header lockups reduce to the compact format below 640px.
