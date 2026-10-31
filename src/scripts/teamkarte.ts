/** Tipp-Detail für Teamkarten auf Touch-Geräten (Hover-Ersatz). */
export default function teamkarte(karte: HTMLElement, signal: AbortSignal) {
  const knopf = karte.querySelector<HTMLButtonElement>('.tk-knopf');
  if (!knopf) return;
  knopf.addEventListener(
    'click',
    () => {
      const offen = !karte.hasAttribute('data-offen');
      karte.toggleAttribute('data-offen', offen);
      knopf.setAttribute('aria-expanded', String(offen));
    },
    { signal },
  );
  karte.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && karte.hasAttribute('data-offen')) {
        karte.removeAttribute('data-offen');
        knopf.setAttribute('aria-expanded', 'false');
        knopf.focus();
      }
    },
    { signal },
  );
}
