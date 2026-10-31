/**
 * Steuertermine: regelbasierte Fälligkeiten + Liste aus der Config.
 *
 * Läuft im Build (statisches HTML, auch ohne JS sichtbar) UND im Browser,
 * damit der Countdown auch Monate nach dem Build stimmt.
 *
 * Verschiebung nach § 108 Abs. 3 AO: Fällt das Fristende auf Samstag, Sonntag
 * oder einen gesetzlichen Feiertag, endet die Frist am nächsten Werktag.
 * Datumswerte sind durchgehend ISO-Strings (JJJJ-MM-TT) in UTC-Rechnung,
 * damit Zeitzonen keine Rolle spielen.
 */

export type Land = 'BW' | 'BY' | 'BE' | 'BB' | 'HB' | 'HH' | 'HE' | 'MV' | 'NI' | 'NW' | 'RP' | 'SL' | 'SN' | 'ST' | 'SH' | 'TH';
export type FristZielgruppe = 'unternehmen' | 'privat' | 'alle';

export type Posten = { titel: string; zielgruppe: FristZielgruppe; hinweis?: string };
export type Frist = { datum: string; verschobenVon?: string; posten: Posten[] };

export type FristenRegeln = {
  umsatzsteuerVoranmeldung: boolean;
  lohnsteuerAnmeldung: boolean;
  vorauszahlungen: boolean;
  gewerbesteuer: boolean;
  sozialversicherung: boolean;
};

export type FristenEingabe = {
  land: Land;
  regeln: FristenRegeln;
  extra: { datum: string; titel: string; zielgruppe: FristZielgruppe; hinweis?: string; verschieben?: boolean }[];
};

// ─── Datum-Helfer (UTC) ─────────────────────────────────────────────────────

const iso = (d: Date) => d.toISOString().slice(0, 10);
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
const plusTage = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
export const ausIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return utc(y, m, d);
};

/** Heutiges Datum (lokale Zeit des Besuchers) als ISO-String */
export function heuteIso(jetzt = new Date()): string {
  return iso(utc(jetzt.getFullYear(), jetzt.getMonth() + 1, jetzt.getDate()));
}

export const tageBis = (vonIso: string, bisIso: string) => Math.round((ausIso(bisIso).getTime() - ausIso(vonIso).getTime()) / 86_400_000);

/** Ostersonntag (Gaußsche Osterformel, anonymer gregorianischer Algorithmus) */
function ostersonntag(jahr: number): Date {
  const a = jahr % 19;
  const b = Math.floor(jahr / 100);
  const c = jahr % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const monat = Math.floor((h + l - 7 * m + 114) / 31);
  const tag = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(jahr, monat, tag);
}

const cache = new Map<string, Set<string>>();

