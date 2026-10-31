/**
 * Varianten-Schema: Single Source of Truth für jede site.config.json.
 *
 * - Wird vom Build (astro.config.ts), von `npm run variant:check` und von den
 *   Komponenten (Typen) genutzt.
 * - Aus diesem Schema entsteht automatisch variants/site.config.schema.json
 *   (Autovervollständigung in VS Code über den "$schema"-Eintrag).
 * - Diese Datei darf nur "zod" importieren, damit Node sie ohne Build-Schritt
 *   laden kann (Type-Stripping).
 */
import { z } from 'zod';

// Fehlermeldungen von Zod auf Deutsch
z.config(z.locales.de());

// ─────────────────────────────────────────────────────────────
// Bausteine
// ─────────────────────────────────────────────────────────────

/** Pflicht-Text mit Zeichenlimit (Limits verhindern, dass Texte das Layout sprengen). */
const text = (max: number, beschreibung?: string) => {
  const s = z
    .string()
    .trim()
    .min(1, 'darf nicht leer sein')
    .max(max, `ist zu lang (max. ${max} Zeichen)`);
  return beschreibung ? s.describe(beschreibung) : s;
};

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'nur Kleinbuchstaben, Ziffern und Bindestriche (z. B. "lohn-buchhaltung")')
  .describe('URL-Kürzel: Kleinbuchstaben, Ziffern, Bindestriche');

const hexFarbe = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'muss eine Hex-Farbe sein, z. B. "#0B6A72"')
  .describe('Hex-Farbe, z. B. #0B6A72');

const isoDatum = z.iso.date('muss ein Datum im Format JJJJ-MM-TT sein').describe('Datum im Format JJJJ-MM-TT');
const uhrzeit = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'muss eine Uhrzeit wie "08:30" sein');
const wochentag = z.enum(['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so']);
const bundesland = z
  .enum(['BW', 'BY', 'BE', 'BB', 'HB', 'HH', 'HE', 'MV', 'NI', 'NW', 'RP', 'SL', 'SN', 'ST', 'SH', 'TH'])
  .describe('Kürzel des Bundeslands (für Feiertage bei Fristverschiebungen)');

/** Lucide-Icon-Name, z. B. "receipt", "users", "file-check". Siehe https://lucide.dev/icons */
const icon = z.string().regex(/^[a-z0-9-]+$/, 'Lucide-Icon-Name in Kleinbuchstaben, z. B. "file-check"').describe('Lucide-Icon-Name (https://lucide.dev/icons)');

const link = z.object({
  label: text(40, 'Beschriftung des Buttons/Links'),
  href: z.string().min(1).describe('Ziel: interne Seite ("/termin/"), Anker ("#faq"), tel:, mailto: oder https://'),
});

/**
 * Bild-Referenz. `datei` ist relativ zum Ordner variants/<slug>/assets/.
 * `alt` ist Pflicht, außer das Bild ist rein dekorativ.
 */
const bild = z
  .object({
    datei: z.string().min(1).describe('Pfad relativ zu variants/<slug>/assets/, z. B. "team/anna.jpg"'),
    alt: z.string().max(180, 'Alt-Text ist zu lang (max. 180 Zeichen)').default('').describe('Bildbeschreibung für Screenreader'),
    dekorativ: z.boolean().default(false).describe('true = rein schmückend, alt bleibt leer'),
    fokus: z.string().optional().describe('Bildausschnitt als CSS object-position, z. B. "50% 30%"'),
    fokusMobil: z.string().optional().describe('Abweichender Bildausschnitt auf Smartphones'),
  })
  .refine((b) => b.dekorativ || b.alt.trim().length > 0, {
    error: 'Alt-Text fehlt (oder dekorativ: true setzen)',
    path: ['alt'],
  });

const zeitfenster = z.object({
  tage: z.array(wochentag).min(1),
  von: uhrzeit,
  bis: uhrzeit,
});

const faqEintrag = z.object({
  frage: text(140),
  antwort: text(900),
});

const adresse = z.object({
  strasse: text(80),
  plz: z.string().regex(/^\d{5}$/, 'muss eine fünfstellige Postleitzahl sein'),
  ort: text(60),
  bundesland,
  land: z.string().default('DE'),
});

// ─────────────────────────────────────────────────────────────
// Sektionen der Startseite (Reihenfolge = Reihenfolge im Array)
// ─────────────────────────────────────────────────────────────

