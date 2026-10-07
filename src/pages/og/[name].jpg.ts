/**
 * Generated share cards (1200x630 JPEG), built once per page family at build time with sharp:
 * the page's photo, a night scrim from the bottom-left, a brass rule and the brand wordmark in ivory.
 * No text is rasterised besides the wordmark paths, so the card never depends on system fonts.
 *
 *   /og/default.jpg          site default (hero photo), used by every page that names no other card
 *   /og/<listing-slug>.jpg   each listing's exterior
 *   /og/<post-slug>.jpg      each journal post's cover
 *
 * Seo.astro points og:image / twitter:image at these through BaseLayout's `ogImage` prop.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { getCopy } from '../../data/load-copy';
import { site } from '../../data/site';

const W = 1200;
const H = 630;
const PHOTOS = path.resolve('src/assets/photos');
const WORDMARK = path.resolve('src/assets/brand/wordmark.svg');

export const getStaticPaths = (async () => {
  const listings = getCopy('properties').listings;
  const posts = await getCollection('journal');
  return [
    { params: { name: 'default' }, props: { photo: site.defaultOgPhoto, position: 'centre' } },
    ...listings.map((l) => ({
      params: { name: l.slug },
      // The penthouse tower is portrait: crop from its upper floors, not the street.
      props: { photo: l.images[0]?.file ?? site.defaultOgPhoto, position: l.slug === 'skyline-penthouse-nyc' ? 'north' : 'centre' },
    })),
    ...posts.map((p) => ({ params: { name: p.data.slug }, props: { photo: p.data.cover, position: 'centre' } })),
  ];
}) satisfies GetStaticPaths;

const scrim = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="1" x2="0.55" y2="0">
        <stop offset="0" stop-color="#0a0d0d" stop-opacity="0.78"/>
        <stop offset="0.45" stop-color="#0a0d0d" stop-opacity="0.5"/>
        <stop offset="1" stop-color="#0a0d0d" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <g stroke="#d4b27c" stroke-width="1.5">
      <path d="M72 470H520"/><path d="M72 462V478M520 462V478"/>
    </g>
  </svg>`,
);

export const GET: APIRoute = async ({ props }) => {
  const { photo, position } = props as { photo: string; position: string };
  const svg = (await readFile(WORDMARK, 'utf8')).replaceAll('currentColor', '#f8f6f0');
  const wordmark = await sharp(Buffer.from(svg), { density: 300 }).resize({ width: 520 }).png().toBuffer();

  const image = await sharp(path.join(PHOTOS, photo))
    .resize(W, H, { fit: 'cover', position })
    .composite([
      { input: scrim, left: 0, top: 0 },
      { input: wordmark, left: 72, top: 500 },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(image), { headers: { 'Content-Type': 'image/jpeg' } });
};
