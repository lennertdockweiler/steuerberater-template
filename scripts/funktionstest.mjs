#!/usr/bin/env node
/**
 * npm run test -- <slug>
 * Klickt die interaktiven Funktionen einer gebauten Variante (dist/<slug>/) durch:
 * Menü, Tabs, Fristen-Filter, Mandanten-Check, Terminbuchung inkl. .ics, Formular,
 * Rechner, Checkliste, Wissenssuche, Seitenwechsel (View Transitions), ohne JS,
 * reduzierte Bewegung und Tastatur-Fokus. Meldet jedes Ergebnis auf Deutsch.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { starteServer } from './lib/server.mjs';

const slug = process.argv[2] ?? 'demo';
const port = 4700 + Math.floor(Math.random() * 200);
const server = await starteServer(`dist/${slug}`, port);
const B = `http://localhost:${port}`;
const browser = await chromium.launch();
const ergebnisse = [];
const pruefe = async (name, fn) => {
  try {
    const info = await fn();
    ergebnisse.push({ name, ok: true, info });
    console.log(`  \x1b[32m✓\x1b[0m ${name}${info ? ` \x1b[90m(${info})\x1b[0m` : ''}`);
  } catch (e) {
    ergebnisse.push({ name, ok: false, info: e.message });
    console.log(`  \x1b[31m✖\x1b[0m ${name}: ${e.message.split('\n')[0]}`);
  }
};
const neu = async (opt = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ...opt });
  const page = await ctx.newPage();
  const fehler = [];
  page.on('pageerror', (e) => fehler.push(e.message));
  page.on('console', (m) => m.type() === 'error' && fehler.push(m.text()));
  return { ctx, page, fehler };
};
const erwarte = (bed, text) => {
  if (!bed) throw new Error(text);
};

console.log(`\nFunktionstest „${slug}“\n`);

await pruefe('Mobilmenü: öffnen, Fokus im Menü, Escape schließt, Fokus zurück', async () => {
  const { ctx, page } = await neu();
  await page.goto(`${B}/`, { waitUntil: 'networkidle' });
  await page.click('[data-menu-oeffnen]');
  await page.waitForTimeout(700);
  erwarte(await page.isVisible('#mobilmenue'), 'Menü nicht sichtbar');
  erwarte(await page.evaluate(() => document.querySelector('#mobilmenue')?.contains(document.activeElement)), 'Fokus nicht im Menü');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  erwarte(!(await page.isVisible('#mobilmenue')), 'Menü bleibt offen');
  erwarte(await page.evaluate(() => document.activeElement?.hasAttribute('data-menu-oeffnen')), 'Fokus nicht zurück am Menüknopf');
  await ctx.close();
});

await pruefe('Leistungs-Tabs per Pfeiltaste', async () => {
  const { ctx, page } = await neu({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${B}/`, { waitUntil: 'networkidle' });
  const tabs = page.locator('[role="tab"]');
  if ((await tabs.count()) < 2) return 'kein Tabs-Layout aktiv';
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  erwarte((await tabs.nth(1).getAttribute('aria-selected')) === 'true', 'zweiter Tab nicht gewählt');
  const panel = await tabs.nth(1).getAttribute('aria-controls');
  erwarte(await page.isVisible(`#${panel}`), 'Panel nicht sichtbar');
  await ctx.close();
});

await pruefe('Steuertermine: Filter „Privat“', async () => {
  const { ctx, page, fehler } = await neu();
  await page.goto(`${B}/wissen/steuertermine/`, { waitUntil: 'networkidle' });
  const vorher = await page.locator('.fr-liste > li').count();
  await page.click('[data-filter="privat"]');
  const nachher = await page.locator('.fr-liste > li').count();
  erwarte(nachher > 0 && nachher < vorher, `Filter wirkt nicht (${vorher} → ${nachher})`);
  erwarte(!fehler.length, fehler[0]);
  await ctx.close();
  return `${vorher} → ${nachher} Termine`;
});

await pruefe('Mandanten-Check bis zum Ergebnis, Termin-Link mit Anliegen', async () => {
  const { ctx, page, fehler } = await neu();
  await page.goto(`${B}/mandanten-check/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('astro-island:not([ssr]) .mc-option');
  for (let i = 0; i < 6; i++) {
    if (await page.isVisible('.mc-ergebnis')) break;
    await page.locator('.mc-option').first().click();
    await page.waitForTimeout(450);
  }
  erwarte(await page.isVisible('.mc-ergebnis'), 'kein Ergebnis');
  const href = await page.locator('.mc-ergebnis a.btn').first().getAttribute('href');
  erwarte(href?.includes('anliegen='), 'Termin-Link ohne Anliegen');
  erwarte(!fehler.length, fehler[0]);
  const titel = await page.locator('.mc-ergebnis .mc-titel').textContent();
  await ctx.close();
  return titel?.trim();
});

await pruefe('Terminbuchung: Art → Tag → Zeit → Daten → Bestätigung → .ics', async () => {
  const { ctx, page, fehler } = await neu({ acceptDownloads: true });
  await page.goto(`${B}/termin/?anliegen=Test%20aus%20dem%20Check`, { waitUntil: 'networkidle' });
  if (!(await page.locator('.tb-art').count())) return 'externer Buchungsdienst konfiguriert';
  await page.waitForSelector('astro-island:not([ssr])');
  await page.locator('.tb-art').first().click();
  await page.locator('.tb-tag:not([disabled])').first().click();
  await page.locator('.tb-slot').first().click();
  erwarte((await page.inputValue('#tb-anliegen')).includes('Test aus dem Check'), 'Anliegen nicht vorausgefüllt');
  await page.click('.tb-form button[type="submit"]');
  erwarte((await page.getAttribute('#tb-name', 'aria-invalid')) === 'true', 'Pflichtfeld-Fehler fehlt');
  await page.fill('#tb-name', 'Erika Test');
  await page.fill('#tb-email', 'erika@beispiel.de');
  await page.click('.tb-form button[type="submit"]');
  await page.waitForSelector('.tb-fertig', { timeout: 5000 });
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('.tb-fertig .btn')]);
  const ics = readFileSync(await download.path(), 'utf8');
  erwarte(ics.includes('BEGIN:VCALENDAR') && ics.includes('DTSTART:'), 'ICS ungültig');
  erwarte(!fehler.length, fehler[0]);
  await ctx.close();
  return ics.match(/DTSTART:(\S+)/)?.[1];
});

await pruefe('Kontaktformular: Fehlermeldungen, dann Demo-Erfolg', async () => {
  const { ctx, page } = await neu();
  await page.goto(`${B}/kontakt/`, { waitUntil: 'networkidle' });
  await page.click('form[data-formular] button[type="submit"]');
  erwarte((await page.getAttribute('#k-email', 'aria-invalid')) === 'true', 'E-Mail-Fehler fehlt');
  erwarte(((await page.textContent('#k-email-fehler')) ?? '').length > 5, 'Fehlertext fehlt');
  await page.fill('#k-name', 'Erika Test');
  await page.fill('#k-email', 'keine-mail');
  await page.fill('#k-nachricht', 'Testnachricht');
  await page.click('form[data-formular] button[type="submit"]');
  erwarte((await page.getAttribute('#k-email', 'aria-invalid')) === 'true', 'ungültige E-Mail akzeptiert');
  await page.fill('#k-email', 'erika@beispiel.de');
  await page.click('form[data-formular] button[type="submit"]');
  await page.waitForSelector('[data-erfolg]:not([hidden])', { timeout: 5000 });
  await ctx.close();
});

await pruefe('Entfernungspauschale rechnet mit Werten aus steuerwerte.ts', async () => {
  const { ctx, page } = await neu();
  await page.goto(`${B}/rechner/`, { waitUntil: 'networkidle' });
  await page.selectOption('#pe-jahr', '2026');
  await page.fill('#pendler input[type="number"][name="km"]', '30');
  await page.fill('#pendler input[type="number"][name="tage"]', '220');
  await page.dispatchEvent('#pendler input[type="number"][name="tage"]', 'input');
  await page.waitForTimeout(1200);
  const text = await page.textContent('#pendler [data-ergebnis-betrag]');
  erwarte(text?.replace(/\s/g, '').includes('2.508'), `erwartet 2.508 €, erhalten ${text}`);
  await ctx.close();
  return text?.trim();
});

await pruefe('Checkliste merkt sich Haken (localStorage)', async () => {
  const { ctx, page } = await neu();
  await page.goto(`${B}/unterlagen/`, { waitUntil: 'networkidle' });
  await page.locator('[data-checkliste] label').first().click();
  await page.reload({ waitUntil: 'networkidle' });
  erwarte(await page.locator('[data-checkliste] input').first().isChecked(), 'Haken nach Neuladen weg');
  await ctx.close();
});

await pruefe('Wissenssuche filtert', async () => {
  const { ctx, page } = await neu();
  await page.goto(`${B}/wissen/`, { waitUntil: 'networkidle' });
  const alle = await page.locator('[data-suchtext]:visible').count();
  await page.fill('input[type="search"]', 'zzzzqqq');
  erwarte(await page.isVisible('[data-keine-treffer]'), 'Leer-Hinweis fehlt');
  await page.fill('input[type="search"]', '');
  erwarte((await page.locator('[data-suchtext]:visible').count()) === alle, 'Zurücksetzen klappt nicht');
  await ctx.close();
  return `${alle} Beiträge`;
});

await pruefe('Seitenwechsel per View Transition hin und zurück ohne Fehler', async () => {
  const { ctx, page, fehler } = await neu({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${B}/`, { waitUntil: 'networkidle' });
  await page.click('.kopf-nav a[href="/team/"]');
  await page.waitForURL('**/team/');
  await page.waitForTimeout(800);
  await page.locator('.tk-link').first().click();
  await page.waitForURL('**/team/*/');
  await page.waitForTimeout(800);
  await page.goBack();
  await page.waitForURL('**/team/');
  await page.goBack();
  await page.waitForURL(`${B}/`);
  await page.waitForTimeout(1000);
  await page.mouse.wheel(0, 3000);
  await page.waitForTimeout(800);
  erwarte(await page.evaluate(() => document.documentElement.classList.contains('js')), 'Klasse .js fehlt nach Wechsel');
  erwarte(await page.evaluate(() => document.documentElement.dataset.anim === 'bereit'), 'Animationen nach Wechsel nicht neu gestartet');
  erwarte(!fehler.length, fehler[0]);
  await ctx.close();
});

