/**
 * robots.txt: Demos (meta.noindex = true) sperren ALLES.
 * Live-Seiten erlauben das Crawling, schließen /pitch/ aus und verweisen auf die Sitemap.
 */
import type { APIRoute } from 'astro';
import { config } from '../lib/config';

export const GET: APIRoute = ({ site }) => {
  const text = config.meta.noindex
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\nDisallow: /pitch/\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