const sektionBasis = {
  aktiv: z.boolean().default(true).describe('false = Sektion ausblenden, ohne sie zu löschen'),
  id: slug.optional().describe('Anker-ID, z. B. "leistungen" für Links auf /#leistungen'),
  kicker: z.string().max(40).optional().describe('Kleine Zeile über der Überschrift (optional, sparsam einsetzen)'),
  titel: z.string().max(90, 'Überschrift ist zu lang (max. 90 Zeichen)').optional(),
  intro: z.string().max(320, 'Einleitung ist zu lang (max. 320 Zeichen)').optional(),
  hintergrund: z.enum(['standard', 'flaeche', 'invers']).optional().describe('standard = Papier, flaeche = leicht getönt, invers = dunkel'),
};

const sektion = z.discriminatedUnion('typ', [
  z.object({
    typ: z.literal('hero'),
    layout: z.enum(['statement', 'split', 'weiche']).optional().describe('statement = Typo + Balkengrafik, split = Porträt, weiche = Zielgruppen-Auswahl'),
    ...sektionBasis,
    titel: z.string().max(70, 'Hero-Überschrift ist zu lang (max. 70 Zeichen)').optional(),
    unterzeile: z.string().max(220).optional(),
    bild: bild.optional().describe('Für Layout "split": Porträt (Hochformat 4:5)'),
    ctaPrimaer: link.optional(),
    ctaSekundaer: link.optional(),
    fakten: z
      .array(z.object({ wert: text(16), label: text(40) }))
      .max(3)
      .optional()
      .describe('Bis zu 3 kurze Fakten unter der Headline'),
    grafikWerte: z.array(z.number().min(0).max(100)).length(12).optional().describe('12 Balkenhöhen (0–100) für die Hero-Grafik'),
  }),
  z.object({ typ: z.literal('zielgruppen'), layout: z.enum(['karten', 'zeilen']).optional(), ...sektionBasis }),
  z.object({
    typ: z.literal('leistungen'),
    layout: z.enum(['tabs', 'liste', 'bento']).optional(),
    ...sektionBasis,
    auswahl: z.array(slug).optional().describe('Slugs der Leistungen, die gezeigt werden (Standard: alle)'),
  }),
  z.object({ typ: z.literal('ablauf'), layout: z.enum(['gepinnt', 'zeitleiste']).optional(), ...sektionBasis }),
  z.object({ typ: z.literal('kennzahlen'), layout: z.enum(['reihe', 'band']).optional(), ...sektionBasis }),
  z.object({ typ: z.literal('spezialisierungen'), layout: z.enum(['horizontal', 'raster']).optional(), ...sektionBasis }),
  z.object({
    typ: z.literal('team'),
    layout: z.enum(['karten', 'portraits']).optional(),
    ...sektionBasis,
    mitTeam: z.boolean().default(true).describe('Auch Mitarbeitende ohne Profilseite zeigen'),
  }),
  z.object({
    typ: z.literal('fristen'),
    layout: z.enum(['kalender', 'kompakt']).optional(),
    ...sektionBasis,
    anzahl: z.number().int().min(1).max(6).default(3),
  }),
  z.object({ typ: z.literal('stimmen'), layout: z.enum(['marquee', 'zitat']).optional(), ...sektionBasis }),
  z.object({
    typ: z.literal('karriere'),
    layout: z.enum(['split', 'band']).optional(),
    ...sektionBasis,
    bild: bild.optional(),
  }),
  z.object({
    typ: z.literal('wissen'),
    layout: z.enum(['liste', 'karten']).optional(),
    ...sektionBasis,
    anzahl: z.number().int().min(2).max(6).default(3),
  }),
  z.object({
    typ: z.literal('faq'),
    layout: z.enum(['akkordeon', 'zweispaltig']).optional(),
    ...sektionBasis,
    fragen: z.array(faqEintrag).max(12).optional().describe('Eigene Fragen für diese Sektion (Standard: faq[] der Config)'),
  }),
  z.object({
    typ: z.literal('cta'),
    layout: z.enum(['band', 'karte']).optional(),
    ...sektionBasis,
    button: link.optional(),
    bild: bild.optional(),
  }),
  z.object({ typ: z.literal('check'), layout: z.enum(['banner', 'karte']).optional(), ...sektionBasis }),
  z.object({
    typ: z.literal('kanzlei'),
    layout: z.enum(['editorial', 'bild']).optional(),
    ...sektionBasis,
    text: z.array(text(700)).max(4).optional(),
    bild: bild.optional(),
    zitat: z.object({ text: text(240), name: text(60) }).optional(),
  }),
  z.object({ typ: z.literal('vertrauen'), layout: z.enum(['laufband', 'reihe']).optional(), ...sektionBasis }),
]);

