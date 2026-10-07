import { test } from 'node:test';
import assert from 'node:assert/strict';
import { similarHomes } from '../src/lib/similar.ts';

const homes = [
  { slug: 'austin', status: 'sale', price: 1_385_000, beds: 3, type: 'House' },
  { slug: 'palm', status: 'sale', price: 2_950_000, beds: 4, type: 'Villa' },
  { slug: 'carolina', status: 'sale', price: 3_250_000, beds: 4, type: 'House' },
  { slug: 'seattle', status: 'sale', price: 3_975_000, beds: 4, type: 'House' },
  { slug: 'brooklyn', status: 'sale', price: 4_395_000, beds: 5, type: 'Townhouse' },
  { slug: 'la', status: 'sale', price: 4_850_000, beds: 4, type: 'Villa' },
  { slug: 'penthouse', status: 'rent', price: 28_500, beds: 3, type: 'Penthouse' },
  { slug: 'loft', status: 'rent', price: 5_400, beds: 2, type: 'Loft' },
];
const slugs = (list: { slug: string }[]) => list.map((h) => h.slug);
const find = (slug: string) => homes.find((h) => h.slug === slug)!;

test('same status first, closest by price ratio, beds and type; never itself', () => {
  assert.deepEqual(slugs(similarHomes(find('austin'), homes)), ['carolina', 'palm', 'seattle']);
  assert.deepEqual(slugs(similarHomes(find('seattle'), homes)), ['carolina', 'la', 'brooklyn']);
});

test('a near price with the same beds and type beats a slightly nearer price that differs', () => {
  const home = { slug: 'x', status: 'sale', price: 3_000_000, beds: 4, type: 'House' };
  const list = [
    { slug: 'near-villa', status: 'sale', price: 3_050_000, beds: 5, type: 'Villa' },
    { slug: 'house', status: 'sale', price: 3_200_000, beds: 4, type: 'House' },
  ];
  assert.deepEqual(slugs(similarHomes(home, list)), ['house', 'near-villa']);
});

test('a rental tops up with the other status, closest beds first, still three cards', () => {
  assert.deepEqual(slugs(similarHomes(find('loft'), homes)), ['penthouse', 'austin', 'palm']);
});
