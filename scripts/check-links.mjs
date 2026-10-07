#!/usr/bin/env node
/**
 * Crawl every dist/**\/*.html and fail on a broken internal link or asset.
 *
 * Checks href, src, srcset, poster, action and content (og:image, twitter:image) values, plus url() in inline
 * style attributes. External http(s) URLs on another host, mailto:, tel:, data: and javascript: are skipped.
 * Absolute URLs on the site's host (SITE_URL, else the host of the pages' canonical links) are checked as
 * internal. BASE_PATH (default '/') is stripped before
 * resolving, so it works for a GitHub Pages build too. Fragments (#id) are checked against ids on the target page.
 *
 * Usage: npm run check:links   (after npm run build; same BASE_PATH/SITE_URL as the build)
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
let base = `/${(process.env.BASE_PATH ?? '/').replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const exists = async (path) => {
  try {
    return await stat(path);
  } catch {
    return null;
  }
};

/** Resolve a site path (base already stripped) to a file in dist, or null. */
async function resolveFile(pathname) {
  let p = decodeURIComponent(pathname);
  if (!p.startsWith('/')) p = `/${p}`;
  const direct = join(DIST, p);
  const s = await exists(direct);
  if (s?.isFile()) return direct;
  const index = join(DIST, p, 'index.html');
  if (await exists(index)) return index;
  const html = join(DIST, `${p.replace(/\/$/, '')}.html`);
  if (await exists(html)) return html;
  return null;
}

const ATTR = /\s(href|src|srcset|poster|action|content|style)\s*=\s*("([^"]*)"|'([^']*)')/gi;
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function candidates(name, value) {
  if (name === 'srcset') return value.split(',').map((part) => part.trim().split(/\s+/)[0]).filter(Boolean);
  if (name === 'style') return [...value.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((m) => m[1]);
  if (name === 'content') return /^(https?:)?\/\//.test(value) || value.startsWith('/') ? [value] : [];
  return [value];
}

const idCache = new Map();
async function idsOf(file) {
  if (!idCache.has(file)) {
    const html = await readFile(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\sid\s*=\s*["']([^"']+)["']/g)].map((m) => m[1])));
  }
  return idCache.get(file);
}

const files = (await walk(DIST)).filter((f) => f.endsWith('.html'));
if (files.length === 0) {
  console.error('check-links: no HTML in dist/. Run npm run build first.');
  process.exit(1);
}

// The site's own host, read from the build's canonical URLs, so no env file is needed here.
let siteHost = process.env.SITE_URL ? new URL(process.env.SITE_URL).host : '';
const homeCanonical = (await readFile(join(DIST, 'index.html'), 'utf8').catch(() => '')).match(
  /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/,
);
if (!siteHost && homeCanonical) siteHost = new URL(homeCanonical[1]).host;
// BASE_PATH: from the env when set, else from the home page's canonical path ("/halden-rowe/").
if (process.env.BASE_PATH === undefined && homeCanonical) {
  base = new URL(homeCanonical[1]).pathname.replace(/\/+$/, '');
}

const broken = [];
let checked = 0;

for (const file of files) {
  const html = (await readFile(file, 'utf8')).replace(/<!--[\s\S]*?-->/g, '');
  const pagePath = `/${relative(DIST, file).split(sep).join('/')}`.replace(/index\.html$/, '').replace(/\.html$/, '');
  const pageUrl = new URL(`${base}${pagePath}`, `http://${siteHost || 'site.local'}`);

  for (const match of html.matchAll(ATTR)) {
    const name = match[1].toLowerCase();
    // <meta content> only counts on og:/twitter: image tags; other content values are prose.
    if (name === 'content' && !/(og:image|twitter:image)/i.test(html.slice(Math.max(0, match.index - 120), match.index))) continue;
    for (const raw of candidates(name, decode(match[3] ?? match[4] ?? ''))) {
      const value = raw.trim();
      if (!value || /^(mailto:|tel:|data:|javascript:|blob:)/i.test(value)) continue;
      let target;
      try {
        target = new URL(value, pageUrl);
      } catch {
        broken.push({ file, value, reason: 'unparseable URL' });
        continue;
      }
      if (!/^https?:$/.test(target.protocol) || target.host !== pageUrl.host) continue;
      checked += 1;

      let pathname = target.pathname;
      if (base && !(pathname === base || pathname.startsWith(`${base}/`))) {
        broken.push({ file, value, reason: `outside BASE_PATH ${base}` });
        continue;
      }
      pathname = pathname.slice(base.length) || '/';
      const resolved = await resolveFile(pathname);
      if (!resolved) {
        broken.push({ file, value, reason: 'no such file in dist' });
        continue;
      }
      const fragment = decodeURIComponent(target.hash.slice(1));
      if (fragment && resolved.endsWith('.html') && !(await idsOf(resolved)).has(fragment)) {
        broken.push({ file, value, reason: `no element with id "${fragment}"` });
      }
    }
  }
}

if (broken.length) {
  for (const b of broken) console.error(`BROKEN  ${relative(DIST, b.file)}  ${b.value}  (${b.reason})`);
  console.error(`\ncheck-links: ${broken.length} broken of ${checked} internal references in ${files.length} pages.`);
  process.exit(1);
}
console.log(`check-links: ${checked} internal references in ${files.length} pages, none broken.`);
