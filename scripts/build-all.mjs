#!/usr/bin/env node
/**
 * npm run build:all – baut jede Variante (außer _template) nach dist/<slug>/.
 * Jede Variante ist danach eigenständig auf eine eigene (Sub-)Domain deploybar.
 */
import { spawnSync } from 'node:child_process';
import { varianten, farbe } from './lib/varianten.mjs';

const liste = varianten();
const ergebnis = [];
console.log(farbe.fett(`▸ Baue ${liste.length} Varianten: ${liste.join(', ')}\n`));
for (const slug of liste) {
  const start = Date.now();
  const r = spawnSync('npx', ['astro', 'build'], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, VARIANT: slug }, encoding: 'utf8' });
  const ok = r.status === 0;
  const seiten = r.stdout.match(/(\d+) page\(s\) built/)?.[1] ?? '?';
  ergebnis.push({ slug, ok, sek: ((Date.now() - start) / 1000).toFixed(1), seiten });
  console.log(`${ok ? farbe.gruen('✓') : farbe.rot('✖')} ${slug.padEnd(16)} ${seiten} Seiten, ${ergebnis.at(-1).sek} s → dist/${slug}/`);
  if (!ok) console.log(farbe.grau((r.stdout + r.stderr).split('\n').slice(-25).join('\n')));
}
const fehler = ergebnis.filter((e) => !e.ok);
console.log(fehler.length ? farbe.rot(`\n✖ ${fehler.length} Variante(n) fehlgeschlagen`) : farbe.gruen('\n✓ Alle Varianten gebaut'));
process.exit(fehler.length ? 1 : 0);
