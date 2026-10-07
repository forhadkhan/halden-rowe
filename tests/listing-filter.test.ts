import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_STATE,
  activeCount,
  closeMatches,
  filterHomes,
  parseKeyword,
  parseParams,
  sheetCount,
  toParams,
  withBar,
  type Home,
  type Options,
} from '../src/scripts/lib/listing-filter.ts';

const options: Options = {
  cities: ['Los Angeles', 'Seattle', 'Chicago'],
  types: ['House', 'Condo', 'Loft'],
  beds: [1, 2, 3, 4],
  sorts: ['newest', 'price-asc', 'price-desc', 'largest'],
};

const homes: Home[] = [
  { slug: 'villa', status: 'sale', city: 'Los Angeles', type: 'House', price: 4_000_000, beds: 4, sqft: 4300, listed: '2026-09-01', text: 'hillside villa hollywood hills los angeles ca' },
  { slug: 'shore', status: 'sale', city: 'Seattle', type: 'House', price: 2_500_000, beds: 4, sqft: 3700, listed: '2026-09-20', text: 'lakeside house laurelhurst seattle wa' },
  { slug: 'loft', status: 'rent', city: 'Chicago', type: 'Loft', price: 6_500, beds: 2, sqft: 1800, listed: '2026-09-10', text: 'river loft west loop chicago il' },
  { slug: 'condo', status: 'sale', city: 'Chicago', type: 'Condo', price: 900_000, beds: 2, sqft: 1500, listed: '2026-08-15', text: 'lake view condo gold coast chicago il' },
];

const parse = (query: string) => parseParams(new URLSearchParams(query), options);
const slugs = (list: Home[]) => list.map((h) => h.slug);

test('empty query gives the default state', () => {
  assert.deepEqual(parse(''), DEFAULT_STATE);
});

test('status, its `mode` alias and `sale` = buy', () => {
  assert.equal(parse('status=rent').mode, 'rent');
  assert.equal(parse('mode=buy').mode, 'buy');
  assert.equal(parse('status=sale').mode, 'buy');
  assert.equal(parse('status=RENT').mode, 'rent');
  assert.equal(parse('status=lease').mode, 'all');
  assert.equal(parse('status=rent&mode=buy').mode, 'rent', 'status wins over mode');
});

test('price=min-max, open-ended sides, and swapped bounds', () => {
  assert.deepEqual([parse('price=500000-2000000').min, parse('price=500000-2000000').max], [500_000, 2_000_000]);
  assert.deepEqual([parse('price=1000000-').min, parse('price=1000000-').max], [1_000_000, null]);
  assert.deepEqual([parse('price=-750000').min, parse('price=-750000').max], [null, 750_000]);
  assert.deepEqual([parse('min=9&max=3').min, parse('min=9&max=3').max], [3, 9]);
  assert.equal(parse('min=100&price=1-2').min, 100, 'explicit min/max win over price');
  assert.equal(parse('price=abc-').min, null);
});

test('type and city match case-insensitively and keep the canonical value; unknown ones drop', () => {
  assert.equal(parse('type=condo').type, 'Condo');
  assert.equal(parse('type=%20LOFT%20').type, 'Loft');
  assert.equal(parse('type=castle').type, '');
  assert.equal(parse('city=seattle').city, 'Seattle');
});

test('sort and beds only accept known values', () => {
  assert.equal(parse('sort=price-desc').sort, 'price-desc');
  assert.equal(parse('sort=cheapest').sort, 'newest');
  assert.equal(parse('beds=3').beds, 3);
  assert.equal(parse('beds=7').beds, null);
  assert.equal(parse('beds=-1').beds, null);
});

test('toParams round-trips and leaves defaults out', () => {
  const state = parse('mode=sale&type=condo&price=1-2&beds=2&q=lake&sort=largest');
  assert.equal(toParams(DEFAULT_STATE).toString(), '');
  assert.deepEqual(parse(toParams(state).toString()), state);
  assert.equal(toParams(state).get('status'), 'buy');
  assert.equal(activeCount(state), 6, 'status, type, min, max, beds and q; sort is not a filter');
});

test('filtering by status, city, beds and keyword; newest first by default', () => {
  assert.deepEqual(slugs(filterHomes(homes, parse(''))), ['shore', 'loft', 'villa', 'condo']);
  assert.deepEqual(slugs(filterHomes(homes, parse('status=rent'))), ['loft']);
  assert.deepEqual(slugs(filterHomes(homes, parse('city=chicago&sort=price-asc'))), ['loft', 'condo']);
  assert.deepEqual(slugs(filterHomes(homes, parse('beds=4&sort=largest'))), ['villa', 'shore']);
  assert.deepEqual(slugs(filterHomes(homes, parse('q=Chicago%20LAKE'))), ['condo']);
});

