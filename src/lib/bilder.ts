/**
 * Bilder der aktiven Variante. Per import.meta.glob werden alle Dateien aus
 * variants/<slug>/assets/ für astro:assets verfügbar (AVIF/WebP, srcset).
 * Geladen wird lazy, sodass nur Bilder der aktiven Variante im Build landen.
 */
import type { ImageMetadata } from 'astro';
import { VARIANT } from './config';

const dateien = import.meta.glob<{ default: ImageMetadata }>('/variants/*/assets/**/*.{jpg,jpeg,png,webp,avif,svg,JPG,JPEG,PNG,WEBP}');

const schluessel = (datei: string) => `/variants/${VARIANT}/assets/${datei.replace(/^\.?\/+/, '')}`;

export const bildExistiert = (datei?: string) => !!datei && schluessel(datei) in dateien;

/** Lädt ein Bild; `null`, wenn die Datei fehlt (dann zeigt <Foto> einen Platzhalter). */
export async function ladeBild(datei?: string): Promise<ImageMetadata | null> {
  if (!datei) return null;
  const loader = dateien[schluessel(datei)];
  if (!loader) {
    console.warn(`\x1b[33m⚠ Bild fehlt: variants/${VARIANT}/assets/${datei} (Platzhalter wird angezeigt)\x1b[0m`);
    return null;
  }
  return (await loader()).default;
}

/**
 * Bildqualität für alle Formate (Astro kennt nur einen Wert pro <Picture>).
 * 50 ergibt bei AVIF etwa JPEG-80-Niveau bei halber Dateigröße gegenüber 72;
 * WebP/JPEG sind nur Rückfallformate. Muss im LCP-Preload identisch sein.
 */
export const BILD_QUALITAET = 50;

/** Zielhöhe für einen Zuschnitt auf das Seitenverhältnis „a / b“ (Astro schneidet beim Build mittig zu). */
export const zuschnittHoehe = (img: ImageMetadata, ratio: string) => {
  const [a, b] = ratio.split('/').map((x) => Number(x.trim()));
  return Math.round((img.width * b) / a);
};

/** Breiten für srcset (identisch in <Foto> und im LCP-Preload). */
export const breitenFuer = (img: ImageMetadata) => {
  const b = [360, 540, 720, 960, 1280, 1600, 2000].filter((w) => w <= img.width);
  return b.length ? b : [img.width];
};
