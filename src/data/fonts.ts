/**
 * Schriftenregister. Alle Schriften sind lokal gehostet (@fontsource-variable),
 * niemals über das Google-Fonts-CDN (DSGVO, LG München I, Az. 3 O 17493/20).
 *
 * Eingebunden wird nur, was die aktive Variante braucht, und nur die Subsets
 * latin + latin-ext (deutsche Umlaute, ß, €, „“ und – liegen alle in latin).
 */

export type SchriftKey = 'schibsted-grotesk' | 'onest' | 'plus-jakarta-sans' | 'newsreader' | 'source-sans-3' | 'fraunces';

export type Schrift = {
  familie: string;
  /** Dateipräfix in @fontsource-variable/<paket>/files/ */
  paket: string;
  gewicht: string;
  fallback: 'sans-serif' | 'serif';
  /** Statischer Schnitt (WOFF) für die OG-Bild-Erzeugung mit Satori */
  ogPaket: string;
  /** Hat die Schrift tabellarische Ziffern (tnum)? */
  tnum: boolean;
};

export const SCHRIFTEN: Record<SchriftKey, Schrift> = {
  'schibsted-grotesk': { familie: 'Schibsted Grotesk', paket: 'schibsted-grotesk', gewicht: '400 900', fallback: 'sans-serif', ogPaket: 'schibsted-grotesk', tnum: true },
  onest: { familie: 'Onest', paket: 'onest', gewicht: '100 900', fallback: 'sans-serif', ogPaket: 'onest', tnum: true },
  'plus-jakarta-sans': { familie: 'Plus Jakarta Sans', paket: 'plus-jakarta-sans', gewicht: '200 800', fallback: 'sans-serif', ogPaket: 'plus-jakarta-sans', tnum: true },
  newsreader: { familie: 'Newsreader', paket: 'newsreader', gewicht: '200 800', fallback: 'serif', ogPaket: 'newsreader', tnum: true },
  'source-sans-3': { familie: 'Source Sans 3', paket: 'source-sans-3', gewicht: '200 900', fallback: 'sans-serif', ogPaket: 'source-sans-3', tnum: false },
  fraunces: { familie: 'Fraunces', paket: 'fraunces', gewicht: '100 900', fallback: 'serif', ogPaket: 'fraunces', tnum: false },
};

// Unicode-Bereiche wie in den Fontsource-Paketen
export const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
export const LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

export const cssVariable = (key: SchriftKey) => `--font-${key}` as const;