/** Gesetzliche Feiertage eines Jahres für ein Bundesland */
export function feiertage(jahr: number, land: Land): Set<string> {
  const key = `${jahr}-${land}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const o = ostersonntag(jahr);
  const tage: Date[] = [
    utc(jahr, 1, 1),
    plusTage(o, -2), // Karfreitag
    plusTage(o, 1), // Ostermontag
    utc(jahr, 5, 1),
    plusTage(o, 39), // Christi Himmelfahrt
    plusTage(o, 50), // Pfingstmontag
    utc(jahr, 10, 3),
    utc(jahr, 12, 25),
    utc(jahr, 12, 26),
  ];
  const in_ = (...laender: Land[]) => laender.includes(land);
  if (in_('BW', 'BY', 'ST')) tage.push(utc(jahr, 1, 6));
  if (in_('BE', 'MV')) tage.push(utc(jahr, 3, 8));
  if (in_('BW', 'BY', 'HE', 'NW', 'RP', 'SL')) tage.push(plusTage(o, 60)); // Fronleichnam
  if (in_('SL')) tage.push(utc(jahr, 8, 15));
  if (in_('TH')) tage.push(utc(jahr, 9, 20));
  if (in_('BB', 'HB', 'HH', 'MV', 'NI', 'SN', 'ST', 'SH', 'TH')) tage.push(utc(jahr, 10, 31));
  if (in_('BW', 'BY', 'NW', 'RP', 'SL')) tage.push(utc(jahr, 11, 1));
  if (in_('SN')) {
    // Buß- und Bettag: Mittwoch vor dem 23. November
    let d = utc(jahr, 11, 22);
    while (d.getUTCDay() !== 3) d = plusTage(d, -1);
    tage.push(d);
  }
  const set = new Set(tage.map(iso));
  cache.set(key, set);
  return set;
}

export const istWerktag = (d: Date, land: Land) => {
  const wt = d.getUTCDay();
  return wt !== 0 && wt !== 6 && !feiertage(d.getUTCFullYear(), land).has(iso(d));
};

/** § 108 Abs. 3 AO: auf den nächsten Werktag verschieben */
export function aufWerktag(datumIso: string, land: Land): string {
  let d = ausIso(datumIso);
  while (!istWerktag(d, land)) d = plusTage(d, 1);
  return iso(d);
}

/** Drittletzter Bankarbeitstag eines Monats (Fälligkeit der SV-Beiträge) */
function drittletzterBankarbeitstag(jahr: number, monat: number, land: Land): string {
  let d = utc(jahr, monat + 1, 1);
  let gezaehlt = 0;
  while (gezaehlt < 3) {
    d = plusTage(d, -1);
    if (istWerktag(d, land)) gezaehlt++;
  }
  return iso(d);
}

// ─── Fristen erzeugen ───────────────────────────────────────────────────────

/**
 * Alle Fristen zwischen `vonIso` (inklusive) und `bisIso`, nach Datum sortiert.
 * Posten am selben Tag werden zu einem Termin zusammengefasst.
 */
export function erzeugeFristen(e: FristenEingabe, vonIso: string, bisIso: string): Frist[] {
  const roh: { datum: string; original: string; posten: Posten }[] = [];
  const add = (originalIso: string, posten: Posten, verschieben = true) => {
    const datum = verschieben ? aufWerktag(originalIso, e.land) : originalIso;
    roh.push({ datum, original: originalIso, posten });
  };
  const von = ausIso(vonIso);
  const bis = ausIso(bisIso);
  const r = e.regeln;

  for (let y = von.getUTCFullYear(); y <= bis.getUTCFullYear(); y++) {
    for (let m = 1; m <= 12; m++) {
      const zehnter = iso(utc(y, m, 10));
      if (r.umsatzsteuerVoranmeldung)
        add(zehnter, { titel: 'Umsatzsteuer-Voranmeldung', zielgruppe: 'unternehmen', hinweis: 'für den Vormonat bzw. das Vorquartal' });
      if (r.lohnsteuerAnmeldung) add(zehnter, { titel: 'Lohnsteuer-Anmeldung', zielgruppe: 'unternehmen', hinweis: 'für den Vormonat' });
      if (r.vorauszahlungen && [3, 6, 9, 12].includes(m)) {
        add(zehnter, { titel: 'Einkommensteuer-Vorauszahlung', zielgruppe: 'alle' });
        add(zehnter, { titel: 'Körperschaftsteuer-Vorauszahlung', zielgruppe: 'unternehmen' });
      }
      if (r.gewerbesteuer && [2, 5, 8, 11].includes(m)) {
        const f = iso(utc(y, m, 15));
        add(f, { titel: 'Gewerbesteuer-Vorauszahlung', zielgruppe: 'unternehmen' });
        add(f, { titel: 'Grundsteuer', zielgruppe: 'alle', hinweis: 'bei vierteljährlicher Zahlung' });
      }
      if (r.sozialversicherung) {
        // Die Fälligkeit liegt bereits auf einem Bankarbeitstag, keine Verschiebung.
        add(
          drittletzterBankarbeitstag(y, m, e.land),
          { titel: 'Sozialversicherungsbeiträge', zielgruppe: 'unternehmen', hinweis: 'Beitragsnachweis zwei Arbeitstage vorher übermitteln' },
          false,
        );
      }
    }
  }
  for (const x of e.extra) add(x.datum, { titel: x.titel, zielgruppe: x.zielgruppe, hinweis: x.hinweis }, x.verschieben ?? true);

  const nachDatum = new Map<string, Frist>();
  for (const { datum, original, posten } of roh) {
    if (datum < vonIso || datum > bisIso) continue;
    const f = nachDatum.get(datum) ?? { datum, posten: [] };
    if (original !== datum) f.verschobenVon = original;
    f.posten.push(posten);
    nachDatum.set(datum, f);
  }
  return [...nachDatum.values()].sort((a, b) => a.datum.localeCompare(b.datum));
}

/** Filtert Posten nach Zielgruppe; Termine ohne passende Posten entfallen. */
export function filtereFristen(fristen: Frist[], filter: 'alle' | 'unternehmen' | 'privat'): Frist[] {
  if (filter === 'alle') return fristen;
  return fristen
    .map((f) => ({ ...f, posten: f.posten.filter((p) => p.zielgruppe === 'alle' || p.zielgruppe === filter) }))
    .filter((f) => f.posten.length > 0);
}

export function plusMonateIso(startIso: string, monate: number): string {
  const d = ausIso(startIso);
  return iso(utc(d.getUTCFullYear(), d.getUTCMonth() + 1 + monate, d.getUTCDate()));
}

export const LAENDER: Record<Land, string> = {
  BW: 'Baden-Württemberg', BY: 'Bayern', BE: 'Berlin', BB: 'Brandenburg', HB: 'Bremen', HH: 'Hamburg',
  HE: 'Hessen', MV: 'Mecklenburg-Vorpommern', NI: 'Niedersachsen', NW: 'Nordrhein-Westfalen',
  RP: 'Rheinland-Pfalz', SL: 'Saarland', SN: 'Sachsen', ST: 'Sachsen-Anhalt', SH: 'Schleswig-Holstein', TH: 'Thüringen',
};
