/**
 * Photo lookup by manifest path ("hero/villa-dusk.jpg"). Kolpona's manifest gives alt text and size;
 * import.meta.glob gives Astro the image module so it can build responsive avif/webp variants.
 */
import type { ImageMetadata } from 'astro';
import manifest from '../assets/photos/manifest.json';

export interface PhotoEntry {
  file: string;
  group: string;
  slot: string;
  listing: string | null;
  alt: string;
  width: number;
  height: number;
  source_url: string;
  photographer: string;
  licence: string;
}

const modules = import.meta.glob<ImageMetadata>('../assets/photos/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

const entries = new Map((manifest as PhotoEntry[]).map((entry) => [entry.file, entry]));

export interface Photo {
  entry: PhotoEntry;
  image: ImageMetadata;
}

/** Resolve a manifest path. Unknown paths fail the build so a typo never ships as a broken image. */
export function getPhoto(file: string): Photo {
  const entry = entries.get(file);
  const image = modules[`../assets/photos/${file}`];
  if (!entry) throw new Error(`Photo "${file}" is not in src/assets/photos/manifest.json.`);
  if (!image) throw new Error(`Photo "${file}" is in the manifest but the file is missing from src/assets/photos/.`);
  return { entry, image };
}

/** All manifest entries of a group ("agents") or of one listing ("hillside-villa-la"). */
export function photosWhere(filter: { group?: string; listing?: string }): PhotoEntry[] {
  return [...entries.values()].filter(
    (e) => (!filter.group || e.group === filter.group) && (!filter.listing || e.listing === filter.listing),
  );
}
