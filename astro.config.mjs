// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// .env files are not loaded into process.env before the config runs, so read them explicitly.
const env = { ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''), ...process.env };

// localhost is for `astro dev` only; requireSiteUrl() stops a build that would bake it into canonical/OG/sitemap URLs.
const SITE_URL = env.SITE_URL || 'http://localhost:4321';
// '/' for Cloudflare Pages or a custom domain; '/<repo>' for a GitHub Pages project site.
const BASE_PATH = env.BASE_PATH || '/';

/**
 * The @fontsource latin files cut down to the characters the copy uses (scripts/subset-fonts.sh), about a third
 * smaller. Axes and OpenType features are kept.
 * @param {string} file
 */
const fontFile = (file) => `./src/assets/fonts/${file}`;

/**
 * The styleguide is a dev tool: injected only for `astro dev`, or for a build with STYLEGUIDE=1
 * (handy for a reviewer's preview build). It is never part of a normal production build.
 * @returns {import('astro').AstroIntegration}
 */
function styleguide() {
  return {
    name: 'halden-rowe:styleguide',
    hooks: {
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command === 'dev' || env.STYLEGUIDE === '1') {
          injectRoute({ pattern: '/styleguide', entrypoint: './src/styleguide/Styleguide.astro' });
        }
      },
    },
  };
}

/** @returns {import('astro').AstroIntegration} */
function requireSiteUrl() {
  return {
    name: 'halden-rowe:require-site-url',
    hooks: {
      'astro:config:setup': ({ command }) => {
        if (command === 'build' && !env.SITE_URL) {
          throw new Error(
            'SITE_URL is not set. A build needs the public origin, e.g. SITE_URL=https://example.com npm run build',
          );
        }
      },
    },
  };
}

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  output: 'static',
  trailingSlash: 'ignore',
  // Inline the page CSS (about 14 KB gzipped per page): no render-blocking stylesheet requests before first paint.
  build: { format: 'directory', inlineStylesheets: 'always' },
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  // Latin subset only (DESIGN.md 3.1), trimmed further to the copy's characters (see fontFile above). The Fonts API adds metric-matched fallbacks, so the swap causes no shift.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          { src: [fontFile('newsreader-latin-opsz-normal.woff2')], weight: '200 800', style: 'normal' },
          { src: [fontFile('newsreader-latin-opsz-italic.woff2')], weight: '200 800', style: 'italic' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Schibsted Grotesk',
      cssVariable: '--font-schibsted',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: [fontFile('schibsted-grotesk-latin-wght-normal.woff2')],
            weight: '400 900',
            style: 'normal',
          },
        ],
      },
    },
  ],
  integrations: [
    requireSiteUrl(),
    styleguide(),
    // No sitemap while the site is closed to search engines (src/data/site.ts `indexable`).
    ...(env.ALLOW_INDEXING === '1'
      ? [sitemap({ filter: (page) => !/\/styleguide\/?$/.test(new URL(page).pathname) })]
      : []),
  ],
  devToolbar: { enabled: false },
});
