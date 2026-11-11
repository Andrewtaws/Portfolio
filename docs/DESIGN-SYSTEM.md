# Taws.Design design system

The live, visual version of this guide is [`design-system.html`](../design-system.html). It shows every token and component with copy-paste markup. This file is the quick reference.

## Principles

1. **Accessible by default.** Each component meets WCAG 2.2 AA on its own: contrast, focus, target size and semantics.
2. **Tokens, not values.** Components only read custom properties from `tokens.css`.
3. **HTML first.** Use native elements before ARIA. JavaScript is an enhancement only.
4. **Copy, paste, adjust.** The examples are the real markup.

## Files

| File | Contains |
|---|---|
| `assets/css/tokens.css` | `@font-face` rules and all design tokens |
| `assets/css/base.css` | Reset, element styles, typography, focus ring, utilities (`.container`, `.flow`, `.stack`, `.cluster`, `.visually-hidden`), reduced motion |
| `assets/css/components.css` | All components (BEM naming) and forced-colours support |
| `assets/js/site.js` | Sticky header bar and mobile menu button (load on every page) |
| `assets/js/scroll-reveal.js` | Fades below-the-fold `[data-reveal]` content into view on scroll (load on every page) |
| `assets/js/contact-form.js` | Form validation, error summary, and sending through FormSubmit (formsubmit.co) without an email app; works without JavaScript too |
| `templates/page.html` | Starting point for a general page |
| `templates/case-study.html` | Starting point for a case study |

Load the three stylesheets in that order on every page.

## Tokens

### Colour

| Role | Token | Value | Notes |
|---|---|---|---|
| Text, headings, links | `--color-text` (`--navy-900`) | `#07354d` | 12.7:1 on the canvas |
| Muted text | `--color-text-muted` (`--slate-600`) | `#4a6575` | 6.0:1 |
| Page canvas | `--color-bg` (`--snow-50`) | `#fffcfc` | |
| Card surface | `--color-surface` (`--sand-100`) | `#f3f1ef` | |
| Primary action | `--color-action` (`--navy-800`) | `#06334a` | White text 13.3:1 |
| Media band | `--color-media-band` (`--sky-200`) | `#b8d3ed` | Behind screenshots |
| Focus (light) | `--color-focus` (`--amber-700`) | `#b35c00` | 4.6:1 |
| Focus (dark) | `--color-focus-inverse` (`--amber-300`) | `#ffb84d` | 12.2:1 on black |
| Accent | `--color-accent` (`--amber-500`) | `#e8890c` | Decorative only, never text |
| Error | `--color-error` (`--red-700`) | `#b42318` | 6.4:1 |
| Figma frame | `--color-frame` (`--violet-500`) | `#8f55e4` | 4:1 on cards. Decorative only |
| Accent pill | `--color-accent-soft` (`--violet-100`) | `#ece2fb` | Navy text 10.4:1 |
| Pastel pills | `--mint-100`, `--peach-100`, `--sky-100`, `--lemon-100` | `#dcf2e7`, `#fde4d3`, `#dbeafa`, `#fbf0c2` | Navy text 10.6–11.3:1 |
| Footer | `--color-inverse-bg` | `#000000` | |

### Type

| Style | Selector | Size | Weight |
|---|---|---|---|
| Heading 1 | `h1`, `.h1` | 40–72px fluid | 700 |
| Heading 2 | `h2`, `.h2` | 26–32px | 600 |
| Heading 3 | `h3`, `.h3` | 22–29px | 500 |
| Heading 4 | `h4`, `.h4` | 20–24px | 700 |
| Lead | `.lead` | 20–24px | 500 |
| Body | `body` | 18px | 400 |
| Label | `--text-label` | 16px | 700 |
| Small (minimum) | `.text-sm` | 15px | |
| Greeting | `.greeting` | 24px Borel | 400 |
| Display | `.site-footer__title` | 40–70px Inter | 900 |

Fonts: Albert Sans (body and headings), Borel (greeting), Inter Black (footer). All are self-hosted in `assets/fonts/`.

### Spacing, shape and interaction

- Spacing: `--space-1` (4px) to `--space-10` (128px)
- Radius: `--radius-sm` 4px (cards, buttons, images), `--radius-lg` 18px (footer)
- Focus ring: 3px solid outline with a 3px offset, on every interactive element
- Minimum target: `--target-min` 44px
- Containers: 1200px (`.container`), 1110px (`.container--narrow`), 640px prose

## Components

