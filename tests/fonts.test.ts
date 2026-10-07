/**
 * The web fonts are cut down to the characters in src/assets/fonts/subset-unicodes.txt (scripts/subset-fonts.sh).
 * A character the copy uses outside that list would render in the fallback font, so this test names it.
 * Scans copy JSON, journal Markdown and the text in .astro/.ts sources (comments stripped).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = new URL('..', import.meta.url).pathname;

function parseRanges(text: string): Array<[number, number]> {
  return text
    .trim()
    .split(',')
    .map((part) => {
      const [from, to = from] = part.replace(/U\+/g, '').split('-');
      return [parseInt(from, 16), parseInt(to, 16)] as [number, number];
    });
}

function files(dir: string, exts: string[]): string[] {
  return readdirSync(join(root, dir), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && exts.includes(extname(entry.name)))
    .map((entry) => join(entry.parentPath, entry.name));
}

const stripComments = (code: string) =>
  code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

test('every character the copy uses is in the font subset', () => {
  const ranges = parseRanges(readFileSync(join(root, 'src/assets/fonts/subset-unicodes.txt'), 'utf8'));
  // Lone combining marks only appear in code (listing-filter.ts strips accents with a [̀-ͯ] class).
  const covered = (cp: number) =>
    cp < 0x20 || /\p{M}/u.test(String.fromCodePoint(cp)) || ranges.some(([from, to]) => cp >= from && cp <= to);

  const sources = [
    ...files('src/data', ['.json']),
    ...files('src/content', ['.md', '.mdx']),
    ...files('src', ['.astro', '.ts']),
  ];
  const missing = new Map<string, string>();
  for (const file of sources) {
    const raw = readFileSync(file, 'utf8');
    const text = ['.astro', '.ts'].includes(extname(file)) ? stripComments(raw) : raw;
    for (const ch of text) {
      const cp = ch.codePointAt(0)!;
      if (!covered(cp) && !missing.has(ch)) missing.set(ch, file.replace(root, ''));
    }
  }
  const report = [...missing].map(([ch, file]) => `U+${ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')} "${ch}" in ${file}`);
  assert.deepEqual(report, [], 'Add these to subset-unicodes.txt and run scripts/subset-fonts.sh');
});
