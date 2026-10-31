/** Animiertes Hochzählen eines Ergebnisses (ohne GSAP, für Rechner). */
const laufend = new WeakMap<HTMLElement, number>();

export function zaehleAuf(el: HTMLElement, ziel: number, format: (n: number) => string, dauer = 700) {
  const reduziert = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = Number(el.dataset.wert ?? 0);
  el.dataset.wert = String(ziel);
  cancelAnimationFrame(laufend.get(el) ?? 0);
  if (reduziert || start === ziel) {
    el.textContent = format(ziel);
    return;
  }
  const t0 = performance.now();
  const schritt = (t: number) => {
    const p = Math.min(1, (t - t0) / dauer);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = format(start + (ziel - start) * e);
    if (p < 1) laufend.set(el, requestAnimationFrame(schritt));
  };
  laufend.set(el, requestAnimationFrame(schritt));
}

export const euroFmt = (n: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n));
export const zahlFmt = (n: number, nk = 0) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: nk, maximumFractionDigits: nk }).format(n);
