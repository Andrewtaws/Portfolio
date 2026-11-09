# andrewtaws.co.uk: WCAG 2.2 AA review and rebuild status

**Last updated:** 9 November 2026
**Scope:** The whole rebuilt site: homepage, About, Contact, the four case studies, the accessibility statement, the design system page, the 404 page and the templates.

| Status | Meaning |
|---|---|
| ✅ | Fixed in the rebuild |
| ⚠️ | Done, but needs your input |
| ⬜ | Still to do |

---

## Test results

### Automated (axe-core 4.10, WCAG 2.0/2.1/2.2 A and AA, plus best practices)

Every page was tested at 1440px and 390px wide, with all disclosures open and after all animations had finished.

| Page | Violations |
|---|---|
| Home, About, Contact, Accessibility statement, 404 | 0 |
| Checker, Changing Health, Design System, Client Portal case studies | 0 |
| Design system page, both templates | 0 |

The only "needs review" items were textareas and a scrolling table, where axe couldn't work out the background colour. They were checked by hand: navy on white, 12.9:1.

### Manual checks (scripted in a real browser)

| Check | WCAG | Result |
|---|---|---|
| Tab order follows the visual order: skip link, logo, Work, About, Contact, Explore my work, four cards, Email, LinkedIn, CV, footer links | 2.4.3 | ✅ |
| Every focus stop has a visible 3px outline. Each card shows one ring around the whole card. | 2.4.7, 2.4.11, 2.4.13 | ✅ |
| The skip link moves focus to `<main>` | 2.4.1 | ✅ |
| Reflow at 320px (equivalent to 400% zoom): no horizontal scrolling on any page | 1.4.10 | ✅ |
| Text spacing override (1.5 line height, 0.12em letter spacing, 0.16em word spacing, 2em paragraph spacing): no clipping or horizontal scroll | 1.4.12 | ✅ |
| Every link and button outside running text is at least 24×24px (most are 44px tall) | 2.5.8 | ✅ |
| One `<h1>` per page, no skipped heading levels | 1.3.1, 2.4.6 | ✅ |
| Contact form errors: an error summary takes focus, links move to each field, fields get `aria-invalid` and a linked message, and the page title gets an "Error:" prefix | 3.3.1, 3.3.3, 4.1.3 | ✅ |
| Forced colours (Windows High Contrast): card, chip, button and badge edges stay visible, and the focus ring uses `Highlight` | 1.4.11 | ✅ |
| Reduced motion turns off the card hover movement, smooth scrolling, scroll reveals, intro text animation, status pulse and page fade | 2.3.3 | ✅ |
| Intro text (letter/word blur-in): screen readers hear the full text once; pieces are `aria-hidden`; plays once in under 2 seconds | 1.3.1, 2.2.2 | ✅ |
| Scroll reveals: nothing on screen at load is hidden, nothing stays hidden after scrolling, and focused content shows at full opacity immediately | 2.4.7, 2.4.11 | ✅ |
| "Open to work" pulse stops after about 4.5 seconds | 2.2.2 | ✅ |
| Page fade between pages (0.4s); browsers without view transitions just load the page | 2.3.3 | ✅ |
| No horizontal scrolling at 390px or 1440px on any page | 1.4.10 | ✅ |
| Sticky header: tabbing forwards and backwards through 6 pages (2,000+ focus stops), nothing is ever entirely hidden by the bar, and focusing a header link never makes the page jump | 2.4.11 | ✅ |
| Sticky header switches off on viewports shorter than 640px (400% zoom, landscape phones) | 1.4.10 | ✅ |
| Mobile Menu button: `aria-expanded` state, Escape closes it and returns focus, it closes when focus leaves the header, and the links stay visible without JavaScript | 4.1.2, 2.1.1 | ✅ |

### Not yet tested

- [ ] Screen reader pass with VoiceOver (macOS/iOS) and NVDA (Windows)
- [ ] Real-device zoom on iOS and Android

---

## Original homepage issues