export const SEKTION_LAYOUTS = {
  hero: ['statement', 'split', 'weiche'],
  zielgruppen: ['karten', 'zeilen'],
  leistungen: ['tabs', 'liste', 'bento'],
  ablauf: ['gepinnt', 'zeitleiste'],
  kennzahlen: ['reihe', 'band'],
  spezialisierungen: ['horizontal', 'raster'],
  team: ['karten', 'portraits'],
  fristen: ['kalender', 'kompakt'],
  stimmen: ['marquee', 'zitat'],
  karriere: ['split', 'band'],
  wissen: ['liste', 'karten'],
  faq: ['akkordeon', 'zweispaltig'],
  cta: ['band', 'karte'],
  check: ['banner', 'karte'],
  kanzlei: ['editorial', 'bild'],
  vertrauen: ['laufband', 'reihe'],
} as const;

// ─────────────────────────────────────────────────────────────
// Seiten, SEO
// ─────────────────────────────────────────────────────────────

export const SEITEN_IDS = [
  'start',
  'leistungen',
  'spezialisierungen',
  'digitaleKanzlei',
  'team',
  'karriere',
  'wissen',
  'steuertermine',
  'mandantenCheck',
  'termin',
  'kontakt',
  'rechner',
  'unterlagen',
  'impressum',
  'datenschutz',
] as const;

const seitenSchalter = z
  .object({
    leistungen: z.boolean().default(true),
    spezialisierungen: z.boolean().default(true),
    digitaleKanzlei: z.boolean().default(true),
    team: z.boolean().default(true),
    karriere: z.boolean().default(true),
    wissen: z.boolean().default(true),
    steuertermine: z.boolean().default(true),
    mandantenCheck: z.boolean().default(true),
    termin: z.boolean().default(true),
    kontakt: z.boolean().default(true),
    rechner: z.boolean().default(true),
    unterlagen: z.boolean().default(true),
  })
  .prefault({})
  .describe('Welche Unterseiten gebaut werden. Abgeschaltete Seiten verschwinden auch aus Navigation und Sitemap.');

const seoSeite = z.object({
  titel: z.string().max(60, 'SEO-Titel ist zu lang (max. 60 Zeichen)').optional(),
  beschreibung: z.string().max(160, 'Meta-Beschreibung ist zu lang (max. 160 Zeichen)').optional(),
});

// ─────────────────────────────────────────────────────────────
// Branche: Steuerberatung
// ─────────────────────────────────────────────────────────────

const berufstraeger = z.object({
  slug,
  name: text(60),
  titel: z
    .array(text(90))
    .min(1)
    .describe('Erster Eintrag = Berufsbezeichnung (z. B. "Steuerberaterin"), danach Grade und Fachberater-Titel. Nur eintragen, was tatsächlich verliehen wurde.'),
  rolle: z.string().max(40).optional().describe('z. B. "Partner", "Inhaberin", "Geschäftsführer"'),
  bestelltSeit: z.number().int().min(1950).max(2100).describe('Jahr der Bestellung'),
  schwerpunkte: z.array(text(60)).max(6).default([]),
  sprachen: z.array(text(30)).max(6).default(['Deutsch']),
  foto: bild,
  vita: z.array(z.object({ jahr: text(12), text: text(160) })).max(10).default([]),
  email: z.email('ist keine gültige E-Mail-Adresse'),
  telefon: z.string().optional(),
  zitat: z.string().max(240).optional().describe('Persönlicher Satz für die Profilseite'),
  kurzbio: z.string().max(700).optional(),
});

const teamMitglied = z.object({
  name: text(60),
  rolle: text(60),
  foto: bild.optional(),
  seit: z.number().int().min(1950).max(2100).optional(),
  schwerpunkte: z.array(text(60)).max(4).default([]),
});

const zielgruppe = z.object({
  slug,
  titel: text(40, 'z. B. "Unternehmen"'),
  ichBin: text(40, 'Formulierung für die Weiche, z. B. "Ich führe ein Unternehmen"'),
  kurztext: text(160),
  text: z.array(text(700)).max(4).default([]),
  icon,
  bild: bild.optional(),
});