| Component | Class | Use |
|---|---|---|
| Skip link | `.skip-link` | First element in `<body>` |
| Site header and nav | `.site-header`, `.site-nav`, `.site-nav__link--cta`, `.nav-toggle` | Every page; mark the current page with `aria-current="page"`. It becomes a floating sticky bar on scroll (`.is-stuck`), with a Menu button below 44em. Ends with the "Motion" switch (`.motion-toggle`, `role="switch"`, `aria-checked`): a pill switch and spaced capitals. Off stops every animation site-wide and is remembered (`html.motion-paused`). Hidden for reduced motion and without JavaScript. |
| Buttons | `.btn` + `--primary`, `--secondary`, `--inverse`, `--ghost-inverse`, `--block` | `<a>` to navigate, `<button>` for actions |
| Scroll reveal | `data-reveal`, `data-reveal="words"`, `data-reveal-stagger` | Below-the-fold content fades up on scroll; on-screen content shows at once. Off for reduced motion and without JavaScript |
| Scroll highlight | `data-reveal="highlight"` | Letters of a large paragraph darken as it's scrolled through (scrubbed). Faded floor 68% opacity keeps 4.5:1. Plain text only; off for reduced motion |
| Page transition | `@view-transition` in `components.css` | Short fade between every page (0.15s out, 0.25s in with an 8px rise). Off for reduced motion |
| Intro text | `data-reveal="intro-chars"`, `data-reveal="intro-words"`, `data-reveal-delay` | Letters or words rise and blur into focus, including on load (greetings, eyebrows, page headings). |
| Greeting, eyebrow | `.greeting`, `.eyebrow` | Above an `<h1>` |
| Chips | `.chip`, `.chip--outline`, `.chip-list` | Categories and skills |
| Status badge | `.status-badge` | e.g. "Open to work" |
| Figma frame | `.figma-frame`, `.figma-frame--lg` | Figma-style selection outline with corner handles, on any element. Decorative |
| Scroll link | `.scroll-link`, `.scroll-link--nudge` | In-page link with an icon. `--nudge` dips the arrow three times after load (under 5 seconds) and on hover; off for reduced motion. On the homepage on mobile it reads "View work" and shares the last row with the final pill |
| Home hero | `.hero`, `.hero__content`, `.hero__media` | Intro with portrait |
| Portrait | `.portrait`, `.portrait__img` | Profile photo |
| Work grid and card | `.work-grid`, `.card` + `--feature`, `--tall`, `--wide` | Homepage case study cards |
| Case hero | `.case-hero` | Top of a case study |
| Case summary | `.case-summary`, `__head`, `__title`, `__tldr`, `__facts`, `__fact`, `__foot` | Project overview card: role, company and type pills, TL;DR, facts row, methods |
| Pills | `.pill`, `.pill--violet` (`--accent`), `.pill--mint`, `.pill--peach`, `.pill--sky`, `.pill--lemon`, `.pill--sm`, `.pill-list` | Rounded tags; pastel variants keep navy text above 10:1 |
| Split section | `.split`, `.split__heading` | Heading left, content right |
| Prose | `.prose`, `.prose--lead` | Body copy with rhythm |
| Media band | `.media-band`, `--plain` | Full-width screenshot band |
| Figure and gallery | `.figure` + `--hero`, `--contained`, `--tall`; `.gallery` + `--2`, `--3`, `--device` | Screenshots |
| Disclosure | `.disclosure` (`<details>`) | Transcripts and optional detail |
| Callout | `.callout` | Highlighted result or quote |
| Pager | `.pager` | Previous and next case study |
| Experience | `.experience` | About page work history |
| Form | `.form`, `.field`, `.input`, `.textarea`, `.field__error` | Forms |
| Error summary | `.error-summary` | Above a form with errors |
| Contact list | `.contact-list` | Icon links |
| Site footer | `.site-footer.on-dark` | Every page |

## Accessibility rules for new content

- One `<h1>` per page, with no skipped heading levels. Use `.h2`/`.h3`/`.h4` classes to change the size without changing the level.
- Every image has `width`, `height` and `alt`. Use `alt=""` when the image is decorative or already described by nearby text, such as card images.
- Text-heavy images, such as personas and diagrams, get a full text version in a `.disclosure`.
- Links that open a new tab say so: `<span class="visually-hidden"> (opens in a new tab)</span>`.
- Don't use colour alone to convey meaning. The amber accent and the green dot are decorative only.
- Interactive elements outside running text must be at least 44px high. Components already handle this.
- Test each new page: keyboard only, 400% zoom (320px wide), forced colours, and an axe scan.

## Adding a case study

1. Copy `templates/case-study.html` into `work/`.
2. Update the `<title>`, meta description, canonical URL and `og:url`, and remove `<meta name="robots" content="noindex">`.
3. Add images to `assets/images/<project>/` as WebP, up to 2000px wide, then run `python3 tools/responsive-images.py` to make smaller copies and add `srcset`.
4. Add a card to `index.html`, update the pager links on the neighbouring case studies, and add the page to `sitemap.xml`.
5. Run `python3 tools/stamp-assets.py` so the page's CSS and JS links carry the current version (also after any CSS or JS change).
6. Run the checks above.
