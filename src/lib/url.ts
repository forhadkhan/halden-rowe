/**
 * Every internal link and public asset goes through `url()` so the same build works at a domain root
 * (Cloudflare Pages) and under a project path (GitHub Pages, BASE_PATH=/<repo>).
 */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

const EXTERNAL = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i;

/**
 * Prefix an internal path with the base. Page paths get a trailing slash (both hosts serve
 * `/about/index.html` at `/about/`, so links skip a redirect). Absolute URLs, `mailto:`, `tel:` and
 * `#hash` links are returned unchanged.
 */
export function url(path = '/'): string {
  if (EXTERNAL.test(path)) return path;
  const match = /^([^?#]*)(.*)$/.exec(path.startsWith('/') ? path : `/${path}`);
  let pathname = match?.[1] ?? '/';
  const rest = match?.[2] ?? '';
  const last = pathname.split('/').pop() ?? '';
  if (!pathname.endsWith('/') && !last.includes('.')) pathname += '/';
  return `${BASE}${pathname}${rest}`;
}

/** Absolute URL on the configured `site`, for canonical, Open Graph and JSON-LD. */
export function absoluteUrl(path: string, site: URL | undefined): string {
  const href = url(path);
  if (EXTERNAL.test(href)) return href;
  if (!site) throw new Error('`site` is not set: define SITE_URL so canonical and Open Graph URLs are absolute.');
  return new URL(href, site).href;
}

/** Path of the current page without the base, for "current page" checks. */
export function stripBase(pathname: string): string {
  const stripped = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  return stripped.startsWith('/') ? stripped : `/${stripped}`;
}
