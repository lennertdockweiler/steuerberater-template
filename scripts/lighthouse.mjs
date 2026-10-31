#!/usr/bin/env node
/**
 * npm run lighthouse -- <slug> [/pfad/ …]
 * Baut die Variante als Messbuild (noindex temporär aus, damit SEO bewertbar ist)
 * nach .lighthouse-build/<slug>, misst mobil (Lighthouse-Standard: Moto G Power,
 * simuliertes 4G, 4× CPU-Drosselung) und speichert Berichte in lighthouse/<slug>/.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from 'playwright';
import { starteServer } from './lib/server.mjs';

const [slug = 'demo', ...pfade] = process.argv.slice(2);
const seiten = pfade.length ? pfade : ['/', '/leistungen/'];
const ziel = `.lighthouse-build/${slug}`;
console.log(`▸ Messbuild ${slug} …`);
const b = spawnSync('npx', ['astro', 'build'], { env: { ...process.env, VARIANT: slug, OUT_DIR: ziel, MESSUNG: '1' }, stdio: 'ignore' });
if (b.status !== 0) {
  console.error('✖ Build fehlgeschlagen');
  process.exit(1);
}
const port = 4800 + Math.floor(Math.random() * 100);
const server = await starteServer(ziel, port);
const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
mkdirSync(`lighthouse/${slug}`, { recursive: true });
const zeilen = [];
for (const pfad of seiten) {
  const r = await lighthouse(`http://localhost:${port}${pfad}`, { port: chrome.port, output: 'html', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
  const lhr = r.lhr;
  const n = pfad === '/' ? 'start' : pfad.replace(/^\/|\/$/g, '').replace(/\//g, '__');
  writeFileSync(`lighthouse/${slug}/${n}.html`, r.report);
  const k = lhr.categories;
  const a = lhr.audits;
  zeilen.push({
    seite: pfad,
    perf: Math.round(k.performance.score * 100),
    a11y: Math.round(k.accessibility.score * 100),
    bp: Math.round(k['best-practices'].score * 100),
    seo: Math.round(k.seo.score * 100),
    lcp: a['largest-contentful-paint'].displayValue,
    cls: a['cumulative-layout-shift'].displayValue,
    tbt: a['total-blocking-time'].displayValue,
    fcp: a['first-contentful-paint'].displayValue,
  });
  const schwach = Object.values(a).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== 'informative' && x.scoreDisplayMode !== 'notApplicable' && x.scoreDisplayMode !== 'manual');
  if (schwach.length) console.log(`  ${pfad}: ${schwach.map((x) => x.id).join(', ')}`);
}
await chrome.kill();
server.close();
console.table(zeilen);
writeFileSync(`lighthouse/${slug}/ergebnis.json`, JSON.stringify(zeilen, null, 2));
console.log(`Berichte: lighthouse/${slug}/`);
