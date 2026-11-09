# Portfolio

Portfolio website for UX Designer Andrew Taws: a hand-built HTML and CSS rebuild of the original Framer site, designed to meet WCAG 2.2 AA.

## Structure

```
index.html                 Homepage
about.html                 About
contact.html               Contact (form opens the visitor's email app)
accessibility.html         Accessibility statement
design-system.html         Living design system documentation
404.html                   Not found page (uses root-relative paths)
work/                      Case studies
  checker.html
  changing-health.html
  design-system.html
  client-portal.html
templates/                 Starting points for new pages (noindex)
assets/
  css/tokens.css           Design tokens and @font-face
  css/base.css             Reset, typography, focus, utilities
  css/components.css       Components (BEM)
  js/contact-form.js       Form validation (progressive enhancement)
  fonts/                   Self-hosted Albert Sans, Borel, Inter
  images/                  WebP images, one folder per page
  files/                   CV (PDF)
docs/
  DESIGN-SYSTEM.md         Design system quick reference
  WCAG-REVIEW.md           Accessibility test results and remaining to-dos
```

There's no build step: every page is plain, static HTML. Paths are relative, so the site works on GitHub Pages either at `/Portfolio/` or on a custom domain.

## Running locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Adding a page

Copy a file from `templates/`, follow the comment at the top, and use the components documented in `design-system.html`. See [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md).

## Before going live

Search the HTML for `TODO (Andrew)`. The open items, mainly the placeholder email address and the case study outcomes, are listed in [docs/WCAG-REVIEW.md](docs/WCAG-REVIEW.md).
