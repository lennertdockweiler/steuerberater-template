#!/usr/bin/env node
/**
 * npm run colors -- <slug> [pfad/zum/logo.png]
 * Schlägt aus einem Logo (PNG/JPG/SVG) Markenfarben vor: dominante, gesättigte
 * Farben, gruppiert im OKLab-Farbraum, mit Kontrastwerten und JSON-Schnipsel.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { rohConfig, farbe } from './lib/varianten.mjs';
import { hexToOklch, rgbToHex, kontrast } from '../src/lib/theme.ts';

const [slug, dateiArg] = process.argv.slice(2);
if (!slug) {
  console.error('Aufruf: npm run colors -- <slug> [logo-datei]');
  process.exit(1);
}
const logo = dateiArg ?? (rohConfig(slug).branding?.logo?.datei ? join('variants', slug, 'assets', rohConfig(slug).branding.logo.datei) : null);
if (!logo || !existsSync(logo)) {
  console.error(farbe.rot('✖ Kein Logo gefunden. Pfad angeben: npm run colors -- <slug> pfad/zum/logo.png'));
  process.exit(1);
}

const { data, info } = await sharp(logo, { density: 200 }).resize(96, 96, { fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const eimer = new Map();
for (let i = 0; i < data.length; i += info.channels) {
  if (data[i + 3] < 160) continue;
  const hex = rgbToHex([data[i] / 255, data[i + 1] / 255, data[i + 2] / 255]);
  const { l, c } = hexToOklch(hex);
  if (l > 0.96 || (l < 0.12 && c < 0.03)) continue; // Weiß und Schwarz ignorieren
  const key = hex.slice(1).match(/../g).map((x) => (parseInt(x, 16) >> 4).toString(16)).join('');
  const e = eimer.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
  e.n++;
  e.r += data[i];
  e.g += data[i + 1];
  e.b += data[i + 2];
  eimer.set(key, e);
}
const kandidaten = [...eimer.values()]
  .map((e) => {
    const hex = rgbToHex([e.r / e.n / 255, e.g / e.n / 255, e.b / e.n / 255]);
    const o = hexToOklch(hex);
    return { hex, n: e.n, o, gewicht: e.n * (o.c + 0.04) };
  })
  .sort((a, b) => b.gewicht - a.gewicht);
const auswahl = [];
for (const k of kandidaten) {
  const nah = auswahl.some((a) => Math.hypot(a.o.l - k.o.l, (a.o.c - k.o.c) * 2, Math.abs(a.o.h - k.o.h) / 180) < 0.12);
  if (!nah) auswahl.push(k);
  if (auswahl.length === 4) break;
}
if (!auswahl.length) {
  console.log(farbe.gelb('Keine farbigen Bereiche gefunden (Logo nur schwarz/weiß?). Vorschlag: Preset-Farben verwenden.'));
  process.exit(0);
}
console.log(farbe.fett(`\nFarbvorschläge aus ${logo}:\n`));
auswahl.forEach((a, i) =>
  console.log(`  ${i + 1}. ${a.hex}  Helligkeit ${(a.o.l * 100).toFixed(0)} %, Sättigung ${(a.o.c * 100).toFixed(1)}, Kontrast zu Weiß ${kontrast(a.hex, '#FFFFFF').toFixed(2)}:1`),
);
const [primaer, akzent] = [auswahl[0], auswahl[1] ?? auswahl[0]];
console.log(`\n${farbe.fett('Vorschlag für branding.farben:')}\n${JSON.stringify({ primaer: primaer.hex, akzent: akzent.hex }, null, 2)}\n`);
console.log(farbe.grau('Der Theme-Generator gleicht zu helle oder knallige Farben automatisch auf WCAG AA an.'));
