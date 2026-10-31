/**
 * Vollbild-Mobilmenü: gestaffelte Menüpunkte (CSS), Fokusfalle, Escape schließt,
 * Hintergrund wird inert, Scrollen (inkl. Lenis) gesperrt.
 */
import { scroll } from './scroll';

const FOKUSSIERBAR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initMenu(signal: AbortSignal) {
  const menue = document.querySelector<HTMLElement>('[data-menu]');
  const oeffner = document.querySelector<HTMLButtonElement>('[data-menu-oeffnen]');
  if (!menue || !oeffner) return;
  const schliesser = menue.querySelector<HTMLButtonElement>('[data-menu-schliessen]');
  const hintergrund = () => [...document.querySelectorAll<HTMLElement>('body > *:not([data-menu]):not(script)')];
  let offen = false;

  const oeffnen = () => {
    if (offen) return;
    offen = true;
    menue.hidden = false;
    void menue.offsetHeight; // Reflow, damit die Übergänge starten
    menue.setAttribute('data-offen', '');
    oeffner.setAttribute('aria-expanded', 'true');
    hintergrund().forEach((el) => (el.inert = true));
    scroll.sperren();
    (menue.querySelector<HTMLElement>('.menue-nav a') ?? schliesser)?.focus({ preventScroll: true });
  };
  const schliessen = (fokusZurueck = true) => {
    if (!offen) return;
    offen = false;
    menue.removeAttribute('data-offen');
    oeffner.setAttribute('aria-expanded', 'false');
    hintergrund().forEach((el) => (el.inert = false));
    scroll.freigeben();
    const reduziert = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => !offen && (menue.hidden = true), reduziert ? 0 : 560);
    if (fokusZurueck) oeffner.focus({ preventScroll: true });
  };

  oeffner.addEventListener('click', oeffnen, { signal });
  schliesser?.addEventListener('click', () => schliessen(), { signal });
  menue.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape') return schliessen();
      if (e.key !== 'Tab') return;
      const f = [...menue.querySelectorAll<HTMLElement>(FOKUSSIERBAR)];
      const erstes = f[0];
      const letztes = f[f.length - 1];
      if (e.shiftKey && document.activeElement === erstes) {
        e.preventDefault();
        letztes.focus();
      } else if (!e.shiftKey && document.activeElement === letztes) {
        e.preventDefault();
        erstes.focus();
      }
    },
    { signal },
  );
  // Link im Menü angeklickt: Menü schließt, Navigation übernimmt der Router
  menue.addEventListener('click', (e) => (e.target as HTMLElement).closest('a') && schliessen(false), { signal });
  matchMedia('(min-width: 75rem)').addEventListener('change', (e) => e.matches && schliessen(false), { signal });

  return () => {
    if (offen) {
      hintergrund().forEach((el) => (el.inert = false));
      scroll.freigeben();
    }
  };
}
