/**
 * "Similar homes" on a listing page: homes with the same status first, ranked by closeness, then (only two homes
 * are for rent) the other status tops the list up to `limit`, closest in size (beds) first. Never the home itself,
 * never a duplicate.
 *
 * Closeness = how far apart the prices are as a ratio (so $1.4M vs $2.9M counts as far as $2.9M vs $6M), plus a
 * small step for each bed of difference and for a different type. The steps only reorder homes of a similar price.
 */
export interface SimilarCandidate {
  slug: string;
  status: string;
  price: number;
  beds: number;
  type: string;
}

const BED_STEP = 0.15;
const TYPE_STEP = 0.15;

export function closeness(home: SimilarCandidate, other: SimilarCandidate): number {
  const price = Math.abs(Math.log(other.price / home.price));
  return price + BED_STEP * Math.abs(other.beds - home.beds) + (other.type === home.type ? 0 : TYPE_STEP);
}

export function similarHomes<T extends SimilarCandidate>(home: SimilarCandidate, all: T[], limit = 3): T[] {
  const others = all.filter((l) => l.slug !== home.slug);
  const byCloseness = (a: T, b: T) => closeness(home, a) - closeness(home, b);
  const byBeds = (a: T, b: T) => Math.abs(a.beds - home.beds) - Math.abs(b.beds - home.beds) || byCloseness(a, b);
  const sameStatus = others.filter((l) => l.status === home.status).sort(byCloseness);
  const topUp = others.filter((l) => l.status !== home.status).sort(byBeds);
  return [...sameStatus, ...topUp].slice(0, limit);
}
