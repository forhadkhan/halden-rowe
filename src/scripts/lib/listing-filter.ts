/**
 * Pure filter / sort / URL logic for /properties (DESIGN.md 10.7). No DOM here, so it is easy to reason about.
 *
 * URL params: status=buy|rent (alias `mode`, and `sale` = buy), city, type, min, max, beds, q, saved=1, sort.
 * The hero search can also send `price=<min>-<max>` (either side may be empty). Invalid values are dropped
 * silently. `status` is what we write: it is what DESIGN.md, the nav (aria-current) and the copy links use.
 * A keyword that is exactly a known city (`?q=Austin`, from testimonial links) becomes the city filter.
 */

export type Mode = 'all' | 'buy' | 'rent';
export type Sort = 'newest' | 'price-asc' | 'price-desc' | 'largest';

export interface FilterState {
  mode: Mode;
  city: string;
  type: string;
  min: number | null;
  max: number | null;
  beds: number | null;
  q: string;
  /** Only homes in the visitor's saved list (localStorage, see saved.ts). */
  saved: boolean;
  sort: Sort;
}

export interface Home {
  slug: string;
  status: 'sale' | 'rent';
  city: string;
  type: string;
  price: number;
  beds: number;
  sqft: number;
  listed: string;
  /** Text the keyword searches: title, type, neighborhood, city, state code and name, street names. */
  text: string;
}

export interface Options {
  cities: string[];
  types: string[];
  beds: number[];
  sorts: Sort[];
}

export const DEFAULT_STATE: FilterState = {
  mode: 'all',
  city: '',
  type: '',
  min: null,
  max: null,
  beds: null,
  q: '',
  saved: false,
  sort: 'newest',
};

const MAX_Q = 80;

const positive = (value: string | null): number | null => {
  if (!value || !/^\d{1,9}$/.test(value.trim())) return null;
  const n = Number(value);
  return n > 0 ? n : null;
};

const pick = (value: string | null, allowed: string[]): string => {
  if (!value) return '';
  const found = allowed.find((a) => a.toLowerCase() === value.trim().toLowerCase());
  return found ?? '';
};

export function parseParams(params: URLSearchParams, options: Options): FilterState {
  const rawMode = (params.get('status') ?? params.get('mode') ?? '').toLowerCase();
  const mode: Mode = rawMode === 'buy' || rawMode === 'sale' ? 'buy' : rawMode === 'rent' ? 'rent' : 'all';

  let min = positive(params.get('min'));
  let max = positive(params.get('max'));
  const price = params.get('price');
  if (price && min === null && max === null) {
    const [lo, hi] = price.split('-');
    min = positive(lo ?? null);
    max = positive(hi ?? null);
  }
  if (min !== null && max !== null && min > max) [min, max] = [max, min];

  const bedsValue = positive(params.get('beds'));
  const sort = pick(params.get('sort'), options.sorts) as Sort | '';
  let city = pick(params.get('city'), options.cities);
  let q = (params.get('q') ?? '').trim().slice(0, MAX_Q);
  // A keyword that is just a city name is the city filter, so it shows once (chip + Location field).
  const qCity = pick(q, options.cities);
  if (qCity && (!city || city === qCity)) {
    city = qCity;
    q = '';
  }

  return {
    mode,
    city,
    type: pick(params.get('type'), options.types),
    min,
    max,
    beds: bedsValue !== null && options.beds.includes(bedsValue) ? bedsValue : null,
    q,
    saved: params.get('saved') === '1',
    sort: sort || 'newest',
  };
}

/** Query string for a state; defaults are left out so a clean page has a clean URL. */
export function toParams(state: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (state.mode !== 'all') p.set('status', state.mode);
  if (state.city) p.set('city', state.city);
  if (state.type) p.set('type', state.type);
  if (state.min !== null) p.set('min', String(state.min));
  if (state.max !== null) p.set('max', String(state.max));
  if (state.beds !== null) p.set('beds', String(state.beds));
  if (state.q) p.set('q', state.q);
  if (state.saved) p.set('saved', '1');
  if (state.sort !== 'newest') p.set('sort', state.sort);
  return p;
}

/** Number of active filters (sort and the default "All" are not filters). */
export function activeCount(state: FilterState): number {
  return [
    state.mode !== 'all',
    state.city,
    state.type,
    state.min !== null,
    state.max !== null,
    state.beds !== null,
    state.q,
    state.saved,
  ].filter(Boolean).length;
}

