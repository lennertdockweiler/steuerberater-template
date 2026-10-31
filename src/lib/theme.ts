/**
 * Theme-Generator: erzeugt aus 1–3 Markenfarben vollständige Farbskalen (50–950)
 * im OKLCH-Farbraum plus semantische Tokens mit garantierten WCAG-AA-Kontrasten.
 *
 * Bewusst ohne Abhängigkeiten, damit auch Node-Skripte (variant:check) die Datei
 * direkt laden können.
 */

export type Oklch = { l: number; c: number; h: number };
type Rgb = [number, number, number];

// ─── Farbraum-Mathematik (Björn Ottosson, OKLab) ────────────────────────────

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function rgbToHex([r, g, b]: Rgb): string {
  const h = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function linearRgbToOklab([r, g, b]: Rgb): Rgb {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToLinearRgb([L, a, b]: Rgb): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function hexToOklch(hex: string): Oklch {
  const [L, a, b] = linearRgbToOklab(hexToRgb(hex).map(toLinear) as Rgb);
  const c = Math.sqrt(a * a + b * b);
  const h = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

function oklchToLinear({ l, c, h }: Oklch): Rgb {
  const rad = (h * Math.PI) / 180;
  return oklabToLinearRgb([l, c * Math.cos(rad), c * Math.sin(rad)]);
}

const inGamut = (rgb: Rgb) => rgb.every((v) => v >= -0.0005 && v <= 1.0005);

/** Reduziert die Sättigung per Binärsuche, bis die Farbe in sRGB darstellbar ist. */
export function oklchToHex(color: Oklch): string {
  let { c } = color;
  if (!inGamut(oklchToLinear(color))) {
    let lo = 0;
    let hi = c;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ ...color, c: mid }))) lo = mid;
      else hi = mid;
    }
    c = lo;
  }
  return rgbToHex(oklchToLinear({ ...color, c }).map(fromLinear) as Rgb);
}

// ─── Kontrast (WCAG 2.x) ────────────────────────────────────────────────────

