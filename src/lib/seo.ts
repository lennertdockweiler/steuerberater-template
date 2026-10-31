/**
 * SEO: Titel, Beschreibungen, Canonical, Open Graph und JSON-LD (schema.org).
 */
import { config, sichtbareStimmen } from './config';
import { PFADE } from './routes';
import type { SeitenId, Berufstraeger, Stelle } from '../../variants/_schema';

const b = config.betrieb;
const TAG_SCHEMA: Record<string, string> = { mo: 'Monday', di: 'Tuesday', mi: 'Wednesday', do: 'Thursday', fr: 'Friday', sa: 'Saturday', so: 'Sunday' };

/** Seitentitel nach dem Muster „Thema – Kanzlei, Ort“ (Config-Override möglich). */
export function seitenTitel(id: SeitenId | null, thema: string): string {
  const eigener = id ? config.seo.seiten[id]?.titel : undefined;
  if (eigener) return eigener;
  const zusatz = config.meta.titelVorlage ?? `${b.kurzname}, ${b.adresse.ort}`;
  return id === 'start' ? `${b.kurzname}: Steuerberatung in ${b.adresse.ort}` : `${thema} – ${zusatz}`;
}

export function seitenBeschreibung(id: SeitenId | null, fallback: string): string {
  const eigene = id ? config.seo.seiten[id]?.beschreibung : undefined;
  const text = eigene ?? fallback;
  return text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, '')} …` : text;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
/** Pfad ohne Basis-Pfad (für Vergleiche und OG-Dateinamen). */
export const ohneBase = (pfad: string) => (BASE && pfad.startsWith(`${BASE}/`) ? pfad.slice(BASE.length) : pfad);
/** Absolute URL inkl. Basis-Pfad. */
export const absolut = (pfad: string, site: URL | undefined) =>
  new URL(pfad.startsWith('/') && BASE && !pfad.startsWith(`${BASE}/`) ? `${BASE}${pfad}` : pfad, site ?? 'http://localhost:4321').toString();

// ── JSON-LD ────────────────────────────────────────────────────────────────

export function kanzleiSchema(site: URL | undefined, logoUrl?: string) {
  const id = absolut('/#kanzlei', site);
  const bew = config.betrieb.bewertungen;
  return {
    '@context': 'https://schema.org',
    '@type': 'AccountingService',
    '@id': id,
    name: b.name,
    alternateName: b.kurzname,
    slogan: b.slogan,
    url: absolut('/', site),
    ...(logoUrl ? { logo: logoUrl, image: logoUrl } : {}),
    telephone: b.telefon,
    email: b.email,
    foundingDate: String(b.gruendungsjahr),
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.adresse.strasse,
      postalCode: b.adresse.plz,
      addressLocality: b.adresse.ort,
      addressRegion: b.adresse.bundesland,
      addressCountry: b.adresse.land,
    },
    geo: { '@type': 'GeoCoordinates', latitude: b.geo.lat, longitude: b.geo.lng },
    areaServed: (b.einzugsgebiet.length ? b.einzugsgebiet : [b.adresse.ort]).map((name) => ({ '@type': 'City', name })),
    openingHoursSpecification: b.oeffnungszeiten.regulaer.map((z) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: z.tage.map((t) => `https://schema.org/${TAG_SCHEMA[t]}`),
      opens: z.von,
      closes: z.bis,
    })),
    sameAs: b.socialLinks.map((s) => s.url),
    knowsAbout: [...new Set(config.berufstraeger.flatMap((p) => p.schwerpunkte))],
    memberOf: config.mitgliedschaften.map((m) => ({ '@type': 'Organization', name: m.name, ...(m.url ? { url: m.url } : {}) })),
    employee: config.berufstraeger.map((p) => ({ '@id': absolut(`/team/${p.slug}/#person`, site) })),
    // aggregateRating nur bei echten, überprüfbaren Bewertungen (nie bei Beispielstimmen)
    ...(bew?.echt && bew.anzahl > 0 && sichtbareStimmen.every((s) => !s.beispiel)
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: bew.schnitt, reviewCount: bew.anzahl, bestRating: 5 } }
      : {}),
  };
}