const leistung = z.object({
  slug,
  zielgruppe: z.array(slug).min(1).describe('Slugs der Zielgruppen; die erste bestimmt die URL'),
  titel: text(60),
  kurztext: text(170),
  text: z.array(text(900)).min(1).max(6),
  punkte: z.array(text(120)).max(10).default([]).describe('„Was dazugehört“, als Liste'),
  icon,
  bild: bild.optional(),
  faq: z.array(faqEintrag).max(6).default([]),
  seo: seoSeite.optional(),
});

const spezialisierung = z.object({
  slug,
  titel: text(50),
  kurztext: text(170),
  text: z.array(text(900)).min(1).max(6),
  punkte: z.array(text(120)).max(10).default([]),
  icon,
  bild: bild.optional(),
  faq: z.array(faqEintrag).max(6).default([]),
  seo: seoSeite.optional(),
});

const checkOption = z.object({
  id: slug,
  label: text(60),
  beschreibung: z.string().max(120).optional(),
  icon: icon.optional(),
  gewichte: z.record(z.string(), z.number()).default({}).describe('Punkte je Ergebnis-ID, z. B. { "unternehmen": 3 }'),
  anliegen: z.string().max(80).optional().describe('Textbaustein für das vorausgefüllte Anliegen'),
});

const mandantenCheck = z.object({
  titel: z.string().max(80).optional(),
  intro: z.string().max(300).optional(),
  fragen: z
    .array(
      z.object({
        id: slug,
        frage: text(120),
        hilfe: z.string().max(200).optional(),
        optionen: z.array(checkOption).min(2).max(6),
      }),
    )
    .min(3, 'mindestens 3 Fragen')
    .max(6, 'höchstens 6 Fragen'),
  ergebnisse: z
    .array(
      z.object({
        id: slug,
        typ: z.enum(['passend', 'hinweis']).default('passend').describe('hinweis = ehrliche Empfehlung, wenn die Kanzlei nicht die beste Wahl ist'),
        titel: text(80),
        text: text(500),
        leistungen: z.array(slug).max(4).default([]),
        ansprechpartner: slug.optional().describe('Slug eines Berufsträgers'),
      }),
    )
    .min(1),
});

const buchung = z.object({
  modus: z.enum(['demo', 'extern']).default('demo').describe('demo = simulierter Slot-Picker, extern = Buchungsdienst'),
  url: z.url().optional().describe('URL des externen Buchungsdienstes'),
  einbettung: z.boolean().default(false).describe('true = Klick-zum-Laden-Einbettung statt Link'),
  anbieterName: z.string().max(40).optional().describe('z. B. "Calendly", "Microsoft Bookings"'),
  beratungsarten: z
    .array(z.object({ id: slug, label: text(30), beschreibung: text(120), icon, dauer: z.number().int().min(10).max(180) }))
    .min(1)
    .max(4),
  arbeitszeiten: z.array(zeitfenster).optional().describe('Standard: reguläre Öffnungszeiten'),
  slotDauer: z.number().int().min(10).max(120).default(30).describe('Minuten je Zeitfenster'),
  vorlaufTage: z.number().int().min(0).max(14).default(1),
  horizontTage: z.number().int().min(7).max(90).default(28),
});

const stelle = z.object({
  slug,
  titel: text(80),
  art: z.enum(['Vollzeit', 'Teilzeit', 'Vollzeit oder Teilzeit', 'Ausbildung', 'Werkstudium', 'Minijob']),
  arbeitsort: z.enum(['vor Ort', 'hybrid', 'remote möglich']).default('hybrid'),
  beginn: text(40),
  stunden: z.string().max(40).optional(),
  kurztext: text(220),
  aufgaben: z.array(text(160)).min(2).max(10),
  profil: z.array(text(160)).min(2).max(10),
  wirBieten: z.array(text(160)).max(10).default([]),
  gehalt: z
    .object({ min: z.number().positive(), max: z.number().positive(), einheit: z.enum(['MONTH', 'YEAR']).default('YEAR') })
    .optional()
    .describe('Gehaltsspanne in Euro (brutto); erscheint auch im JobPosting-Schema'),
  veroeffentlicht: isoDatum,
  gueltigBis: isoDatum.optional(),
  ansprechpartner: slug.optional(),
});

// ─────────────────────────────────────────────────────────────
// Gesamt-Schema
// ─────────────────────────────────────────────────────────────

