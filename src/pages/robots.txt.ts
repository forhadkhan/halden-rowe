/**
 * robots.txt as an endpoint (not a static public/ file) so the Sitemap line is absolute and honours
 * SITE_URL and BASE_PATH on every host.
 */
import type { APIRoute } from 'astro';
import { site as siteConfig } from '../data/site';

export const GET: APIRoute = ({ site }) => {
  if (!siteConfig.indexable) {
    return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const sitemap = new URL(`${base}/sitemap-index.xml`, site).href;
  const body = ['User-agent: *', 'Allow: /', `Disallow: ${base}/styleguide/`, '', `Sitemap: ${sitemap}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
