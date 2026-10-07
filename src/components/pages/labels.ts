/**
 * Short page names for breadcrumbs, taken from the copy that already names each page (nav and footer links),
 * so a breadcrumb never invents its own wording.
 */
import { getCopy } from '../../data/load-copy';

interface LinkGroup {
  links: { label: string; href: string }[];
}

export function pageLabel(href: string, fallback: string): string {
  const site = getCopy('site') as unknown as {
    nav: LinkGroup;
    footer: { explore: LinkGroup; company: LinkGroup; creditsHref: string; creditsLabel: string };
  };
  if (href === site.footer.creditsHref) return site.footer.creditsLabel;
  const links = [...site.nav.links, ...site.footer.company.links, ...site.footer.explore.links];
  return links.find((link) => link.href === href)?.label ?? fallback;
}

/** "Home" as the copy names it (the properties breadcrumb starts with it). */
export function homeLabel(): string {
  return getCopy<{ properties: { breadcrumb: string[] } }>('search').properties.breadcrumb[0] ?? 'Home';
}

export function breadcrumbLabel(): string {
  return (getCopy('properties').detailPage as { breadcrumbLabel?: string }).breadcrumbLabel ?? 'Breadcrumb';
}
