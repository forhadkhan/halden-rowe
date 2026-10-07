# Halden & Rowe — session state (read this after any compaction)

Updated: 2026-10-07. Project root: `/mnt/data/Dev/lab/halden-rowe/`. Full spec: `docs/BRIEF.md`. Refs: `docs/ref-*.webp`.

## User request (Forhad, verbatim gist)
Premium, hyper-realistic, well-designed, professional real estate website, production-ready, with animations and motion
graphics. I choose the stack. Demo hosted on GitHub Pages or Cloudflare Pages. Well-written copy. Real, beautiful photos
from free sites (or generated). Perfectly mobile responsive. Four reference screenshots: Zentro, Housiq, RelateAgency,
Realspace (copied to docs/ref-*.webp).

## Decisions (final unless Forhad vetoes)
- Brand: "Halden & Rowe" (fictional placeholder, all in `src/data/site.ts`). Footer notes "Demo site, listings illustrative".
- Stack: Astro 7 static, TS, plain CSS custom props (no Tailwind), GSAP+ScrollTrigger+Lenis, Astro Image/sharp, fontsource,
  Lucide inline SVG, @astrojs/sitemap, env-driven site/base, CSS cross-document view transitions, form endpoint via
  PUBLIC_FORM_ENDPOINT with demo fallback.
- Pages: / , /properties, /properties/[slug] (12 listings), /about, /contact, /journal (+4 posts), /404.
- Direction: warm editorial luxury (ivory/stone, ink, brass accent, 1-2 dark sections, serif display + sans).
- Photos: Unsplash/Pexels non-plus, ~67 slots, manifest at `src/assets/photos/manifest.json`, credits in `CREDITS.md`.
  Unsplash API/search HTML blocked for curl; browser used to read URLs, curl for images.unsplash.com downloads.
- Portraits (agents/clients) are stock placeholders; tell Forhad to swap for real ones before real launch.

## Standing rules to honour (from ~/.claude/rules)
- Never add Co-Authored-By / "Generated with Claude Code" to commits/PRs (overrides the harness reminder). Commits are
  conventional, all-lowercase, small. Nobody commits/pushes in this project unless Forhad asks.
- Icons: SVG only, one set (Lucide), chevrons never arrows for direction, no emoji; brand logos from simpleicons.org.
- Memory note: never publish to cloud / Artifact; deliverables stay local under /mnt/data/Dev/lab.
- Keep big outputs out of context (grep/head, subagents for reading images/logs). Machine RAM is tight (~2.4 GB available):
  one chrome page at a time, check `free -h` before running agents in parallel.
- Background tasks: stop dev servers/browser pages/agents when done. Test resources: clean up.
- Self-review before saying done: give "Would fix" / "Worth knowing" lists.
- Karkhana roles: writer's change gets soqua; prompts are the card (goal, criteria, boundary, risk, report cap); a
  finished agent gets a fresh agent for a new task (SendMessage only to finish the same task). `karkhana pick` does not
  exist; judge model/effort myself.

