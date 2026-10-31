/**
 * Geteilter Scroll-Zustand: Die Animations-Engine legt hier ihre Lenis-Instanz ab,
 * Menü und Dialoge sperren/entsperren das Scrollen darüber.
 */
import type Lenis from 'lenis';

let sperren = 0;

export const scroll = {
  lenis: null as Lenis | null,
  sperren() {
    sperren++;
    scroll.lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
  },
  freigeben(alles = false) {
    sperren = alles ? 0 : Math.max(0, sperren - 1);
    if (sperren > 0) return;
    scroll.lenis?.start();
    document.documentElement.style.overflow = '';
  },
};
