/**
 * Zwei-Klick-Lösung für Karten und externe Einbettungen: Erst nach aktiver
 * Zustimmung wird das iframe geladen (vorher keine Verbindung zum Anbieter).
 */
export default function zweiKlick(root: HTMLElement, signal: AbortSignal) {
  const knopf = root.querySelector<HTMLButtonElement>('[data-laden]');
  knopf?.addEventListener(
    'click',
    () => {
      const iframe = document.createElement('iframe');
      iframe.src = root.dataset.zweiKlick ?? '';
      iframe.title = root.dataset.titel ?? '';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.className = 'zk-frame';
      root.querySelector('[data-vorschau]')?.replaceWith(iframe);
      root.setAttribute('data-geladen', '');
      iframe.focus();
    },
    { signal, once: true },
  );
}
