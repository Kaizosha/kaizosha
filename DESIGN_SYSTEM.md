# Kaizōsha Site Design System

This document is the visual and structural contract for every page on
`kaizosha.org`. The homepage directory establishes the quiet, indexed tone;
the Terms, Privacy, and Contact pages establish the rules for hierarchy,
numbering, reading width, and navigation.

The system should make pages feel related without making every project look
identical. Shared structure belongs in `assets/styles/site-system.css`.
Page-specific color, diagrams, and interaction belong in that page's stylesheet.

## Principles

1. **Indexed, not decorated.** Use numbers, rules, labels, and deliberate
   whitespace to establish hierarchy. Do not add pills, floating cards, glow,
   or ornamental containers without a functional reason.
2. **One shell, distinct pages.** Headers, legal navigation, footers,
   spacing rhythm, and focus behavior are shared. Dedicated pages may own one
   signal color and their primary visual system.
3. **Content sets the scale.** Large type belongs to dedicated or identity
   moments. Navigation, controls, metadata, and descriptions stay compact.
4. **Every edge aligns.** Brand, navigation, section labels, content, and
   footer links use a small set of gutters. Elements must never extend beyond
   the viewport at 320px or wider.
5. **Motion explains state.** Animation may communicate opening, progress,
   selection, or a project concept. It must not delay navigation and must
   respect `prefers-reduced-motion`.
6. **Plain language wins.** Project promises, legal text, status, and actions
   should state exactly what they do. Avoid marketing filler.

## Page Families

Every `<body>` must declare one `data-page-family` value.

| Family | Pages | Required structure |
| --- | --- | --- |
| `directory` | Homepage | Brand trigger, indexed project list, legal footer |
| `document` | Terms, Privacy, Contact | Document rail, compact brand lockup, readable main column, numbered sections, start/end markers |
| `identity` | Creator | Standard brand header, identity hero, indexed work list, legal footer |
| `error` | 404 | Brand icon, direct status, one recovery action |

## Foundations

### Typography

- Use the established monospace stack from the page tokens.
- Dedicated and identity-page H1s may be large; never use that scale inside controls,
  cards, rails, or navigation.
- Labels, navigation, metadata, and statuses are uppercase with normal letter
  spacing and compact sizing.
- Body copy uses sentence case, `1.6-1.75` line-height, and a maximum readable
  width of approximately `72ch-84ch`.
- Use tabular numerals for section numbers, counters, versions, and times.

### Color

- Base surfaces remain near-white or near-black, never a saturated wash.
- Kaizōsha orange is the studio accent.
- A dedicated page may define one `--page-signal` color for page state, focus, and
  diagram emphasis.
- Muted text must remain readable. Rules should be visible but subordinate.
- Active controls use a light signal tint and a clear edge, not a solid block,
  unless the action is genuinely primary.

### Spacing

Use the shared CSS tokens rather than one-off values:

| Token | Purpose |
| --- | --- |
| `--ks-shell-edge` | Header and footer inset |
| `--ks-section-edge` | Main section inset |
| `--ks-header-height` | Shared header minimum |
| `--ks-reading-width` | Long-form copy measure |
| `--ks-control-height` | Minimum interactive-control height |
| `--ks-footer-height` | Closing legal footer minimum |

Spacing should create clear bands: header, hero, numbered sections, closing,
footer. Do not make ordinary sections appear as floating cards.

## Shared Components

### Brand

Use only the lockups defined in `BRAND.md`. Full lockups use the compact format
below 640px.

### Section Heading

- Begin with a two-digit or Roman index and a concise uppercase label.
- Pair the label with one direct heading and short supporting copy.
- Use a rule or grid boundary to connect the section to the document language.

### Controls

- Group related modes in one bounded toolbar.
- Keep controls at least `--ks-control-height` tall.
- Use a subtle signal tint for selection and a visible focus ring.
- Use icons for pause/play and other familiar actions; include an accessible
  name and state.

### Footer

- End directory and identity pages with `FROM ME COMES THE FUTURE`
  and legal links. Document pages use their related-links section and explicit
  end marker; error pages keep one direct recovery action.
- Order: Terms, Privacy, Contact.
- Use a top rule, centered alignment, shared spacing, and no badges.

## Responsive Contract

- Required checks: `320x720`, `390x844`, `1024x768`, and `1440x900`.
- `documentElement.scrollWidth` must never exceed the viewport width.
- Document rails become a compact top identity/navigation surface.
- Controls stack before their labels wrap incoherently.
- Text, logos, and status must never overlap.

## Accessibility Contract

- Exactly one H1 per page.
- A skip link targets the primary content on every content page.
- Keyboard focus uses the page signal or studio accent and is never removed.
- Interactive elements expose names, state, and at least a 44px target where
  the interface permits.
- Motion honors `prefers-reduced-motion`; content remains available without
  animation or JavaScript.
- Color is never the only indication of state.

## New Page Checklist

1. Choose and declare a page family on `<body>`.
2. Load `brand.css`, the page stylesheet, then `site-system.css`.
3. Use an approved brand lockup.
4. Define `--page-signal` only when the page needs a dedicated interaction color.
5. Use the shared header/footer and numbered section grammar.
6. Keep unique visuals inside the page stylesheet; do not redefine shared
   shell geometry.
7. Verify keyboard navigation, reduced motion, console output, and all four
   responsive sizes before shipping.
