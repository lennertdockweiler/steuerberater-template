/**
 * Hilfsfunktionen für Playwright-Aufnahmen: Seite laden, durchscrollen (damit
 * Scroll-Animationen auslösen), auf Ruhe warten, Screenshot erstellen.
 */
export async function durchscrollen(page) {
  await page.evaluate(async () => {
    const schritt = Math.round(window.innerHeight * 0.6);
    const hoehe = () => document.documentElement.scrollHeight;
    for (let y = 0; y < hoehe(); y += schritt) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, hoehe());
    await new Promise((r) => setTimeout(r, 600));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 900));
  });
}

export async function ladeSeite(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

/**
 * Ganzseiten-Aufnahme ohne Artefakte: fixierte Bedienelemente (Aktionsleiste,
 * Demo-Badge, Sprunglink) ausblenden und sehr lange Seiten in Abschnitten
 * aufnehmen (Chromium rendert höchstens ca. 16.384 px am Stück), dann zusammensetzen.
 */
export async function ganzeSeite(page, pfad) {
  const sharp = (await import('sharp')).default;
  await page.addStyleTag({ content: '.mobile-leiste,.demo-badge,.sprunglink{display:none!important}[data-header]{position:absolute!important;transform:none!important}' });
  const { breite, hoehe } = await page.evaluate(() => ({ breite: document.documentElement.clientWidth, hoehe: document.documentElement.scrollHeight }));
  if (hoehe <= 15000) return page.screenshot({ path: pfad, fullPage: true });
  const teile = [];
  for (let y = 0; y < hoehe; y += 8000) {
    const h = Math.min(8000, hoehe - y);
    teile.push({ input: await page.screenshot({ fullPage: true, clip: { x: 0, y, width: breite, height: h } }), left: 0, top: y });
  }
  await sharp({ create: { width: breite, height: hoehe, channels: 3, background: '#ffffff' } }).composite(teile).png().toFile(pfad);
}

/** Für Ganzseiten-Aufnahmen: alle Lazy-Bilder sofort laden und auf sie warten. */
export async function alleBilderLaden(page) {
  await page.evaluate(async () => {
    const bilder = [...document.querySelectorAll('img')];
    bilder.forEach((b) => (b.loading = 'eager'));
    await Promise.all(bilder.map((b) => (b.complete && b.naturalWidth ? null : new Promise((r) => ((b.onload = r), (b.onerror = r), setTimeout(r, 8000))))));
  });
  await page.waitForTimeout(300);
}
