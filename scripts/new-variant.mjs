#!/usr/bin/env node
/**
 * npm run variant:new -- <slug>
 * Kopiert variants/_template/ nach variants/<slug>/, setzt den Slug und zeigt die
 * Checkliste der Daten, die vom Betrieb gebraucht werden.
 */
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { farbe, gueltigerSlug } from './lib/varianten.mjs';

const slug = process.argv[2];
if (!gueltigerSlug(slug)) {
  console.error(farbe.rot('✖ Bitte einen Slug angeben: Kleinbuchstaben, Ziffern, Bindestriche – z. B. npm run variant:new -- kanzlei-meyer'));
  process.exit(1);
}
const ziel = join('variants', slug);
if (existsSync(ziel)) {
  console.error(farbe.rot(`✖ variants/${slug} existiert bereits.`));
  process.exit(1);
}
cpSync('variants/_template', ziel, { recursive: true });
const pfad = join(ziel, 'site.config.json');
writeFileSync(pfad, readFileSync(pfad, 'utf8').replace('"slug": "neue-kanzlei"', `"slug": "${slug}"`));

console.log(farbe.gruen(`\n✓ Neue Variante angelegt: variants/${slug}/\n`));
console.log(farbe.fett('Pflichtangaben in site.config.json (alles mit "TODO" ersetzen):'));
const PFLICHT = [
  ['betrieb', 'Name, Kurzname, Rechtsform, Inhaber, Slogan, Gründungsjahr, Adresse inkl. Bundesland, Geo-Koordinaten, Telefon, E-Mail, Öffnungszeiten'],
  ['branding', 'Markenfarbe (primaer), Stil-Preset (klar | klassisch | warm), optional Logo und Akzentfarbe'],
  ['berufstraeger', 'Name, Titel (exakt wie verliehen!), Bestellungsjahr, Schwerpunkte, Sprachen, Foto mit Alt-Text, E-Mail'],
  ['zielgruppen + leistungen', 'Welche Mandanten, welche Leistungen mit Kurztext und Text'],
  ['kammer', 'Zuständige Steuerberaterkammer mit Anschrift und Website'],
  ['berufshaftpflicht', 'Versicherer, Anschrift, räumlicher Geltungsbereich'],
  ['rechtliches', 'USt-IdNr., ggf. Register (PartG/GmbH), Vertretungsberechtigte, Verbraucherstreitbeilegung'],
  ['buchung', 'Beratungsarten, Arbeitszeiten, Slot-Dauer'],
  ['demo.agentur', 'Ihre Agenturdaten für das Demo-Badge'],
];
PFLICHT.forEach(([feld, text]) => console.log(`  ${farbe.gelb('□')} ${farbe.fett(feld)}: ${text}`));
console.log(`
${farbe.fett('Bilder')} nach variants/${slug}/assets/ (Benennung siehe README, Abschnitt Bilder-Leitfaden).
${farbe.fett('Artikel')} nach variants/${slug}/wissen/ (Vorlage: _beispiel.md).

${farbe.fett('Weiter:')}
  1. npm run variant:check -- ${slug}
  2. VARIANT=${slug} npm run dev
  3. npm run publish -- ${slug}
`);
