/**
 * Journal posts (Quill writes them in src/content/journal/*.md). The `slug` front matter is the entry id.
 * `cover` is a photo manifest path and `author` an agent id from agents.json; the pages resolve both and the
 * build fails on a typo.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: z.string(),
    category: z.string(),
    cover: z.string(),
    coverAlt: z.string(),
    caption: z.string().optional(),
    readingTime: z.number().int().positive(),
  }),
});

export const collections = { journal };
