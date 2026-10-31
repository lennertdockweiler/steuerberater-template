/**
 * HTML für die Steuertermine. Dieselbe Funktion rendert im Build (statisch, ohne JS
 * sichtbar) und im Browser (Countdown ab dem tatsächlichen Datum des Besuchers).
 */
import { tageBis, type Frist } from './fristen';

export type FristTexte = { heute: string; morgen: string; inTagen: string; verschoben: string; keine: string };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('de-DE', { ...o, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
};

export function countdownText(heute: string, datum: string, t: FristTexte): string {
  const n = tageBis(heute, datum);
  return n <= 0 ? t.heute : n === 1 ? t.morgen : t.inTagen.replace('{tage}', String(n));
}

export function fristenHtml(fristen: Frist[], heute: string, layout: 'kalender' | 'kompakt' | 'tabelle', t: FristTexte): string {
  if (!fristen.length) return `<li class="fr-leer">${esc(t.keine)}</li>`;
  return fristen
    .map((f) => {
      const n = tageBis(heute, f.datum);
      const dringend = n <= 3;
      const badge = `<span class="fr-badge${dringend ? ' fr-dringend' : ''}">${esc(countdownText(heute, f.datum, t))}</span>`;
      const verschoben = f.verschobenVon ? `<p class="fr-hinweis">${esc(t.verschoben.replace('{datum}', fmt(f.verschobenVon, { day: '2-digit', month: '2-digit', year: 'numeric' })))}</p>` : '';
      const posten = f.posten.map((p) => `<li>${esc(p.titel)}${p.hinweis ? `<span class="fr-ph">${esc(p.hinweis)}</span>` : ''}</li>`).join('');
      if (layout === 'kalender')
        return `<li class="fr-blatt${dringend ? ' fr-blatt-dringend' : ''}"><div class="fr-datum"><span class="fr-monat">${fmt(f.datum, { month: 'long' })}</span><span class="fr-tag ziffern">${fmt(f.datum, { day: 'numeric' })}</span><span class="fr-wtag">${fmt(f.datum, { weekday: 'long' })}</span></div><div class="fr-inhalt">${badge}<ul class="fr-posten">${posten}</ul>${verschoben}</div></li>`;
      return `<li class="fr-zeile"><time class="fr-d datum" datetime="${f.datum}">${fmt(f.datum, { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}</time><div class="fr-p"><ul class="fr-posten">${posten}</ul>${verschoben}</div>${badge}</li>`;
    })
    .join('');
}
