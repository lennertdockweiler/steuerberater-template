/**
 * Animations-Engine. Wird von src/scripts/app.ts bei jedem astro:page-load gestartet
 * und gibt eine Aufräumfunktion zurück (astro:before-swap).
 *
 * - Lenis-Smooth-Scrolling, gekoppelt mit ScrollTrigger über gsap.ticker
 * - gsap.context + gsap.matchMedia sammeln alle Tweens/ScrollTrigger/SplitTexts,
 *   revert() setzt alles sauber zurück: keine Leaks, keine doppelten Animationen
 * - prefers-reduced-motion: keine Bewegung, kein Lenis (Inhalte sind per CSS sichtbar)
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { scroll } from '../../scripts/scroll';
import { faktoren, DESKTOP } from './einstellungen';
import { reveals, zeilen } from './reveal';
import { zaehler, parallax, magnet, pinStory, horizontal, cursorVorschau, lesefortschritt } from './effekte';

gsap.registerPlugin(ScrollTrigger, SplitText);

export async function starteAnimationen(signal: AbortSignal): Promise<() => void> {
  const html = document.documentElement;
  const reduziert = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const f = faktoren();
  const root = document.querySelector('main') ?? document;

  let lenis: Lenis | null = null;
  const tick = (zeit: number) => lenis?.raf(zeit * 1000);
  if (!reduziert) {
    lenis = new Lenis({ autoRaf: false, anchors: { offset: -96 }, lerp: 0.11, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    scroll.lenis = lenis;
  }

  const ctx = gsap.context(() => {
    if (reduziert) return;
    reveals(root, f);
    zeilen(root, f);
    zaehler(root, f);
    pinStory(root);
    lesefortschritt(root);
  });

  const mm = gsap.matchMedia();
  if (!reduziert) {
    mm.add(DESKTOP, () => {
      if (f.parallax) parallax(root, f);
      if (f.magnet) magnet(document, signal);
      if (f.cursor) cursorVorschau(root, signal);
      return horizontal(root);
    });
  }

  // Inhalte ändern ihre Höhe (Tabs, Akkordeons, Filter) → Positionen neu messen
  document.addEventListener('inhalt:geaendert', () => ScrollTrigger.refresh(), { signal });

  html.dataset.anim = 'bereit';
  // Nach dem Laden der Schriften stimmen Zeilenumbrüche und Höhen → neu messen
  document.fonts?.ready.then(() => !signal.aborted && ScrollTrigger.refresh());

  return () => {
    ctx.revert();
    mm.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
    if (lenis) {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenis = null;
      scroll.lenis = null;
    }
    delete html.dataset.anim;
  };
}
