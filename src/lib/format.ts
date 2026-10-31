/**
 * Deutsche Typografie und Formate. Wird server- und clientseitig genutzt.
 */

const NBSP = ' ';
const NNBSP = ' '; // schmales geschütztes Leerzeichen (z. B. „z. B.“)

const euroFmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const euroFmtGanz = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

/** 1250 → „1.250,00 €“ (mit geschütztem Leerzeichen vor €) */
export const euro = (n: number, ganz = false) => (ganz ? euroFmtGanz : euroFmt).format(n);

/** 1250.5 → „1.250,5“ */
export const zahl = (n: number, nachkomma = 0) =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: nachkomma, maximumFractionDigits: nachkomma }).format(n);

const parseIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/** „2026-10-21“ → „21.10.2026“ */
export const datum = (iso: string) =>
  new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(parseIso(iso));

/** „2026-10-21“ → „21. Oktober 2026“ */
export const datumLang = (iso: string) =>
  new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parseIso(iso));

/** „2026-10-21“ → „Mittwoch, 21. Oktober“ */
export const datumMitTag = (iso: string) =>
  new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(parseIso(iso));

/** Telefonnummer → tel:-Link im internationalen Format (+49…) */
export function telHref(nummer: string): string {
  let n = nummer.replace(/[^\d+]/g, '');
  if (n.startsWith('00')) n = `+${n.slice(2)}`;
  else if (n.startsWith('0')) n = `+49${n.slice(1)}`;
  return `tel:${n}`;
}

/** Telefonnummer → wa.me-Link */
export const whatsappHref = (nummer: string) => `https://wa.me/${telHref(nummer).replace('tel:+', '')}`;

/**
 * Korrigiert typische Satzfehler in Freitexten aus der Config:
 * gerade Anführungszeichen → „…“, Bindestrich mit Leerzeichen → Gedankenstrich,
 * geschützte Leerzeichen zwischen Zahl und Einheit, bei §, Abs., Nr. und Abkürzungen.
 */
export function typo(s: string): string {
  return s
    .replace(/"([^"\n]+)"/g, '„$1“')
    .replace(/(^|\s)-(\s)/g, '$1–$2')
    .replace(/\.\.\./g, '…')
    .replace(/(\d)\s(?=(€|%|km|kg|m²|ha|Std\.|Min\.|Mio\.|Mrd\.|Tsd\.|Uhr|Cent|Euro|Tage?n?\b|Monate?n?\b|Jahre?n?\b|Wochen?\b|Mitarbeitende))/g, `$1${NBSP}`)
    .replace(/(§§?)\s(?=\d)/g, `$1${NBSP}`)
    .replace(/\b(Abs\.|Nr\.|Art\.|S\.|Satz|Buchst\.)\s(?=\d|[a-z]\))/g, `$1${NBSP}`)
    .replace(/\bz\. ?B\./g, `z.${NNBSP}B.`)
    .replace(/\bu\. ?a\./g, `u.${NNBSP}a.`)
    .replace(/\bd\. ?h\./g, `d.${NNBSP}h.`)
    .replace(/\bi\. ?d\. ?R\./g, `i.${NNBSP}d.${NNBSP}R.`)
    .replace(/\bz\. ?T\./g, `z.${NNBSP}T.`);
}

/** Wendet typo() rekursiv auf alle Textfelder an, nicht aber auf technische Felder. */
const TECHNISCH = /^(\$schema|slug|id|url|href|email|domain|datei|dateiHell|fokus|fokusMobil|icon|telefon|fax|whatsapp|datum|von|bis|primaer|akzent|neutralTon|typ|layout|zielgruppe|ansprechpartner|leistungen|auswahl|netzwerk|tage|ustId|wirtschaftsId|nummer|plz|motiv|einheit|art|modus|anbieter|stilPreset|radius|headline|veroeffentlicht|gueltigBis|skriptUrl|agbUrl|datenschutzUrl|land|bundesland)$/;

export function typoTief<T>(wert: T, schluessel = ''): T {
  if (typeof wert === 'string') return (TECHNISCH.test(schluessel) ? wert : typo(wert)) as T;
  if (Array.isArray(wert)) return wert.map((v) => typoTief(v, schluessel)) as T;
  if (wert && typeof wert === 'object') {
    const aus: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(wert)) aus[k] = typoTief(v, k);
    return aus as T;
  }
  return wert;
}

/** Ersetzt {platzhalter} in Texten. */
export const fuelle = (s: string, werte: Record<string, string | number> = {}) =>
  s.replace(/\{(\w+)\}/g, (_, k) => (k in werte ? String(werte[k]) : `{${k}}`));

/** Lesezeit in Minuten (180 Wörter/Minute, aufgerundet – Fachtexte liest man langsamer). */
export const lesezeit = (text: string) => Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 180));