export const siteConfigSchema = z.object({
  $schema: z.string().optional(),

  meta: z.object({
    slug,
    sprache: z.literal('de').default('de'),
    anrede: z.enum(['sie', 'du']).default('sie').describe('Ansprache in allen Standardtexten'),
    domain: z.url().optional().describe('Live- oder Demo-URL inkl. https://, für Canonical, Sitemap, OG'),
    noindex: z.boolean().default(true).describe('true = Suchmaschinen ausgesperrt (Standard für Demos!)'),
    titelVorlage: z.string().max(40).optional().describe('Zusatz hinter Seitentiteln, z. B. "Steuerberater Münster"'),
  }),

  betrieb: z.object({
    name: text(80, 'Vollständiger Name inkl. Rechtsform'),
    kurzname: text(32, 'Kurzform für Header, Wortmarke, Mobilansicht'),
    rechtsform: text(80),
    inhaber: z.array(text(60)).min(1).describe('Inhaber bzw. vertretungsberechtigte Personen'),
    slogan: text(120),
    gruendungsjahr: z.number().int().min(1900).max(2100),
    adresse,
    geo: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
    einzugsgebiet: z.array(text(40)).max(10).default([]).describe('Orte für lokales SEO, z. B. ["Münster", "Greven"]'),
    telefon: text(30),
    fax: z.string().max(30).optional(),
    email: z.email('ist keine gültige E-Mail-Adresse'),
    whatsapp: z.string().max(30).optional(),
    oeffnungszeiten: z.object({
      regulaer: z.array(zeitfenster).min(1),
      sonder: z
        .array(
          z.object({
            datum: isoDatum,
            geschlossen: z.boolean().default(true),
            von: uhrzeit.optional(),
            bis: uhrzeit.optional(),
            hinweis: z.string().max(80).optional(),
          }),
        )
        .default([]),
      hinweis: z.string().max(140).optional(),
    }),
    socialLinks: z
      .array(z.object({ netzwerk: z.enum(['linkedin', 'xing', 'instagram', 'facebook', 'youtube', 'mastodon']), url: z.url() }))
      .default([]),
    bewertungen: z
      .object({
        quelle: text(40, 'z. B. "Google"'),
        schnitt: z.number().min(1).max(5),
        anzahl: z.number().int().min(0),
        echt: z.boolean().default(false).describe('Nur true, wenn es echte, überprüfbare Bewertungen sind (dann aggregateRating im Schema)'),
        echtheitsHinweis: text(400, 'Hinweis nach § 5b Abs. 3 UWG, ob und wie die Echtheit geprüft wird'),
        eintraege: z
          .array(
            z.object({
              name: text(50),
              kontext: z.string().max(60).optional().describe('z. B. "Zahnarztpraxis, Münster"'),
              text: text(420),
              sterne: z.number().int().min(1).max(5).optional(),
              datum: isoDatum.optional(),
              einwilligungLiegtVor: z.boolean().describe('PFLICHT: schriftliche Einwilligung des Mandanten (Verschwiegenheitspflicht). Ohne true keine Anzeige.'),
              beispiel: z.boolean().default(false).describe('true = Beispielstimme (wird als solche gekennzeichnet)'),
            }),
          )
          .default([]),
      })
      .optional(),
  }),

  branding: z.object({
    logo: z
      .object({
        datei: z.string().min(1).describe('Logo (SVG bevorzugt) relativ zu assets/'),
        dateiHell: z.string().optional().describe('Helle Logo-Version für dunkle Flächen'),
        alt: z.string().max(100).optional(),
        hoehe: z.number().int().min(16).max(80).default(36).describe('Darstellungshöhe im Header in px'),
      })
      .optional()
      .describe('Ohne Logo wird automatisch eine typografische Wortmarke erzeugt'),
    wortmarke: z
      .object({
        zeile1: z.string().max(32).optional(),
        zeile2: z.string().max(40).optional(),
      })
      .optional()
      .describe('Optionale Aufteilung der automatischen Wortmarke'),
    farben: z.object({
      primaer: hexFarbe.describe('Markenfarbe'),
      akzent: hexFarbe.optional().describe('Zweitfarbe für Daten-Hervorhebungen'),
      neutralTon: hexFarbe.optional().describe('Farbstich der Grautöne'),
    }),
    stilPreset: z.enum(['klar', 'klassisch', 'warm']).describe('klar = Klar & Digital, klassisch = Klassisch Seriös, warm = Persönlich Warm'),
    schriftPaar: z
      .object({
        headline: z.enum(['schibsted-grotesk', 'onest', 'plus-jakarta-sans', 'newsreader', 'source-sans-3', 'fraunces']),
        text: z.enum(['schibsted-grotesk', 'onest', 'plus-jakarta-sans', 'newsreader', 'source-sans-3', 'fraunces']),
      })
      .optional()
      .describe('Überschreibt die Schriften des Presets'),
    radius: z.enum(['eckig', 'dezent', 'weich', 'rund']).optional(),
    animationsIntensitaet: z.enum(['dezent', 'standard', 'ausdrucksstark']).optional(),
    bildstil: z
      .object({
        grain: z.boolean().optional().describe('Feines Korn über Fotos für einheitliche Bildwirkung'),
        tonung: z.enum(['keine', 'marke', 'warm', 'kuehl']).optional(),
      })
      .optional(),
  }),

  sektionen: z.array(sektion).min(1).describe('Startseite: Reihenfolge, Auswahl und Layout der Sektionen'),
  seiten: seitenSchalter,
  seo: z
    .object({
      seiten: z.partialRecord(z.enum(SEITEN_IDS), seoSeite).default({}),
    })
    .prefault({}),

  rechtliches: z.object({
    vertretungsberechtigt: z.array(text(80)).default([]),
    register: z
      .object({
        art: z.enum(['Partnerschaftsregister', 'Handelsregister']),
        gericht: text(60),
        nummer: text(30),
      })
      .optional(),
    ustId: z.string().max(20).optional(),
    wirtschaftsId: z.string().max(24).optional(),
    inhaltlichVerantwortlich: z.object({ name: text(60), adresse: text(140) }).optional().describe('Verantwortlich nach § 18 Abs. 2 MStV'),
    verbraucherstreitbeilegung: z.string().max(600).optional(),
    datenschutzbeauftragter: z.object({ name: text(80), kontakt: text(140) }).optional(),
    hosting: z.object({ anbieter: text(80), adresse: text(160), datenschutzUrl: z.url().optional() }).optional(),
    agbUrl: z.string().optional(),
    zusatz: z.array(text(600)).max(4).default([]),
    bildnachweise: z.array(text(240)).max(40).default([]).describe('Bildquellen für das Impressum, z. B. "Team: eigene Fotos", "Büro: Unsplash/…"'),
  }),

  integrationen: z
    .object({
      formularEndpoint: z.string().default('').describe('leer = Demo-Modus; sonst z. B. https://formspree.io/f/xxxx'),
      formularAnbieter: z.string().max(40).optional().describe('Name für die Datenschutzerklärung, z. B. "Formspree"'),
      karte: z
        .object({
          aktiv: z.boolean().default(true),
          anbieter: z.enum(['osm', 'google']).default('osm'),
        })
        .prefault({}),
      analytics: z
        .object({
          aktiv: z.boolean().default(false),
          anbieter: z.enum(['plausible', 'matomo', 'umami']).optional(),
          skriptUrl: z.url().optional(),
          domain: z.string().optional(),
        })
        .prefault({}),
    })
    .prefault({}),

  demo: z
    .object({
      banner: z.object({ aktiv: z.boolean().default(true), text: z.string().max(120).optional() }).prefault({}),
      agentur: z
        .object({
          name: text(60),
          telefon: z.string().max(30).optional(),
          email: z.email().optional(),
          website: z.url().optional(),
        })
        .optional(),
      pitchSeite: z.boolean().default(true),
    })
    .prefault({}),

  // ── Branche ────────────────────────────────────────────────
  kanzleiForm: z.enum(['Einzelkanzlei', 'Partnerschaft', 'PartG mbB', 'GmbH']),
  berufstraeger: z.array(berufstraeger).min(1),
  team: z.array(teamMitglied).default([]),
  zielgruppen: z.array(zielgruppe).min(1).max(6),
  leistungen: z.array(leistung).min(1),
  spezialisierungen: z.array(spezialisierung).default([]),
  mitgliedschaften: z.array(z.object({ name: text(80), url: z.url().optional() })).default([]),
  software: z.array(z.object({ name: text(50), beschreibung: z.string().max(120).optional() })).default([]),
  portalLink: z
    .object({
      url: z.url(),
      label: z.string().max(30).default('Mandantenportal'),
      anbieter: z.string().max(60).optional().describe('z. B. "DATEV Unternehmen online"'),
    })
    .optional(),
  mandantenCheck: mandantenCheck.optional(),
  buchung,
  fristen: z
    .array(
      z.object({
        datum: isoDatum,
        titel: text(90),
        zielgruppe: z.enum(['unternehmen', 'privat', 'alle']).default('alle'),
        hinweis: z.string().max(160).optional(),
        verschieben: z.boolean().default(true).describe('Fällt der Tag auf Wochenende/Feiertag, auf den nächsten Werktag verschieben (§ 108 Abs. 3 AO)'),
      }),
    )
    .default([])
    .describe('Zusätzliche Fristen (z. B. Abgabefristen der Steuererklärungen)'),
  fristenRegeln: z
    .object({
      umsatzsteuerVoranmeldung: z.boolean().default(true),
      lohnsteuerAnmeldung: z.boolean().default(true),
      vorauszahlungen: z.boolean().default(true).describe('ESt/KSt-Vorauszahlungen 10.3./10.6./10.9./10.12.'),
      gewerbesteuer: z.boolean().default(true).describe('GewSt/GrSt 15.2./15.5./15.8./15.11.'),
      sozialversicherung: z.boolean().default(true).describe('Beitragsfälligkeit am drittletzten Bankarbeitstag'),
    })
    .prefault({}),
  stellen: z.array(stelle).default([]),
  benefits: z.array(z.object({ titel: text(40), text: text(160), icon })).max(9).default([]),
  karriere: z
    .object({
      titel: z.string().max(90).optional(),
      intro: z.string().max(400).optional(),
      kultur: z.array(text(500)).max(4).default([]),
      bewerbungsSchritte: z.array(z.object({ titel: text(40), text: text(200) })).max(5).default([]),
      bild: bild.optional(),
      zitat: z.object({ text: text(260), name: text(60), rolle: text(60) }).optional(),
    })
    .prefault({}),
  digitaleKanzlei: z
    .object({
      titel: z.string().max(90).optional(),
      intro: z.string().max(400).optional(),
      bausteine: z.array(z.object({ titel: text(50), text: text(300), icon })).max(8).default([]),
      sicherheit: z.array(z.object({ titel: text(50), text: text(260) })).max(6).default([]),
      bild: bild.optional(),
    })
    .prefault({}),
  unterlagen: z
    .object({
      intro: z.string().max(400).optional(),
      checklisten: z
        .array(
          z.object({
            id: slug,
            titel: text(70),
            zielgruppe: z.enum(['unternehmen', 'privat', 'alle']).default('alle'),
            punkte: z.array(z.object({ text: text(140), hinweis: z.string().max(160).optional() })).min(1),
          }),
        )
        .optional()
        .describe('Standard: Checklisten aus src/data/checklisten.ts'),
    })
    .prefault({}),
  kennzahlen: z
    .array(
      z.object({
        wert: z.number(),
        nachkommastellen: z.number().int().min(0).max(2).default(0),
        praefix: z.string().max(4).optional(),
        suffix: z.string().max(6).optional(),
        label: text(60),
      }),
    )
    .max(4)
    .default([]),
  ablauf: z
    .object({
      titel: z.string().max(90).optional(),
      intro: z.string().max(300).optional(),
      schritte: z
        .array(
          z.object({
            titel: text(40),
            text: text(220),
            motiv: z.enum(['foto', 'upload', 'buchen', 'auswertung', 'gespraech', 'portal']),
          }),
        )
        .min(3)
        .max(4),
    })
    .optional(),
  faq: z.array(faqEintrag).max(16).default([]),
  kammer: z.object({ name: text(80), adresse: text(160), website: z.url() }),
  berufshaftpflicht: z.object({ versicherer: text(100), adresse: text(160), geltungsbereich: text(200) }),

  texte: z.record(z.string(), z.string()).default({}).describe('Überschreibt einzelne Standardtexte aus src/data/texte.ts'),
});

