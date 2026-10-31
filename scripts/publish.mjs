#!/usr/bin/env node
/**
 * npm run publish              → alle Varianten veröffentlichen
 * npm run publish -- demo-2    → nur diese Variante(n), die übrigen bleiben online
 *
 * Baut jede Variante mit passendem Basis-Pfad, legt die fertigen Seiten in das
 * öffentliche Repo (veroeffentlichen.config.json) und pusht. GitHub Pages stellt sie
 * unter <url>/<pfad>/ bereit. Der Template-Code wird NICHT hochgeladen.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { varianten as alleVarianten } from './lib/varianten.mjs';

const root = new URL('../', import.meta.url).pathname;
const cfg = JSON.parse(readFileSync(`${root}veroeffentlichen.config.json`, 'utf8'));
const repoName = cfg.repo.split('/')[1];
const work = `${root}.veroeffentlichen`;
const sh = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: root, ...opts, env: { ...process.env, ...opts.env } });
  if (r.status !== 0) {
    console.error(`\n✖ Fehlgeschlagen: ${cmd} ${args.join(' ')}`);
    process.exit(1);
  }
};

const alle = alleVarianten().filter((v) => !cfg.ausschliessen.includes(v));
const auswahl = process.argv.slice(2);
const liste = auswahl.length ? auswahl.filter((v) => alle.includes(v)) : alle;
if (!liste.length) {
  console.error(`✖ Keine passende Variante. Verfügbar: ${alle.join(', ')}`);
  process.exit(1);
}

// 1) Öffentliches Repo holen bzw. aktualisieren
if (!existsSync(`${work}/.git`)) {
  rmSync(work, { recursive: true, force: true });
  sh('gh', ['repo', 'clone', cfg.repo, work]);
} else {
  sh('git', ['pull', '--ff-only'], { cwd: work });
}

// 2) Prüfen und mit Basis-Pfad bauen
const site = new URL(cfg.url).origin;
const links = [];
for (const v of liste) {
  const pfad = cfg.pfade[v] ?? v;
  console.log(`\n▶ ${v} → ${cfg.url}/${pfad}/`);
  sh('node', ['scripts/check-variant.mjs', v]);
  rmSync(`${work}/${pfad}`, { recursive: true, force: true });
  sh('npx', ['astro', 'build'], { env: { VARIANT: v, OUT_DIR: `${work}/${pfad}`, BASE_PATH: `/${repoName}/${pfad}/`, SITE_URL: site } });
  links.push([v, `${cfg.url}/${pfad}/`]);
}

// 3) Neutrale Startseite: Kunden sehen nur ihren eigenen Link, keine Liste aller Entwürfe
const neutral = (titel) => `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>${titel}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:17px/1.6 system-ui,sans-serif;background:#f4f4f2;color:#222}main{max-width:32rem;padding:2rem}h1{font-size:1.4rem;margin:0 0 .5rem}</style></head>
<body><main><h1>Website-Entwürfe</h1><p>Den Link zu Ihrem persönlichen Entwurf haben Sie direkt von uns erhalten.</p></main></body></html>\n`;
writeFileSync(`${work}/index.html`, neutral('Website-Entwürfe'));
writeFileSync(`${work}/404.html`, neutral('Seite nicht gefunden'));
// Ohne .nojekyll ignoriert GitHub Pages Ordner mit Unterstrich – also /_astro/ (CSS, JS, Bilder)!
writeFileSync(`${work}/.nojekyll`, '');
writeFileSync(`${work}/robots.txt`, 'User-agent: *\nDisallow: /\n');

// 4) Hochladen
sh('git', ['add', '-A'], { cwd: work });
const diff = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: work });
if (diff.status !== 0) {
  sh('git', ['commit', '-m', `Entwürfe aktualisiert: ${liste.join(', ')}`], { cwd: work });
  sh('git', ['push', 'origin', `HEAD:${cfg.branch}`], { cwd: work });
} else console.log('\nKeine Änderungen – nichts hochzuladen.');

// 5) QR-Codes zu den Links
mkdirSync(`${root}qr`, { recursive: true });
for (const [v, url] of links) spawnSync('node', ['scripts/qr.mjs', v, url], { cwd: root, stdio: 'ignore' });

console.log(`\n✔ Veröffentlicht. GitHub Pages braucht nach dem Push meist 1–2 Minuten.\n`);
for (const [v, url] of links) console.log(`  ${v.padEnd(10)} ${url}   (QR: qr/${v}.png)`);
console.log('');
