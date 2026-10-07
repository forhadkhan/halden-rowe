# Halden & Rowe — real estate website (demo, production-grade)

Project root: `/mnt/data/Dev/lab/halden-rowe/`. Local only; nothing is published or pushed by any agent.
Owner: Forhad. Fictional boutique agency; the brand name and all listings are placeholders, so keep them in ONE config file
(`src/data/site.ts`) and make a rename trivial. Footer carries a small "Demo site, listings are illustrative" line.

## Goal
A premium, hyper-realistic, editorial-quality real estate site that could go live as-is. Cinematic photography, confident
typography, rich but tasteful motion. Perfect on phones (360px up) through 4K. Hosts as a static site on GitHub Pages or
Cloudflare Pages (so: no server, no runtime API keys).

## Reference designs (inspiration only, never clone)
`docs/ref-*.webp`: Zentro (airy, big hero headline, pill search), Housiq (dark cinematic hero, Buy/Rent/Sell tabs + filter bar),
RelateAgency (stats, circular service images, price pins over a photo, blog row, dark footer), Realspace (agents, testimonial
slider, FAQ accordion, CTA band, giant footer wordmark). Take the section vocabulary, not the layouts or styling.

## Direction
Warm editorial luxury: ivory/stone surfaces, deep ink text, one restrained brass/clay accent, one or two dark "night" sections
for drama. Big serif display headlines + clean sans body. Generous whitespace. Photos do the heavy lifting. Not templated,
not purple gradients, not glassmorphism soup.

## Stack (decided)
Astro 7 static output, TypeScript, plain modern CSS with custom properties (no Tailwind), GSAP + ScrollTrigger + Lenis for
motion (npm, bundled, no CDN), Astro `<Image>`/sharp for responsive avif/webp, self-hosted fonts via @fontsource, Lucide
icons as inline SVG, `@astrojs/sitemap`. `site`/`base` read from env so the same build deploys to GitHub Pages
(project path) or Cloudflare Pages (root). Cross-document CSS view transitions (`@view-transition`), not Astro ClientRouter.
Forms post to an endpoint from `PUBLIC_FORM_ENDPOINT` (Web3Forms/Formspree compatible), with a clear demo fallback.

## Pages
`/` home · `/properties` (client-side filter/sort/search, URL params, empty state) · `/properties/[slug]` (12 listings:
gallery + lightbox, facts, description, features, stylised location map, agent card, enquiry form, mortgage calculator,
similar homes) · `/about` (story, values, team) · `/contact` · `/journal` + 3 posts · `/404`.
Home sections: cinematic hero with Buy/Rent/Sell search panel · trust numbers (count-up) · featured properties ·
about teaser · services (4, arch/circle image cards) · "explore the map" (stylised SVG city map with animated price pins and a
popup card) · how it works (4 steps, sticky/scroll-linked) · neighbourhoods · agents · testimonials slider ·
FAQ accordion · CTA band · journal teaser · newsletter · footer with giant wordmark.

## Motion (all must respect `prefers-reduced-motion`; 60fps; no layout shift)
Hero: slow image zoom + headline line/word reveal + search panel rise. Scroll: image clip-path reveals, soft parallax,
staggered card entrances, count-ups, marquee, horizontal-scroll or pinned step sequence, line-drawing SVG accents
(blueprint house/skyline), pulsing map pins, magnetic buttons, card hover (image scale, price reveal), animated nav
(hide on scroll down, solid after hero), mobile menu with staggered links, cursor-follow only on fine pointers.
Lenis smooth scroll off for reduced-motion and for touch if it hurts feel.

## Hard rules
- Icons: SVG only, ONE set (Lucide). No emoji anywhere, no icon fonts. Directional UI (carousels, pagination, breadcrumbs,
  accordions, "view all" links, back/next) uses chevron-left/right, NEVER arrow-left/right. Brand logos (social) come from
  simpleicons.org.
- Accessibility: WCAG AA contrast, visible focus, keyboard-operable menu/accordion/slider/lightbox/filters, semantic
  landmarks, alt text on every photo, skip link, motion-safe.
- Mobile first. Verified at 360, 390, 768, 1024, 1440, 1920 widths. No horizontal scroll at any width.
- Performance: LCP image preloaded, below-fold images lazy, JS only where needed, fonts subset + `font-display: swap`.
  Target Lighthouse mobile ≥90 performance, 100 a11y/best-practices/SEO.
- SEO: unique title/description per page, Open Graph + Twitter cards (generated OG image), JSON-LD (RealEstateAgent,
  Residence/Offer on listings), canonical, sitemap, robots.txt.
- No secrets, no tracking scripts, no third-party requests at runtime (fonts, maps, images all local).
- Photo licence: Unsplash/Pexels only (no Unsplash+/plus.unsplash.com). Credits kept in `CREDITS.md`.

## Photo shot list (Kolpona sources these; slugs are the file names)
Output: `src/assets/photos/<group>/<slug>.jpg` + `src/assets/photos/manifest.json`.
Long edge 2400px (hero, listings) or 1600px (others), JPEG q≈80, sRGB. No watermarks, no legible brand signage or licence
plates, no kitsch HDR, no stock-photo cheese. Interiors of one listing must feel like one coherent home in style and light.
- `hero/` (3, landscape): dusk modern villa wide exterior; sunlit living room with floor-to-ceiling glass; golden-hour
  residential street or aerial.
- `listings/<id>/` each: `exterior` + `living` + `kitchen` + `bedroom` + `bath-or-detail` (5 each, 8 listings = 40):
  1 `hillside-villa-la` modern hillside villa with pool · 2 `lakefront-house-seattle` contemporary lakefront timber/glass ·
  3 `brownstone-brooklyn` classic brick townhouse · 4 `skyline-penthouse-nyc` high-rise penthouse, city view (rental) ·
  5 `garden-home-austin` craftsman/family home with garden · 6 `beach-house-carolina` coastal shingle beach house ·
  7 `loft-chicago` industrial-chic loft (rental) · 8 `courtyard-villa-palm-springs` mid-century/Mediterranean courtyard villa.
- `services/` (4): buying, selling (staged home), renting (apartment building), valuation (architect desk/plans).
- `agents/` (6 portraits, 4:5, neutral light backdrop, diverse, professional) · `clients/` (3 portrait or couple/family).
- `places/` (4): city skyline, leafy suburb street, waterfront promenade, historic district.
- `about/` (2): team at work, architectural detail. `cta/` (1 wide, golden hour). `journal/` (3): interior styling,
  neighbourhood/keys, mortgage paperwork + laptop. `contact/` (1 office/building).
Total ≈ 67. Reject anything blurry, tilted, over-processed or with people looking at the camera in a cheesy way (except
agents/clients portraits).

## Roles and boundaries (one writer per path)
- Kolpona: `src/assets/photos/**`, `CREDITS.md`.
- Picasso: `docs/DESIGN.md`, `src/styles/tokens.css`, `public/favicon.svg`, `src/assets/brand/**` (wordmark + monogram SVG).
- Quill: `src/data/copy/**`, `src/content/journal/**` (all words on the site, SEO meta, alt text).
- Fena: everything else under the project root (Astro app, components, pages, motion, config, README, deploy workflow).
- Soqua reviews the finished build; Rookie tests the running site blind. Nobody commits or pushes.
