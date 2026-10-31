/**
 * Gemeinsame Helfer der Varianten-Skripte (Node, ohne Build-Schritt).
 * Das Zod-Schema wird direkt als TypeScript geladen (Node-Type-Stripping).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const VARIANTEN_ORDNER = 'variants';

/** Alle bauberen Varianten (Ordner mit site.config.json, ohne führenden Unterstrich). */
export function varianten() {
  return readdirSync(VARIANTEN_ORDNER)
    .filter((d) => !d.startsWith('_') && !d.startsWith('.'))
    .filter((d) => statSync(join(VARIANTEN_ORDNER, d)).isDirectory() && existsSync(join(VARIANTEN_ORDNER, d, 'site.config.json')));
}

export async function schemaLaden() {
  return import('../../variants/_schema.ts');
}

export function rohConfig(slug) {
  const pfad = join(VARIANTEN_ORDNER, slug, 'site.config.json');
  if (!existsSync(pfad)) throw new Error(`variants/${slug}/site.config.json fehlt.`);
  return JSON.parse(readFileSync(pfad, 'utf8'));
}

export const farbe = {
  rot: (s) => `\x1b[31m${s}\x1b[0m`,
  gelb: (s) => `\x1b[33m${s}\x1b[0m`,
  gruen: (s) => `\x1b[32m${s}\x1b[0m`,
  grau: (s) => `\x1b[90m${s}\x1b[0m`,
  fett: (s) => `\x1b[1m${s}\x1b[0m`,
};

/** Slug prüfen (gleiche Regel wie im Schema). */
export const gueltigerSlug = (s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s ?? '');
