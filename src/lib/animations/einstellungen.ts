/** Bewegungsfaktoren je Intensität (data-motion am <html>, aus der Config). */
export type Faktoren = { distanz: number; dauer: number; stagger: number; parallax: boolean; magnet: boolean; cursor: boolean };

const TABELLE: Record<string, Faktoren> = {
  dezent: { distanz: 0.5, dauer: 0.85, stagger: 0.6, parallax: false, magnet: false, cursor: false },
  standard: { distanz: 1, dauer: 1, stagger: 1, parallax: true, magnet: true, cursor: true },
  ausdrucksstark: { distanz: 1.6, dauer: 1.15, stagger: 1.25, parallax: true, magnet: true, cursor: true },
};

export const faktoren = (): Faktoren => TABELLE[document.documentElement.dataset.motion ?? 'standard'] ?? TABELLE.standard;

/** Desktop mit Maus: Parallax, Magnet-Buttons, Cursor-Vorschau, gepinnte Horizontal-Galerie */
export const DESKTOP = '(min-width: 64rem) and (pointer: fine)';
