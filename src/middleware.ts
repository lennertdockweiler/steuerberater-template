/**
 * Basis-Pfad-Unterstützung (z. B. Veröffentlichung unter /website-entwuerfe/<slug>/).
 *
 * Komponenten schreiben interne Links wie gewohnt als „/kontakt/“. Ist beim Build ein
 * Basis-Pfad gesetzt (BASE_PATH), ergänzt diese Middleware ihn zentral in allen
 * HTML-Antworten: in href/src/action-Attributen und in den Props der Preact-Islands.
 * Bereits präfixierte Pfade (Astro-Assets) und externe URLs bleiben unverändert.
 * Ohne Basis-Pfad (Standard) wird nichts angefasst.
 */
import { defineMiddleware } from 'astro:middleware';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const onRequest = defineMiddleware(async (_ctx, next) => {
  const antwort = await next();
  if (!BASE || !(antwort.headers.get('content-type') ?? '').includes('text/html')) return antwort;
  const ohne = esc(BASE.slice(1));
  const attribut = new RegExp(`(\\s(?:href|src|action|poster)=")/(?!/|${ohne}/)`, 'g');
  const island = new RegExp(`&quot;/(?!/|${ohne}/)`, 'g');
  const html = (await antwort.text())
    .replace(attribut, `$1${BASE}/`)
    .replace(/(\sprops=")([^"]*)(")/g, (_, a: string, inhalt: string, z: string) => a + inhalt.replace(island, `&quot;${BASE}/`) + z);
  return new Response(html, { status: antwort.status, headers: antwort.headers });
});
