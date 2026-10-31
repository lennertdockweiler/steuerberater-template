/**
 * Astro-Konfiguration. Die aktive Variante kommt aus der Umgebungsvariable VARIANT
 * (Standard: "demo"). Hier wird die Config VOR dem Build validiert, die Schriften
 * der Variante registriert und nur die aktivierten Unterseiten eingebunden.
 */
import { defineConfig, fontProviders } from 'astro/config';
import type { AstroIntegration } from 'astro';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';
import { siteConfigSchema, formatiereFehler, pruefeQuerverweise, type SiteConfig } from './variants/_schema';
import { PRESETS, type PresetKey } from './src/data/presets';
import { SCHRIFTEN, LATIN, LATIN_EXT, cssVariable, type SchriftKey } from './src/data/fonts';

const VARIANT = process.env.VARIANT?.trim() || 'demo';
const PRESET_OVERRIDE = (process.env.PRESET?.trim() || '') as PresetKey | '';

// ── 1. Config laden und validieren ─────────────────────────────────────────
function ladeConfig(): SiteConfig {
  const pfad = `./variants/${VARIANT}/site.config.json`;
  const abbruch = (zeilen: string[]) => {
    console.error(`\n\x1b[31m✖ Die Konfiguration der Variante "${VARIANT}" ist ungültig:\x1b[0m\n`);
    zeilen.forEach((z) => console.error(`  • ${z}`));
    console.error(`\nTipp: npm run variant:check -- ${VARIANT}\n`);
    process.exit(1);
  };
  if (!existsSync(pfad)) abbruch([`Datei ${pfad} nicht gefunden. Neue Variante anlegen mit: npm run variant:new -- ${VARIANT}`]);
  let roh: unknown;
  try {
    roh = JSON.parse(readFileSync(pfad, 'utf8'));
  } catch (e) {
    abbruch([`site.config.json ist kein gültiges JSON: ${(e as Error).message}`]);
  }
  const r = siteConfigSchema.safeParse(roh);
  if (!r.success) abbruch(formatiereFehler(r.error, roh));
  const quer = pruefeQuerverweise(r.data!);
  if (quer.length) abbruch(quer);
  if (PRESET_OVERRIDE && !(PRESET_OVERRIDE in PRESETS)) abbruch([`PRESET="${PRESET_OVERRIDE}" unbekannt (klar | klassisch | warm).`]);
  return r.data!;
}
const config = ladeConfig();
// Nur für Messungen (npm run lighthouse): noindex temporär aus, damit SEO bewertbar ist
if (process.env.MESSUNG === '1') config.meta.noindex = false;

// JSON-Schema für die VS-Code-Autovervollständigung aktuell halten
const jsonSchema = JSON.stringify(z.toJSONSchema(siteConfigSchema, { io: 'input', unrepresentable: 'any' }), null, 2);
const schemaPfad = './variants/site.config.schema.json';
if (!existsSync(schemaPfad) || readFileSync(schemaPfad, 'utf8') !== jsonSchema) writeFileSync(schemaPfad, jsonSchema);

// ── 2. Schriften der Variante (lokal aus @fontsource-variable) ─────────────
const preset = PRESETS[PRESET_OVERRIDE || config.branding.stilPreset];
const paar = (!PRESET_OVERRIDE && config.branding.schriftPaar) || preset.schriften;
const schriftKeys = [...new Set([paar.headline, paar.text])] as SchriftKey[];
const fonts = schriftKeys.map((key) => {
  const s = SCHRIFTEN[key];
  const datei = (subset: string) => `@fontsource-variable/${s.paket}/files/${s.paket}-${subset}-wght-normal.woff2`;
  return {
    provider: fontProviders.local(),
    name: s.familie,
    cssVariable: cssVariable(key),
    fallbacks: [s.fallback],
    options: {
      variants: [
        { src: [datei('latin')] as [string], weight: s.gewicht, style: 'normal' as const, display: 'swap' as const, unicodeRange: [LATIN] as [string] },
        { src: [datei('latin-ext')] as [string], weight: s.gewicht, style: 'normal' as const, display: 'swap' as const, unicodeRange: [LATIN_EXT] as [string] },
      ] as [any, ...any[]],
    },
  };
});

