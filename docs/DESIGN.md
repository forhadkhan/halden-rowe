# Halden & Rowe: design spec

Owner: Picasso. Written 2026-10-07 for Fena (build), Quill (words), Kolpona (photos), Rookie (blind test).
Source of truth for values: `src/styles/tokens.css`. This document names tokens; it never asks for a raw hex in a
component. Brand files: `src/assets/brand/`. Favicon: `public/favicon.svg`.

- **Subject:** Halden & Rowe, a fictional boutique agency selling and letting twelve distinctive US homes (BRIEF.md).
- **Audience:** buyers and renters of high-end homes, and owners thinking of selling; on phones first.
- **Single job of the site:** get a visitor to a home they want to see, then to an enquiry with a named agent.
- **Accessibility target:** WCAG 2.2 AA (BRIEF.md says "WCAG AA"; 2.2 is the working assumption). Plus Karkhana
  practice: every animation has a reduced-motion version.
- **Icon set:** Lucide only (section 9). Brand logos: Simple Icons.

---

## 1. Concept

### 1.1 Concept and mood (the brief for every decision below)

**"Drawn to scale."** An architect's drawing set laid inside a quiet editorial magazine.
Surfaces are limewash plaster and stone, text is a green-black ink, and the only colour is brass, used like a
draughtsman's line: dimension rules, pins, underlines. Photography carries all the warmth and drama; the interface
stays still around it. Two night sections (the map and the footer) and the hero's dusk photo give the page its depth.
Headlines are large, light, optical-size serif; everything functional is a sturdy grotesk.
Motion behaves like a pen and a camera: lines draw themselves, images open like a reveal, nothing bounces.
Signature element: **the dimension line** (section 1.3). Everything else is deliberately plain.

### 1.2 First plan, critique, revision

| Axis | First plan | Critique | Revised (this spec) |
|---|---|---|---|
| Colour | Cream `#F4F1EA`, black, terracotta `#C0643F` accent, pure black dark band | Exactly AI default 1 (cream + serif + terracotta). The brief asks for ivory and a brass/clay accent, so the axis is pinned, but the defaults are not. | Greyer, cooler limewash `#EEECE5` (plaster, not paper); brass, not terracotta, and used as **line**, never as a large fill; ink and night are green-black (`#1A1E1D`, `#121717`), never `#000`. |
| Type | Cormorant Garamond + Inter | Both are the template luxury pairing; Cormorant's hairlines break at mobile sizes. | **Newsreader** (variable, optical size 6–72: real display cut at hero sizes and a sturdy text cut for article body) + **Schibsted Grotesk** (variable 400–900, a newsroom grotesk with firmer shapes than Inter). |
| Hero | Centred headline over photo, pill search in the middle | That is Zentro and Housiq. | Headline set left and low across the dusk photo; the search panel **straddles** the hero's bottom edge, half on the photo and half on the page. |
| Signature | Giant footer wordmark | Every reference already does it (Realspace, Zentro, Housiq). | Keep the footer wordmark (brief asks for it) but make the **dimension line** the identity; the wordmark is drawn in the same monoline, so the footer reads as part of the drawing set, not a ghost watermark. |
| Decoration | Grain overlay, gradient glows, tilted cards | None of it serves the brief. | Removed. One accessory removed before handoff: a planned blueprint grid behind the hero. |

### 1.3 Signature: the dimension line

A 1px `--color-accent-line` rule with 9px end ticks and a centred label in `--text-label` uppercase
(`--tracking-label`, `--weight-strong`, `--color-accent-text` on light, `--color-accent-text` on night), the label
sitting on a gap in the rule. It appears in exactly four places, and nowhere else:

1. **Section eyebrows.** The eyebrow label sits on a dimension line as wide as the heading below it
   (max `--measure-narrow`). Draws from the centre out on reveal (motion M21).
2. **Property card and detail facts:** the floor area is shown as a dimension line under the facts row
   ("4,850 sq ft" on the rule). It encodes a real measurement, which is the point.
3. **"How it works" progress:** a vertical dimension line with four ticks, filled as you scroll (M9).
4. **Journal post reading progress:** a horizontal rule across the top of the viewport (2px, scrubbed).

Build it once as a component (`DimensionLine`, props: `label`, `orientation`, `width`) with the rule as two
`::before`/`::after` lines plus tick spans, so the label never overlaps the line. The rule is decorative
(`aria-hidden` on the lines); the label is real text.

---

## 2. Colour

### 2.1 Palette (primitives in tokens.css)