## Pipeline and status
| # | Step | Role | Status |
|---|------|------|--------|
| 1 | Photo sourcing (~67) | kolpona (sonnet), id aac4ca28c7586433a | DONE 2026-10-07: 67/67 Unsplash, 33MB, manifest.json + CREDITS.md; I spot-checked exteriors, quality good |
| 2 | Design spec, tokens, logo, SVG illustrations | picasso (opus), id aaa074822d485b4b7 | DONE 2026-10-07 (58 contrast pairs pass) |
| 3 | Copy: `src/data/copy/**`, `src/content/journal/**`, alt text, SEO; needs photo manifest + DESIGN.md | quill (opus), id a15872777ea5a2401 | DONE 2026-10-07: 12 JSON + README in src/data/copy, 3 journal posts; prose-lint clean |
| 4a | F1 foundation: Astro scaffold, global CSS, layout/nav/footer, Photo/Icon/Button/Accordion/Slider/Lightbox/DrawSvg/PropertyCard, motion.ts, deploy files, README, /styleguide | fena (opus), id a9653a20d5c89ab0c | DONE 2026-10-07: check 0 errors, build ok, BASE_PATH ok, styleguide 360/1440 ok |
| 4b | F2a: home page only (15 sections, hero search, US map with pins, motions) | fena (opus), id ae5bd3c88a5985a7a | DONE 2026-10-07: check 0/0/0, build + BASE_PATH build ok, widths 360-1920 ok, 59.4KB gz JS, 0 console msgs, 0 3rd-party reqs (see F2a outcome) |
| 4c | F2b: /properties (filters), /properties/[slug] x8 (gallery, mortgage calc, neighborhood plan SVG), about, contact, journal+3 posts, privacy, 404, SEO/JSON-LD, OG | fena (opus), id a80854665d3c53f9e | DONE 2026-10-07 (see F2b outcome). I then fixed `#neighborhoods` id (home Places.astro), added footer Privacy link (site.json privacyLabel/Href + Footer.astro + load-copy.ts). My own verification: check 0/0/0, build ok (19 pages), check:links 3214 refs none broken, BASE_PATH build ok + links ok, dist rebuilt at root |
| 5 | White-box review | soqua (opus), id ac8e53af8430fe276 | DONE: BLOCK. SQ-1 high: street address shown on 8 listing pages ([slug].astro:89). SQ-2 SITE_URL defaults to localhost (241 localhost links in dist). SQ-3..SQ-10 low (mortgage "1.25m"->1, SplitText escapes reduced-motion revert, numberOfRooms=beds, 404 canonical, UK spellings, no tests, no-JS form POST, honeypot comment/scroll-lock/unused fields). Soqua could not verify BASE_PATH build (guard) - I did. |
| 5b | Fix round 1 (SQ-1..10 + contact phone label + node tests) | fena (opus), fresh id afb6a2f4d99a41ee4 | DONE + I re-verified: check 0/0/0, 16 tests pass, build ok, links 3213 ok, localhost count 0, no street addresses. I also changed "grey"->"gray" in copy. SQ-4 reduced-motion fix only code-checked. Build now REQUIRES SITE_URL (use SITE_URL=https://example.com for local builds) |
| 5c | Lighthouse (mobile) by me via CLI (chrome-devtools lighthouse_audit fails: that Chrome never paints, NO_FCP): home 83/100/100/100 (LCP 4.1s, TBT 110), /properties 88, listing 94, about 97, a11y/bp/seo all 100 | me | done; perf fix = fena id a9a08c20bf026541a, running |
| 6 | Rookie black-box (URL only, no code; 390/360/1440; 3 screenshots, mostly DOM) | rookie (opus), id a5c712b15f4f35d53 | DONE: no blockers. 2 major: phone photos soft (maybe false alarm, emulation DPR1?), Save heart has no saved list. Minor: calc 1e20 price + panel overflow at 390, Back button skips filters (replaceState), hero city becomes keyword chip + count mismatch, search "Brooklyn, NY"/"3 bed" no match, share links example.com (expected: placeholder SITE_URL), socials "#" (known), hero shows only tabs above fold on phone, Similar homes price mismatch, no Contact in nav, Sell->valuation topic, rent heading static, calc 80% caps at 60% silently + "1.2m" error, odd Austin bed alt, Seattle card empty area on desktop; unconfirmed: filter sheet "Show 1 home" -> "No homes". Felt good: premium look, numbers consistent, focus traps/Esc, form errors, no console errors, no sideways scroll |
| 6b | Fix round 2 (14 items from Rookie) | fena (opus), fresh id a8b54ba884b5a4384 | running; afterwards: my re-verify, Lighthouse, hero scrim contrast vs villa-dusk, final self-review + report, stop preview server (`npx astro preview stop`), remove keep-running pid line 952590 from ~/.claude/hooks/keep-running.pids |
| 5d | Perf round (target >=90 on / and /properties) | fena (opus), id a9a08c20bf026541a | DONE: / 83->93, /properties 88->94 (margin small, / dipped to 90 in 2 of 4 runs), a11y/bp/seo 100. Changes: italic preload (home only), fonts subset to copy chars (scripts/subset-fonts.sh via uvx, src/assets/fonts, tests/fonts.test.ts - NEW COPY CHARS must be added to subset-unicodes.txt), card image widths 560/720, motion/home scripts load after hero (lib/after-lcp.ts), CSS inlined. I re-verified: check 0/0/0, 17 tests, build ok, links 3272 ok, 0 localhost. Preview server of dist runs on 127.0.0.1:4400 (astro daemon pid 952590; stop with `npx astro preview stop` from project root when ALL testing is finished) |
| 6 | Black-box mobile/desktop test on running preview | rookie | not started |
| 7 | Fix round, final build + Lighthouse, report to Forhad with self-review lists | me | not started |

Boundaries: kolpona `src/assets/photos/**`+CREDITS.md; picasso `docs/DESIGN.md`, `src/styles/tokens.css`,
`public/favicon.svg`, `src/assets/brand/**`; quill copy+journal; fena everything else.
Agent completion notifications arrive automatically; never predict their results. Agent output files live under
/tmp/claude-1000/-mnt-data-Dev-lab/e16ccf13-5789-4b32-9088-0e64a059cf41/tasks/ (do not read them raw).

## Scratch
Scratchpad: /tmp/claude-1000/-mnt-data-Dev-lab/e16ccf13-5789-4b32-9088-0e64a059cf41/scratchpad
Existing unrelated project in lab: `rennick-realtor` (do not touch or reuse its photos).

## Picasso outcome (done)
Concept "Drawn to scale": architect's drawing set inside a quiet magazine; signature = brass dimension line.
Palette: limewash #EEECE5 page, ivory #F8F6F0 cards, ink #1A1E1D, brass #7A5823 text / #94702F graphics / #B08848 decorative
only, night #121717 with mist #ECE8DF and brass #D4B27C. Fonts: Newsreader Variable (display + article body), Schibsted
Grotesk Variable (UI), both @fontsource. Files: docs/DESIGN.md (motion M1-M25, home sections H1-H15, components 10.1-10.14),
src/styles/tokens.css (night via [data-scheme="night"]), src/assets/brand/{wordmark,monogram}.svg, public/favicon.svg,
src/assets/brand/illustrations/{house-blueprint,skyline,floor-plan,key}.svg (pathLength=1, data-layer draw order).
Vetoes put to me; I ACCEPTED all (user delegated design): (1) home map = stylised US outline with 8 price pins, detail pages get
a stylised neighbourhood plan; (2) monoline-capitals wordmark; (3) 4th illustration floor-plan; (4) no LinkedIn icon
(not in Simple Icons) so use a text link; (5) home has 15 sections, if blind test finds it tiring cut cities marquee and
journal teaser first. Open: hero scrim must be re-checked against Kolpona's actual dusk photo.

## Kolpona outcome (done)
Weak slots Fena must handle: interiors not one house in most listings (copy must not over-claim cohesion); skyline-penthouse
exterior is a portrait tower (crop/object-position); garden-home bedroom quirky; loft detail = brick-column interior;
beach-house detail = porch, living slightly staged; clients/client-3 stock-like; agent portraits not all 4:5 (crop via
object-fit); hero/golden-street is an aerial at dawn. manifest.json fields: file, group, slot, listing, alt, width, height,
source_url, photographer, licence.

## Quill outcome (done) and F2 instructions derived from it
- Visible text is US spelling ("inquiry", "neighborhood"); keep it (listings are US). DESIGN.md says "enquiry": follow copy.
- Show only neighborhood, city, state on listings (NOT street address); README in src/data/copy says so.
- Testimonials link to city search results (`/properties?q=...`), not listings. Neighborhood rows on home say "1 home" each.
- F2 must add a /privacy page (placeholder policy, clearly marked to be replaced); none exists in copy yet. Social links in
  site.json point to `#` (placeholders, Forhad replaces). LinkedIn: text link only.
- Before real launch Forhad must: replace fictional testimonials/agents/stats (labelled demo), social links, privacy policy,
  fact-check neighborhood facts and closing-cost rules in the journal, confirm waterfront/historic photo city labels
  (Seattle/Brooklyn are assumed).
- Copy check script: scratchpad/check_copy.py (valid JSON, slugs match photo folders, alt text, SEO lengths, banned words).

## F1 outcome (done) and conventions for pages
Use `url()` from src/lib/url.ts for every link, `<Photo src="group/file.jpg">` for images, mark hero with [data-hero] and pass
`overHero` to BaseLayout. src/data/site.ts + load-copy.ts typed loaders. motion.ts data attrs: data-reveal/split/parallax/
count/magnetic/clip/marquee/draw. F1 left to F2: M1, M3, M9 vertical, M11, M16, M22, M23, M25; lightbox has no zoom; no CSP
header; robots.txt generated by build; extra env PUBLIC_FORM_ACCESS_KEY (Web3Forms). Accordion 380ms literal (missing token).
Full animation not verified visually (reduced motion was on in devtools; screenshots time out on low RAM).
Guard blocks inline code (`node -e`, `python3 -c`): write script files instead. No CSP header yet.
Query-param contract for /properties: mode=buy|rent, q, type, min, max, beds, sort. Hero Sell tab goes to /contact?intent=sell.
Dev server ports: F2a 4321, F2b 4322.

## F2a outcome (done)
Files: src/pages/index.astro, src/components/home/**, src/scripts/home.ts, src/styles/home.css; additive edits to Form.astro
(`sendAnother`), Slider.astro (`ratingLabel`, 44px linked detail), motion.ts (M16 "View" cursor). Motions done: M1, M3, M9
vertical, M10, M11, M16, M22, M23, hero reveal, 4 line drawings, places wipe, map pulse, pinned steps (stacked on mobile).
M25 left to F2b (/properties). Not verified: CSS transition timing under real motion (browser forced reduced motion; used
matchMedia override); scroll triggers fire after a Lenis scroll event.
Departures from DESIGN for Picasso/me to mention: phone map popup docks under the map; SVG city labels omitted; featured item 6
hidden (grid holds 5); CTA scrim strong to 45%; extra hero scrim layer. Known minor: NYC/Brooklyn pin hit areas overlap 8px on
desktop; at 768 a popup can cover list below map; on short maps (548px) popup can stick out ~110px.
Contract for F2b: home search sends `mode` and `q`; /properties should also accept `price` and match `type` case-insensitively.
Cleanup owed: /mnt/data/Dev/lab/tmp_f2a_dist_base and scratchpad/dist-base (F2a scratch builds; guard blocked its rm).
F2a dev server stopped, scratch dirs removed (done).

## F2b outcome (done)
Pages: /properties, /properties/[slug] x8, /about, /contact, /journal (+3 posts), /privacy, /credits, /404; og images via
src/pages/og/[name].jpg.ts; scripts/check-links.mjs (`npm run check:links`); src/content.config.ts; styles/pages.css; README
"Before launch" list added. /properties filter param is `status` (aliases `mode`, `sale`=buy; `price=min-max` also accepted).
Edits to F1 shared files: PropertyCard crop, Seo+BaseLayout `ogImage` prop, Gallery button 48px. F2b duplicated trust/CTA/
newsletter blocks in components/pages/ (F2a's depend on home.css). Known/open: header nav links are 26-42px wide (F1, 44 tall);
phone label says "(optional)" even when phone reply makes it required (contact form); privacy/credits titles live in the page
files, not seo.json; filter-view-transition M25 done; visual overlap not screenshot-checked by F2b.
Deviations for Picasso: facts 3 cols not 6; CTA scrim solid to 58%; rentals' similar homes topped up with nearby sale homes.
Not visually verified by anyone yet: Rookie/me must look at real screenshots.

## Next
After perf round: Rookie black-box (note: the chrome-devtools Chrome does not paint, screenshots may time out; DOM/interaction
testing works; for visual review take headless screenshots with `google-chrome --headless=new --no-sandbox --disable-gpu
--window-size=W,H --screenshot=FILE URL` and have a subagent describe them). Built-in Claude_Browser navigation to localhost
was denied (needs user permission), don't rely on it. Then final fixes, hero scrim contrast check vs villa-dusk.jpg,
self-review, final report, stop preview server (`npx astro preview stop`), remove scratch files, make sure no agents/pages remain.

## Motion pass (2026-10-07, fena)
New motion.ts attributes: `data-speed` depth layers (CSS `translate`, tablet+desktop; `data-speed-phone`, `data-speed-scope`,
`data-speed-mode="settle"`), `data-mouse` pointer depth in `[data-mouse-root]` (fine pointer, desktop), `data-clip="scrub"`
scrubbed reveal, `data-parallax="desktop"` (drift + scale). Used on: hero (headline/tower/dome scroll + mouse; phones tower
only), featured (scrubbed clip, card row drift at 64rem+, 2nd card layer), map pins (settle float), trust stats, drawings,
cards and journal images, CTA/about/post photos. Hover: button fill sweep, nav underline in/out, chip press + check pop,
card image zoom + brass frame + price colour (cards never move: Forhad). JS +0.7 KB gz. Lighthouse mobile / 94/94,
/properties 94/94, CLS 0. DESIGN.md 6.1 not updated (Picasso's file).

## FINAL (2026-10-07)
Round 2 (Rookie 14 findings) fixed. Verified by me: check 0/0/0, 28 tests pass, build exit 0 (SITE_URL=https://example.com),
check:links 3424 refs none broken, 0 localhost in dist. Lighthouse mobile (CLI, best of 2): / 93/92, /properties/ 93/94,
a11y/BP/SEO 100, CLS 0, LCP ~3.2s. Hero checked via CDP real-time capture (scratchpad cdp-hero.mjs): H1/lead/panel settle at
opacity 1, scrim legible over villa-dusk at 390 and 1440. Earlier fragmentary H1 shots were --virtual-time capture artifacts.
Sherlock skipped (static site, only a form endpoint). Remaining: self-review, final report, cleanup (preview server pid).

## Later changes (2026-10-07, after FINAL)
Built since: /properties filter redo, pill search, focus style, Clear button; Zentro-style hero with placeholder tower
(`src/assets/hero/tower.png`, prompt in docs/tower-prompt.md, awaiting Forhad's PNG); logo B "Et" (A Swing / C Hinge
alternatives; identity still a placeholder); 4th journal article; 12 homes; motion pass; team captions on /about; Soqua
fixes.
This stretch: In numbers restyled (full-width stat row, brass tick; no page-level "demo" text, the footer note stays);
Featured cards `arrow` hover (dark translucent disc with arrow-up-right, dark body panel, text scaled .92, still no
translate); What we do photos have a different top shape each (`--service-top`); the cities marquee became `CitiesGrid`
(12 cities, 2 per row, each state's outline as its icon, `state-shapes.ts`; icon stacks above text under 30rem); USA map
rebuilt from us-atlas with light state borders (`--color-map-border`, `.usmap__borders`), pins unchanged; "On the map" list
rows have a sweep-fill hover with brass edge and chevron; Neighborhoods names use display-m. Dead `.marquee*` CSS removed
from home.css (the global `[data-marquee]` rules stay for the styleguide).
Verified: check 0/0/0, 28 tests pass, build exit 0, no horizontal scroll on 23 pages at 320/375/414/768 (CDP audit).
Open: the 12 city tiles show 9 distinct states, not 12 (copy now says "twelve", fixed 2026-10-07);
SQ-3 (featured cards drift on scroll at 1024px+) left as is; DESIGN.md H5b, M8, rule 6, trust parallax and the new
hovers are not yet described there; /privacy, /credits and the form success text still say "demo".

### FAQ doors (2026-10-07)
- `src/components/Accordion.astro` rewritten: each question is a hinged door (title on the leaf). Open swings the leaf about the
  left hinge (`rotateY` 98deg, `--door-swing` 640ms) and reveals a lit room with the answer; close swings it shut. Flat real
  button on top (aria-expanded unchanged), leaf/room `aria-hidden`. `.is-open` now sits on the item and the panel.
- Verified in the browser: closed, open, mid-swing (slowed), hover, focus ring, 375 and 320 (no horizontal scroll); check 0 errors,
  28 tests pass, build ok. Not checked: Lighthouse, screen reader.
- DESIGN.md 10.9 and H11 updated.

## Map cards (2026-10-07)
- H6 list under the map is now cards (`.map-card` in MapSection.astro, CSS beside `.map-list` in home.css): 3-col
  thumbnail cards at 1024+, 2-col at 768+, swipe rail on phones. Section height at 1024w: ~2070px -> ~1310px.
- Selector is `.map-section__list .map-list` because the global `ul[role="list"]` reset beats a lone `.map-list`.
- Checked: 1280, 768, 375 in the browser (no horizontal overflow, rent filter shows 4 of 12), check 0 errors,
  28 tests pass, build ok (needs SITE_URL). Not checked: keyboard/screen-reader walk, Lighthouse, touch hover.

## Agents + subscribe form (2026-10-07)
- Home agents now use `pages/TeamGrid.astro` (name and role on the portrait, same as /about); H9 CSS deleted.
- Subscribe form: 52px field and button, tops level at 1280, 1024 and 768 (home and journal-post panel), 375 stacked
  with error state ok; empty status line collapsed. Checked: check 0 errors, 28 tests pass, build 24 pages.
- Not checked: keyboard/screen-reader walk, Lighthouse, touch hover.
- Open: user dislikes the Featured-homes hover; waiting on which direction (1 photo zoom + "View" cursor, recommended).

## Search engines off + scrollbar (2026-10-07)
- Site is closed to crawlers: `site.indexable` (src/data/site.ts) is false unless the build sets `ALLOW_INDEXING=1`.
  Closed = `noindex, nofollow, noarchive` meta on every page (Seo.astro), robots.txt `Disallow: /`, no sitemap
  (integration only added when ALLOW_INDEXING=1, no `<link rel=sitemap>`), canonical skipped.
  `X-Robots-Tag` in public/_headers is static: delete that line when opening the site (GitHub Pages ignores it).
- Open Graph checked on all 24 built pages: og:title/description/url/type/site_name/image(+alt, 1200x630) and the
  twitter card are present, every og:image file exists and is 1200x630. Pages without their own card use /og/default.jpg.
- Scrollbar: `scrollbar-width: thin` + stone-600 thumb on the limewash page colour (global.css), WebKit fallback for old
  Safari. Native scrollbar is not visible in browser-pane screenshots: only the computed style was checked.
- 2026-10-07 review fixes: city count now "twelve" everywhere (12 listing cities, 12 tiles, stat 12, seo titles);
  footer Sell link now `?topic=valuation` like the nav; `aria-disabled="true"` (was empty string) while a form is busy;
  15s fetch timeout on form submit; form placeholders use `--color-text-muted`; og:url dropped on noindex pages (404).
  Not done: footer social links still `#`, privacy page "REPLACE BEFORE LAUNCH", DESIGN.md (M34 cursor, Featured
  border/margin, card bg hovers). Check 0/0/0, 28 tests pass, build exit 0. Motion work (Fena) still in progress.
- 2026-10-07 cursor (M34) rewritten: CSS-only premium arrow (ink, ivory outline) and hand (ivory, ink outline), Lucide
  `mouse-pointer-2` / `pointer` shapes as data-URI cursors in Cursor.astro; no script, no popover. Fields keep the system
  caret; `.gallery__open` keeps zoom-in; the "View" disc (motion.ts M16) is unchanged.
- Hero eyebrow ("Twelve homes, twelve cities") removed (Hero.astro, home.css, home.json, types.ts).
- Images: fallback is now webp (was jpg) via `fallbackFormat` in Photo.astro and Hero.astro; dist 250 MB -> 159 MB.
  Measured on the build at 1024px with every lazy image forced: home 61 images 664 KB (all avif), listing page 485 KB.
  Remaining jpgs are one OG / JSON-LD image per page (getImage), left as jpg on purpose (social crawlers).

## Site-wide motion + curtain hero (2026-10-07, fena)
- M26 auto reveal (motion.ts): below-fold blocks in main + footer get `data-auto` and fade/rise once via one
  IntersectionObserver (12%, stagger 70ms); h1-h3 become M2 splits. Skips hand-tuned motion and widgets (SKIP/OWNED
  lists in motion.ts). Footer columns: `data-reveal-unit`. Reduced motion: `html.motion-soft`, 400ms opacity-only fades.
- Ambient loops M27-M33 (CSS, `.motion-ok`, transform/opacity): tower Ken Burns + float, dome breathing, What we do
  drift, primary button shine (`.btn__shine`), CTA light sweep (`.light-sweep`), eyebrow rule breathing, cities
  outline shimmer. `[data-ambient]` + `--ambient-play`: paused off screen, when covered, and in a hidden tab.
- M34 curtain hero: `data-curtain` on the hero, `.home-cover` wrapper in index.astro; sticky only while the hero fits
  `clientHeight` (so not on 320/390 phones or 1440x600); hero data-speed layers removed.
- Verified (headless CDP, real time): 10 pages at 390 + 1440, nothing left hidden except phone map rail rows until
  swiped; CLS 0 (contact 0.0127 in both motion and reduced modes, not from this change as far as measured).
  Lighthouse mobile / 94 and 93 (a cold first run 79), /properties 93; JS +0.9 KB gz; check 0, 28 tests, build ok,
  links ok. Open: WCAG 2.2.2 pause control for the always-on loops (DESIGN.md 6.1 note).

## Journal, slider, placeholder, accordion (2026-10-07)
- Client stories (Slider.astro): prev/next + counter sit below the slide, right-aligned (column 2 of a 5fr/7fr grid from 48rem);
  the row sits under the tallest cell (the photo), so on desktop it is about 100px under the text.
- Journal detail: "More from the journal" lists the other three posts (4 exist): 3 columns from 64rem, third card a full-width
  row on tablets, one column on phones (pages.css `.post-related`).
- Image placeholder (Photo.astro): the monogram (`assets/brand/monogram.svg`, mask, `--color-text-muted` at 30%) is centred
  behind every photo via `.photo::before`; a loaded photo covers it, a failed one (`is-broken`) leaves it. Replaces the house icon.
- Accordion (Accordion.astro): slimmer doors (min-height 5.5rem), reduced-motion fallback (leaf fades 400ms, no swing), keyboard
  ArrowUp/Down (wrap), Home, End between questions.
- Journal hover = Featured homes hover: `styles/card-hover.css` (disc with arrow-up-right, 1px frame 12px outside, dark text panel,
  text scale .92), used by PostCard (index, article) and JournalTeaser; underline hover rules removed. Layout variants
  (lead card, tablet third card, phone thumb rows) set `--hc-*` custom properties.
- Bug fixed: Featured card photos were not clickable (the stretched link anchored to the positioned body). PropertyCard
  `--arrow` now draws the dark panel as the body's own background (negative margin + padding), nothing positioned in the body.
- Verified in the browser pane (1024 and 800 wide): hover states, photo hit-test on Featured, journal cards and teaser,
  3 related posts, broken-image placeholder, accordion toggle and keyboard. Check 0/0/0, 28 tests, build ok.
  Not yet checked by eye: 320/390 phones for the new rows, the teaser's phone thumb rows on hover.