// ── 3. Nur aktivierte Unterseiten einbinden ────────────────────────────────
const s = config.seiten;
const routen: { aktiv: boolean; pattern: string; entrypoint: string }[] = [
  { aktiv: s.leistungen, pattern: '/leistungen', entrypoint: 'leistungen/index.astro' },
  { aktiv: s.leistungen, pattern: '/leistungen/[zielgruppe]', entrypoint: 'leistungen/[zielgruppe].astro' },
  { aktiv: s.leistungen, pattern: '/leistungen/[zielgruppe]/[leistung]', entrypoint: 'leistungen/[leistung].astro' },
  { aktiv: s.spezialisierungen && config.spezialisierungen.length > 0, pattern: '/spezialisierungen', entrypoint: 'spezialisierungen/index.astro' },
  { aktiv: s.spezialisierungen && config.spezialisierungen.length > 0, pattern: '/spezialisierungen/[slug]', entrypoint: 'spezialisierungen/[slug].astro' },
  { aktiv: s.digitaleKanzlei, pattern: '/digitale-kanzlei', entrypoint: 'digitale-kanzlei.astro' },
  { aktiv: s.team, pattern: '/team', entrypoint: 'team/index.astro' },
  { aktiv: s.team, pattern: '/team/[slug]', entrypoint: 'team/[slug].astro' },
  { aktiv: s.karriere, pattern: '/karriere', entrypoint: 'karriere/index.astro' },
  { aktiv: s.karriere, pattern: '/karriere/[slug]', entrypoint: 'karriere/[slug].astro' },
  { aktiv: s.wissen, pattern: '/wissen', entrypoint: 'wissen/index.astro' },
  { aktiv: s.wissen, pattern: '/wissen/[slug]', entrypoint: 'wissen/[slug].astro' },
  { aktiv: s.steuertermine, pattern: '/wissen/steuertermine', entrypoint: 'wissen/steuertermine.astro' },
  { aktiv: s.mandantenCheck && !!config.mandantenCheck, pattern: '/mandanten-check', entrypoint: 'mandanten-check.astro' },
  { aktiv: s.termin, pattern: '/termin', entrypoint: 'termin.astro' },
  { aktiv: s.kontakt, pattern: '/kontakt', entrypoint: 'kontakt.astro' },
  { aktiv: s.rechner, pattern: '/rechner', entrypoint: 'rechner.astro' },
  { aktiv: s.unterlagen, pattern: '/unterlagen', entrypoint: 'unterlagen.astro' },
  { aktiv: config.demo.pitchSeite, pattern: '/pitch', entrypoint: 'pitch/index.astro' },
  { aktiv: config.demo.pitchSeite, pattern: '/pitch/layouts', entrypoint: 'pitch/layouts.astro' },
];

const variantenRouten: AstroIntegration = {
  name: 'varianten-routen',
  hooks: {
    'astro:config:setup': ({ injectRoute, logger }) => {
      for (const r of routen.filter((r) => r.aktiv)) {
        const datei = `./src/routes/${r.entrypoint}`;
        if (!existsSync(datei)) {
          logger.warn(`Route ${r.pattern} übersprungen: ${datei} fehlt.`);
          continue;
        }
        injectRoute({ pattern: r.pattern, entrypoint: datei });
      }
      logger.info(`Variante "${VARIANT}" (${preset.name}${PRESET_OVERRIDE ? ', Preset-Vorschau' : ''}), ${routen.filter((r) => r.aktiv).length} optionale Routen aktiv`);
    },
  },
};

// ── 4. Astro ───────────────────────────────────────────────────────────────
const site = process.env.SITE_URL || config.meta.domain || 'http://localhost:4321';
// Optional: Veröffentlichung unter einem Unterpfad (npm run publish setzt das automatisch)
const base = process.env.BASE_PATH ? `/${process.env.BASE_PATH.replace(/^\/|\/$/g, '')}/` : '/';
const indexierbar = !config.meta.noindex;

export default defineConfig({
  site,
  base,
  outDir: process.env.OUT_DIR || `./dist/${VARIANT}`,
  trailingSlash: 'always',
  compressHTML: true,
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  fonts,
  integrations: [
    variantenRouten,
    preact({ include: ['**/islands/**'] }),
    ...(indexierbar
      ? [sitemap({ filter: (page) => !page.includes('/pitch') && !page.includes('/og/') })]
      : []),
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      __VARIANT__: JSON.stringify(VARIANT),
      __PRESET__: JSON.stringify(PRESET_OVERRIDE),
      __MESSUNG__: JSON.stringify(process.env.MESSUNG === '1'),
    },
  },
});