test('a price filter in "All" implies homes for sale', () => {
  assert.deepEqual(slugs(filterHomes(homes, parse('max=10000'))), []);
  assert.deepEqual(slugs(filterHomes(homes, parse('status=rent&max=10000'))), ['loft']);
  assert.deepEqual(slugs(filterHomes(homes, parse('price=1000000-3000000'))), ['shore']);
});

test('empty state: no match gives close matches by relaxing price first, then the rest', () => {
  const none = parse('city=seattle&max=1000000');
  assert.deepEqual(filterHomes(homes, none), []);
  assert.deepEqual(slugs(closeMatches(homes, none)), ['shore']);
  assert.deepEqual(slugs(closeMatches(homes, parse('q=nowhere'), 2)), ['shore', 'loft']);
});

test('saved=1 shows only saved homes, round-trips, and never relaxes in close matches', () => {
  const savedSet = new Set(['condo', 'villa']);
  const state = parse('saved=1');
  assert.equal(state.saved, true);
  assert.equal(parse('saved=yes').saved, false);
  assert.equal(toParams(state).toString(), 'saved=1');
  assert.deepEqual(slugs(filterHomes(homes, state, savedSet)), ['villa', 'condo']);
  assert.deepEqual(filterHomes(homes, state, new Set()), [], 'nothing saved: empty, not every home');
  assert.deepEqual(slugs(closeMatches(homes, parse('saved=1&city=seattle'), 3, savedSet)), ['villa', 'condo']);
  assert.deepEqual(closeMatches(homes, state, 3, new Set()), []);
});

test('a keyword that is only a city name becomes the city filter (hero and testimonial links)', () => {
  assert.deepEqual([parse('q=seattle').city, parse('q=seattle').q], ['Seattle', '']);
  assert.deepEqual([parse('q=Seattle&city=Chicago').city, parse('q=Seattle&city=Chicago').q], ['Chicago', 'Seattle']);
  assert.equal(parse('q=Seattle%20lake').q, 'Seattle lake', 'more than a city stays a keyword');
});

test('Filters (n) counts only the sheet filters, which are exactly the chips', () => {
  const state = parse('status=buy&city=chicago&q=lake&saved=1');
  assert.equal(sheetCount(state), 2);
  assert.equal(activeCount(state), 4, 'Clear all still sees the keyword and Saved');
});

test('the sheet applies its draft with the bar keyword, Saved and sort as they are now', () => {
  const draft = parse('status=rent');
  const current = parse('q=loop&saved=1&sort=price-asc&status=buy');
  assert.deepEqual(withBar(draft, current), { ...draft, q: 'loop', saved: true, sort: 'price-asc' });
});

test('keyword ignores commas, case and accents, and every word must start a word of the card text', () => {
  const list: Home[] = [
    { ...homes[0]!, slug: 'slope', city: 'Brooklyn', text: 'brownstone park slope brooklyn ny new york' },
    { ...homes[0]!, slug: 'canyon', text: 'canyon house los angeles ca california' },
  ];
  const find = (q: string) => slugs(filterHomes(list, parse(`q=${encodeURIComponent(q)}`)));
  assert.deepEqual(find('Brooklyn, NY'), ['slope']);
  assert.deepEqual(find('park slope, brooklyn'), ['slope']);
  assert.deepEqual(find('BRÓOKLYN'), ['slope']);
  assert.deepEqual(find('new york'), ['slope']);
  assert.deepEqual(find('ny'), ['slope'], '"ny" does not match inside "canyon"');
  assert.deepEqual(find('brooklyn ca'), []);
});

test('"3 bed", "3 beds", "3br", "3-bedroom" mean 3 or more beds, like the Beds filter', () => {
  for (const q of ['3 bed', '3 beds', '3br', '3 BR', '3-bedroom', '3 bedrooms', '3bd']) {
    assert.deepEqual(parseKeyword(q), { words: [], beds: 3 }, q);
  }
  assert.deepEqual(slugs(filterHomes(homes, parse('q=4%20beds'))), ['shore', 'villa']);
  assert.deepEqual(slugs(filterHomes(homes, parse('q=chicago%202br'))), ['loft', 'condo']);
  assert.deepEqual(slugs(filterHomes(homes, parse('q=chicago%203%20bed'))), []);
});
