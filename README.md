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
tools/stamp-assets.py      Versions CSS/JS links so browsers don't use stale copies
tools/responsive-images.py Makes smaller image copies and adds srcset/sizes
robots.txt, sitemap.xml    For search engines
assets/
  css/tokens.css           Design tokens and @font-face
  css/base.css             Reset, typography, focus, utilities
  css/components.css       Components (BEM)
  js/site.js               Sticky header bar and mobile menu
  js/scroll-reveal.js      Scroll fade-ins and intro text animation
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

## After adding or replacing images

```bash
python3 tools/responsive-images.py
```

It makes 640, 1024 and 1440px copies of every large WebP image and adds `srcset`/`sizes` to the pages, so phones and smaller layouts download a smaller file. Needs Pillow (`pip install pillow`). Then run `stamp-assets.py` as below.

## After changing CSS or JavaScript

Run this from the repository root before committing:

```bash
python3 tools/stamp-assets.py
```

It adds a version to every stylesheet and script link (for example `components.css?v=3f9a1c2e`), based on each file's contents. When a file changes, its version changes, so visitors' browsers fetch the new file straight away instead of using an old cached copy.

## Adding a page

Add any new page's address to `sitemap.xml`.


Copy a file from `templates/`, follow the comment at the top, and use the components documented in `design-system.html`. See [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md).

## Before going live

Search the HTML for `TODO (Andrew)`. The open items, mainly the placeholder email address and the case study outcomes, are listed in [docs/WCAG-REVIEW.md](docs/WCAG-REVIEW.md).