export function personSchema(p: Berufstraeger, site: URL | undefined, bildUrl?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': absolut(`/team/${p.slug}/#person`, site),
    name: p.name,
    jobTitle: p.titel[0],
    honorificSuffix: p.titel.slice(1).join(', ') || undefined,
    email: p.email,
    knowsAbout: p.schwerpunkte,
    knowsLanguage: p.sprachen,
    ...(bildUrl ? { image: bildUrl } : {}),
    worksFor: { '@id': absolut('/#kanzlei', site) },
    url: absolut(`/team/${p.slug}/`, site),
  };
}

export function artikelSchema(a: { titel: string; beschreibung: string; datum: Date; stand: Date; autor?: Berufstraeger; pfad: string; bildUrl?: string }, site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.titel,
    description: a.beschreibung,
    datePublished: a.datum.toISOString().slice(0, 10),
    dateModified: a.stand.toISOString().slice(0, 10),
    inLanguage: 'de-DE',
    mainEntityOfPage: absolut(a.pfad, site),
    ...(a.bildUrl ? { image: a.bildUrl } : {}),
    author: a.autor ? { '@id': absolut(`/team/${a.autor.slug}/#person`, site), name: a.autor.name } : { '@type': 'Organization', name: b.name },
    publisher: { '@id': absolut('/#kanzlei', site) },
  };
}

export function stellenSchema(s: Stelle, site: URL | undefined) {
  const typ: Record<string, string[]> = {
    Vollzeit: ['FULL_TIME'],
    Teilzeit: ['PART_TIME'],
    'Vollzeit oder Teilzeit': ['FULL_TIME', 'PART_TIME'],
    Ausbildung: ['OTHER'],
    Werkstudium: ['PART_TIME', 'INTERN'],
    Minijob: ['PART_TIME'],
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: s.titel,
    description: `<p>${s.kurztext}</p><h3>Aufgaben</h3><ul>${s.aufgaben.map((a) => `<li>${a}</li>`).join('')}</ul><h3>Profil</h3><ul>${s.profil
      .map((a) => `<li>${a}</li>`)
      .join('')}</ul>${s.wirBieten.length ? `<h3>Wir bieten</h3><ul>${s.wirBieten.map((a) => `<li>${a}</li>`).join('')}</ul>` : ''}`,
    datePosted: s.veroeffentlicht,
    ...(s.gueltigBis ? { validThrough: `${s.gueltigBis}T23:59:59+01:00` } : {}),
    employmentType: typ[s.art],
    hiringOrganization: { '@type': 'Organization', name: b.name, sameAs: absolut('/', site) },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: b.adresse.strasse,
        postalCode: b.adresse.plz,
        addressLocality: b.adresse.ort,
        addressRegion: b.adresse.bundesland,
        addressCountry: b.adresse.land,
      },
    },
    ...(s.arbeitsort === 'remote möglich' ? { jobLocationType: 'TELECOMMUTE', applicantLocationRequirements: { '@type': 'Country', name: 'DE' } } : {}),
    ...(s.gehalt
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'EUR',
            value: { '@type': 'QuantitativeValue', minValue: s.gehalt.min, maxValue: s.gehalt.max, unitText: s.gehalt.einheit },
          },
        }
      : {}),
    directApply: true,
    url: absolut(`/karriere/${s.slug}/`, site),
  };
}

export function faqSchema(fragen: { frage: string; antwort: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: fragen.map((f) => ({ '@type': 'Question', name: f.frage, acceptedAnswer: { '@type': 'Answer', text: f.antwort } })),
  };
}

export function breadcrumbSchema(teile: { label: string; href: string }[], site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: teile.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.label, item: absolut(t.href, site) })),
  };
}

export const OG_PFAD = (pfad: string) => `/og${pfad === '/' ? '/start' : pfad.replace(/\/$/, '')}.png`;
export { PFADE };