| # | Issue | WCAG | Rebuild |
|---|---|---|---|
| 1 | LinkedIn link had no accessible name and was `aria-hidden` | 1.1.1, 2.4.4, 4.1.2 | ✅ Visible "LinkedIn" button with hidden "(opens in a new tab)" text |
| 2 | No main/header/footer landmarks, no skip link | 1.3.1, 2.4.1 | ✅ |
| 3 | Two H1s, no H2/H3 | 1.3.1, 2.4.6 | ✅ |
| 4 | An invisible Framer badge took focus | 2.4.7, 2.4.11 | ✅ Removed |
| 5 | The nav was duplicated three times, two copies off screen | 2.4.3 | ✅ One nav |
| 6 | Reading and focus order differed from the layout | 1.3.2, 2.4.3 | ✅ |
| 7 | No reduced-motion support | 2.3.3 (AAA) | ✅ |
| 8 | 1px focus outline | 2.4.7, 2.4.13 | ✅ 3px solid amber with an offset |
| 9 | Alt text typo and redundant wording | 1.1.1 | ✅ Every image re-described |
| 10 | 12px labels | Best practice | ✅ Nothing smaller than 15px |
| 11 | "Alreet!" was split into one span per letter | 1.3.1 | ✅ |
| 12 | The LinkedIn target was about 41×22px | 2.5.8 | ✅ 44px |

## Issues found and fixed on the other pages

| Page | Original issue | Rebuild |
|---|---|---|
| Case studies | The same "Recite me Sign in page" alt text on six different Design System images | ✅ Each image described individually |
| Checker | Persona cards were images of dense text with only a name as alt text | ✅ A short alt plus a full text version in a disclosure |
| Checker | Carousel for the add domain flow | ✅ Replaced with a static, captioned gallery |
| All case studies | Case study cards on the homepage weren't real links (only Changing Health navigated) | ✅ All four cards are links |
| All case studies | Mixed Poppins/Albert Sans body text, inconsistent heading levels | ✅ One type scale, H1 → H2 → H3 |
| Contact | Framer form | ✅ Labelled fields, error summary, autocomplete, and a note saying it opens your email app |
| About | Company logos duplicated the company name text | ✅ Logos marked decorative |

## Contrast

| Pair | Ratio |
|---|---|
| Navy text `#07354d` on canvas `#fffcfc` | 12.7:1 |
| Navy text on card `#f3f1ef` | 11.5:1 |
| Muted text `#4a6575` on canvas | 6.0:1 |
| White on button navy `#06334a` | 13.3:1 |
| White on black footer | 21:1 |
| Focus ring `#b35c00` on canvas / card | 4.6:1 / 4.2:1 |
| Focus ring `#ffb84d` on black | 12.2:1 |
| Error `#b42318` on canvas | 6.4:1 |

No text sits on top of images.

---

## Remaining to-dos

### Your input needed (search the HTML for `TODO (Andrew)`)

- [ ] Replace the placeholder email `hello@andrewtaws.co.uk` (footer on every page, and the Contact page and its form's `action` and `data-email`)
- [ ] Add outcomes (one to three real results) to each case study
- [ ] Add Timeline and Team to the Checker, Design System and Client Portal case studies
- [ ] Confirm the paragraphs marked "confirm" in the Design System and Client Portal case studies
- [ ] Add reflections to the Checker, Design System and Client Portal case studies
- [ ] Review the homepage specialism chips. IAAP isn't mentioned because I couldn't confirm which certification you hold.
- [ ] Optional: rename the persona "Charles Leclerc" in Figma (same name as the F1 driver) and re-export it
- [ ] Optional: check you can share the NHS screens publicly

### Testing

- [ ] Screen reader pass (VoiceOver and NVDA), then add it to the accessibility statement

### Going live

- [ ] Turn on GitHub Pages (Settings → Pages → deploy from branch)
- [ ] Add a `CNAME` file containing `andrewtaws.co.uk` and point the domain's DNS at GitHub Pages, replacing the Framer redirect
- [ ] Cancel or downgrade the Framer site once everything has moved
