/** Einzelzitat-Wechsler mit Vor/Zurück und Pfeiltasten. */
export default function zitate(root: HTMLElement, signal: AbortSignal) {
  const items = [...root.querySelectorAll<HTMLElement>('[data-zitat]')];
  const anzeige = root.querySelector<HTMLElement>('[data-aktuell]');
  if (items.length < 2) return;
  let i = 0;
  const zeige = (n: number) => {
    i = (n + items.length) % items.length;
    items.forEach((el, j) => (el.hidden = j !== i));
    if (anzeige) anzeige.textContent = String(i + 1);
  };
  root.querySelector('[data-vor]')?.addEventListener('click', () => zeige(i + 1), { signal });
  root.querySelector('[data-zurueck]')?.addEventListener('click', () => zeige(i - 1), { signal });
  root.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'ArrowRight') zeige(i + 1);
      if (e.key === 'ArrowLeft') zeige(i - 1);
    },
    { signal },
  );
}
