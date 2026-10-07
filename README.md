# Halden & Rowe

A static marketing site for a fictional luxury real-estate agency. It is a demo: the homes, agents and
reviews are not real, and the photos are free stock (see `CREDITS.md`).

## Stack

- Astro 7 (static output) + TypeScript, Node 24 (`.nvmrc`), npm. Every version is pinned in `package.json`.
- `sharp` for images (AVIF/WebP `srcset`), `@astrojs/sitemap`.
- GSAP + ScrollTrigger + SplitText and Lenis for motion (`src/scripts/motion.ts`).
- Self-hosted variable fonts: Newsreader (display), Schibsted Grotesk (UI), via `@fontsource-variable/*`.
- Icons: `lucide-static` (UI) and `simple-icons` (brand logos only).
- No third-party requests at runtime and no tracking. The only outgoing request is a form POST,
  and only when you configure an endpoint.

## Scripts

| Command | What it does |
|---|---|
| `npm install` | Install the pinned dependencies |
| `npm run dev` | Dev server at http://localhost:4321 (the styleguide is at `/styleguide/`) |
| `npm run check` | Type and template check (`astro check`); must report 0 errors |
| `npm run build` | Static build into `dist/`. Needs `SITE_URL` (in `.env` or the shell); it stops with an error without it |
| `npm run preview` | Serve `dist/` locally |
| `npm run check:links` | After a build: crawl `dist/**/*.html` and fail on a broken internal link, asset or `#fragment` |
| `npm test` | Unit tests for the mortgage maths, the listing filter and similar homes (`node --test`, no extra dependency) |

`check:links` reads the site host and base path from the built home page's canonical URL, so it works for a
`BASE_PATH=/halden-rowe` build without extra flags.

Open Graph images (1200x630 JPEG) are generated at build time by `src/pages/og/[name].jpg.ts` with sharp: one
default, one per listing and one per journal post.

`STYLEGUIDE=1 npm run build` also builds `/styleguide/` (noindex, kept out of the sitemap). Without it the
styleguide exists only in dev.

## Environment

Copy `.env.example` to `.env`. Nothing in it is secret; every value ends up in the public build.

| Variable | Default | Use |
|---|---|---|
| `ALLOW_INDEXING` | unset (closed) | Set to `1` to allow search engines: drops the noindex meta, writes an open robots.txt and a sitemap (also delete `X-Robots-Tag` from `public/_headers`) |
| `SITE_URL` | none: required for `npm run build` (`npm run dev` uses `http://localhost:4321`) | Absolute origin: canonical URLs, Open Graph, sitemap, robots.txt |
| `BASE_PATH` | `/` | Sub-path the site lives under, e.g. `/halden-rowe` on a GitHub Pages project site |
| `PUBLIC_FORM_ENDPOINT` | empty | Where forms POST. Empty means demo mode |
| `PUBLIC_FORM_ACCESS_KEY` | empty | Web3Forms public access key (leave empty for Formspree) |

Internal links and assets always go through `url()` in `src/lib/url.ts`, so they honour `BASE_PATH`.
Use it for any new link: `<a href={url('/contact/')}>`.

## Deploy

### Cloudflare Pages

1. Create a Pages project from the repo. Build command `npm run build`, output directory `dist`.
2. Environment variables: `NODE_VERSION=24`, `SITE_URL=https://<your-domain>`, `BASE_PATH=/`, and the
   form variables if you want live forms.
3. `public/_headers` sets security headers and a one-year immutable cache for `/_astro/*`;
   `public/_redirects` is a placeholder for redirects.

### GitHub Pages

1. Repo Settings > Pages > Source: **GitHub Actions**.
2. `.github/workflows/deploy-pages.yml` deploys on every push to `main`, and can also be started from Actions >
   Deploy to GitHub Pages > Run workflow.
3. It builds with the repository variables `SITE_URL` and `BASE_PATH` (Settings > Secrets and variables >
   Actions > Variables). Unset, they default to `https://<owner>.github.io` and `/<repo-name>`. For a custom
   domain or a `<owner>.github.io` repo, set `SITE_URL` to that origin and `BASE_PATH=/`.
4. GitHub Pages ignores `_headers` and `_redirects`, so there are no custom security or cache headers there.

## Rename the brand

1. Edit `name` in `src/data/site.ts`, and the contact details and social links in `src/data/copy/site.json`.
   Copy strings that contain the old brand name are rewritten to `site.name` when loaded
   (`src/data/load-copy.ts`), so the copy files need no edit.
2. Redraw the three files that spell the name: `src/assets/brand/wordmark.svg`,
   `src/assets/brand/monogram.svg` and `public/favicon.svg`. Keep the `viewBox` proportions and use
   `currentColor` so the marks follow the colour scheme.
3. Colours, type and spacing live in `src/styles/tokens.css`; change values there, never in components.

## Swap photos

1. Put the new file under `src/assets/photos/<group>/`.
2. Add or edit its entry in `src/assets/photos/manifest.json`: `file`, `alt`, `width`, `height`, photographer, source and licence.
   `<Photo src="hero/villa-dusk.jpg" />` looks the file up in the manifest and takes the alt text from it,
   so every image has one source of alt text.
3. Update `CREDITS.md`. The build fails on a path that is missing from the manifest, so typos show up early.

## Swap copy

All visible text is in `src/data/copy/*.json` (see `src/data/copy/README.md`). Listings are in
`properties.json`, agents in `agents.json`, page titles and descriptions in `seo.json`. Typed loaders are in
`src/data/load-copy.ts`; add a type there when you add a file.

## Forms

Forms validate in the browser and work without an endpoint: in demo mode they show the success panel with
a "nothing was sent" note.

- **Web3Forms:** `PUBLIC_FORM_ENDPOINT=https://api.web3forms.com/submit` and `PUBLIC_FORM_ACCESS_KEY=<key>`.
  Lock the key to your domain in the Web3Forms dashboard.
- **Formspree:** `PUBLIC_FORM_ENDPOINT=https://formspree.io/f/<form-id>`, no access key.

Forms POST `FormData` with `Accept: application/json` and include a `botcheck` honeypot field. A non-2xx
response shows the failure message and keeps what the visitor typed. Mention the form service in your privacy
notice when you turn it on.

## Before launch

- **Replace the privacy page.** `src/pages/privacy.astro` is a placeholder that describes the demo (marked
  `REPLACE BEFORE LAUNCH` in an HTML comment). Publish a policy reviewed for the real business, its form
  service and its jurisdictions.
- Set `SITE_URL` (and the form variables) for the real domain.

## Credits

Photos: Unsplash, listed per file in `CREDITS.md` and `manifest.json`. Fonts: Newsreader and Schibsted Grotesk
(SIL Open Font License). Icons: Lucide (ISC) and Simple Icons (CC0).
