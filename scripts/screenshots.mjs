#!/usr/bin/env node
/**
 * npm run shots -- <slug> [--breiten=390,1024,1440] [--nur=/,/kontakt/] [--alle]
 *
 * Erstellt mit Playwright Screenshots der Hauptseiten aus dist/<slug>/:
 *   screenshots/<slug>/<breite>/<seite>-fold.png  (erster Bildschirm, mit Animationen)
 *   screenshots/<slug>/<breite>/<seite>-voll.png  (ganze Seite, ruhiger Endzustand)
 * Prüft nebenbei Konsolenfehler und horizontales Überlaufen (bericht.json).
 *
 * Für Ganzseiten-Aufnahmen wird prefers-reduced-motion emuliert: Dann gibt es keine
 * gepinnten Bereiche und alle Inhalte stehen in ihrer Endposition – ideal als Ausdruck.
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { starteServer } from './lib/server.mjs';
import { alleBilderLaden, durchscrollen, ganzeSeite, ladeSeite } from './lib/aufnahme.mjs';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--')) ?? 'demo';
const opt = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
const breiten = (opt.breiten ?? '390,1024,1440').split(',').map(Number);
const HOEHE = { 390: 844, 768: 1024, 1024: 768, 1440: 900, 1920: 1080 };

const wurzel = `dist/${slug}`;
if (!existsSync(wurzel)) {
  console.error(`✖ dist/${slug} fehlt. Zuerst bauen: VARIANT=${slug} npm run build`);
  process.exit(1);
}

/** Alle HTML-Seiten finden und auf Hauptseiten reduzieren (je Detailtyp ein Beispiel). */
function seiten() {
  const alle = [];
  const lauf = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) {
        if (!['_astro', 'og'].includes(f)) lauf(p);
      } else if (f === 'index.html') alle.push(`/${relative(wurzel, dir)}/`.replace(/\/+/g, '/'));
    }
  };
  lauf(wurzel);
  if (opt.nur) return opt.nur.split(',');
  if ('alle' in opt) return alle.sort();
  const gesehen = new Set();
  return alle.sort().filter((p) => {
    const teile = p.split('/').filter(Boolean);
    if (teile.length <= 1 || p === '/wissen/steuertermine/') return true;
    const typ = teile.slice(0, -1).join('/') + `#${teile.length}`;
    if (gesehen.has(typ)) return false;
    gesehen.add(typ);
    return true;
  });
}

const name = (p) => (p === '/' ? 'start' : p.replace(/^\/|\/$/g, '').replace(/\//g, '__'));
const port = 4500 + Math.floor(Math.random() * 400);
const server = await starteServer(wurzel, port);
const browser = await chromium.launch();
const bericht = [];
const liste = seiten();
console.log(`▸ ${slug}: ${liste.length} Seiten × ${breiten.length} Breiten`);

for (const breite of breiten) {
  const ordner = `screenshots/${slug}/${breite}`;
  mkdirSync(ordner, { recursive: true });
  for (const pfad of liste) {
    const url = `http://localhost:${port}${pfad}`;
    const fehler = [];
    // 1) Erster Bildschirm mit Animationen
    const ctx = await browser.newContext({ viewport: { width: breite, height: HOEHE[breite] ?? 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => m.type() === 'error' && fehler.push(m.text()));
    page.on('pageerror', (e) => fehler.push(e.message));
    await ladeSeite(page, url);
    await page.waitForTimeout(2600);
    await page.screenshot({ path: `${ordner}/${name(pfad)}-fold.png` });
    const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await durchscrollen(page);
    await ctx.close();
    // 2) Ganze Seite im ruhigen Endzustand
    const ctx2 = await browser.newContext({ viewport: { width: breite, height: HOEHE[breite] ?? 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page2 = await ctx2.newPage();
    await ladeSeite(page2, url);
    await alleBilderLaden(page2);
    await ganzeSeite(page2, `${ordner}/${name(pfad)}-voll.png`);
    await ctx2.close();
    bericht.push({ breite, pfad, ueberlauf, fehler });
    console.log(`  ${breite}px ${pfad}${ueberlauf > 0 ? `  ⚠ horizontaler Überlauf ${ueberlauf}px` : ''}${fehler.length ? `  ⚠ ${fehler.length} Konsolenfehler` : ''}`);
  }
}

writeFileSync(`screenshots/${slug}/bericht.json`, JSON.stringify(bericht, null, 2));
await browser.close();
server.close();
const probleme = bericht.filter((b) => b.ueberlauf > 0 || b.fehler.length);
console.log(probleme.length ? `\n⚠ ${probleme.length} Aufnahmen mit Auffälligkeiten (siehe screenshots/${slug}/bericht.json)` : '\n✓ Keine Konsolenfehler, kein horizontales Überlaufen.');
console.log(`✓ Screenshots: screenshots/${slug}/`);
