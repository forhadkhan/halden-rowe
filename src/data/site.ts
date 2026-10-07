/**
 * Brand and site configuration: the one place to rename the agency.
 *
 * RENAME: change `name` below. Every copy string that contains
 * `COPY_BRAND` is rewritten to `name` when it is loaded (see `src/data/load-copy.ts`), so the copy files
 * need no edit. Three drawn files spell the old name and must be redrawn by a designer:
 * `src/assets/brand/wordmark.svg`, `src/assets/brand/monogram.svg`, `public/favicon.svg`.
 * Email addresses and social handles live in `src/data/copy/site.json`.
 */
export const site = {
  /** Tagline, positioning line, contact details and social links live in src/data/copy/site.json. */
  name: 'Halden & Rowe',
  /** From SITE_URL at build time (astro.config.mjs). */
  url: import.meta.env.SITE,
  locale: 'en-US',
  lang: 'en',
  currency: 'USD',
  /** Mortgage calculator default, labelled "illustrative rate" on the page (DESIGN.md 10.14). */
  illustrativeRate: 6.5,
  /** Brand colour for browser chrome (night 900 from tokens.css). */
  themeColor: '#121717',
  /**
   * Search engines are blocked (noindex meta, robots.txt Disallow, no sitemap, X-Robots-Tag in public/_headers) until a
   * build sets ALLOW_INDEXING=1. This is a fictional agency, so the default is closed.
   */
  indexable: import.meta.env.ALLOW_INDEXING === '1',
  /** Default social share image, a manifest path (see src/lib/photos.ts). */
  defaultOgPhoto: 'hero/villa-dusk.jpg',
} as const;

/** The brand name exactly as Quill writes it in the copy files; replaced by `site.name` on load. */
export const COPY_BRAND = 'Halden & Rowe';

/** Form endpoint (Web3Forms or Formspree compatible). Empty = demo mode. */
export const formConfig = {
  endpoint: import.meta.env.PUBLIC_FORM_ENDPOINT ?? '',
  accessKey: import.meta.env.PUBLIC_FORM_ACCESS_KEY ?? '',
} as const;
