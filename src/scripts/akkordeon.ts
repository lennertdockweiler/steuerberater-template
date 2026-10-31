/** Nach dem Auf-/Zuklappen müssen ScrollTrigger-Positionen neu gemessen werden. */
export default function akkordeon(root: HTMLElement, signal: AbortSignal) {
  root.addEventListener('toggle', () => document.dispatchEvent(new CustomEvent('inhalt:geaendert')), { capture: true, signal });
}
