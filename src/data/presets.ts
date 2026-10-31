/**
 * Stil-Presets. Ein Preset bündelt Schriften, Radien, Bildstil, Bewegungscharakter,
 * Standardfarben und die bevorzugten Layout-Varianten je Sektion.
 * Alles hier ist Standard: Die Config einer Variante kann jeden Wert überschreiben.
 */
import type { SchriftKey } from './fonts';

export type PresetKey = 'klar' | 'klassisch' | 'warm';
export type Radius = 'eckig' | 'dezent' | 'weich' | 'rund';
export type Intensitaet = 'dezent' | 'standard' | 'ausdrucksstark';

export type Preset = {
  name: string;
  beschreibung: string;
  schriften: { headline: SchriftKey; text: SchriftKey };
  radius: Radius;
  animationsIntensitaet: Intensitaet;
  bildstil: { grain: boolean; tonung: 'keine' | 'marke' | 'warm' | 'kuehl' };
  farben: { akzent: string; neutralTon: string };
  hintergrundL: number;
  neutralStaerke: number;
  typo: {
    headlineGewicht: number;
    headlineLaufweite: string;
    headlineZeilenhoehe: number;
    /** Faktor für die größten Headlines */
    displayFaktor: number;
    textGroesse: string;
  };
  layouts: Record<string, string>;
};

export const PRESETS: Record<PresetKey, Preset> = {
  klar: {
    name: 'Klar & Digital',
    beschreibung: 'Swiss Style: präzise Grotesk, viel Weiß, ein kräftiger Akzent, Raster und Datengrafik als Ornament.',
    schriften: { headline: 'schibsted-grotesk', text: 'schibsted-grotesk' },
    radius: 'eckig',
    animationsIntensitaet: 'standard',
    bildstil: { grain: false, tonung: 'kuehl' },
    farben: { akzent: '#E8A33D', neutralTon: '#5E7471' },
    hintergrundL: 0.99,
    neutralStaerke: 0.8,
    typo: { headlineGewicht: 680, headlineLaufweite: '-0.032em', headlineZeilenhoehe: 1.02, displayFaktor: 1, textGroesse: '1.0625rem' },
    layouts: {
      hero: 'statement', zielgruppen: 'karten', leistungen: 'tabs', ablauf: 'gepinnt', kennzahlen: 'reihe',
      spezialisierungen: 'horizontal', team: 'karten', fristen: 'kalender', stimmen: 'marquee', karriere: 'split',
      wissen: 'liste', faq: 'akkordeon', cta: 'band', check: 'banner', kanzlei: 'editorial', vertrauen: 'laufband',
    },
  },
  klassisch: {
    name: 'Klassisch Seriös',
    beschreibung: 'Editorial: Serif-Headlines, ruhige Sans, Navy oder Bordeaux mit Messing, Satzspiegel mit Randnotizen.',
    schriften: { headline: 'newsreader', text: 'source-sans-3' },
    radius: 'eckig',
    animationsIntensitaet: 'dezent',
    bildstil: { grain: true, tonung: 'warm' },
    farben: { akzent: '#A8834A', neutralTon: '#857B70' },
    hintergrundL: 0.978,
    neutralStaerke: 0.9,
    typo: { headlineGewicht: 430, headlineLaufweite: '-0.018em', headlineZeilenhoehe: 1.06, displayFaktor: 1.06, textGroesse: '1.125rem' },
    layouts: {
      hero: 'weiche', zielgruppen: 'zeilen', leistungen: 'liste', ablauf: 'zeitleiste', kennzahlen: 'band',
      spezialisierungen: 'raster', team: 'portraits', fristen: 'kompakt', stimmen: 'zitat', karriere: 'band',
      wissen: 'karten', faq: 'zweispaltig', cta: 'karte', check: 'karte', kanzlei: 'editorial', vertrauen: 'reihe',
    },
  },
  warm: {
    name: 'Persönlich Warm',
    beschreibung: 'Nahbar: große Porträts, warme Neutraltöne, weiche Radien, runde Grotesk, persönliche Ansprache.',
    schriften: { headline: 'plus-jakarta-sans', text: 'plus-jakarta-sans' },
    radius: 'rund',
    animationsIntensitaet: 'standard',
    bildstil: { grain: false, tonung: 'warm' },
    farben: { akzent: '#5C6B35', neutralTon: '#8A7A78' },
    hintergrundL: 0.975,
    neutralStaerke: 1,
    typo: { headlineGewicht: 760, headlineLaufweite: '-0.028em', headlineZeilenhoehe: 1.06, displayFaktor: 0.94, textGroesse: '1.0625rem' },
    layouts: {
      hero: 'split', zielgruppen: 'karten', leistungen: 'liste', ablauf: 'zeitleiste', kennzahlen: 'reihe',
      spezialisierungen: 'raster', team: 'portraits', fristen: 'kompakt', stimmen: 'zitat', karriere: 'band',
      wissen: 'karten', faq: 'zweispaltig', cta: 'karte', check: 'karte', kanzlei: 'bild', vertrauen: 'reihe',
    },
  },
};

/** Radien je Stufe (sm = Badges/Inputs, md = Buttons, lg = Karten, xl = große Bilder). */
export const RADIEN: Record<Radius, { sm: string; md: string; lg: string; xl: string; btn: string }> = {
  eckig: { sm: '2px', md: '3px', lg: '4px', xl: '4px', btn: '3px' },
  dezent: { sm: '4px', md: '6px', lg: '10px', xl: '14px', btn: '6px' },
  weich: { sm: '6px', md: '10px', lg: '18px', xl: '24px', btn: '999px' },
  rund: { sm: '8px', md: '14px', lg: '24px', xl: '32px', btn: '999px' },
};

/** Multiplikatoren für Bewegung: Distanz, Dauer, Stagger. */
export const BEWEGUNG: Record<Intensitaet, { distanz: number; dauer: number; stagger: number; parallax: boolean; magnet: boolean; cursor: boolean }> = {
  dezent: { distanz: 0.5, dauer: 0.85, stagger: 0.6, parallax: false, magnet: false, cursor: false },
  standard: { distanz: 1, dauer: 1, stagger: 1, parallax: true, magnet: true, cursor: true },
  ausdrucksstark: { distanz: 1.6, dauer: 1.15, stagger: 1.25, parallax: true, magnet: true, cursor: true },
};
