# Kaizōsha Design System

Kaizōsha uses a two-tone, markdown-first visual system. The interface should
feel like a clean text document: compact, direct, fast, and free of decoration.

## Principles

1. Use only the near-black surface and off-white ink defined in
   `assets/styles/markdown.css`. Muted information uses opacity, not another
   brand color.
2. Use the system monospace stack at one compact reading scale.
3. Let markdown grammar show the hierarchy: `#` for the page title, `##` for
   sections, `-` for entries, `>` for supporting notes, and `[text](url)` for
   links.
4. Keep content in one centered reading column. Do not add rails, cards,
   badges, gradients, scanlines, shadows, illustrations, or decorative rules.
5. Use no visual animation or runtime JavaScript. Hover and keyboard focus may
   add an underline or outline without moving content.
6. Preserve plain language, semantic HTML, metadata, and legal content.

## Page families

| Family | Pages | Visible structure |
| --- | --- | --- |
| `directory` | Homepage | Centered Kaizōsha icon only |
| `document` | Terms, Privacy, Contact | Markdown breadcrumb, title, sections, related links |
| `error` | 404 | Markdown status and one home link |

## Foundations

- Surface: `#101010`
- Ink: `#f4f4ef`
- Type: system monospace stack
- Base size: `13px`
- Reading width: `72ch`
- Small-screen edge: `1rem`
- Motion: none

The homepage remains a single centered logo at every screen size. It has no
footer, project list, app links, slogans, controls, or click behavior.

Document pages keep the company and creator metadata in their `<head>`, while
the visible page uses only the markdown reading column. Links deliberately show
their destination using `[label](href)` so the page reads like source text.

## Responsive and accessibility contract

- Required checks: `320x720`, `390x844`, `1024x768`, and `1440x900`.
- The page must never be wider than the viewport.
- The document measure remains centered with equal left and right space.
- Text and link destinations may wrap without clipping.
- Every content page has one H1 and a skip link.
- Keyboard focus is always visible.
- Browser zoom remains available on document and error pages.
- All content works without JavaScript, animation, hover, or color distinction.

## New page checklist

1. Add a supported `data-page-family` value to `<body>`.
2. Load `markdown.css`; load `brand.css` only when the Kaizōsha icon is shown.
3. Use semantic headings, paragraphs, lists, navigation, and links.
4. Keep the page inside the shared reading measure.
5. Update the asset cache version when a stylesheet changes.
6. Build and test every supported viewport before publishing.