| Name | Hex | Token | Use |
|---|---|---|---|
| Limewash | `#EEECE5` | `--hr-limewash` | page background |
| Ivory | `#F8F6F0` | `--hr-ivory` | raised surfaces: cards, panels, inputs; text on ink |
| Stone 200 | `#E2DED4` | `--hr-stone-200` | sunken bands (FAQ, newsletter), skeletons |
| Stone 250 | `#E4E1D7` | `--hr-stone-250` | map land (light) |
| Stone 300 | `#CFC9BC` | `--hr-stone-300` | decorative hairlines only |
| Stone 600 | `#7B766B` | `--hr-stone-600` | control borders (3:1 on every light surface) |
| Ink 900 | `#1A1E1D` | `--hr-ink-900` | text, primary buttons, focus ring |
| Ink 800 | `#2F3533` | `--hr-ink-800` | primary hover, selected chip |
| Ink 600 | `#555A56` | `--hr-ink-600` | muted text |
| Brass 300 | `#D4B27C` | `--hr-brass-300` | accent on night: text, primary button, focus, pins |
| Brass 500 | `#B08848` | `--hr-brass-500` | **decorative** lines on light (2.75:1, carries no meaning); lines on night |
| Brass 600 | `#94702F` | `--hr-brass-600` | meaningful graphics on light (pins' pulse, active tab underline, range fill). **No text on it.** |
| Brass 700 | `#7A5823` | `--hr-brass-700` | accent text and links on light |
| Night 900 | `#121717` | `--hr-night-900` | night section background |
| Night 800 | `#1C2323` | `--hr-night-800` | night raised surfaces, map land (night) |
| Night 700 | `#2C3534` | `--hr-night-700` | night hairlines, hover |
| Night 500 | `#7A817C` | `--hr-night-500` | night control borders |
| Mist 200 | `#ECE8DF` | `--hr-mist-200` | text on night |
| Mist 400 | `#A7ABA4` | `--hr-mist-400` | muted text on night |
| Park / Water | `#D7D9C9` / `#C6D0CD` | `--hr-park`, `--hr-water` | light map fills |
| Clay 700 / 300 | `#A33A2B` / `#E8A091` | `--hr-clay-*` | error, light / night |
| Fern 700 / 300 | `#3D6845` / `#96C49E` | `--hr-fern-*` | success, light / night |
| Scrim | `#0A0D0D` at 0.64 | `--scrim-strong` | minimum behind any text on a photo |

### 2.2 Role tokens and schemes

Components use only role tokens (`--color-bg`, `--color-surface`, `--color-surface-sunken`, `--color-text`,
`--color-text-muted`, `--color-accent-text`, `--color-accent-graphic`, `--color-accent-line`, `--color-border`,
`--color-border-control`, `--color-focus`, `--color-btn-bg/-fg/-bg-hover`, `--color-chip-selected-bg/-fg`,
`--color-error`, `--color-success`, `--color-input-bg`, `--color-map-*`, `--color-pin*`).
A section becomes night with `data-scheme="night"`; every role token flips, so components need no night variant.
Stack mapping: plain CSS custom properties (no shadcn, no Tailwind); the role token **is** the CSS variable. No fallback
column is needed: every supported browser has custom properties.

Night sections: the hero (photo + scrim, header and hero text use night roles), "Explore the map", the mobile menu,
the lightbox, the 404 page and the footer.

Rules:
- Text on a photo always sits on `--scrim-strong` or the hero scrims (`--scrim-hero-top` behind the transparent
  header, `--scrim-hero-bottom` behind the headline). Checked against pure white, the worst pixel possible.
- Never text on `--hr-brass-600` or `--hr-brass-500`. Pins and buttons that hold text use ink (light) or brass 300
  (night).
- Colour never carries meaning alone: status chips have words; errors have an icon and words; the selected chip has
  a check icon and `aria-pressed`; map pins have a price label or a visible list.
- Text selection: `--color-selection-bg` / `--color-selection-fg`.

### 2.3 Contrast check (script: design-craft `references/contrast.md`, run 2026-10-07)

Every pair passes; 0 FAIL. Rejected on the way and fixed in the palette: brass 500 as a meaningful graphic on light
(2.75:1, now brass 600), control border `#858075` on sunken (2.93:1, now `#7B766B`), a 0.55 hero scrim (4.29:1,
now 0.64), ivory text on brass 600 (4.21:1, now banned). The lines below are regrouped from the script's output;
one redundant line (an earlier flattening of the 0.64 scrim, `#5C5F5F`, 5.97:1) is left out in favour of the stricter
hand-flattened `#626464`.

```
PASS 14.24:1 need 4.5 #1A1E1D on #EEECE5 text on page
PASS 15.58:1 need 4.5 #1A1E1D on #F8F6F0 text on raised
PASS 12.53:1 need 4.5 #1A1E1D on #E2DED4 text on sunken
PASS  5.96:1 need 4.5 #555A56 on #EEECE5 muted on page
PASS  6.51:1 need 4.5 #555A56 on #F8F6F0 muted on raised
PASS  5.24:1 need 4.5 #555A56 on #E2DED4 muted on sunken
PASS  7.04:1 need 4.5 #555A56 on #FFFFFF muted on white input
PASS  5.47:1 need 4.5 #7A5823 on #EEECE5 brass-text on page
PASS  5.98:1 need 4.5 #7A5823 on #F8F6F0 brass-text on raised
PASS  4.81:1 need 4.5 #7A5823 on #E2DED4 brass-text on sunken
PASS 15.58:1 need 4.5 #F8F6F0 on #1A1E1D primary button text
PASS 11.58:1 need 4.5 #F8F6F0 on #2F3533 primary hover / chip selected text
PASS  6.08:1 need 4.5 #A33A2B on #F8F6F0 error text raised
PASS  5.56:1 need 4.5 #A33A2B on #EEECE5 error text page
PASS  5.95:1 need 4.5 #3D6845 on #F8F6F0 success text raised
PASS  5.44:1 need 4.5 #3D6845 on #EEECE5 success on page
PASS 14.24:1 need 3 #1A1E1D on #EEECE5 focus ring on page
PASS 15.58:1 need 3 #1A1E1D on #F8F6F0 focus ring on raised
PASS  3.82:1 need 3 #7B766B on #EEECE5 control border on page
PASS  4.18:1 need 3 #7B766B on #F8F6F0 control border on raised
PASS  3.36:1 need 3 #7B766B on #E2DED4 control border on sunken
PASS  3.45:1 need 3 #7B766B on #E4E1D7 control border on map land
PASS  3.85:1 need 3 #94702F on #EEECE5 brass-600 pin/line on page
PASS  4.21:1 need 3 #94702F on #F8F6F0 brass-600 on raised
PASS  3.39:1 need 3 #94702F on #E2DED4 brass-600 on sunken
PASS  3.48:1 need 3 #94702F on #E4E1D7 brass-600 pin on map land
PASS 15.58:1 need 4.5 #F8F6F0 on #1A1E1D price pill text on ink pin
PASS 12.87:1 need 4.5 #1A1E1D on #E4E1D7 text on map land
PASS  5.38:1 need 4.5 #555A56 on #E4E1D7 muted on map land
PASS 11.75:1 need 4.5 #1A1E1D on #D7D9C9 map label on park
PASS 10.67:1 need 4.5 #1A1E1D on #C6D0CD map label on water
PASS  5.51:1 need 4.5 #F8F6F0 on #626464 hero text on 0.64 scrim #0A0D0D over pure white (flattened by hand)
PASS 14.80:1 need 4.5 #ECE8DF on #121717 text on night
PASS 13.07:1 need 4.5 #ECE8DF on #1C2323 text on night raised / popup
PASS 10.31:1 need 4.5 #ECE8DF on #2C3534 text on night hover
PASS  7.76:1 need 4.5 #A7ABA4 on #121717 muted night
PASS  6.85:1 need 4.5 #A7ABA4 on #1C2323 muted night raised / map label on night land
PASS  6.23:1 need 4.5 #A7ABA4 on #222B29 map label on night park
PASS  7.12:1 need 4.5 #A7ABA4 on #18201F map label on night water
PASS  9.01:1 need 4.5 #D4B27C on #121717 brass-300 text on night
PASS  7.96:1 need 4.5 #D4B27C on #1C2323 brass-300 on night raised
PASS  9.01:1 need 4.5 #121717 on #D4B27C night button text / pin price text
PASS 14.80:1 need 4.5 #121717 on #ECE8DF night button hover text
PASS  4.53:1 need 3 #7A817C on #121717 control border night
PASS  4.00:1 need 3 #7A817C on #1C2323 control border night raised
PASS  9.01:1 need 3 #D4B27C on #121717 focus ring night
PASS  7.96:1 need 3 #D4B27C on #1C2323 pin on night land
PASS  7.23:1 need 3 #D4B27C on #222B29 pin on night park
PASS  5.57:1 need 3 #B08848 on #121717 brass-500 line on night
PASS  8.50:1 need 4.5 #E8A091 on #121717 error night page
PASS  7.51:1 need 4.5 #E8A091 on #1C2323 error night raised
PASS  9.21:1 need 4.5 #96C49E on #121717 success night
```

Exempt by design (decorative, carry no meaning): `--hr-stone-300` hairlines, brass 500 dimension lines and
illustrations on light, map roads (`--color-map-road`), the brand marks.

---

## 3. Typography

### 3.1 Families (self-hosted, @fontsource, `font-display: swap`)

| Role | Family | Package and import | Axes |
|---|---|---|---|
| Display + article body | Newsreader | `@fontsource-variable/newsreader/opsz.css` and `.../opsz-italic.css` | opsz 6–72, wght 200–800, italic |
| UI + body | Schibsted Grotesk | `@fontsource-variable/schibsted-grotesk/wght.css` (no italic needed) | wght 400–900 |

Verified on api.fontsource.org on 2026-10-07 (both v5.3.0, OFL-1.1). Import the `latin` subset only; let the
package's `unicode-range` do the rest. Preload only the Newsreader roman latin file (hero headline is above the fold).
Set `font-optical-sizing: auto` (default) so Newsreader picks its display cut at large sizes. Use
`font-variant-numeric: tabular-nums` on prices, stats, the calculator and counters; `lining-nums` on all Newsreader
numerals. Fallback stacks are in `--font-display` / `--font-sans`; add `size-adjust` fallbacks via Astro's font
tooling or `@font-face` overrides to keep CLS at 0.

### 3.2 Scale (fluid from 360 px to 1440 px, capped; tokens in tokens.css section 3)

| Token | Min → max px | Family / weight | Line height | Tracking | Used for |
|---|---|---|---|---|---|
| `--text-display-xl` | 48 → 128 | Newsreader 360 | 0.95 | -0.025em | hero H1, 404, About H1 |
| `--text-display-l` | 38 → 88 | Newsreader 360 | 1.02 | -0.02em | section H2, page H1 |
| `--text-display-m` | 30 → 56 | Newsreader 360 | 1.08 | -0.015em | CTA band, quote, mobile menu links, calculator result |
| `--text-display-s` | 24 → 36 | Newsreader 400 | 1.15 | -0.01em | H3, large card titles, journal titles |
| `--text-stat` | 44 → 96 | Newsreader 300, lining tabular | 1.0 | -0.02em | trust numbers |
| `--text-title` | 20 → 24 | Schibsted 500 | 1.3 | 0 | card titles, H4, prices (600) |
| `--text-lead` | 18 → 22 | Schibsted 400 (Newsreader 400 in article body) | 1.5 (1.6 article) | 0 | intros, article body |
| `--text-body` | 16 → 17 | Schibsted 400 | 1.6 | 0 | body |
| `--text-small` | 14 → 15 | Schibsted 400/500 | 1.5 | 0.005em | meta, captions, form hints, buttons (500) |
| `--text-label` | 12 → 13 | Schibsted 600, uppercase | 1.2 | 0.14em | eyebrows, dimension labels, status chips |

Italic: Newsreader italic at `--weight-display-italic` for one emphasised word or phrase in a headline (Quill marks it
with `<em>`), never a whole headline. Measure: body `--measure` (66ch), lead and headings `--measure-narrow` where
set. Headlines: `text-wrap: balance`; paragraphs: `text-wrap: pretty`. Never letter-space lowercase body text.

---

> **Override (2026-10-07, Forhad): no focus rings anywhere.** `global.css` sets `outline: none` on `:focus` and `:focus-visible`, and every per-component ring, offset and ring-gap shadow was removed. Text fields still darken their border on focus, cards keep their hover treatment on `:focus-within`, and the accordion door handle still brightens. Everything below that describes a "ring" is superseded. This leaves keyboard users without a visible focus indicator (WCAG 2.4.7); revisit before a real launch.

## 4. Space, radius, shadow, z-index

All in tokens.css sections 4 to 10. How to use them:

- **Space:** 4px steps `--space-1` … `--space-40`. Layout uses the three fluid tokens: `--space-gutter`
  (page side padding and grid gap, 20 → 40), `--space-block` (heading to content, 32 → 64), `--space-section`
  (between sections, 72 → 160). Night sections pad with `--space-section` inside their own background.
- **Radius:** images in cards `--radius-sm` (4px); inputs `--radius-sm`; search panel, calculator, lightbox frame
  `--radius-md` (8px); CTA band and newsletter panel `--radius-lg` (16px); buttons, chips, tabs and price pins
  `--radius-pill`. **Arch** (`--radius-arch`, top fully rounded) is reserved for: service cards, the about teaser
  image and the about page hero image. It echoes the monogram's doorway; do not spread it further.
- **Shadow:** cards are flat (no shadow) at rest; `--shadow-md` on card hover only for the search panel and popups;
  `--shadow-lg` on the hero search panel; `--shadow-popup` on map popup, dropdown listboxes and toasts.
- **Focus:** `outline: var(--focus-width) solid var(--color-focus); outline-offset: var(--focus-offset)` on every
  focusable element via `:focus-visible`. Over photos (card save button, gallery), add `--shadow-focus-gap` so the
  ring has its own background.
- **Z-index:** use the named layers only (`--z-sticky` 100 … `--z-cursor` 800). Header 200, map popup 350, menu 450,
  lightbox and filter sheet 500, skip link 700.

---

## 5. Layout grid and breakpoints

| Name | Min width | Columns | Gutter | Container |
|---|---|---|---|---|
| base | 320 (design floor; brief checks from 360) | 4 | `--space-gutter` (20) | fluid, side padding = gutter |
| sm | 480 (30rem) | 4 | 20–24 | fluid |
| md | 768 (48rem) | 8 | ~26 | fluid |
| lg | 1024 (64rem) | 12 | ~32 | fluid |
| xl | 1280 (80rem) | 12 | ~37 | fluid up to `--container-max` 1440 |
| 2xl | 1536 (96rem) | 12 | 40 | 1440 content, centred |
| 3xl | 1920 (120rem)+ | 12 | 40 | content 1440; full-bleed rows (hero, CTA band, footer wordmark, journal hero image) cap at `--container-wide` 1680 or go edge to edge (hero only) |

- Grid: `display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: var(--space-gutter)` inside
  `.container { width: min(100% - 2 * var(--space-gutter), var(--container-max)); margin-inline: auto }`.
- Media queries use the literal rem values above (custom properties cannot be used in `@media`). Use container
  queries inside cards (`container-type: inline-size`) for card internals.
- 4K (2560–3840): the type scale caps at 1440, content stays 1440 wide; the hero photo is the only edge-to-edge
  element. Serve hero at 2400px long edge (Kolpona's size) with `object-fit: cover`; never upscale other images past
  their intrinsic width.
- **200% zoom** on a 1280 window = 640 CSS px: the md/base layout applies; nothing is clipped; the header is the
  mobile header. **400% zoom** = 320 px: single column; the only content allowed to scroll sideways is none (the map
  scales as an SVG; the gallery is a deliberate scroll-snap row with visible controls).
- No horizontal page scroll at any width: `overflow-x: clip` on `body` is a backstop, not a fix; full-bleed rows use
  `width: 100%`, never `100vw`.
- Header height `--header-height` (72) → `--header-height-compact` (64) below md. `scroll-padding-top` on `html` =
  header height + `--space-4`, so anchor jumps and focus never land under the header.
- Tap targets: project choice of `--tap-min` 44×44 for every control (WCAG 2.5.8's minimum is 24). Icon buttons are
  44×44 even when the visible circle is 36.

---

## 6. Motion system

Stack: GSAP + ScrollTrigger (+ SplitText, free since GSAP 3.13) and Lenis, bundled. Rules:

1. **Visible without JS.** Content renders in its final state. A tiny inline script in `<head>` adds `.motion-ok` to
   `<html>` only when `matchMedia('(prefers-reduced-motion: no-preference)').matches`; pre-animation hidden states are
   written only under `.motion-ok`. No-JS and reduced-motion visitors never see hidden content.
2. **All GSAP inside `gsap.matchMedia()`** with conditions `motion: "(prefers-reduced-motion: no-preference)"`,
   `fine: "(hover: hover) and (pointer: fine)"`, `desktop: "(min-width: 64rem)"`. Reverting is automatic when a
   condition flips.
3. **Only `transform`, `opacity`, `clip-path`, `stroke-dashoffset`** animate. Nothing that changes layout. CLS 0.
4. **Once.** Entrance reveals run once (`once: true`); they do not replay on scroll back.
5. **Lenis** only when `motion` and `fine` both match (desktop with mouse/trackpad): `lerp: 0.1`, `wheelMultiplier: 1`,
   wired to ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)`, Lenis raf on `gsap.ticker`, `lagSmoothing(0)`).
   Off on touch and on reduced motion: native scroll. Lenis must stop (`lenis.stop()`) while the mobile menu,
   lightbox or filter sheet is open.
6. **Anything that moves for more than 5 seconds has a pause control** (marquee). WCAG 2.2.2.
7. **Cross-document view transitions:** `@view-transition { navigation: auto; }`; root cross-fade `--dur-base`.
   Shared element: a listing's exterior image on the card and on the detail gallery share
   `view-transition-name: home-<slug>` (set inline). Under reduced motion:
   `::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none; }`.

### 6.1 Motion catalogue (pages reference these IDs)

| ID | Name | Technique | Trigger | Duration / stagger | Easing | Reduced-motion fallback |
|---|---|---|---|---|---|---|
| M1 | Hero slow zoom | CSS `@keyframes` scale 1.08 → 1.0 on the `<img>` inside an `overflow: clip` frame | image `decode()` resolves (or load) | `--dur-hero-zoom` 9s, once | `--ease-out` | static, scale 1 |
| M2 | Headline line reveal | SplitText `type: "lines"`, each line wrapped in a mask (`overflow: clip`, `padding-bottom: .08em` so descenders survive); line `yPercent: 105 → 0` | hero: on fonts ready (`document.fonts.ready`) + 120ms; elsewhere ScrollTrigger `start: "top 82%"`, once | `--dur-reveal` 1.1s, stagger `--stagger-md` 110ms | `--ease-out-expo` (expo.out) | no split; text visible. Keep `aria-label` on the heading with the full text, split lines `aria-hidden`. Re-split on resize (SplitText `autoSplit`). |
| M3 | Search panel rise | `y: 32 → 0`, `opacity: 0 → 1` | 500ms after M2 starts | `--dur-slower` 0.8s | `--ease-out` | visible |
| M4 | Clip reveal | wrapper `clip-path: inset(100% 0 0 0) → inset(0)` (bottom up) with the inner image `scale: 1.12 → 1` | ScrollTrigger `start: "top 85%"`, once | `--dur-reveal` 1.1s | `--ease-out-expo` | visible, no clip; optional `opacity` 0 → 1 over 200ms |
| M5 | Soft parallax | inner image 112% tall, `yPercent: -6 → 6` scrubbed (`scrub: true`) while the frame crosses the viewport | ScrollTrigger `start: "top bottom", end: "bottom top"` | scrubbed | `none` | off, image static and centred |
| M6 | Staggered entrance | `ScrollTrigger.batch` on cards: `y: 40 → 0`, `opacity: 0 → 1` | `start: "top 88%"`, once | `--dur-slower` 0.8s, stagger `--stagger-sm` 70ms, max 6 per batch | `--ease-out` | visible |
| M7 | Count-up | GSAP tween on an object, writes `Intl.NumberFormat` text into an `aria-hidden` span; a visually hidden span holds the final value from the server | `start: "top 80%"`, once | `--dur-count` 1.8s, stagger 120ms | `power2.out` | final value shown |
| M8 | Marquee | CSS `translateX(0 → -50%)` on a track holding two copies (second `aria-hidden`) | always, paused on `:hover`, `:focus-within` and by the pause button | `--dur-marquee` 48s per loop | `linear` | no animation; items wrap onto two lines, centred; pause button hidden |
| M9 | Pinned steps | desktop only: section pinned (`pin: true, end: "+=300%"`), `scrub: 0.6`; timeline per step: illustration layers draw (M10 scrubbed), step text crossfades (`opacity`, `y: 16`), vertical dimension line `scaleY` 0 → 1 | `desktop` + `motion` | scrubbed | `none` inside scrub | no pin: steps stacked, each illustration fully drawn |
| M10 | Line draw | per path `stroke-dasharray: 1; stroke-dashoffset: 1 → 0` (paths have `pathLength="1"`), layers in `data-layer` order | ScrollTrigger `start: "top 75%"`, once (or scrubbed inside M9) | `--dur-draw` 1.6s per illustration, layer stagger 250ms | `--ease-in-out` | fully drawn, static |
| M11 | Pin drop + pulse | pins `y: -12 → 0`, `opacity` 0 → 1, staggered; then CSS keyframe pulse ring `scale .6 → 2.2`, `opacity .5 → 0`, delays offset per pin (`--i * 300ms`) | map enters `top 70%`, once; pulse infinite | drop 600ms, stagger 80ms; pulse 2.4s | drop `--ease-out`; pulse `ease-out` | pins visible, no pulse; static ring at opacity .35 |
| M12 | Magnetic button | `gsap.quickTo` on x/y: button moves toward pointer, max 6px (strength 0.25), label 0.4× extra; resets on leave | `fine` + `motion`, pointer inside the button's box + 16px | 400ms follow, 600ms reset | `power3.out` | off |
| M13 | Card hover | image `scale 1 → 1.05`; a "View home" line with chevron-right slides in (`x: -8 → 0`, `opacity`); also on `:focus-within` | hover / focus-within | image `--dur-slow` 480ms, line `--dur-base` 280ms | `--ease-standard` | no scale or slide; title underline appears instead |

**Featured homes and Journal cards** use a second hover instead of M13: a dark disc with `arrow-up-right` fades in over the photo, a 1px `--hr-night-800` frame appears 12px outside the card, and the text sits on a `--hr-night-800` panel (mist text, brass price or "Read article") scaled to .92. Opacity, scale and colour only; the card never moves. Source: PropertyCard `--arrow`, `styles/card-hover.css`.
| M14 | Header behaviour | hide: `translateY(-100%)` when scrolling down past 120px with delta > 8px; show on any scroll up. Transparent over hero, solid `--color-surface` + hairline once the hero's bottom passes the header | ScrollTrigger on hero end; scroll direction | `--dur-base` 280ms | `--ease-standard` | header never hides; colour switch instant |
| M15 | Mobile menu | panel `clip-path: inset(0 0 100% 0) → inset(0)`; links `y: 24 → 0`, `opacity` staggered | menu button | open `--dur-slow` 480ms, links start +160ms, stagger 60ms; close 320ms | open `--ease-in-out`, links `--ease-out`, close `--ease-in` | opacity fade 150ms, no clip, no stagger |
| M16 | Cursor follow | 76px ink disc (night: brass 300 with night text) labelled "View" follows pointer via `quickTo` | `fine` + `motion`, only inside `[data-cursor="view"]` (card images, detail gallery) | follow 350ms; scale 0 → 1 on enter 280ms | `power3.out` | off; native cursor always stays visible |
| M17 | Page transition | CSS view transitions (rule 7 above) | navigation | `--dur-base` | `--ease-standard` | none |
| M18 | Accordion | panel `grid-template-rows: 0fr → 1fr` (or `interpolate-size: allow-keywords` + `height: auto`), chevron rotates 180° | toggle | 380ms panel, `--dur-base` chevron | `--ease-in-out` | instant |
| M19 | Slider change | outgoing quote `opacity 1 → 0, y 0 → -12`, incoming `0 → 1, 12 → 0`; photo `clip-path: inset(0 0 0 100%) → inset(0)` | chevron buttons, arrow keys, swipe | quote `--dur-slow`, photo `--dur-slower` | quote `--ease-out`, photo `--ease-out-expo` | instant swap |
| M20 | Lightbox | FLIP from thumbnail rect to centred frame; backdrop `opacity 0 → 1` | open / close | open `--dur-slow`, backdrop `--dur-base`, close 320ms | `--ease-in-out` | fade 150ms |
| M21 | Dimension line draw | rule halves `scaleX 0 → 1` from the label outward, ticks `opacity 0 → 1` after | `start: "top 85%"`, once | `--dur-slower` 0.8s | `--ease-out-expo` | drawn |
| M22 | Map popup | `scale .96 → 1`, `opacity 0 → 1`, `transform-origin` at the pin | pin activate | open `--dur-base`, close `--dur-fast` | open `--ease-out`, close `--ease-in` | instant |
| M23 | Neighbourhood photo swap | new photo `clip-path: inset(0 100% 0 0) → inset(0)` over the old, old fades | hover or focus on a row | 600ms | `--ease-out-expo` | instant swap |
| M24 | Footer wordmark rise | each letter path inside a clipped group: `yPercent 100 → 0`, stagger 40ms | wordmark `top 95%`, once | `--dur-reveal` | `--ease-out-expo` | static |
| M25 | Filter results | `document.startViewTransition()` around the DOM update; cards keep `view-transition-name: card-<slug>` | filter/sort change | `--dur-base` | `--ease-standard` | plain DOM update |
| M26 | Auto reveal | motion.ts tags blocks in `<main>` and the footer that sit below the fold at load (`data-auto`): headings h1-h3 become M2, other blocks `y: 24 → 0`, `opacity 0 → 1`. Topmost block wins (a card moves as one; `[data-reveal-unit]` groups a footer column). Skips hand-tuned motion (data-reveal/split/clip/parallax/speed/mouse/magnetic/draw/letters/dim/count) and the hero, sliders, FAQ doors, filters, results, steps, places, map, gallery, `[hidden]`, dialogs | IntersectionObserver, 12% visible, once | `--dur-slower`, stagger 70ms, max 6 | `--ease-out` | `html.motion-soft`: opacity-only 400ms fade, also for blocks M2/M4/M6 would have animated |
| M27 | Hero tower Ken Burns + float | tower `<img>`: `translate 0 → -6px` (alternate) and `scale 1 → 1.03` from its base | always | `--dur-float` 9s, zoom 22.5s, alternate | `--ease-in-out` | static |
| M28 | Hero dome breathing | dome `scale 1 → 1.03` from its base | always | 13.5s alternate | `--ease-in-out` | static |
| M29 | What we do drift | each arch photo frame `translate 0 → 10px` down, out of step (`--i * -2.75s`) | always | `--dur-drift` 11s alternate | `--ease-in-out` | static |
| M30 | Button shine | faint white band (`::before` of `.btn__shine`) crosses primary buttons, under the label and the hover fill | always, 2s after load | `--dur-shine` 8s cycle, crossing in the first 20% | `--ease-in-out` | none |
| M31 | CTA light sweep | warm band (`.light-sweep::before`) crosses the CTA photo under its scrim | always | `--dur-sweep` 11s cycle, crossing in the first 30% | `--ease-in-out` | none |
| M32 | Eyebrow breathing | drawn dimension-line rules `opacity 1 → .4` | after M21 | `--dur-float` 9s alternate | `--ease-in-out` | static |
| M33 | Cities shimmer | a brass 300 copy of each state outline (`<use>`) glows `opacity 0 → .9 → 0`, tile after tile (`--i * 0.5s`) | always | `--dur-shine` 8s cycle | `--ease-in-out` | none |
| M34 | Curtain hero | home hero `position: sticky` (`.is-curtain`) while it fits the viewport; `.home-cover` (opaque, z-index 1) slides over it; hero children `opacity → .4`, `scale → .96` scrubbed until covered | scroll from 0 until the cover's top meets the viewport top | scrubbed | `none` | no pin, normal flow |

M27-M33 loops run only under `.motion-ok`, transform/opacity only, and read `animation-play-state` from
`--ambient-play`: motion.ts pauses a `[data-ambient]` block while it is off screen (or fully covered, the hero) and
every loop while the tab is hidden. M11's pin pulse (2.4s) is the one older loop that cycles faster than 6s.
Open for Forhad/Picasso: rule 6 (pause control for motion over 5s, WCAG 2.2.2) is not met by M27-M33; the
reduced-motion preference turns them off, but there is no on-page pause control.

#### 6.2 Motion pass (built in `src/scripts/motion.ts`)

A second layer of depth sits on top of M1-M25. One rule governs it: **cards never translate or tilt on hover.** The
photo, the border and the price colour respond; the card stays put.

- **Hero:** curtain (M34): the hero stays pinned while the page slides up over it (only when it fits the viewport),
  plus a pointer lean on a fine pointer at desktop widths. The earlier scroll-speed layers were removed.
- **Featured:** the clip reveal is scrubbed to scroll (`data-clip="scrub"`), and at 1024 and up the card row drifts
  and the second card sits on its own layer.
- **Depth layers:** `data-speed` moves an element by CSS `translate` on tablet and desktop. Variants:
  `data-speed-phone` (a phone value), `data-speed-scope` (the element whose scroll range drives it) and
  `data-speed-mode="settle"` (starts offset and comes to rest). `data-mouse` gives pointer depth inside a
  `[data-mouse-root]`. `data-parallax="desktop"` adds drift and scale on desktop only. Used on trust stats, line
  drawings, card and journal images, and the CTA, about and post photos.
- **Map pins:** three depths, with the settle float.
- **Hover and press:** button fill sweep; nav underline draws in and out; chip press with a check pop; card hover =
  photo zoom + brass border + price colour change.
- **Reduced motion:** every item above has a static version (no layers, no lean, no sweep or draw; hover changes
  colour and border only).

Purpose lines (why each exists): M1–M3 set the cinematic first frame (brief); M4/M5 let photos "open" like a
reveal; M6/M7 pace dense rows; M8 shows reach without a list; M9/M10/M21 are the drawing-set signature; M11 points
to homes on the map; M12/M13/M16 make the clickable thing feel clickable on a mouse; M14 gives back screen space;
M15/M18–M20/M22 explain where a panel came from; M17/M25 keep context across a change; M23/M24 add the
editorial finish. If performance budget forces cuts, cut in this order: M16, M12, M5, M24, M8.

---

## 7. Brand

Identity applied: **direction B, "Et"** (one of three options; see `docs/brand/LOGO-OPTIONS.md`). The ampersand is
drawn as the old Latin *et*: the E's middle arm runs on to become the t's crossbar, so the two names are joined by one
shared stroke. The capitals are high-contrast and drawn, not typed (thick stems, hairline arms), and the t's top is cut
on the oblique of a dimension tick, which ties it to the signature in 1.3. Files are hand-built SVG, single colour via
`currentColor`, so they take the text colour of any scheme:

| File | Use | Min size | Clear space |
|---|---|---|---|
| `src/assets/brand/wordmark.svg` (viewBox -3 0 463 48) | header (height 16 → 18px), footer giant wordmark, OG image | 120px wide | one cap-H width (about 6% of width) all round |
| `src/assets/brand/monogram.svg` (48×48) | mobile header (28px), footer (40px), OG image corner | 24px | 8 units |
| `public/favicon.svg` (32×32) | `<link rel="icon" type="image/svg+xml">`; the Et with heavier hairlines so it holds at 16px, on light and dark browser chrome | 16px | n/a |

- **Wordmark:** the drawn high-contrast capitals with the Et ligature as the ampersand. It is drawn, not typeset, so it
  renders identically everywhere and pairs with Newsreader headings.
- **Monogram and favicon:** the Et ampersand alone. Below 24px use the favicon, not the monogram (its hairlines thin
  out under 1px there).
- **Options kept:** A "Swing" (the R drawn as a door swing) and C "Hinge" (a hinge as the ampersand) are in
  `docs/brand/options/`. The previous identity (monoline capitals, arched H/R doorway) is in `docs/brand/previous/`
  to roll back to.
- Inline both as SVG in Astro (so `currentColor` works): `aria-label="Halden & Rowe"` on the home link that wraps
  the wordmark; the SVG's own `<title>` says "Halden & Rowe", so a reader does not hear "Et". Colour: ink on light, mist on night. Never brass
  (brass is the line colour, and brass 500 fails 3:1 on light).
- Rename: the marks spell the placeholder name. If the brand is renamed, these three files need redrawing; record that
  in `src/data/site.ts` as a comment next to the name (Fena).
- **Giant footer wordmark:** the same `wordmark.svg`, `width: 100%` of the footer container (`--container-wide`
  max), colour `--color-text` (mist 200) on night, placed last in the footer above the legal row, `aria-hidden="true"`
  (the brand name is already in the footer as text). Animation M24.
- Placeholder identity only; no trademark search has been done and none is implied.

---

## 8. Line-drawing accents (`src/assets/brand/illustrations/`)

Four decorative SVGs (the card asked for three; `floor-plan.svg` is added so "How it works" has one drawing per
step). All `aria-hidden`, `currentColor` stroke, `pathLength="1"` on every path, layers named in `data-layer` for
the draw order (M10). Colour: `--color-accent-line` (brass 500 on light, brass 500 on night). Strokes: 1.5 main,
1 openings, 0.75 fine/dimension, scaling with the SVG; never draw them below 160px wide.

| File | Drawing | Layers (draw order) | Where |
|---|---|---|---|
| `house-blueprint.svg` (320×240) | elevation: gabled volume + flat-roofed glazed wing with cantilevered slab, ground line, width and height dimension lines | ground, structure, openings, dimensions | About teaser (corner), How it works step 3, properties empty state |
| `skyline.svg` (480×200) | ten towers: stepped deco crown with spire, slanted tower with mullions, water tower, antenna tower with floor lines; water reflection dashes | ground, towers, detail, water | How it works step 1, About page values band |
| `floor-plan.svg` (320×240) | top-down plan: outer walls with window glazing, bedroom, bath, open living, three door swings, furniture outlines, dimensions | walls, partitions, openings, furniture, dimensions | How it works step 2, contact page aside |
| `key.svg` (240×120) | round bow with a house-shaped cut-out, shank with groove, two-step bit | outline, house, groove | How it works step 4, newsletter, 404 |

Inline them (Astro `?raw` import or an `<Illustration name>` component) so CSS can reach the paths.

---

## 9. Icons

**Lucide only** (`lucide-static` or `@lucide/astro`, inline SVG; checked 2026-10-07 against lucide-static 1.52.0,
every name below exists). Default size 20px, `stroke-width: 1.5`, `stroke: currentColor`; 16px inside chips and
facts; 24px in icon buttons. Decorative icons next to text get `aria-hidden="true"`; icon-only buttons get an
`aria-label` (Quill writes it). No emoji anywhere, no icon fonts. **No arrow icons for direction:** every
back/next, carousel, breadcrumb separator, "view all", pagination and accordion uses a chevron.

| Purpose | Lucide name |
|---|---|
| Navigation / direction | `chevron-left`, `chevron-right`, `chevron-down`, `chevron-up` |
| Sort select indicator | `chevrons-up-down` |
| Menu open / close, remove chip | `menu`, `x` |
| Search | `search` |
| Location, map | `map-pin`, `map`, `locate-fixed` |
| Facts | `bed-double`, `bath`, `ruler-dimension-line`, `car-front`, `trees` (garden), `waves` (waterfront), `flame` (fireplace), `sofa` (furnished), `sun` (south-facing), `square-parking`, `calendar` (year built) |
| Save, share, copy | `heart`, `share-2`, `copy` |
| Gallery / lightbox | `images` (show all photos), `maximize-2`, `zoom-in`, `zoom-out` |
| View toggle (properties) | `layout-grid`, `list` |
| Filters | `sliders-horizontal`, `rotate-ccw` (clear all) |
| Contact | `phone`, `mail`, `clock`, `send` |
| Status / feedback | `check`, `circle-check`, `circle-alert`, `info`, `loader-circle` (spinning, stops under reduced motion) |
| Calculator | `calculator`, `plus`, `minus` (steppers) |
| Services | `house` (buying), `hand-coins` (selling), `key-round` (renting), `file-text` (valuation), `building-2`, `landmark` |
| Testimonials | `quote`, `star` (rating, with text "5 out of 5") |
| Marquee | `pause`, `play` |
| Print (detail page) | `printer` |
| Agent | `user-round` (portrait fallback only) |

**Simple Icons** (social, footer and post share; checked against simple-icons 16.34.0): `instagram`, `facebook`, `x`,
`youtube`, `pinterest`. **LinkedIn is not in Simple Icons** (removed at the brand's request): do not add a LinkedIn
icon from another source; if Forhad wants LinkedIn, use a text link. Brand icons: 20px, `currentColor`, inside 44px
links with `aria-label` "Halden & Rowe on Instagram" etc.

---

## 10. Components

State table legend: values are tokens. "n/a" states give the reason.

### 10.1 Header and navigation

- **Desktop (≥1024):** height `--header-height`. Left: wordmark (18px tall) linking home. Centre: primary links
  (`--text-small`, 500): Buy, Rent, Sell, About, Journal (Buy → `/properties?status=buy`, Rent →
  `/properties?status=rent`, Sell → `/contact?topic=valuation`). Right: phone link (`phone` icon + number, ≥1280 only),
  secondary small button "Book a valuation" (Quill's label). Current page: 1.5px underline `--color-accent-graphic`
  2px below the text, plus `aria-current="page"`.
- **Over the hero:** `data-scheme="night"` on the header, transparent background over `--scrim-hero-top`. After the
  hero (M14) it switches to light: `--color-surface` background + 1px `--color-border` bottom. On pages without a photo
  hero it is light from the start.
- **Below 1024:** monogram (28px) + wordmark (14px tall, hidden below 360) left; right a "Menu" button (visible word +
  `menu` icon, 44px tall).
- **Skip link:** first element, "Skip to content", visually hidden until focus, then an ink pill top-left at
  `--z-skip`.
- Pattern: `<header>` + `<nav aria-label="Main">` list of links (not a menu widget).

| State | Link | Header |
|---|---|---|
| default | `--color-text` | transparent (hero) / surface |
| hover | underline `--color-accent-graphic` scales in from left `--dur-fast` | n/a: no hover state |
| focus-visible | focus ring | never hides while focus is inside |
| active / current | underline fixed, `aria-current` | n/a |
| hidden (scrolling down) | n/a | `translateY(-100%)` (M14), not under reduced motion |

### 10.2 Mobile menu

Native `<dialog>` opened with `showModal()` (focus trap, Esc and inert page for free); night scheme; full screen.
Top row repeats the header so the close button (`x` + "Close") sits exactly where "Menu" was. Links in
`--text-display-m` Newsreader, stacked, left-aligned, 56px rows, hairline separators; under them the phone, email,
and social icons; the "Book a valuation" primary button pinned to the bottom (safe-area padding). Opening: M15.
Focus goes to the first link; on close it returns to the Menu button. Body scroll locked (`overflow: clip` on html)
and Lenis stopped while open. Tapping a link closes the menu after navigation starts.

| State | Menu button | Link in panel |
|---|---|---|
| default | ink text + icon | `--color-text` (mist) |
| hover | underline | brass 300 text |
| focus-visible | ring | ring (brass 300) |
| active / current | `aria-expanded="true"` | `aria-current`, small brass dot left of the link, plus the word in a visually hidden span "current page" |
| disabled, loading, empty, error | n/a: always available, static content | n/a |

### 10.3 Buttons

| Variant | Light | Night | Shape |
|---|---|---|---|
| Primary | bg `--color-btn-bg`, text `--color-btn-fg` | same tokens (flip to brass 300 + night text) | pill, height 48 (md), 40 (sm), 56 (lg); padding-inline 24 / 18 / 28 |
| Secondary | transparent bg, 1px `--color-border-control` border, text `--color-text` | same tokens | pill |
| Text link | `--color-text`, underline 1px offset 4px, optional trailing `chevron-right` 16px | same | inline |
| Icon button | 44×44 hit area, 36px visible circle, `--color-surface` bg on photos, transparent elsewhere | same | circle |

Label: `--text-small` 500, `--tracking-button`, sentence case. Icon + label gap `--space-2`. Primary and secondary get
M12 on fine pointers.

| State | Primary | Secondary | Text link | Icon button |
|---|---|---|---|---|
| default | as above | as above | as above | as above |
| hover | bg `--color-btn-bg-hover` `--dur-fast` | border `--color-text`, bg `--color-surface` | underline thickens to 2px, chevron `x: 2px` | bg `--color-surface-sunken` |
| focus-visible | ring, offset 3px | ring | ring | ring + `--shadow-focus-gap` on photos |
| active | `scale(.98)` `--dur-instant` | same | n/a: inline text | `scale(.94)` |
| disabled | `opacity .45`, `cursor: not-allowed`, `aria-disabled` only where the reason is shown next to it; prefer not disabling | same | n/a | same |
| loading | label kept, `loader-circle` replaces the icon, `aria-busy="true"`, text "Sending…" (Quill) | same | n/a | n/a |
| success / error | handled by the form status region (10.8), not the button | | | |

### 10.4 Chips

- **Filter chip** (toggle): `<button aria-pressed>`; height 36 visible, 44 hit area via padding/margin; pill, 1px
  `--color-border-control`, `--text-small` 500. Selected: bg `--color-chip-selected-bg`, text `--color-chip-selected-fg`,
  leading `check` 16px (non-colour cue).
- **Removable chip** (active filters on /properties): label + `x` icon button inside, `aria-label` "Remove filter:
  3+ beds".
- **Status chip** (not interactive): For sale / For rent / New / Under offer; `--text-label` uppercase on
  `--color-surface` with 1px `--color-border`, 26px tall; on photos it sits on ivory, never on the photo directly.

| State | Filter chip | Removable | Status |
|---|---|---|---|
| default / hover / focus-visible | border control / bg surface-sunken / ring | same | n/a: static |
| selected | ink bg + check | n/a (always active) | n/a |
| disabled | when a filter has 0 results: `opacity .45` + count "(0)" in label; still focusable with `aria-disabled` | n/a | n/a |

### 10.5 Property card

Anatomy (top to bottom): image frame 4:3 `--radius-sm`, `listings/<id>/exterior`; status chip top-left (12px inset);
save button top-right (`heart`, icon button on ivory circle, `aria-pressed`, label "Save <title>"); then on the card
body (no box, sits on the page): price (`--text-title` 600 tabular; rentals add "/mo" in `--text-small` muted),
title (`--text-display-s` at card width ≥ 360px, else `--text-title`, Newsreader 400), address (`map-pin` 16 +
`--text-small` muted), facts row (`bed-double` n, `bath` n, separated by 1px `--color-border` verticals), and the floor
area as a dimension line spanning the card width (signature, 1.3). Spacing: image → price `--space-4`, then
`--space-2` steps.

- Whole card is one link: the title `<a>` is stretched (`::after { inset: 0 }`); the save button sits above it
  (`position: relative; z-index: var(--z-raised)`). DOM order: title link, then price, address, facts, save button.
- Variants: `large` (featured, image 3:2, title `--text-display-m`, price row on one line with facts); `compact`
  (popup, similar homes on mobile: image 16:10, no dimension line).
- Motion: M6 entrance, M13 hover, M16 cursor on the image, M17 shared image name.

| State | Spec |
|---|---|
| default | as above, no shadow |
| hover | M13: image scale, "View home" + `chevron-right` line appears under the facts |
| focus-visible | ring around the whole card (`:has(a:focus-visible)` on the card, `outline-offset: 6px`), plus M13 |
| active | n/a: navigation happens |
| saved | `heart` filled `--color-text` (fill = currentColor), `aria-pressed="true"`, toast "Saved to your list" (status region) |
| loading | n/a: static pages; images use `background: var(--color-skeleton)` until decoded, fixed aspect ratio, no shift |
| empty | n/a for one card; list empty state is per page |
| error (image fails) | frame keeps `--color-skeleton` and shows `house` icon 32px centred, muted |

### 10.6 Search panel (hero, Buy / Rent / Sell)

- APG **Tabs** pattern: `role="tablist"` with three `role="tab"` buttons, arrow keys move, automatic activation.
  Tabs are text (`--text-small` 600) with a 2px `--color-accent-graphic` underline on the selected tab and
  `aria-selected`.
- Panels: Buy and Rent are a `<form method="get" action="/properties">` with hidden `status`; fields: Location
  (`<select>` of cities from `site.ts`, plus "Any"), Type (select), Price (select with ranges; Rent shows monthly
  ranges), Beds (select Any / 1+ / 2+ / 3+ / 4+), submit "Search homes" (primary, `search` icon). Sell panel: one
  line of copy + address field + "Book a valuation" (primary) → `/contact?topic=valuation&address=…`.
- Surface `--color-surface`, `--radius-md`, `--shadow-lg`, padding `--space-6` (`--space-4` mobile). Field labels
  above in `--text-label` uppercase muted; fields are borderless selects separated by 1px `--color-border` verticals
  on desktop, bordered (`--color-border-control`) on mobile; each select 52px tall with a `chevron-down` icon.
- Desktop: one row, columns 4 / 2 / 2 / 2 / auto (button). Tablet (768–1023): 2×2 fields, full-width button.
  Mobile: Location + Search visible; a "More options" disclosure button (`chevron-down`, `aria-expanded`) reveals
  Type, Price, Beds stacked.

| State | Tab | Select | Submit |
|---|---|---|---|
| default | muted text | `--color-text` value | primary |
| hover | text `--color-text` | bg `--color-surface-sunken` | button hover |
| focus-visible | ring | ring | ring |
| selected | ink text + brass 600 underline | n/a | n/a |
| disabled, loading | n/a: navigates with GET, no wait | n/a | n/a |
| error | n/a: every field optional, empty search shows all | n/a | n/a |

### 10.7 Filters (/properties)

- Desktop (≥1024): sticky filter bar under the header (`--z-sticky`, `top: header height`, but it slides up with the
  header when the header hides): Buy/Rent segmented control (radio group styled as pill toggle), Location, Type,
  Price min, Price max, Beds (selects), keyword search field (`search` icon, debounced 250ms), Sort (select with
  `chevrons-up-down`: Newest, Price low to high, Price high to low, Largest). Below it the active filter chips row
  + "Clear all" (`rotate-ccw`). Results count in a polite live region: "6 homes" (Quill).
- Tablet and mobile (<1024): bar shows keyword field + "Filters" button (`sliders-horizontal` + count badge "(3)") +
  Sort. "Filters" opens a native `<dialog>` as a bottom sheet (full height on mobile, `--radius-lg` top corners,
  night-free, light), with the same controls stacked, a sticky footer "Clear all" (secondary) + "Show 6 homes"
  (primary, live count). Changes apply on "Show", not live, inside the sheet.
- Every filter writes to URL params (`status, city, type, min, max, beds, q, sort`) with `history.replaceState`; the
  page reads them on load. Invalid params are ignored silently.

### 10.8 Form fields

- Label above, `--text-small` 500 `--color-text`; optional fields say "(optional)" in the label. Hint below the label
  in `--text-small` muted, linked by `aria-describedby`.
- Input / select / textarea: height 52 (textarea min 144, `resize: vertical`), bg `--color-input-bg`, 1px
  `--color-border-control`, `--radius-sm`, padding-inline `--space-4`, `--text-body`. Selects: native `<select>`,
  `appearance: none`, `chevron-down` inline SVG positioned right (`pointer-events: none`).
- Checkbox / radio: native inputs styled with `appearance: none`, 20px box, 1px border control, checked = ink fill +
  ivory `check` (checkbox) or inner dot (radio); the whole label row is the 44px target.
- Range (calculator): native `<input type="range">`, track 4px `--color-border` with filled part
  `--color-accent-graphic` (via a `--fill` custom property), thumb 20px `--color-text` circle with 2px ivory ring.
- Autocomplete attributes on every personal field (`name`, `email`, `tel`). Paste always allowed.
- Validation: on submit, then live per field after its first error. Error = 1.5px `--color-error` border +
  message under the field with `circle-alert` 16px + text (Quill: says what is wrong and how to fix it),
  `aria-invalid="true"`. On submit with errors, an **error summary** box at the top of the form (`role="alert"`,
  focus moved to it, list of links to each field).
- Submission status region (`role="status"`) below the submit button.

| State | Field |
|---|---|
| default | border control |
| hover | border `--color-text` |
| focus-visible | ring (outline), border stays |
| disabled | bg `--color-surface-sunken`, text muted, not used in v1 except the demo notice |
| loading (submitting) | fields `readonly`, submit in loading state, status "Sending your message…" |
| error | as above |
| success | form replaced by a success panel (heading + text + "Send another" text link), focus to its heading. Demo mode (no `PUBLIC_FORM_ENDPOINT`): same panel plus a `info` note "Demo site: nothing was sent." |
| failure (network) | status `--color-error` with `circle-alert`: "We couldn't send your message. Check your connection and try again, or email hello@…" (Quill), form keeps its values |

Submissions here commit no money or account data; each form is **checked** (validation + summary) before sending.

### 10.9 Accordion (FAQ): doors

APG Accordion: each question is a `<button aria-expanded aria-controls>` inside an `<h3>`. Visually each item is a **door**
in a two-hairline casing (rows 20px apart). Closed: an `--hr-ink-800` leaf with a raised panel moulding, two brass hinges at the
left, a brass lever handle at the right, the number (`01`, brass, `--text-label`) and the question printed on it in
`--text-title` Newsreader (ivory); min-height 104. Open: the leaf swings about its left hinge (`rotateY` to 98deg, 640ms,
`cubic-bezier(.55,0,.2,1)`, perspective 1100px, light on the leaf falls off to 55% black) and is gone when edge-on; behind it
a lit room (ivory, brass-tinted light from the top right, recessed shadow at the hinge side, floor line) holds the answer
(`--text-body`, `--color-text`, max `--measure`). The room opens by grid rows 0fr -> 1fr over the same 640ms. Closing runs it
backwards. The door edge and hinges stay on the wall at the left of the room.
**Structure:** the control is a flat button that never rotates (so hit area and focus ring stay put); the leaf and its printed
copy of the question are `aria-hidden`. While closed the button's own text is transparent (the door carries the type); once open
it fades in (ink on the room) with a `chevron-up` (the chevron rotates 180deg). Several can be open; all start closed.
States: hover (closed) = handle brightens, leaf lifts a step, brass seam on the free edge (no movement); focus-visible = ring on
the whole door; open = `aria-expanded="true"`. Reduced motion (global rule): the door changes state instantly.
Forced colors: doors are not drawn, plain bordered accordion. No JS: stacked list, every answer visible, doors not drawn.
Phones (<30rem): 28px number column, 48px handle column, 560ms swing.
Keyboard: ArrowUp / ArrowDown move between questions (wrapping), Home and End jump to the first and last. Min-height of a closed door is 5.5rem. Reduced motion: the leaf fades over 400ms with no swing.
**Image placeholder:** every photo frame shows the monogram, centred at 24% of the frame (20px to 72px), under the photo while it loads and when it fails.
Add `FAQPage` JSON-LD (Fena) from the same data.

### 10.10 Slider (testimonials)

APG **Carousel** (basic, no auto-rotation): `<section aria-roledescription="carousel" aria-label="Client stories">`,
slides `role="group" aria-roledescription="slide" aria-label="1 of 3"`; only the current slide is visible to AT
(others `inert`). Controls: two 44px icon buttons `chevron-left` / `chevron-right` ("Previous story", "Next story")
+ counter "1 / 3" (`aria-hidden`; the slide label carries it). Wraps around. Arrow keys work when focus is on the
controls. Swipe on touch (pointer events, 40px threshold). Motion M19.
States: buttons as icon buttons; disabled n/a (wraps).

### 10.11 Lightbox (listing gallery)

Native `<dialog>` modal, night scheme, full viewport. Image centred, `object-fit: contain`, max 92vw × 80vh,
`--radius-md` on the frame. Top bar: counter "2 / 5" left, close (`x`, "Close gallery") right. Sides: `chevron-left`
/ `chevron-right` 56px buttons (hidden below 768; swipe instead, buttons move to the bottom bar). Caption under the
image (`--text-small` muted; Quill's caption, else the alt text). Keys: Esc close, ← → previous/next, Home/End.
Focus starts on the close button and returns to the thumbnail that opened it. Preload neighbours. Motion M20.
States: loading = `--color-skeleton` frame at the image's aspect with `loader-circle`; error = `house` icon and
"This photo couldn't load." Disabled n/a (wraps).

### 10.12 Footer (night)

`<footer data-scheme="night">`, padding-top `--space-section`.
- Row 1 (desktop 12 cols): col 1–4 monogram (40px) + one-line positioning sentence + office address; col 5–6 Explore
  links (Buy, Rent, Sell, Neighbourhoods); col 7–8 Company (About, Journal, Contact); col 9–12 contact (phone, email,
  hours with `phone`/`mail`/`clock` icons) and social icons row (Simple Icons, 44px links).
- Row 2: giant wordmark (section 7), margin-block `--space-16`.
- Row 3 (legal): © year Halden & Rowe · "Demo site, listings are illustrative" · Photo credits (link to
  `CREDITS.md` rendered page or GitHub) — `--text-small` muted, 1px `--color-border` top.
- Tablet: row 1 becomes 2×2. Mobile: stacked, link groups as two columns side by side (Explore | Company), contact
  below. Link states as nav links.

### 10.13 Stylised map with pins and popup

**Decision to veto (see handoff):** the twelve listings sit in different US cities, so a single "city map" cannot place
them truthfully. Home page map = **a stylised drawing of the contiguous US** (one simplified outline + Great Lakes +
a faint lat/long graticule) with twelve price pins at their cities. Detail page map = **a stylised neighbourhood
plan** around one pin (section 11.3). Both are drawn, not tiled; no third-party map, no runtime request.

- Home map SVG: viewBox `0 0 1000 620`, source shape from Natural Earth (public domain) admin-0 USA, simplified to
  ≤ 250 points, projected Albers USA, exported once by Fena into `src/assets/map/us.svg` (Fena's path). Layers:
  graticule (`--color-border`, 0.75px), land fill `--color-map-land` + 1px `--color-accent-line` coastline, lakes
  `--color-map-water`, twelve city dots (4px `--color-map-label`) with city names in `--text-label`.
- Pins are **HTML buttons** absolutely positioned over the SVG at percentage coordinates (`left: x/1000`,
  `top: y/620`), so they are focusable, labelled and keep text crisp. Pin = price pill (`--color-pin` bg,
  `--color-pin-fg` text, `--text-small` 600 tabular, height 32, pill) with a 6px tick below pointing at a 10px dot and
  the pulse ring (M11, `--color-pin-pulse`). `aria-label` "4 bed villa in Los Angeles, $4,200,000"; `aria-expanded`,
  `aria-controls` the popup.
- **Below 768:** the pill collapses to the 12px dot with a 44px invisible hit area (labels would collide); prices move
  into the popup and the list.
- **Popup card** (non-modal disclosure, `role="group"` + `aria-labelledby` its title, not a dialog): 288px wide,
  `--color-surface`, `--radius-sm`, `--shadow-popup`; image 16:10 `exterior`, price, title, facts, "View home" text
  link with `chevron-right`, close `x` icon button. Positioned above the pin with an 8px gap; flips below when within
  240px of the map top; clamps inside the map frame horizontally. Below 768 it docks as a sheet across the bottom of
  the map frame (full width minus 12px). One open at a time; Esc or close returns focus to its pin; clicking outside
  closes. Motion M22.
- **Accessible alternative:** the list of the same twelve homes beside / below the map (city, price, link). The map
  section's chips (All, For sale, For rent) filter both pins and list; filtered-out pins are removed (`hidden`), not
  dimmed.
- Night scheme on the home page; light on the detail page.

| State | Pin | Popup |
|---|---|---|
| default | pill / dot + pulse | hidden |
| hover | pill lifts `y: -2` + `--shadow-md` | n/a |
| focus-visible | ring + `--shadow-focus-gap` | ring on close and link |
| active (open) | pill inverts (light: ivory bg ink text + 1.5px ink border; night: mist bg night text), `aria-expanded="true"` | visible |
| filtered out | `hidden` | closes if its pin hides |
| loading / error | n/a: static SVG and data | image error = `house` icon frame |

### 10.14 Mortgage calculator (detail page, sale listings only)

- `<form>` with no submit (live calculation), `--color-surface`, `--radius-md`, padding `--space-8` (`--space-5`
  mobile). Heading `--text-display-s`.
- Inputs: Home price (text input, `inputmode="numeric"`, prefilled with the listing price, formatted as you leave the
  field); Down payment (range 0–60% step 1 + paired numeric input for %, the amount shown as text); Interest rate
  (number 0–15, step 0.05, default from `site.ts`, labelled "illustrative rate"); Term (radio group as pill
  segmented control: 15 / 20 / 30 years, default 30). Steppers (`minus` / `plus` icon buttons) beside rate.
- Output: `<output aria-live="polite">` updated 300ms after the last input: "Estimated monthly payment" label +
  amount `--text-display-m` Newsreader tabular; below it loan amount, total interest, total cost in a two-column
  definition list; a horizontal stacked bar (principal `--color-text`, interest `--color-accent-graphic`, 8px tall,
  `--radius-pill`) with text labels and values on both segments (colour is never the only cue).
- Formula: `M = P·r·(1+r)^n / ((1+r)^n − 1)`, `r = rate/12/100`, `n = years·12`, `P = price − down`; if `r = 0`,
  `M = P/n`. Currency via `Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0})`.
- Disclaimer `--text-small` muted under the result (Quill). Taxes/insurance out of scope v1.
- Desktop: inputs left (7 cols of the main column), result right (5 cols), result sticky within the card.
  Mobile: inputs, then result.

| State | Spec |
|---|---|
| default | prefilled, result shown on load (server-rendered default) |
| hover / focus-visible | per form field |
| error | price empty or 0, rate > 15: field error text, result shows "—" and "Enter a home price to see a payment" |
| loading, disabled, success | n/a: instant client-side maths |

---

## 11. Pages

Photo slot names follow the shot list: `group/slug` (Kolpona writes `src/assets/photos/manifest.json`; Fena maps by
slug). Hero, services, places etc. are referred to by the shot list's description where the slug is not fixed yet,
e.g. `hero/[dusk villa]`. Content slots are names only; Quill writes all words in `src/data/copy/**`. Every image has
alt text from Quill.

Section rhythm on the home page: light sections on `--color-bg`; FAQ and newsletter on `--color-surface-sunken`;
the map is night; footer is night. Adjacent night sections never touch (the map is followed by light "How it works").

### 11.1 Home

#### H1 Hero (night text over photo)
- **Purpose:** the thesis: these are exceptional homes; start searching now.
- **Desktop:** `min-height: 100svh` (max 1100px; at 1920+ height = min(100svh, 1200px)), photo full-bleed edge to
  edge, `--scrim-hero-top` + `--scrim-hero-bottom`. Headline `--text-display-xl` in cols 1–9, set low (bottom of
  headline 200px above the hero's bottom edge), left-aligned, 2–3 lines. Eyebrow dimension line above it. Lead
  (`--text-lead`, max 34ch) in cols 9–12 aligned to the headline's last baseline. The search panel spans cols 2–11 and
  **straddles** the bottom edge: 50% of its height over the photo, 50% over the next section (the next section adds
  that half to its top padding).
- **Tablet:** headline cols 1–8 of 8, lead below it full width (max 40ch). Panel cols 1–8, still straddling.
- **Mobile (360/390):** `min-height: 88svh`; headline at the bottom of the photo (3–4 lines at 48px), lead below
  (2–3 lines). The panel does not straddle: it sits directly under the photo on a night band (`--color-bg` night),
  full width minus gutters, then the page turns light. Reading/focus order everywhere: eyebrow, H1, lead, panel.
- **Slots:** `hero.eyebrow`, `hero.headline` (one `<em>` word allowed), `hero.lead`, `search.tabs[3]`,
  `search.labels.*`, `search.submit`, `search.sell.copy`, `search.sell.submit`.
- **Photo:** `hero/[dusk modern villa wide exterior]`, `loading="eager"`, `fetchpriority="high"`, preloaded, sizes
  `100vw`, art direction: mobile crop focus right third (`object-position` from manifest focal point if Kolpona
  supplies one, else `60% 50%`).
- **Motion:** M1 on the photo; M21 eyebrow; M2 headline on fonts ready; lead fades `opacity 0 → 1` 600ms after
  headline start (`--ease-out`, reduced: visible); M3 panel; M14 header. LCP is the photo, so none of these delay it.

#### H2 Trust numbers
- **Purpose:** credibility in one glance.
- **Desktop:** cols 1–4 eyebrow + a short statement in `--text-display-s`; cols 5–12 four stats in a row, each:
  number `--text-stat` (Newsreader light, tabular), suffix (e.g. "+", "%") in the same size, label `--text-small`
  muted below; 1px `--color-border` vertical between stats.
- **Tablet:** statement full width, stats 2×2 below. **Mobile:** statement, then 2×2 stats (numbers at 44px fit
  150px columns at 360).
- **Slots:** `trust.eyebrow`, `trust.statement`, `trust.stats[4]{value, suffix, label}`.
- **Photo:** none.
- **Motion:** M21 eyebrow, M2 statement, M7 count-up (stagger 120ms).

#### H3 Featured properties
- **Purpose:** put real homes in front of the visitor within one scroll.
- **Desktop:** header row: eyebrow + H2 (`--text-display-l`) cols 1–8, "View all homes" text link with
  `chevron-right` right-aligned on the H2 baseline. Grid: row 1 = one `large` card cols 1–7 + one standard card
  cols 8–12 (aligned to the large card's top, image 4:3); row 2 = three standard cards, 4 cols each. Six homes.
- **Tablet:** large card spans 8, then 2-up standard cards (show 5; the 6th is hidden below 1024).
- **Mobile:** single column: the large card + two standard cards, then a full-width secondary button "View all homes".
- **Slots:** `featured.eyebrow`, `featured.headline`, `featured.viewAll`; cards from listing data (`featured: true`).
- **Photos:** `listings/<id>/exterior` for each card.
- **Motion:** M4 on the large card's image; M6 cards; M13, M16, M17.

#### H4 About teaser
- **Purpose:** who is behind the homes; the boutique story in one breath.
- **Desktop:** cols 1–5 arched image (`--radius-arch`, aspect 4:5), cols 7–12 eyebrow, H2, lead, a short body
  paragraph, founders' names in `--text-small` caps, text link "Our story". `house-blueprint.svg` 280px wide in
  `--color-accent-line` sits below the text column, bottom-aligned with the image.
- **Tablet:** image cols 1–4, text cols 5–8; illustration hidden. **Mobile:** image (arch, full width, 4:5 → 1:1 crop
  at ≤390) then text, illustration under the text at 70% width.
- **Slots:** `aboutTeaser.eyebrow`, `.headline`, `.lead`, `.body`, `.founders`, `.link`.
- **Photo:** `about/[architectural detail]`.
- **Motion:** M4 + M5 on the image, M21, M2 on H2, M10 on the illustration.

#### H5 Services (4)
- **Purpose:** the four things the agency does, each a door into the right page.
- **Desktop:** header (eyebrow + H2 cols 1–7, intro `--text-body` cols 9–12). Four cards in a row (3 cols each):
  arched image (aspect 3:4), service icon is **not** shown (photos carry it), title `--text-display-s`, one line
  `--text-small` muted, text link "Explore buying" + `chevron-right` (whole card clickable as 10.5).
- **Tablet:** 2×2. **Mobile:** one card per row (photo 4:5), no sideways scrolling.
- **Slots:** `services.eyebrow`, `.headline`, `.intro`, `services.items[4]{title, line, link, href}`.
- **Photos:** `services/buying`, `services/selling`, `services/renting`, `services/valuation`.
- **Motion:** M4 per arch (stagger 110ms), M6 text, image `scale 1.04` on hover.
- Links: buying → `/properties?status=buy`, selling → `/contact?topic=selling`, renting → `/properties?status=rent`,
  valuation → `/contact?topic=valuation`.

#### H5b Cities marquee (between Services and Map)
- **Purpose:** reach, in one line, and a rhythm break before the night section.
- **Layout (all widths):** full-bleed band, padding-block `--space-8`, 1px `--color-border` top and bottom; city names
  in `--text-display-m` Newsreader italic, separated by the monogram arch outline (16px, `--color-accent-line`,
  `aria-hidden`). Pause / play icon button (44px) at the right end, inside the gutter.
- **Slots:** `marquee.items` (cities from `site.ts`), `marquee.pauseLabel`, `marquee.playLabel`.
- **Motion:** M8. Screen readers get one plain list (`<ul>` of the cities, first copy only).

#### H6 Explore the map (night)
- **Purpose:** see where the homes are and jump to one.
- **Desktop:** `data-scheme="night"`. Cols 1–8 the map (10.13, aspect 1000:620). Cols 9–12: eyebrow, H2, lead,
  chips (All / For sale / For rent), vertically centred beside the map. Below, full width, the homes as compact
  cards in 3 columns (7rem photo thumbnail left; city and state in `--text-label`, title clamped to 2 lines, price in
  brass; a small disc with a chevron at the lower right). The whole card is the title's link.
- **Tablet:** header + chips full width, map full width, cards in 2 columns below.
- **Mobile:** header, chips, map full width (dots only), then one swipe rail of photo-over-text cards (76vw, max
  17rem, scroll-snap, the next card peeks). Popup docks at the map's bottom.
- **Card hover/focus:** brass border, the disc fills brass, the photo scales 1.06 under `.motion-ok`. The card never
  moves. Chips hide cards with `hidden` (data-row), so filtered-out cards leave the grid and the rail.
- **Slots:** `map.eyebrow`, `map.headline`, `map.lead`, `map.chips[3]`, `map.listHeading` (visually hidden),
  `map.popup.viewHome`, `map.popup.closeLabel`.
- **Photos:** popup uses `listings/<id>/exterior` (compact).
- **Motion:** M21, M2, M10-style draw of the coastline path (stroke-dashoffset, 1.6s, once), then M11 pins, M22.

#### H7 How it works (4 steps, sequence)
- **Purpose:** take the fear out of the process. This content is a real sequence, so step numbers are allowed.
- **Desktop (≥1024, motion on):** pinned (M9). Left cols 1–5: eyebrow, H2, then the current step: number
  ("01" … "04" in `--text-display-xl` Newsreader light, tabular), step title `--text-display-s`, text `--text-body`;
  a vertical dimension line at the far left of the column with four ticks fills as you scroll. Right cols 7–12: a
  stage (aspect 4:3, `--color-surface` panel, `--radius-md`) where the step's illustration draws in
  `--color-accent-line`: 1 `skyline.svg`, 2 `floor-plan.svg`, 3 `house-blueprint.svg`, 4 `key.svg`. Previous drawing
  fades out (`opacity`, 300ms) as the next draws.
- **Desktop, reduced motion / tablet / mobile:** no pin. Ordered list `<ol>`: each step = number + title + text,
  with its illustration (fully drawn under reduced motion; M10 on enter otherwise) beside it on tablet (2 cols) and
  above it on mobile (illustration 60% width).
- **Slots:** `steps.eyebrow`, `steps.headline`, `steps.items[4]{title, text}`.
- **Photo:** none (drawings only).
- **Focus:** the pinned version still renders all four steps in the DOM (visually stacked and crossfaded); Tab order
  goes 1 → 4 and nothing interactive sits inside the steps.

#### H8 Neighbourhoods
- **Purpose:** sell the places, not just the houses.
- **Desktop:** cols 1–6 a list of four neighbourhoods as large rows: name in `--text-display-l` Newsreader, on the
  right of each row a dimension label ("12 homes · from $1.2M") and `chevron-right`; 1px `--color-border` between
  rows. Cols 8–12: a sticky photo frame (aspect 4:5, `--radius-sm`) showing the hovered/focused row's photo (M23);
  default = first row. Each row links to `/properties?city=…`.
- **Tablet:** same, photo cols 5–8. **Mobile:** each row shows its photo inline above the name (16:9,
  `--radius-sm`), no sticky frame, no hover.
- **Slots:** `places.eyebrow`, `.headline`, `places.items[4]{name, meta, href}`.
- **Photos:** `places/[city skyline]`, `places/[leafy suburb street]`, `places/[waterfront promenade]`,
  `places/[historic district]`.
- **Motion:** M21, M2, rows M6 (stagger 70ms), M23.

#### H9 Agents
- **Purpose:** put a face and a phone number on the agency.
- **Desktop:** header (eyebrow + H2, text link "Meet the team" → /about#team). 3-column grid, two rows, six agents.
  Agent card: portrait 4:5 `--radius-sm`, name `--text-title`, role `--text-small` muted, then two icon buttons
  (`phone`, `mail`, labels "Call Maya Chen" etc.) and listings count as dimension label.
- **Tablet:** 3 columns. **Mobile:** one card per row; icon buttons stay 44px.
- **Slots:** `agents.eyebrow`, `.headline`, `.link`; agents from `site.ts` (name, role, phone, email, photo slug).
- **Photos:** `agents/*` (6).
- **Name and role on the photo:** both sit at the bottom of the portrait over an ink gradient (rgb 26 30 29, 0.82 at
  the bottom edge fading to 0 over about 45% of the height; ink, never pure black, so the caption reads on any
  portrait). The role stays on the photo at every width (phone cards are full width, so it fits).
  Bio and the icon buttons stay below the photo. Source: `src/components/pages/TeamGrid.astro`.
- **One component:** the home section renders `<TeamGrid />` too (`Agents.astro` is only the heading, the link and
  the grid), so home and /about cannot drift. The old `.agents__grid` / `.agent*` CSS is gone.
- **Motion:** M6, portrait `scale 1.03` on hover.

#### H10 Testimonials slider
- **Purpose:** proof from people who moved.
- **Desktop:** cols 1–5 client photo (4:5, `--radius-sm`); cols 7–12: `quote` icon 32px `--color-accent-graphic`,
  quote in `--text-display-m` Newsreader italic (max 4 lines; Quill keeps quotes ≤ 220 characters), name
  `--text-title`, detail line ("Bought in Brooklyn", linking to the listing), rating as 5 `star` icons + visually hidden
  "5 out of 5"; controls (10.10) bottom-right of the text column.
- **Tablet:** photo cols 1–3, text cols 4–8. **Mobile:** photo 1:1 on top, quote at `--text-display-s`, controls below.
- **Slots:** `testimonials.eyebrow`, `.headline` (visible), `testimonials.items[3]{quote, name, detail, listingSlug}`, control labels.
- **Photos:** `clients/*` (3).
- **Motion:** M19.

#### H11 FAQ
- **Purpose:** answer the questions that stop an enquiry.
- **Desktop:** `--color-surface-sunken` band. Cols 1–4: eyebrow, H2, lead, "Still have a question?" + text link to
  /contact. Cols 6–12: door accordion (10.9), 6 items.
- **Tablet / mobile:** stacked: header, accordion, contact link.
- **Slots:** `faq.eyebrow`, `.headline`, `.lead`, `faq.items[6]{q, a}`, `faq.contactPrompt`, `faq.contactLink`.
- **Motion:** M21, M2, M18.

#### H12 CTA band
- **Purpose:** the one ask for owners: book a valuation (buyers already had the search).
- **Desktop:** inside the container-wide frame, `--radius-lg`, photo full frame (aspect 21:9, min-height 480px) with
  `--scrim-strong` gradient from left (text side) at 0.64 → 0 at 70%. H2 `--text-display-m`/`-l` cols 1–7, short
  line, buttons: primary "Book a valuation" (night tokens: brass 300) + secondary "Browse homes" (night).
- **Tablet:** same, text cols 1–6. **Mobile:** aspect 4:5 (min-height 520px), scrim from the bottom
  (`--scrim-hero-bottom`), text at the bottom, buttons stacked full width.
- **Slots:** `cta.headline`, `cta.line`, `cta.primary`, `cta.secondary`.
- **Photo:** `cta/[wide golden hour]`.
- **Motion:** M4 on the frame, M5 on the photo, M2 on H2, M12 on buttons.

#### H13 Journal teaser
- **Purpose:** show expertise and give a reason to come back.
- **Desktop:** header (eyebrow + H2 + "All articles" link). Three equal columns: image 3:2 `--radius-sm`, category +
  date `--text-label` muted, title `--text-display-s`, read time `--text-small`.
- **Tablet:** first post full width as a row (image cols 1–4, text cols 5–8), then two columns.
- **Mobile:** first post with image; posts 2–3 as rows with a 96px square thumbnail left, title right.
- **Slots:** `journalTeaser.eyebrow`, `.headline`, `.link`; posts from the content collection (3 newest).
- **Photos:** `journal/*` (3).
- **Motion:** M6, M13 (image scale only).

#### H14 Newsletter
- **Purpose:** keep people who aren't ready yet.
- **Desktop:** panel `--color-surface-sunken`, `--radius-lg`, padding `--space-16`: cols 1–6 H2 `--text-display-m` +
  one line; cols 7–11 form: email field + "Subscribe" primary inline (field and button on one row ≥ 480px), consent
  line `--text-small` muted; `key.svg` 200px in the panel's top-right corner.
- **Mobile:** stacked, button full width, key illustration 140px above the heading.
- **Alignment (2026-10-07):** field and button are both 52px (`--btn-h: 52px`). From 480px they share a row and the
  button is pushed down by one label line plus `--space-2` (`margin-top: calc(1.5rem + var(--space-2))`, label
  `line-height: 1.5rem`) so the two tops match. Columns are `5fr / 6fr` so the placeholder fits. The empty
  `.form__status` is collapsed (`min-height: 0`, margin only when it has text) so no dead gap sits under the button.
  Same rules in the journal-post `.signup` panel (`pages/Newsletter.astro`).
- **States:** as 10.8; success text "You're on the list." (Quill). Posts to `PUBLIC_FORM_ENDPOINT` with a
  `form_name=newsletter` field; demo fallback as 10.8.
- **Slots:** `newsletter.headline`, `.line`, `.label`, `.submit`, `.consent`, `.success`, `.error`.
- **Motion:** M10 on the key, M2 on H2.

#### H15 Footer — see 10.12.

### 11.2 /properties

- **Purpose:** find a home among the twelve by status, place, type, price and size.
- **Layout:** page header (light, padding-top header height + `--space-16`): breadcrumb (`Home` › `Properties`, the
  separator is `chevron-right` 14px `aria-hidden`; `<nav aria-label="Breadcrumb">`, current item `aria-current`),
  H1 `--text-display-l`, lead. Filter bar (10.7). Results grid: 3 columns ≥1280, 2 columns 768–1279, 1 column below.
  Card = 10.5 standard.
- **Empty state:** centred block in the grid area: `house-blueprint.svg` 240px (M10), H2 `--text-display-s`
  "No homes match these filters" (Quill), one line suggesting what to change, primary "Clear all filters", and up
  to 3 nearest matches below ("Close matches") if any filter can be relaxed (relax price first).
- **No pagination** (12 listings, the limit reached). If listings grow past 12, add "Show more" (button, focus moves
  to the first new card), not numbered pages.
- **Slots:** `properties.breadcrumb`, `.title`, `.lead`, `filters.*` labels, `results.count` (pluralised),
  `empty.*`, `sort.options[4]`.
- **Photos:** `listings/<id>/exterior`.
- **Motion:** M2 on H1, M6 initial cards, M25 on change, M13, M16, M17.

### 11.3 /properties/[slug]

- **Purpose:** convince and convert: show the home fully, then make the enquiry easy.
- **Layout, desktop (≥1024):**
  1. Breadcrumb (Home › Properties › Title).
  2. Title block: cols 1–8 status chip, H1 `--text-display-l` (Newsreader), address (`map-pin`). Cols 9–12 aligned
     to the H1 baseline: price `--text-display-s` Schibsted 600 tabular (+ "/mo" for rentals) and actions: Save
     (`heart`), Share (`share-2`; Web Share API, fallback copy link + toast "Link copied"), Print (`printer`).
  3. Gallery mosaic (container-wide): left 2/3 the `exterior` (3:2), right 1/3 `living` and `kitchen` stacked; a
     secondary button "Show all 5 photos" (`images`) over the bottom-right image on ivory. Any image opens the
     lightbox at that index.
  4. Two columns: main cols 1–8, aside cols 9–12 (`position: sticky; top: header + --space-6`).
     Main: key facts row (beds, baths, area as dimension line, year built, lot size, parking: icon 20 + value
     `--text-title` + label `--text-small` muted, 3 per row on 1024, 6 on ≥1280); description (`--text-lead` first
     paragraph, then `--text-body`, max `--measure`); features (2-column list with `check` icons); location
     (stylised neighbourhood plan, see below); mortgage calculator (10.14, sale listings) or rental terms list
     (rentals: deposit, term, availability, pets).
     Aside: agent card (portrait 1:1 80px, name, role, phone and email icon buttons), enquiry form (10.8): name,
     email, phone (optional), message prefilled "I'd like to arrange a viewing of <title>." (Quill), preferred
     viewing date (optional, `<input type="date">`), consent checkbox, primary "Send enquiry".
  5. Similar homes: 3 standard cards (same status, nearest price), full container width.
- **Tablet:** title block stacked (price under address). Gallery: exterior full width 16:9, living + kitchen
  side by side below. Aside drops below the main column (agent + form full width, form 2 columns for name/email).
- **Mobile:** gallery first, edge to edge: scroll-snap row of all 5 photos (aspect 4:3) with counter "1 / 5"
  overlaid bottom-right on an ivory pill and a "Show all" button; then title block; facts as a 2×3 grid; then
  description, features, agent + form, location, calculator, similar homes (horizontal scroll-snap, 82% cards).
  A **sticky bottom bar** (64px, `--color-surface`, top hairline, safe-area padding) shows price + primary
  "Enquire" button that scrolls to and focuses the form's first field; the bar hides while the form is in view
  (IntersectionObserver) and never covers focused fields.
- **DOM / reading order (all widths):** breadcrumb, title block, gallery, facts, description, features, agent +
  form (aside), location, calculator, similar homes. Desktop places the aside in the right column via grid
  (`grid-row: 1 / span 6`), which keeps focus order sensible (form after features).
- **Neighbourhood plan (detail map):** inline SVG 800×500 drawn per listing from a small set of parts Fena
  composes from data: street grid (roads `--color-map-road`, 10px), a park block, water edge where the listing has
  one (`waves`: lake, coast, river), 2–3 street name labels (fictional, Quill), one pin (ink pill with the price,
  light scheme) at the centre, and a dimension-line scale bar ("200 m"). A text line under it: neighbourhood + city +
  "Exact address shared on enquiry." (Quill). No interaction beyond the pin's label; no popup.
- **Slots:** `listing.*` from data (title, price, status, address, facts, description, features[], agentId,
  location{neighbourhood, city, water}), `enquiry.*` labels, `calculator.*` labels, `similar.headline`, `share.*`.
- **Photos:** `listings/<id>/exterior`, `living`, `kitchen`, `bedroom`, `bath-or-detail` (all 5 in the lightbox
  order), agent `agents/*`.
- **Motion:** M17 shared exterior image (no M4 on it, the view transition is the entrance); M2 on H1; M4 on the two
  side images; M16 on gallery; M20 lightbox; M6 facts (stagger 40ms); M21 on the area dimension line; similar homes M6.
- JSON-LD `Residence` + `Offer` (Fena) from the same data.

### 11.4 /about

- **Purpose:** trust in the people and the way they work.
- **Layout:** (1) header: H1 `--text-display-xl` cols 1–10, lead cols 7–12 below; (2) full-width image
  `about/[team at work]` (container-wide, 21:9 desktop, 4:3 mobile) M4 + M5; (3) story: cols 1–4 eyebrow + H2,
  cols 6–12 two paragraphs `--text-lead` then `--text-body`, first letter not dropped (no ornament); (4) values: three
  columns (stacked on mobile), each a dimension-line eyebrow with the value's name (not numbered: they are not a
  sequence) + `--text-display-s` line + body; `skyline.svg` drawn across the full width above the three (M10);
  (5) trust numbers component (H2 reused); (6) team (id `team`): agents grid as H9 with a one-line bio added;
  (7) arched image `about/[architectural detail]` beside a pull quote from a founder; (8) CTA band (H12 reused).
- **Tablet:** two-column parts become stacked where columns would be < 300px.
- **Slots:** `about.*` (title, lead, story.headline, story.paragraphs[2], values[3]{name, line, body},
  founderQuote, founderName), team from `site.ts`.
- **Motion:** M2 H1, M4/M5 images, M10 skyline, M21, M7, M6 team.

### 11.5 /contact

- **Purpose:** send a message or find the office.
- **Desktop:** cols 1–5: H1 `--text-display-l`, lead, contact list (`phone`, `mail`, `map-pin` address, `clock`
  hours) as rows with hairline separators, `contact/[office building]` photo 4:5 `--radius-sm` below,
  `floor-plan.svg` decorative 200px under the photo. Cols 7–12: the form (10.8): topic (select: Buying, Selling,
  Renting, Valuation, Something else; preselected from `?topic=`), name, email, phone (optional), address (shown only
  for Selling/Valuation), message, preferred contact (radio: Email, Phone), consent, primary "Send message".
- **Tablet:** contact column above the form; photo 16:9. **Mobile:** H1, lead, form first (it is the job), then the
  contact list, then the photo. DOM order follows mobile (header, form, details) and desktop places details left via
  grid; focus order: H1 region, form, details.
- **Slots:** `contact.*` (title, lead, details labels, form labels, hints, errors, success, failure, demoNote).
- **Photo:** `contact/[office building]`.
- **Motion:** M2 H1, M4 photo, M10 floor plan. Form states: 10.8.

### 11.6 /journal (index)

- **Purpose:** browse the agency's articles.
- **Layout:** H1 `--text-display-l` + lead; the newest post as a feature row (image 16:10 cols 1–7, text cols 8–12:
  category label, `--text-display-m` title, excerpt `--text-lead`, date + read time, text link "Read article");
  remaining posts in a 3-column grid (2 on tablet, 1 on mobile) as the H13 card. With only 3 posts: feature + 2.
  Category chips above the grid only when there are ≥ 2 categories with ≥ 2 posts (not in v1).
- **Mobile:** feature becomes a stacked card (image 3:2).
- **Slots:** `journal.title`, `.lead`, `.readLabel`; posts from `src/content/journal/**`.
- **Photos:** `journal/*`.
- **Motion:** M2 H1, M4 feature image, M6 grid.

### 11.7 /journal/[post]

- **Purpose:** a comfortable long read that leads back to homes.
- **Layout:** breadcrumb (Home › Journal › Title); category label; H1 `--text-display-l` max 20ch; meta row (author
  portrait 40px circle `agents/*`, name, date, read time); hero image container-wide 3:2 (16:10 ≥1280), caption.
  Body in `--container-text` (46rem) centred: Newsreader 400 at `--text-lead`, line-height 1.6; H2
  `--text-display-s`; H3 `--text-title`; lists with 1.5em indent; blockquote = pull quote `--text-display-m` italic
  with a 1px `--color-accent-line` rule left (only element allowed to break the text column, to cols 2–11 on
  desktop); inline images full text width with captions `--text-small` muted. End: author card, share links (Simple
  Icons `x`, `facebook`, `pinterest` + `copy` link), "More from the journal" (2 cards), newsletter (H14).
- **Reading progress:** fixed 2px dimension line at the very top of the viewport (`--z-header` + 1),
  `--color-accent-graphic`, `scaleX` scrubbed to article progress; `aria-hidden`. Under reduced motion it still
  tracks (it is position feedback, not animation) but without smoothing.
- **Slots:** from the content collection (title, category, date, author, readTime, hero, caption, body).
- **Photos:** `journal/*` for hero; inline images reuse listing interiors only if Quill references them.
- **Motion:** M2 H1, M4 hero image, nothing inside the body text.

### 11.8 404

- **Purpose:** recover a lost visitor in one click.
- **Layout (all widths):** full viewport, night scheme, centred column (max 36rem): `key.svg` 220px (M10), H1
  `--text-display-l` (Quill; e.g. a locked-door line, no pun overload), one sentence, search field (posts to
  /properties?q=), then two buttons: primary "Browse homes", secondary "Go to the homepage". Header and footer
  present as on other pages.
- **Slots:** `notFound.title`, `.line`, `.searchLabel`, `.primary`, `.secondary`.
- **Photo:** none. **Motion:** M10, M2.

---

## 12. Accessibility notes for Fena (beyond each component)

- Landmarks: one `<header>`, `<nav aria-label="Main">`, `<main id="content">`, `<footer>`; breadcrumb nav labelled.
- One H1 per page; section headings H2 in order; eyebrows are `<p>` above the heading, not headings.
- Focus never lands under the sticky header (`scroll-padding-top`), and never under the mobile sticky bar
  (`scroll-padding-bottom: 80px` on detail pages below 768).
- Every status message (results count, saved, copied, form status, calculator) goes through a `role="status"` region
  that exists in the DOM on load.
- Images: `alt` from Quill; decorative illustrations and the giant wordmark `aria-hidden`.
- Respect `prefers-reduced-motion`, `prefers-contrast: more` (raise `--color-border` to `--color-border-control` and
  remove scrims' gradient ramps: use flat `--scrim-strong`), and `forced-colors: active` (focus ring
  `outline-color: Highlight`, pins and chips get `border: 1px solid CanvasText`).

---

## 13. Review

### 13.1 Heuristic pass (NN/g 10)

1. Visibility of system status: results count live, calculator output live, form sending/sent/failed states, saved
   toast, lightbox counter, step progress line. Finding: none.
2. Match with the real world: plain domain words (beds, baths, sq ft, viewing, valuation); dimension lines are a real
   architectural convention. Finding: "sq ft" vs "m²" depends on market; US listings → sq ft only. none.
3. User control and freedom: every overlay closes with Esc and a visible close; filters have Clear all and removable
   chips; URL keeps filter state for back/forward. Finding: none.
4. Consistency and standards: one card component everywhere, chevrons for every direction, same verb through each
   form ("Send enquiry" → "Enquiry sent"). Finding: Quill must keep button verbs and success messages paired.
5. Error prevention: selects instead of free text in search; calculator clamps ranges; topic preselected from the
   link that brought the visitor. Finding: none.
6. Recognition rather than recall: active filters always visible as chips; agent shown next to the form.
   Finding: none.
7. Flexibility and efficiency: URL params let people share searches; keyboard on every widget; Hick's law: the hero
   search keeps four fields on desktop and one on mobile. Finding: none.
8. Aesthetic and minimalist design: one accent, one signature, photos carry the drama. Finding: the home page has 15
   sections; if Rookie reports fatigue, cut H5b marquee and H13 journal first.
9. Help users recognise, diagnose and recover from errors: error summary + field messages that say how to fix;
   empty state offers close matches. Finding: none.
10. Help and documentation: FAQ on home; "Exact address shared on enquiry" sets expectations. Finding: none.

Principles behind non-obvious calls: the straddling search panel (Fitts's law: the main action sits where the eye
lands after the headline); text-labelled chevrons and "Menu" word (Jakob's law, recognition); no auto-rotating
slider (user control).

### 13.2 Flows that need human review in the rendered site

- Keyboard walk (Fena) and keyboard + zoom + phone-width pass (Rookie): hero search tabs → /properties with params;
  filter sheet on mobile (open, change, Show, Clear all, Esc); map pins → popup → listing; listing gallery →
  lightbox → close returns focus; enquiry form error summary → fix → success (demo mode too); contact form with
  `?topic=valuation`; mobile menu open/close focus return; testimonials controls; FAQ; marquee pause.
- Reduced-motion pass of the whole home page (everything visible, nothing pinned, nothing pulsing).
- 200% and 400% zoom at 1280 on home, /properties and a detail page.
- Text over photos on the real hero, CTA band and any chosen photos (contrast is designed against pure white, so it
  should hold; verify crops).

### 13.3 What remains uncertain

- WCAG 2.2 AA assumed (brief says "AA"). Not tested with a screen reader; no conformance claim.
- The US-outline map instead of a single city map (decision for Forhad, 10.13).
- No DTCG JSON token file: the card's boundary allows `tokens.css` only, so the design-craft `ajv` validation step
  was not run. Proposed card: add `docs/tokens.json` (DTCG 2025.10) generated from tokens.css if the project wants
  tooling.
- Hero photo, focal points and the real dusk sky are Kolpona's; the hero scrim may look heavy on a dark dusk shot.
  It can only be lightened after a contrast check on the chosen photo's brightest text-area pixel.
- `floor-plan.svg` is a fourth illustration beyond the three the card asked for.
