# Site copy

Every word on the Halden & Rowe site, as JSON. Slot names follow `docs/DESIGN.md` section 11. Visible copy is US
English ("neighborhood", "inquiry"); some keys keep the spec's spelling. `{name}` marks a value to interpolate.
Plural objects are `{ zero?, one, other }`. Photo paths are relative to `src/assets/photos/` and match `manifest.json`.

| File | Shape | Used by |
|---|---|---|
| `site.json` | `name, tagline, nav{links[], cta, menuOpen...}, cities[], contact{phone, email, address, hours[]}, social[], footer{}, newsletter{}, demo{}, a11y{}` | Header, mobile menu, footer (10.1, 10.2, 10.12); H14 newsletter on home and posts; `demo.formNote` in every form; `demo.galleryNote` under listing galleries |
| `home.json` | one key per section: `hero, trust, featured, aboutTeaser, services, marquee, map, steps, places, agents, testimonials, faq, cta, journalTeaser`; each image is `{file, alt}` | Home H1 to H13. H14 reads `site.json#newsletter`. `trust.demoNote` is the one demo label for the stats |
| `search.json` | `search{tabs[3], labels, options, submit, sell}`, `properties{breadcrumb, title, lead}`, `filters{}`, `sort.options[4]`, `results.count`, `empty{}`, `card{}` | H1 search panel (10.6), /properties header, filters (10.7), empty state, property card labels (10.5) |
| `properties.json` | `listings[12]` (below) + `detailPage{status, actions, gallery, facts, rentalTerms, enquiry, calculator, ...}` | Cards everywhere, H6 map pins and list, /properties/[slug] (11.3, 10.11, 10.14) |
| `agents.json` | `agents[6]{id, name, role, photo, alt, bio, bioShort, specialties[], phone, phoneHref, email}` | H9 (name, role, phone, email), /about team (adds `bioShort` as the one-line bio), listing agent card, post author |
| `testimonials.json` | `items[6]{id, quote, name, detail, href, agentId, rating, photo, alt, slider}`, `ratingLabel`, `demoNote` | H10 slider shows the 3 with `slider: true` (they have client photos). The other 3 have no photo |
| `faq.json` | `items[8]{id, home, q, a}` | H11 shows the 6 with `home: true`; FAQPage JSON-LD |
| `about.json` | `title, lead, teamImage, story{eyebrow, headline, paragraphs[2]}, values[3]{name, line, body}, team{}, detailImage, founderQuote, founderName` | /about (11.4); trust band from `home.json#trust`, CTA from `home.json#cta` |
| `contact.json` | `title, lead, details{}, image, form{topic, address, preferredContact, messagePlaceholders, submit, success, failure, demoNote}` | /contact (11.5); shared field labels and errors come from `errors.json#forms` |
| `journal.json` | `title, lead, breadcrumb, readLabel, readingTime, categories{}, post{}` | /journal index (11.6) and post chrome (11.7) |
| `errors.json` | `notFound{}`, `forms{fields, errors, summary, status}`, `toasts{}` | 404 (11.8); every form (10.8): name, email, phone, message, consent; status region toasts |
| `seo.json` | `pages{}, listings{slug}, posts{slug}` each `{title, description}`; `jsonLd{organization, listingDefaults}` | `<head>` on every page; RealEstateAgent, Residence + Offer, FAQPage |

## Listing object

`slug` (= folder in `listings/`), `title`, `status` (`sale` or `rent`), `tag` (`"New"` or null), `featured`,
`featuredOrder` (1 = H3 large card), `listed` (ISO date, for "Newest"), `price` (number; monthly for rentals),
`priceLabel`, `address{street, city, state, postalCode, neighborhood, oneLine}`, `beds`, `baths`, `sqft`,
`sqftLabel`, `lot` (string or null), `yearBuilt`, `type`, `parking`, `description[3]` (first paragraph is the lead),
`features[]`, `neighborhoodFacts[3]`, `agentId`, `images[5]{file, caption, alt}` (lightbox order),
`location{neighborhood, city, water, streets[3], park, note}` for the drawn plan, `mapPin{label, ariaLabel}`,
`rentalTerms{deposit, term, available, pets, furnished}` or null.

## Wiring notes

- URL `?status=buy` maps to data `status: "sale"`; `?status=rent` to `"rent"`.
- Price filter steps differ by status: `filters.priceStepsBuy` and `filters.priceStepsRent`.
- The plan's text line is `location.note` ("Exact address shared on inquiry"). To keep that true, show
  `{neighborhood}, {city}, {state}` on cards and the title block, not `address.oneLine` (DESIGN 11.3 asks for both).
  The listing's own street in `location.streets` is never shown or searchable (`publicStreets()` in load-copy.ts).
- Social `href` values are `#` until real accounts exist. `footer.creditsHref` assumes a `/credits` page.
