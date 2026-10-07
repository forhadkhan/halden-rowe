/** Shapes of the copy the home page reads (src/data/copy/home.json, search.json, journal.json). */

export interface CopyImage {
  file: string;
  alt: string;
}

export interface HomeCopy {
  hero: {
    headline: string;
    lead: string;
    stat: { value: string; label: string };
    rating: { stars: number; starsLabel: string; title: string; caption: string };
    avatars: string[];
  };
  trust: {
    eyebrow: string;
    statement: string;
    stats: { value: number; suffix: string; label: string }[];
  };
  featured: { eyebrow: string; headline: string; viewAll: string; viewAllHref: string; cardHoverLabel: string };
  aboutTeaser: {
    eyebrow: string;
    headline: string;
    lead: string;
    body: string;
    founders: string;
    link: string;
    href: string;
    image: CopyImage;
  };
  services: {
    eyebrow: string;
    headline: string;
    intro: string;
    regionLabel: string;
    items: { id: string; title: string; line: string; link: string; href: string; image: CopyImage }[];
  };
  marquee: { label: string; eyebrow: string; linkLabel: string; items: { name: string; state: string }[] };
  map: {
    eyebrow: string;
    headline: string;
    lead: string;
    mapLabel: string;
    chips: { id: 'all' | 'sale' | 'rent'; label: string }[];
    chipsLabel: string;
    listHeading: string;
    popup: { viewHome: string; closeLabel: string };
  };
  steps: { eyebrow: string; headline: string; items: { title: string; text: string }[] };
  places: {
    eyebrow: string;
    headline: string;
    items: { name: string; meta: string; href: string; image: CopyImage }[];
    rowLabel: string;
  };
  agents: { eyebrow: string; headline: string; link: string; href: string; listingsCount: { one: string; other: string } };
  testimonials: {
    eyebrow: string;
    headline: string;
    carouselLabel: string;
    slideLabel: string;
    previous: string;
    next: string;
    counter: string;
  };
  faq: { eyebrow: string; headline: string; lead: string; contactPrompt: string; contactLink: string; contactHref: string };
  cta: {
    headline: string;
    line: string;
    primary: string;
    primaryHref: string;
    secondary: string;
    secondaryHref: string;
    image: CopyImage;
  };
  journalTeaser: { eyebrow: string; headline: string; link: string; href: string };
}

export interface PriceRange {
  min: number | null;
  max: number | null;
  label: string;
}

export interface SearchCopy {
  search: {
    label: string;
    tabs: { id: 'buy' | 'rent' | 'sell'; label: string }[];
    labels: { location: string; type: string; price: string; beds: string };
    options: {
      anyLocation: string;
      anyType: string;
      anyPrice: string;
      anyBeds: string;
      beds: { value: number; label: string }[];
      types: string[];
      priceBuy: PriceRange[];
      priceRent: PriceRange[];
    };
    moreOptions: string;
    fewerOptions: string;
    submit: string;
    sell: { copy: string; addressLabel: string; addressPlaceholder: string; submit: string };
  };
}

export interface JournalCopy {
  readingTime: string;
  categories: Record<string, string>;
}

/**
 * Home copy links use `status` and `city`; the /properties contract (card F2a) reads `mode` and `q`.
 * Rewrites only /properties links; everything else passes through.
 */
export function toPropertiesContract(href: string): string {
  const [path, query = ''] = href.split('?');
  if (path !== '/properties' || !query) return href;
  const params = new URLSearchParams(query);
  const status = params.get('status');
  const city = params.get('city');
  if (status) {
    params.delete('status');
    params.set('mode', status);
  }
  if (city) {
    params.delete('city');
    params.set('q', city);
  }
  return `${path}?${params.toString().replace(/\+/g, '%20')}`;
}