export type SiteConfigInput = z.input<typeof siteConfigSchema>;
export type SiteConfig = z.output<typeof siteConfigSchema>;
export type Sektion = SiteConfig['sektionen'][number];
export type SektionTyp = Sektion['typ'];
export type Bild = z.output<typeof bild>;
export type Berufstraeger = SiteConfig['berufstraeger'][number];
export type Leistung = SiteConfig['leistungen'][number];
export type Spezialisierung = SiteConfig['spezialisierungen'][number];
export type Zielgruppe = SiteConfig['zielgruppen'][number];
export type Stelle = SiteConfig['stellen'][number];
export type SeitenId = (typeof SEITEN_IDS)[number];

/** Querverweise prüfen, die Zod allein nicht sieht (Slugs, Ansprechpartner …). */
export function pruefeQuerverweise(c: SiteConfig): string[] {
  const fehler: string[] = [];
  const zg = new Set(c.zielgruppen.map((z) => z.slug));
  const ls = new Set(c.leistungen.map((l) => l.slug));
  const bt = new Set(c.berufstraeger.map((b) => b.slug));
  const doppelt = (arr: string[], was: string) => {
    const seen = new Set<string>();
    for (const s of arr) {
      if (seen.has(s)) fehler.push(`${was}: Slug "${s}" ist doppelt vergeben.`);
      seen.add(s);
    }
  };
  doppelt(c.leistungen.map((l) => l.slug), 'leistungen');
  doppelt(c.spezialisierungen.map((s) => s.slug), 'spezialisierungen');
  doppelt(c.berufstraeger.map((b) => b.slug), 'berufstraeger');
  doppelt(c.stellen.map((s) => s.slug), 'stellen');
  doppelt(c.zielgruppen.map((z) => z.slug), 'zielgruppen');

  c.leistungen.forEach((l) =>
    l.zielgruppe.forEach((z) => {
      if (!zg.has(z)) fehler.push(`leistungen › ${l.slug}: Zielgruppe "${z}" existiert nicht in zielgruppen[].`);
    }),
  );
  c.sektionen.forEach((s, i) => {
    if (s.typ === 'leistungen' && s.auswahl)
      s.auswahl.forEach((a) => {
        if (!ls.has(a)) fehler.push(`sektionen[${i}] (leistungen): Leistung "${a}" existiert nicht.`);
      });
  });
  if (c.mandantenCheck) {
    const ergebnisIds = new Set(c.mandantenCheck.ergebnisse.map((e) => e.id));
    c.mandantenCheck.ergebnisse.forEach((e) => {
      e.leistungen.forEach((l) => {
        if (!ls.has(l)) fehler.push(`mandantenCheck › ergebnis "${e.id}": Leistung "${l}" existiert nicht.`);
      });
      if (e.ansprechpartner && !bt.has(e.ansprechpartner))
        fehler.push(`mandantenCheck › ergebnis "${e.id}": Ansprechpartner "${e.ansprechpartner}" ist kein Berufsträger.`);
    });
    c.mandantenCheck.fragen.forEach((f) =>
      f.optionen.forEach((o) =>
        Object.keys(o.gewichte).forEach((k) => {
          if (!ergebnisIds.has(k)) fehler.push(`mandantenCheck › frage "${f.id}" › option "${o.id}": Ergebnis "${k}" existiert nicht.`);
        }),
      ),
    );
  }
  c.stellen.forEach((s) => {
    if (s.ansprechpartner && !bt.has(s.ansprechpartner))
      fehler.push(`stellen › ${s.slug}: Ansprechpartner "${s.ansprechpartner}" ist kein Berufsträger.`);
  });
  if (c.buchung.modus === 'extern' && !c.buchung.url) fehler.push('buchung: Im Modus "extern" ist eine url Pflicht.');
  if (c.kanzleiForm === 'PartG mbB' && !c.rechtliches.register)
    fehler.push('rechtliches.register fehlt: Eine PartG mbB muss das Partnerschaftsregister im Impressum angeben.');
  return fehler;
}

/** Macht aus Zod-Fehlern eine verständliche deutsche Liste („betrieb › adresse › plz: …“). */
export function formatiereFehler(error: z.ZodError, rohConfig?: unknown): string[] {
  return error.issues.map((issue) => {
    const pfad = issue.path
      .map((teil, i) => {
        if (typeof teil === 'number') {
          // Bei Arrays den Slug/Typ/Namen des Eintrags zeigen, wenn vorhanden
          let knoten: any = rohConfig;
          for (const p of issue.path.slice(0, i + 1)) knoten = knoten?.[p as any];
          const name = knoten?.slug ?? knoten?.typ ?? knoten?.id ?? knoten?.name ?? knoten?.titel;
          return name ? `[${teil}: ${name}]` : `[${teil}]`;
        }
        return String(teil);
      })
      .join(' › ')
      .replace(/ › \[/g, '[');
    return `${pfad || '(Wurzel)'}: ${issue.message}`;
  });
}