export function luminanz(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function kontrast(a: string, b: string): number {
  const [hell, dunkel] = [luminanz(a), luminanz(b)].sort((x, y) => y - x);
  return (hell + 0.05) / (dunkel + 0.05);
}

// ─── Skalen ─────────────────────────────────────────────────────────────────

export const STUFEN = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type Stufe = (typeof STUFEN)[number];
export type Skala = Record<Stufe, string>;

const HELLIGKEIT: Record<Stufe, number> = {
  50: 0.977, 100: 0.946, 200: 0.893, 300: 0.818, 400: 0.72, 500: 0.627,
  600: 0.54, 700: 0.462, 800: 0.388, 900: 0.316, 950: 0.245,
};
// Sättigung folgt einer Glockenkurve: helle und sehr dunkle Stufen werden ruhiger.
const CHROMA_KURVE: Record<Stufe, number> = {
  50: 0.14, 100: 0.26, 200: 0.46, 300: 0.7, 400: 0.9, 500: 1,
  600: 1, 700: 0.94, 800: 0.84, 900: 0.72, 950: 0.6,
};

export function erzeugeSkala(hex: string, chromaMax?: number): Skala {
  const basis = hexToOklch(hex);
  // Sehr graue Eingaben nicht künstlich aufblasen, knallige leicht beruhigen.
  const c = Math.min(chromaMax ?? 0.2, Math.max(basis.c, 0.012));
  const skala = {} as Skala;
  for (const s of STUFEN) skala[s] = oklchToHex({ l: HELLIGKEIT[s], c: c * CHROMA_KURVE[s], h: basis.h });
  return skala;
}

/** Neutrale Skala mit leichtem Farbstich (Farbton aus neutralTon bzw. Markenfarbe). */
export function erzeugeNeutral(hex: string, staerke = 1): Skala {
  const { h, c } = hexToOklch(hex);
  const stich = Math.min(0.022, Math.max(0.005, c * 0.3)) * staerke;
  const skala = {} as Skala;
  for (const s of STUFEN) {
    const kurve = s <= 100 ? 0.6 : s >= 900 ? 0.9 : 1;
    skala[s] = oklchToHex({ l: HELLIGKEIT[s] + (s === 50 ? 0.012 : 0), c: stich * kurve, h });
  }
  return skala;
}

/** Wählt die Stufe, die dem Ziel am nächsten ist und den Mindestkontrast gegen `gegen` erfüllt. */
function passendeStufe(skala: Skala, gegen: string, minKontrast: number, start: Stufe, richtung: 'dunkler' | 'heller'): string {
  const reihe = richtung === 'dunkler' ? STUFEN.filter((s) => s >= start) : [...STUFEN].reverse().filter((s) => s <= start);
  for (const s of reihe) if (kontrast(skala[s], gegen) >= minKontrast) return skala[s];
  return richtung === 'dunkler' ? skala[950] : skala[50];
}

function naechsteStufe(hex: string): Stufe {
  const { l } = hexToOklch(hex);
  let beste: Stufe = 500;
  for (const s of STUFEN) if (Math.abs(HELLIGKEIT[s] - l) < Math.abs(HELLIGKEIT[beste] - l)) beste = s;
  return beste;
}

// ─── Theme ──────────────────────────────────────────────────────────────────

export type ThemeEingabe = {
  primaer: string;
  akzent: string;
  neutralTon: string;
  /** Helligkeit des Seitenhintergrunds (0–1); Presets setzen das unterschiedlich. */
  hintergrundL: number;
  /** Stärke des Farbstichs der Grautöne. */
  neutralStaerke?: number;
};

export type Theme = {
  primaer: Skala;
  akzent: Skala;
  neutral: Skala;
  tokens: Record<string, string>;
  hinweise: string[];
};

const WEISS = '#FFFFFF';

/** Text auf einer Farbfläche: hell oder dunkel, je nachdem was besser lesbar ist. */
export function textAuf(flaeche: string, dunkel: string, hell = WEISS): string {
  const kHell = kontrast(flaeche, hell);
  // Weiß bevorzugen, solange AA erfüllt ist (wirkt auf Markenfarben meist hochwertiger).
  if (kHell >= 4.5) return hell;
  return kontrast(flaeche, dunkel) > kHell ? dunkel : hell;
}

export function erzeugeTheme(e: ThemeEingabe): Theme {
  const hinweise: string[] = [];
  const primaer = erzeugeSkala(e.primaer);
  const akzent = erzeugeSkala(e.akzent, 0.19);
  const neutral = erzeugeNeutral(e.neutralTon, e.neutralStaerke);
  const { h: nh, c: nc } = hexToOklch(e.neutralTon);
  const stich = Math.min(0.02, Math.max(0.004, nc * 0.3)) * (e.neutralStaerke ?? 1);

  const bg = oklchToHex({ l: e.hintergrundL, c: stich * 0.5, h: nh });
  const surface = oklchToHex({ l: e.hintergrundL - 0.03, c: stich * 0.8, h: nh });
  const surface2 = oklchToHex({ l: e.hintergrundL - 0.065, c: stich, h: nh });
  const ink = oklchToHex({ l: 0.22, c: stich * 1.2, h: nh });
  const inkMuted = passendeStufe(neutral, surface, 4.6, 600, 'dunkler');
  const line = oklchToHex({ l: e.hintergrundL - 0.115, c: stich * 1.1, h: nh });
  const lineStrong = passendeStufe(neutral, bg, 3, 400, 'dunkler');

  // Markenfläche (Buttons): Originalfarbe behalten, solange Text darauf lesbar ist
  // (4.5:1 mit Weiß oder Tinte). Nur wenn das nicht geht, nächste dunklere Stufe.
  let brand = e.primaer.toUpperCase();
  if (kontrast(brand, textAuf(brand, ink)) < 4.5) {
    const ersatz = passendeStufe(primaer, WEISS, 4.5, naechsteStufe(brand), 'dunkler');
    hinweise.push(`Auf der Markenfarbe ${brand} ist kein Text lesbar, für Buttons wird ${ersatz} verwendet.`);
    brand = ersatz;
  }
  // Sehr helle Markenfarben (z. B. Gelb) bekommen eine dunklere Kante, damit die
  // Fläche sich vom Papier abhebt (WCAG 1.4.11, 3:1 für UI-Grenzen).
  const brandEdge = kontrast(brand, bg) >= 3 ? brand : passendeStufe(primaer, bg, 3, naechsteStufe(brand), 'dunkler');
  if (brandEdge !== brand) hinweise.push(`Markenfarbe ${brand} ist sehr hell: Buttons erhalten eine Kante in ${brandEdge}.`);
  const onBrand = textAuf(brand, ink);
  // Hover: dieselbe Farbe, eine Spur dunkler (helle Marken) bzw. tiefer (dunkle Marken)
  const bo = hexToOklch(brand);
  const brandHover = oklchToHex({ ...bo, l: bo.l > 0.6 ? bo.l - 0.06 : Math.max(0.18, bo.l - 0.07), c: bo.c * 1.04 });

  // Markenfarbe als Textfarbe auf Papier (Links, Ziffern): mind. 4.5:1
  let brandInk = e.primaer.toUpperCase();
  if (kontrast(brandInk, bg) < 4.5 || kontrast(brandInk, surface) < 4.5) {
    brandInk = passendeStufe(primaer, surface, 4.5, naechsteStufe(brandInk), 'dunkler');
    hinweise.push(`Markenfarbe ist als Textfarbe zu hell, für Links/Text wird ${brandInk} verwendet.`);
  }

  const akzentFlaeche = e.akzent.toUpperCase();
  const onAkzent = textAuf(akzentFlaeche, ink);
  const akzentInk = passendeStufe(akzent, surface, 4.5, naechsteStufe(akzentFlaeche), 'dunkler');

  // Dunkle Flächen (invers): tiefe Variante der Markenfarbe
  const inverse = oklchToHex({ l: 0.235, c: Math.min(0.055, hexToOklch(e.primaer).c * 0.5), h: hexToOklch(e.primaer).h });
  const inverse2 = oklchToHex({ l: 0.29, c: Math.min(0.06, hexToOklch(e.primaer).c * 0.55), h: hexToOklch(e.primaer).h });
  const onInverse = '#FFFFFF';
  const onInverseMuted = oklchToHex({ l: 0.82, c: 0.02, h: hexToOklch(e.primaer).h });
  const inverseLine = oklchToHex({ l: 0.38, c: 0.03, h: hexToOklch(e.primaer).h });
  // Akzent auf dunkler Fläche: heller Akzentton, der AA auf invers schafft
  const brandOnInverse = passendeStufe(primaer, inverse, 4.5, 300, 'heller');
  const akzentOnInverse = kontrast(akzentFlaeche, inverse) >= 4.5 ? akzentFlaeche : passendeStufe(akzent, inverse, 4.5, 300, 'heller');

  if (kontrast(ink, bg) < 7) hinweise.push('Textkontrast auf dem Hintergrund liegt unter AAA (7:1).');

  const tokens: Record<string, string> = {
    bg,
    surface,
    'surface-2': surface2,
    ink,
    'ink-muted': inkMuted,
    line,
    'line-strong': lineStrong,
    brand,
    'brand-hover': brandHover,
    'brand-edge': brandEdge,
    'on-brand': onBrand,
    'brand-ink': brandInk,
    'brand-soft': primaer[100],
    'brand-softer': primaer[50],
    accent: akzentFlaeche,
    'on-accent': onAkzent,
    'accent-ink': akzentInk,
    'accent-soft': akzent[100],
    inverse,
    'inverse-2': inverse2,
    'on-inverse': onInverse,
    'on-inverse-muted': onInverseMuted,
    'inverse-line': inverseLine,
    'brand-on-inverse': brandOnInverse,
    'accent-on-inverse': akzentOnInverse,
    focus: brandInk,
    success: oklchToHex({ l: 0.5, c: 0.12, h: 150 }),
    danger: oklchToHex({ l: 0.5, c: 0.17, h: 25 }),
  };
  for (const s of STUFEN) {
    tokens[`p-${s}`] = primaer[s];
    tokens[`a-${s}`] = akzent[s];
    tokens[`n-${s}`] = neutral[s];
  }
  return { primaer, akzent, neutral, tokens, hinweise };
}

/** CSS-Text für :root mit allen Tokens. */
export function themeCss(theme: Theme): string {
  return `:root{${Object.entries(theme.tokens)
    .map(([k, v]) => `--${k}:${v}`)
    .join(';')}}`;
}

/** Prüft die wichtigsten Paarungen und liefert einen Bericht (für variant:check). */
export function pruefeKontraste(theme: Theme): { paar: string; wert: number; min: number; ok: boolean }[] {
  const t = theme.tokens;
  const paare: [string, string, string, number][] = [
    ['Text auf Hintergrund', t.ink, t.bg, 4.5],
    ['Gedämpfter Text auf Fläche', t['ink-muted'], t.surface, 4.5],
    ['Button-Text auf Markenfarbe', t['on-brand'], t.brand, 4.5],
    ['Button-Kante gegen Hintergrund', t['brand-edge'], t.bg, 3],
    ['Link-Farbe auf Hintergrund', t['brand-ink'], t.bg, 4.5],
    ['Text auf Akzentfläche', t['on-accent'], t.accent, 4.5],
    ['Text auf dunkler Fläche', t['on-inverse'], t.inverse, 4.5],
    ['Gedämpfter Text auf dunkler Fläche', t['on-inverse-muted'], t.inverse, 4.5],
  ];
  return paare.map(([paar, a, b, min]) => {
    const wert = kontrast(a, b);
    return { paar, wert: Math.round(wert * 100) / 100, min, ok: wert >= min };
  });
}