/**
 * Filters that live in the sheet and show as chips. "Filters (n)" counts these, so n always equals the chips;
 * the keyword and Saved show their state in their own controls in the bar.
 */
export function sheetCount(state: FilterState): number {
  return activeCount({ ...state, q: '', saved: false });
}

/**
 * What "Show N homes" applies: the sheet's draft plus the bar's own controls (keyword, Saved, sort) as they are
 * now. The sheet's count and the applied result both come from this, so they cannot diverge.
 */
export function withBar(draft: FilterState, current: FilterState): FilterState {
  return { ...draft, q: current.q, saved: current.saved, sort: current.sort };
}

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Lower-case words, accents and punctuation dropped: "Park Slope, Brooklyn, NY" -> park, slope, brooklyn, ny. */
const words = (s: string) => normalise(s).split(/[^a-z0-9]+/).filter(Boolean);

/**
 * "3 bed", "3 beds", "3-bed", "3br", "3 bd", "3 bedroom(s)" in the keyword. Read as "3 or more beds", the same
 * meaning as the Beds filter ("3+ beds"), so a typed phrase and the select never disagree.
 */
const BEDS_PHRASE = /\b(\d{1,2})\s*-?\s*(?:bedrooms?|beds?|bdrms?|br|bd)\b/g;

export interface Keyword {
  words: string[];
  beds: number | null;
}

export function parseKeyword(q: string): Keyword {
  let beds: number | null = null;
  const rest = normalise(q).replace(BEDS_PHRASE, (_, n: string) => {
    beds = Math.max(beds ?? 0, Number(n));
    return ' ';
  });
  return { words: words(rest), beds };
}

/** Every word of the keyword must start a word of the home's text (so "ny" matches "NY", not "Canyon"). */
function keywordMatches(home: Home, keyword: Keyword): boolean {
  if (keyword.beds !== null && home.beds < keyword.beds) return false;
  const text = words(home.text);
  return keyword.words.every((w) => text.some((t) => t.startsWith(w)));
}

export function matches(home: Home, state: FilterState, saved: ReadonlySet<string> = new Set()): boolean {
  if (state.saved && !saved.has(home.slug)) return false;
  if (state.mode === 'buy' && home.status !== 'sale') return false;
  if (state.mode === 'rent' && home.status !== 'rent') return false;
  // A price filter in "All" uses the sale scale, so it implies homes for sale.
  if (state.mode === 'all' && (state.min !== null || state.max !== null) && home.status !== 'sale') return false;
  if (state.city && home.city !== state.city) return false;
  if (state.type && home.type !== state.type) return false;
  if (state.min !== null && home.price < state.min) return false;
  if (state.max !== null && home.price > state.max) return false;
  if (state.beds !== null && home.beds < state.beds) return false;
  if (state.q && !keywordMatches(home, parseKeyword(state.q))) return false;
  return true;
}

export function sortHomes(homes: Home[], sort: Sort): Home[] {
  const list = [...homes];
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price);
    case 'largest':
      return list.sort((a, b) => b.sqft - a.sqft);
    default:
      return list.sort((a, b) => b.listed.localeCompare(a.listed));
  }
}

export function filterHomes(homes: Home[], state: FilterState, saved?: ReadonlySet<string>): Home[] {
  return sortHomes(
    homes.filter((h) => matches(h, state, saved)),
    state.sort,
  );
}

/**
 * Up to `limit` close matches when nothing matches: relax price first, then beds, type, keyword, city and
 * finally status, one step at a time, and return the first non-empty result. "Saved" is never relaxed: close
 * matches in the saved view are still saved homes.
 */
export function closeMatches(homes: Home[], state: FilterState, limit = 3, saved?: ReadonlySet<string>): Home[] {
  const steps: ((s: FilterState) => FilterState)[] = [
    (s) => ({ ...s, min: null, max: null }),
    (s) => ({ ...s, beds: null }),
    (s) => ({ ...s, type: '' }),
    (s) => ({ ...s, q: '' }),
    (s) => ({ ...s, city: '' }),
    (s) => ({ ...s, mode: 'all' }),
  ];
  let relaxed = state;
  for (const step of steps) {
    relaxed = step(relaxed);
    const found = filterHomes(homes, relaxed, saved);
    if (found.length) return found.slice(0, limit);
  }
  return [];
}
