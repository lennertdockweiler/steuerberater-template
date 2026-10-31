/**
 * Open-Graph-Bilder (1200 × 630) für jede Seite, automatisch pro Variante:
 * Name, Seitentitel, Markenfarbe und das Balken-Motiv aus dem Hero.
 * Satori erzeugt SVG (Text als Pfade), sharp rastert zu PNG.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';
import { config, design, theme } from '../../lib/config';
import { SCHRIFTEN } from '../../data/fonts';
import { seitenliste, type SeitenEintrag } from '../../lib/seitenliste';

export const getStaticPaths: GetStaticPaths = async () =>
  (await seitenliste()).map((s) => ({
    params: { pfad: s.pfad === '/' ? 'start' : s.pfad.replace(/^\/|\/$/g, '') },
    props: { s },
  }));

const require = createRequire(import.meta.url);
const schrift = (key: keyof typeof SCHRIFTEN, gewicht: number) => {
  const p = SCHRIFTEN[key].ogPaket;
  return readFileSync(require.resolve(`@fontsource/${p}/files/${p}-latin-${gewicht}-normal.woff`));
};
const fonts = [
  { name: 'Headline', data: schrift(design.schriften.headline, 700), weight: 700 as const, style: 'normal' as const },
  { name: 'Text', data: schrift(design.schriften.text, 400), weight: 400 as const, style: 'normal' as const },
];

const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });

export const GET: APIRoute = async ({ props }) => {
  const { s } = props as { s: SeitenEintrag };
  const tk = theme.tokens;
  const werte = [34, 42, 39, 51, 48, 60, 55, 67, 63, 74, 71, 86];
  const titelGroesse = s.titel.length > 70 ? 50 : s.titel.length > 45 ? 60 : 72;

  const baum = el(
    'div',
    { width: 1200, height: 630, display: 'flex', background: tk.bg, fontFamily: 'Text', color: tk.ink },
    [
      el('div', { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 840, padding: '64px 72px' }, [
        el('div', { display: 'flex', flexDirection: 'column', gap: 10 }, [
          el('div', { fontFamily: 'Headline', fontSize: 30, letterSpacing: -0.6 }, config.betrieb.kurzname),
          el('div', { width: 210, height: 7, borderTop: `2px solid ${tk['brand-ink']}`, borderBottom: `2px solid ${tk['brand-ink']}` }),
        ]),
        el('div', { display: 'flex', flexDirection: 'column', gap: 22 }, [
          el('div', { fontSize: 26, color: tk['brand-ink'] }, s.kicker),
          el('div', { fontFamily: 'Headline', fontSize: titelGroesse, lineHeight: 1.04, letterSpacing: -titelGroesse * 0.03 }, s.titel),
        ]),
        el('div', { fontSize: 22, color: tk['ink-muted'] }, `${config.betrieb.adresse.strasse}, ${config.betrieb.adresse.plz} ${config.betrieb.adresse.ort}  ·  ${config.betrieb.telefon}`),
      ]),
      el(
        'div',
        { display: 'flex', alignItems: 'flex-end', gap: 9, width: 360, padding: '0 40px 64px', background: tk.brand },
        werte.map((w, i) =>
          el('div', {
            width: 15,
            height: Math.round(w * 4.4),
            background: i === werte.length - 1 ? tk.accent : tk['on-brand'],
            opacity: i === werte.length - 1 ? 1 : 0.85,
            borderRadius: 2,
          }),
        ),
      ),
    ],
  );

  const svg = await satori(baum as never, { width: 1200, height: 630, fonts });
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
