# Polish pass: changelog

Round 1: the site-wide details and the Home page. All new CSS is in `src/styles/polish.css`, under headings P1 to P16. New behaviour is in `src/scripts/polish.ts`, one function per effect, listed in `initPolish()`. To switch an effect off, delete its CSS block or its `run(...)` line. Under `prefers-reduced-motion: reduce`, everything shows its final state (block P16).

| Effect | Where | How to turn it off |
|---|---|---|
| Logo rebuilt: vector emblem, original wordmark, live subline corrected to "Solutions (Private) Limited"; the scrolled header uses the official artwork (compact, no subline) | `src/components/Logo.astro`, `public/assets/markforth-wordmark.png`, used in `Header.astro` and `Footer.astro`; styles P1 | Swap `<Logo>` back to the PNG `<img>` |
| Logo hover: the emblem's stripes slide out and back, staggered | `polish.css` P1 (`pStripe`) | Delete the hover block in P1 |
| Primary buttons: sheen, 3px arrow nudge, press scale with darken | `upgrade.css` (sheen), `polish.css` P2 | P2 |
| Primary buttons: magnetic pull (desktop, at most 6px) | `motion.ts` section 8 (selector now includes `.btn-primary`) | Remove `.btn-primary` from the selector |
| Ember spark burst on press (primary buttons) | `polish.ts` `buttonSparks()` / `sparks()`; `.p-spark` in P2 | `run(buttonSparks)` |
| Outline buttons: red hairline runs round left to right; warmer fill | `polish.css` P2 | P2 |
| Dark card spotlight with a border that lights near the cursor (how we work, time zones, campaign tabs, FAQ card, status, roles and map panels) | `motion.ts` section 13 (`.spot`), `polish.css` P3 | Remove selectors from section 13 |
| FAQ items lift instead of sliding | `polish.css` P4 | P4 |
| Eyebrow label fades in after its slash | `polish.css` P5 | P5 |
| Accent words shimmer once when first seen (was looping every 6s) | `polish.ts` `shimmer()`; `polish.css` P6 | `run(shimmer)` |
| Hand-drawn red underline under "forward." on the home hero | `polish.ts` `flameLine()`; `polish.css` P6 | `run(flameLine)` |
| Glowing ember on the header reading line | `polish.ts` `progressEmber()`; `main.ts` `scrollProgress()` sets `--p`; P7 | `run(progressEmber)` |
| Page transitions: red diagonal stripe wipe (360ms) | `polish.css` P8 | P8 (the older fade in `global.css` then applies) |
| Focus ring: 2px bright red, 3px offset, soft glow | `polish.css` P9 | P9 |
| Live dots: double ring pulse (green on shift, amber off shift) | `polish.css` P10 | P10 |
| Photos: grey and red brand treatment on every photo, slow zoom to 1.04 on reveal, colour bleeds back on hover | `polish.css` P11 (scroll parallax removed from `motion.ts` section 7) | P11 |
| Footer: quieter wordmark behind the links; back to top launches with an ember trail | `polish.css` P12; `polish.ts` `launchTop()` | P12 / `run(launchTop)` |
| Hero: stray grey slanted shape removed; comet tails on the orbit dots; emblem tilt capped at 6° | `polish.css` P13; `emblem3d.ts`; `main.ts` (phone tilt) | P13 |
| Live clocks: breathing colon, minutes flip (hero chip, menu, About, Contact) | `main.ts` `tickClock()` (`data-time-fx` on the element); P13 | Remove `data-time-fx` |
| How we work: icons draw in with the section; icon box glows on hover | `polish.css` P13 | P13 |
| Campaign panel: 8px slide, icon draws itself, embers rise behind it; panel art about 40% shorter on phones; tiles glow on hover | `polish.css` P13; `CampaignArt.astro` (`.camp-art__sparks`) | P13 |
| Process: ghost numbers lift on hover; one-time nudge hint on the scrolling row | `polish.css` P13; `main.ts` `processJourney()` | P13 / the nudge block in `processJourney()` |
| Time zones: the "now" line glides; sun and moon rise into place; a few windows flicker on; city cards scroll sideways on phones | `polish.css` P13 | P13 |
| Careers teaser: icon wobble; light stripe across "All open positions" | `polish.css` P13 | P13 |
| Closing card: each step number pops with a ring | `polish.css` P13 | P13 |
| Mobile: 44px tap targets; menu links slide in from the right after their slash, clocks last; two buttons share a row in service blocks | `polish.css` P14 | P14 |
| Ember canvases draw every other frame on phones | `embers.ts`, `slantfx.ts` | Remove the `small && (frame++ & 1)` line |
| Privacy popup: one shared component, dark panel, running red stripe, corner close button, real mailto link, blurred backdrop, bottom sheet on phones, animated close, opens from `#privacy`, clears the hash on close, scroll lock | `src/components/PrivacyDialog.astro`, `polish.ts` `dialogs()`, `polish.css` P15 | P15 / `run(dialogs)` |
| "Privacy notice" link beside the submit buttons (Contact, Apply, Track) | `contact.astro`; `polish.ts` `dialogs()` (Apply, Track) | Remove the `addMini(...)` lines / the link |
| `/privacy.html` sends visitors to `/#privacy` | `src/pages/privacy.astro` | Delete the file |
| Old one-page links: `#services` and `#industries` land on the home sections; `#about` and `#contact` go to their pages | `index.astro` (section ids), `main.ts` `redirectOldAnchors()` | |
| Reveals start earlier (no empty dark block while scrolling) | `motion.ts` (trigger starts 92–97%) | |
| Keyboard: anything reached with Tab shows at once; the hidden interview list is out of the tab order | `polish.ts` `focusReveal()`; `main.ts` `trackEnhance()` | `run(focusReveal)` |
