import type { APIRoute } from 'astro';
import { config, theme } from '../lib/config';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: config.betrieb.name,
      short_name: config.betrieb.kurzname,
      lang: 'de',
      start_url: import.meta.env.BASE_URL,
      display: 'standalone',
      background_color: theme.tokens.bg,
      theme_color: theme.tokens.brand,
      icons: [{ src: `${import.meta.env.BASE_URL.replace(/\/$/, '')}/favicon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