await pruefe('Ohne JavaScript: alle Inhalte sichtbar', async () => {
  const { ctx, page } = await neu({ javaScriptEnabled: false });
  await page.goto(`${B}/`, { waitUntil: 'load' });
  const versteckt = await page.evaluate(
    () => [...document.querySelectorAll('[data-anim], [data-anim-kinder] > *')].filter((e) => getComputedStyle(e).opacity === '0').length,
  );
  erwarte(versteckt === 0, `${versteckt} Elemente unsichtbar`);
  erwarte(await page.isVisible('h1'), 'H1 nicht sichtbar');
  await ctx.close();
});

await pruefe('Reduzierte Bewegung: nichts versteckt, Laufband steht', async () => {
  const { ctx, page } = await neu({ reducedMotion: 'reduce' });
  await page.goto(`${B}/`, { waitUntil: 'networkidle' });
  const versteckt = await page.evaluate(() => [...document.querySelectorAll('[data-anim]')].filter((e) => getComputedStyle(e).opacity === '0').length);
  erwarte(versteckt === 0, `${versteckt} Elemente unsichtbar`);
  const laeuft = await page.evaluate(() => [...document.querySelectorAll('.mq-spur, .vl-spur')].some((e) => getComputedStyle(e).animationName !== 'none'));
  erwarte(!laeuft, 'Laufband läuft');
  erwarte(await page.evaluate(() => !document.documentElement.classList.contains('lenis')), 'Lenis aktiv');
  await ctx.close();
});

await pruefe('Tastatur: Sprunglink zuerst, sichtbarer Fokus', async () => {
  const { ctx, page } = await neu({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${B}/`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  erwarte(await page.evaluate(() => document.activeElement?.classList.contains('sprunglink')), 'erster Tab-Stopp ist nicht der Sprunglink');
  let ohneFokus = 0;
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    const sichtbar = await page.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return true;
      const s = getComputedStyle(e);
      return s.outlineStyle !== 'none' || s.boxShadow !== 'none';
    });
    if (!sichtbar) ohneFokus++;
  }
  erwarte(ohneFokus === 0, `${ohneFokus} Elemente ohne sichtbaren Fokus`);
  await ctx.close();
});

await browser.close();
server.close();
const fehlgeschlagen = ergebnisse.filter((e) => !e.ok);
console.log(fehlgeschlagen.length ? `\n\x1b[31m✖ ${fehlgeschlagen.length} von ${ergebnisse.length} Prüfungen fehlgeschlagen\x1b[0m\n` : `\n\x1b[32m✓ Alle ${ergebnisse.length} Prüfungen bestanden\x1b[0m\n`);
process.exit(fehlgeschlagen.length ? 1 : 0);
