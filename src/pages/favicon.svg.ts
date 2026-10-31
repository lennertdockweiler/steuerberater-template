/** Favicon in Markenfarbe: Initialen über einem Summenstrich. */
import type { APIRoute } from 'astro';
import { config, theme } from '../lib/config';

export const GET: APIRoute = () => {
  const name = config.branding.wortmarke?.zeile1 ?? config.betrieb.kurzname;
  const initialen = name
    .split(/\s+/)
    .filter((w) => /^[A-ZÄÖÜ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  const tk = theme.tokens;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${tk.brand}"/><text x="32" y="38" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${initialen.length > 1 ? 26 : 32}" letter-spacing="-1" fill="${tk['on-brand']}">${initialen}</text><path d="M16 47h32M16 51.5h32" stroke="${tk['on-brand']}" stroke-width="2.2"/></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
