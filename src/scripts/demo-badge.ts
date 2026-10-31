/** Demo-Badge: aufklappbar, für die Sitzung ausblendbar. */
export function initDemoBadge(signal: AbortSignal) {
  const badge = document.querySelector<HTMLElement>('[data-demo-badge]');
  if (!badge) return;
  try {
    if (sessionStorage.getItem('demo-badge-weg') === '1') {
      badge.hidden = true;
      return;
    }
  } catch {
    /* Speicher nicht verfügbar */
  }
  const knopf = badge.querySelector<HTMLButtonElement>('.demo-knopf');
  const details = badge.querySelector<HTMLElement>('.demo-details');
  if (!knopf || !details) return;
  const setze = (offen: boolean) => {
    knopf.setAttribute('aria-expanded', String(offen));
    details.hidden = !offen;
  };
  knopf.addEventListener('click', () => setze(Boolean(details.hidden)), { signal });
  badge.addEventListener('keydown', (e) => e.key === 'Escape' && (setze(false), knopf.focus()), { signal });
  document.addEventListener('click', (e) => !badge.contains(e.target as Node) && setze(false), { signal });
  badge.querySelector('[data-demo-weg]')?.addEventListener(
    'click',
    () => {
      badge.hidden = true;
      try {
        sessionStorage.setItem('demo-badge-weg', '1');
      } catch {
        /* egal */
      }
    },
    { signal },
  );
}
