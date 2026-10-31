#!/usr/bin/env node
/**
 * npm run qr -- <slug> <url>
 * Erzeugt qr/<slug>.png und qr/<slug>.svg in Markenfarbe (dunkel genug zum Scannen).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import QRCode from 'qrcode';
import { rohConfig, farbe } from './lib/varianten.mjs';
import { erzeugeTheme, kontrast } from '../src/lib/theme.ts';
import { PRESETS } from '../src/data/presets.ts';

const [slug, url] = process.argv.slice(2);
if (!slug || !url) {
  console.error('Aufruf: npm run qr -- <slug> <url>');
  process.exit(1);
}
const c = rohConfig(slug);
const p = PRESETS[c.branding.stilPreset] ?? PRESETS.klar;
const theme = erzeugeTheme({
  primaer: c.branding.farben.primaer,
  akzent: c.branding.farben.akzent ?? p.farben.akzent,
  neutralTon: c.branding.farben.neutralTon ?? p.farben.neutralTon,
  hintergrundL: p.hintergrundL,
});
// Für zuverlässiges Scannen mindestens 7:1 gegen Weiß
let dunkel = theme.tokens['brand-ink'];
for (const s of [700, 800, 900, 950]) {
  if (kontrast(dunkel, '#FFFFFF') >= 7) break;
  dunkel = theme.tokens[`p-${s}`];
}
const optionen = { errorCorrectionLevel: 'M', margin: 2, color: { dark: dunkel, light: '#FFFFFF' } };
mkdirSync('qr', { recursive: true });
await QRCode.toFile(`qr/${slug}.png`, url, { ...optionen, width: 1024 });
writeFileSync(`qr/${slug}.svg`, await QRCode.toString(url, { ...optionen, type: 'svg' }));
console.log(farbe.gruen(`✓ qr/${slug}.png und qr/${slug}.svg → ${url} (Farbe ${dunkel})`));
