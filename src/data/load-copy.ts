/**
 * Typed loaders for Quill's copy files in `src/data/copy/*.json`.
 * Every string passes through `rebrand()` so a rename in `site.ts` reaches all copy.
 * A missing file fails the build loudly instead of rendering an empty section.
 */
import { COPY_BRAND, site } from './site';

const files = import.meta.glob<unknown>('./copy/*.json', { eager: true, import: 'default' });

export interface Link {
  label: string;
  href: string;
}

export interface SiteCopy {
  name: string;
  tagline: string;
  positioning: string;
  skipLink: string;
  nav: {
    label: string;
    links: Link[];
    cta: Link;
    homeLinkLabel: string;
    menuOpen: string;
    menuClose: string;
    currentPage: string;
  };
  cities: string[];
  contact: {
    phone: string;
    phoneHref: string;
    email: string;
    address: { street: string; city: string; state: string; postalCode: string; country: string; oneLine: string };
    hours: { days: string; time: string }[];
    hoursShort: string;
  };
  social: { network: SocialNetwork; handle: string; href: string; label: string }[];
  footer: {
    positioning: string;
    explore: { heading: string; links: Link[] };
    company: { heading: string; links: Link[] };
    contactHeading: string;
    socialHeading: string;
    copyright: string;
    demoLine: string;
    creditsLabel: string;
    creditsHref: string;
    privacyLabel: string;
    privacyHref: string;
  };
  newsletter: {
    headline: string;
    line: string;
    label: string;
    placeholder: string;
    submit: string;
    sending: string;
    consent: string;
    success: string;
    successLine: string;
    error: string;
    failure: string;
  };
  demo: { footerLine: string; formNote: string; galleryNote: string; banner: string };
  a11y: { socialLinkPattern: string; phoneLinkPattern: string; emailLinkPattern: string; openInNewTab: string };
}

export type SocialNetwork = 'instagram' | 'facebook' | 'x' | 'youtube' | 'pinterest';

export interface Agent {
  id: string;
  name: string;
  role: string;
  photo: string;
  alt: string;
  bio: string;
  bioShort: string;
  specialties: string[];
  phone: string;
  phoneHref: string;
  email: string;
}

export interface AgentsCopy {
  agents: Agent[];
}

/** Plural pair used across the copy: { one: 'bed', other: 'beds' }. */
export interface Plural {
  zero?: string;
  one: string;
  other: string;
}

export interface ListingImage {
  file: string;
  caption?: string;
  alt: string;
}

export interface Listing {
  slug: string;
  title: string;
  status: 'sale' | 'rent';
  tag: string | null;
  featured: boolean;
  featuredOrder: number | null;
  listed: string;
  price: number;
  priceLabel: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    neighborhood: string;
    oneLine: string;
  };
  beds: number;
  baths: number;
  sqft: number;
  sqftLabel: string;
  lot: string | null;
  yearBuilt: number;
  type: string;
  parking: string;
  description: string[];
  features: string[];
  neighborhoodFacts: string[];
  agentId: string;
  images: ListingImage[];
  location: {
    neighborhood: string;
    city: string;
    water: string | null;
    streets: string[];
    park: string | null;
    note: string;
  };
  mapPin: { label: string; ariaLabel: string };
  rentalTerms: Record<'deposit' | 'term' | 'available' | 'pets' | 'furnished', string> | null;
}

/** properties.json: the listings plus detail-page labels (typed where F1 components read them). */
export interface PropertiesCopy {
  listings: Listing[];
  detailPage: {
    status: Record<'sale' | 'rent' | 'new' | 'underOffer', string>;
    priceSuffixRent: string;
    actions: Record<'save' | 'saved' | 'unsaved' | 'share' | 'shareText' | 'linkCopied' | 'copyFailed' | 'print', string>;
    gallery: Record<
      'showAll' | 'showAllShort' | 'open' | 'counter' | 'close' | 'previous' | 'next' | 'zoomIn' | 'zoomOut' | 'loadError' | 'regionLabel',
      string
    >;
    facts: { beds: Plural; baths: Plural; area: string; [key: string]: unknown };
    [key: string]: unknown;
  };
}

export interface FormFieldCopy {
  label: string;
  hint?: string;
  autocomplete?: string;
}

/** errors.json: 404 copy, shared form labels and messages, toasts. */
export interface ErrorsCopy {
  notFound: Record<string, string>;
  forms: {
    optional: string;
    fields: Record<'name' | 'email' | 'phone' | 'message' | 'consent', FormFieldCopy>;
    errors: Record<string, string>;
    summary: { heading: Plural; intro: string };
    status: { sending: string; buttonSending: string; failure: string; demoNote: string; noScriptNote: string };
  };
  toasts: Record<'saved' | 'unsaved' | 'linkCopied' | 'copyFailed', string>;
}

export interface SeoPage {
  path: string;
  title: string;
  description: string;
}

/** seo.json (typed where Seo.astro reads it; page-specific parts stay loose for F2). */
export interface SeoCopy {
  siteName: string;
  titleTemplate: string;
  locale: string;
  defaultOgImageAlt: string;
  twitterHandle: string;
  pages: Record<string, SeoPage>;
  [key: string]: unknown;
}

export interface FaqItem {
  id: string;
  home?: boolean;
  q: string;
  a: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  detail: string;
  href?: string;
  agentId?: string;
  rating?: number;
  photo: string;
  alt: string;
  slider: boolean;
}

/** Known files and their shapes. Add an entry when Quill adds a file; untyped files load as `unknown`. */
export interface CopyFiles {
  site: SiteCopy;
  agents: AgentsCopy;
  properties: PropertiesCopy;
  errors: ErrorsCopy;
  seo: SeoCopy;
  faq: { items: FaqItem[]; [key: string]: unknown };
  testimonials: { items: Testimonial[]; [key: string]: unknown };
}

/** Pick the plural form: plural(3, { one: 'bed', other: 'beds' }) -> 'beds'. */
export function plural(count: number, forms: Plural): string {
  if (count === 0 && forms.zero) return forms.zero;
  return count === 1 ? forms.one : forms.other;
}

/**
 * Street names that may appear on the page (drawn plan, keyword search). The listing's own street is left out:
 * with the neighborhood it would point at the house, and the page promises "Exact address shared on inquiry".
 */
export function publicStreets(listing: Listing): string[] {
  return listing.location.streets.filter((street) => !listing.address.street.includes(street));
}

function rebrand<T>(value: T): T {
  if (typeof value === 'string') return value.replaceAll(COPY_BRAND, site.name) as T;
  if (Array.isArray(value)) return value.map(rebrand) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rebrand(v)])) as T;
  }
  return value;
}

/** Does `src/data/copy/<name>.json` exist? For optional data such as listings. */
export function hasCopy(name: string): boolean {
  return `./copy/${name}.json` in files;
}

/** Load `src/data/copy/<name>.json`, typed for the files listed in `CopyFiles`. */
export function getCopy<K extends keyof CopyFiles>(name: K): CopyFiles[K];
export function getCopy<T = unknown>(name: string): T;
export function getCopy(name: string): unknown {
  const key = `./copy/${name}.json`;
  if (!(key in files)) {
    throw new Error(`Copy file src/data/copy/${name}.json is missing. Quill writes it; the page cannot render without it.`);
  }
  return rebrand(files[key]);
}

/** Fill `{token}` placeholders in a copy string: fmt('Call {name}', { name: 'Clara' }). */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => (key in values ? String(values[key]) : whole));
}
