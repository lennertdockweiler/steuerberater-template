#!/usr/bin/env node
/**
 * npm run variant:check -- <slug>
 *
 * Prüft eine Variante vor Demo oder Livegang und meldet verständlich auf Deutsch:
 *  - Schemafehler (fehlende Pflichtfelder, zu lange Texte → Zeichenlimits im Schema)
 *  - Querverweise (Slugs, Ansprechpartner, Zielgruppen)
 *  - fehlende oder zu kleine Bilder
 *  - Farbkontraste (WCAG AA) inkl. automatischer Korrekturen des Theme-Generators
 *  - verbliebene Platzhalter („TODO“, „Musterstraße“, „Lorem“ …)
 *  - Live-Bereitschaft (noindex, Demo-Banner, Formular-Endpoint, Beispielstimmen)
 * Exit-Code 1 bei Fehlern, damit Skripte (z. B. publish) abbrechen.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { schemaLaden, rohConfig, farbe, varianten } from './lib/varianten.mjs';
import { erzeugeTheme, pruefeKontraste } from '../src/lib/theme.ts';
import { PRESETS } from '../src/data/presets.ts';

const slug = process.argv[2];
if (!slug) {
  console.error(`Aufruf: npm run variant:check -- <slug>\nVorhanden: ${varianten().join(', ')}`);
  process.exit(1);
}

const fehler = [];
const warnungen = [];
const ok = [];
const ordner = join('variants', slug);

// ── 1. Schema ──────────────────────────────────────────────────────────────
const { siteConfigSchema, formatiereFehler, pruefeQuerverweise } = await schemaLaden();
let roh;
try {
  roh = rohConfig(slug);
} catch (e) {
  console.error(farbe.rot(`✖ ${e.message}`));
  process.exit(1);
}
const r = siteConfigSchema.safeParse(roh);
if (!r.success) fehler.push(...formatiereFehler(r.error, roh).map((f) => `Schema: ${f}`));
const c = r.success ? r.data : null;
if (c) {
  ok.push('Schema gültig');
  fehler.push(...pruefeQuerverweise(c).map((f) => `Verweis: ${f}`));
  if (c.meta.slug !== slug) warnungen.push(`meta.slug ist „${c.meta.slug}“, der Ordner heißt „${slug}“.`);
}

// ── 2. Bilder ──────────────────────────────────────────────────────────────
const bilder = [];
const sammle = (wert, pfad = '') => {
  if (Array.isArray(wert)) wert.forEach((v, i) => sammle(v, `${pfad}[${i}]`));
  else if (wert && typeof wert === 'object')
    for (const [k, v] of Object.entries(wert)) {
      if ((k === 'datei' || k === 'dateiHell') && typeof v === 'string') bilder.push({ datei: v, wo: `${pfad}.${k}`.replace(/^\./, '') });
      else sammle(v, `${pfad}.${k}`);
    }
};
sammle(roh);
const wissenOrdner = join(ordner, 'wissen');
const artikel = existsSync(wissenOrdner) ? readdirSync(wissenOrdner).filter((f) => f.endsWith('.md') && !f.startsWith('_')) : [];
for (const a of artikel) {
  const text = readFileSync(join(wissenOrdner, a), 'utf8');
  const bild = text.match(/^bild:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1];
  if (bild) bilder.push({ datei: bild, wo: `wissen/${a}` });
  const titel = text.match(/^titel:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? '';
  if (titel.length > 90) fehler.push(`Artikel ${a}: Titel ist zu lang (${titel.length} von max. 90 Zeichen).`);
  if (!/^stand:/m.test(text)) fehler.push(`Artikel ${a}: Feld „stand“ (Rechtsstand) fehlt.`);
}
let bilderOk = 0;
for (const b of bilder) {
  const datei = join(ordner, 'assets', b.datei);
  if (!existsSync(datei)) {
    fehler.push(`Bild fehlt: assets/${b.datei} (${b.wo}) – es wird ein Platzhalter angezeigt.`);
    continue;
  }
  if (/\.svg$/i.test(datei)) {
    bilderOk++;
    continue;
  }
  const { width = 0 } = await sharp(datei).metadata();
  const min = /team|foto|portrait/i.test(b.wo + b.datei) ? 800 : 1200;
  if (width < min) warnungen.push(`Bild assets/${b.datei} ist nur ${width} px breit (empfohlen ≥ ${min} px).`);
  else bilderOk++;
}
ok.push(`${bilderOk} von ${bilder.length} Bildern vorhanden und groß genug`);
ok.push(`${artikel.length} Wissensartikel`);
if (artikel.length < 3) warnungen.push(`Nur ${artikel.length} Wissensartikel – für die Startseite sind 3 ideal.`);

// ── 3. Kontraste ───────────────────────────────────────────────────────────
if (c) {
  const p = PRESETS[c.branding.stilPreset];
  const theme = erzeugeTheme({
    primaer: c.branding.farben.primaer,
    akzent: c.branding.farben.akzent ?? p.farben.akzent,
    neutralTon: c.branding.farben.neutralTon ?? p.farben.neutralTon,
    hintergrundL: p.hintergrundL,
    neutralStaerke: p.neutralStaerke,
  });
  const kontraste = pruefeKontraste(theme);
  const schlecht = kontraste.filter((k) => !k.ok);
  schlecht.forEach((k) => fehler.push(`Kontrast zu gering: ${k.paar} ${k.wert}:1 (mind. ${k.min}:1)`));
  theme.hinweise.forEach((h) => warnungen.push(`Farbe: ${h}`));
  if (!schlecht.length) ok.push(`Alle ${kontraste.length} Farbpaarungen erfüllen WCAG AA`);
}

// ── 4. Platzhalter ─────────────────────────────────────────────────────────
const PLATZHALTER = [/\bTODO\b/i, /lorem ipsum/i, /musterstra(ß|ss)e/i, /mustermann/i, /beispielstra(ß|ss)e/i, /\bXXX+\b/, /\[(Anbieter|Name|Adresse|Platzhalter)[^\]]*\]/i];
const texte = [];
const sammleTexte = (wert, pfad = '') => {
  if (typeof wert === 'string') texte.push({ wert, pfad });
  else if (Array.isArray(wert)) wert.forEach((v, i) => sammleTexte(v, `${pfad}[${i}]`));
  else if (wert && typeof wert === 'object') for (const [k, v] of Object.entries(wert)) sammleTexte(v, pfad ? `${pfad}.${k}` : k);
};
sammleTexte(roh);
for (const a of artikel) texte.push({ wert: readFileSync(join(wissenOrdner, a), 'utf8'), pfad: `wissen/${a}` });
for (const { wert, pfad } of texte) {
  const treffer = PLATZHALTER.find((re) => re.test(wert));
  if (treffer) fehler.push(`Platzhalter in ${pfad}: „${wert.match(treffer)[0]}“`);
  if (/\.example\b/.test(wert)) warnungen.push(`Beispiel-Domain in ${pfad}: ${wert.match(/[\w.-]+\.example\b/)?.[0]} (vor Livegang ersetzen)`);
}

// ── 5. Live-Bereitschaft ───────────────────────────────────────────────────
if (c) {
  const live = !c.meta.noindex;
  const stimmenBeispiel = (c.betrieb.bewertungen?.eintraege ?? []).some((e) => e.beispiel && e.einwilligungLiegtVor);
  const pruefe = (bedingung, text) => bedingung && (live ? fehler : warnungen).push(`${live ? 'Livegang' : 'Vor Livegang'}: ${text}`);
  pruefe(c.demo.banner.aktiv, 'Demo-Banner ist noch aktiv (demo.banner.aktiv).');
  pruefe(!c.integrationen.formularEndpoint, 'Kein formularEndpoint gesetzt – Formulare laufen im Demo-Modus.');
  pruefe(stimmenBeispiel, 'Beispielstimmen sind sichtbar – durch echte Stimmen mit Einwilligung ersetzen.');
  pruefe(!c.meta.domain, 'meta.domain fehlt (Canonical, Sitemap, Open Graph).');
  pruefe(c.meta.domain?.includes('.example'), 'meta.domain ist eine Beispiel-Domain.');
  if (!live) ok.push('Demo-Schutz aktiv (noindex, robots.txt sperrt alles)');
}

// ── Ausgabe ────────────────────────────────────────────────────────────────
console.log(farbe.fett(`\nPrüfung der Variante „${slug}“\n`));
ok.forEach((o) => console.log(`  ${farbe.gruen('✓')} ${o}`));
if (warnungen.length) {
  console.log(farbe.gelb(`\n  Hinweise (${warnungen.length}):`));
  warnungen.forEach((w) => console.log(`  ${farbe.gelb('•')} ${w}`));
}
if (fehler.length) {
  console.log(farbe.rot(`\n  Fehler (${fehler.length}):`));
  fehler.forEach((f) => console.log(`  ${farbe.rot('✖')} ${f}`));
  console.log(farbe.rot(`\n✖ Variante „${slug}“ ist nicht bereit.\n`));
  process.exit(1);
}
console.log(farbe.gruen(`\n✓ Variante „${slug}“ ist in Ordnung${warnungen.length ? ' (siehe Hinweise)' : ''}.\n`));
