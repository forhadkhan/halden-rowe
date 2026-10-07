/**
 * JSON-LD builders for the inner pages (site-quality 3.1: only what the page shows, from the same data).
 * Seo.astro serialises and escapes them; pass the results to <BaseLayout jsonLd={[...]}>.
 */
import { getCopy, type Listing } from '../../data/load-copy';
import { site } from '../../data/site';
import { absoluteUrl } from '../../lib/url';

type Ld = Record<string, unknown>;

const seo = getCopy('seo');
const jsonLd = seo.jsonLd as {
  organization: Ld;
  listingDefaults: {
    residenceType: Record<string, string>;
    offer: { priceCurrency: string; availability: string; businessFunction: Record<'sale' | 'rent', string>; rentUnitText: string };
  };
};

/** Stable @id for the agency node so other blocks can point at it. */
export const orgId = (siteUrl: URL) => `${absoluteUrl('/about', siteUrl)}#agency`;

/** RealEstateAgent (about and contact). `url` comes from SITE_URL, not the copy file's example domain. */
export function organizationLd(siteUrl: URL): Ld {
  const social = getCopy('site').social.map((s) => s.href).filter((href) => /^https?:/.test(href));
  return {
    '@context': 'https://schema.org',
    ...jsonLd.organization,
    '@id': orgId(siteUrl),
    name: site.name,
    url: absoluteUrl('/', siteUrl),
    logo: absoluteUrl('/favicon.svg', siteUrl),
    sameAs: social,
  };
}

/** BreadcrumbList from [label, path] pairs; the last item is the current page. */
export function breadcrumbLd(items: { label: string; path: string }[], siteUrl: URL): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: absoluteUrl(item.path, siteUrl),
    })),
  };
}

/**
 * Residence + Offer for one listing. The street address is left out on purpose: the page shows only
 * neighborhood, city and state ("Exact address shared on inquiry"), and markup must match the page.
 */
export function listingLd(listing: Listing, imageUrls: string[], siteUrl: URL): Ld {
  const { residenceType, offer } = jsonLd.listingDefaults;
  const pageUrl = absoluteUrl(`/properties/${listing.slug}`, siteUrl);
  const price: Ld =
    listing.status === 'rent'
      ? {
          '@type': 'UnitPriceSpecification',
          price: listing.price,
          priceCurrency: offer.priceCurrency,
          unitText: offer.rentUnitText,
        }
      : { '@type': 'PriceSpecification', price: listing.price, priceCurrency: offer.priceCurrency };
  return {
    '@context': 'https://schema.org',
    '@type': residenceType[listing.type] ?? 'SingleFamilyResidence',
    '@id': `${pageUrl}#home`,
    name: listing.title,
    description: listing.description[0],
    url: pageUrl,
    image: imageUrls,
    numberOfBedrooms: listing.beds,
    numberOfBathroomsTotal: listing.baths,
    floorSize: { '@type': 'QuantitativeValue', value: listing.sqft, unitCode: 'FTK' },
    yearBuilt: listing.yearBuilt,
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.address.city,
      addressRegion: listing.address.state,
      addressCountry: 'US',
    },
    containedInPlace: { '@type': 'Place', name: `${listing.address.neighborhood}, ${listing.address.city}` },
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      price: listing.price,
      priceCurrency: offer.priceCurrency,
      priceSpecification: price,
      availability: offer.availability,
      businessFunction: offer.businessFunction[listing.status],
      validFrom: listing.listed,
      offeredBy: { '@id': orgId(siteUrl) },
    },
  };
}

export function articleLd(
  post: { title: string; description: string; date: Date; updated?: Date; slug: string },
  author: { name: string; role: string },
  imageUrl: string,
  siteUrl: URL,
): Ld {
  const pageUrl = absoluteUrl(`/journal/${post.slug}`, siteUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: [imageUrl],
    datePublished: post.date.toISOString().slice(0, 10),
    dateModified: (post.updated ?? post.date).toISOString().slice(0, 10),
    mainEntityOfPage: pageUrl,
    author: { '@type': 'Person', name: author.name, jobTitle: author.role, url: absoluteUrl('/about#team', siteUrl) },
    publisher: { '@type': 'Organization', name: site.name, '@id': orgId(siteUrl), logo: absoluteUrl('/favicon.svg', siteUrl) },
  };
}
