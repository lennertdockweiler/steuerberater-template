/**
 * Abhakbare Checklisten. Der Stand wird nur lokal im Browser gespeichert
 * (localStorage), ist ohne Speicher aber trotzdem bedienbar.
 */
export default function checkliste(root: HTMLElement, signal: AbortSignal) {
  const schluessel = `checkliste:${document.body.dataset.variante}:${root.dataset.checkliste}`;
  const boxen = [...root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
  const anzeige = root.querySelector<HTMLElement>('[data-fortschritt-text]');
  const balken = root.querySelector<HTMLElement>('[data-fortschritt-balken]');
  const vorlage = anzeige?.dataset.vorlage ?? '{erledigt} von {gesamt}';

  const lesen = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(schluessel) ?? '[]');
    } catch {
      return [];
    }
  };
  const schreiben = () => {
    try {
      localStorage.setItem(schluessel, JSON.stringify(boxen.filter((b) => b.checked).map((b) => b.value)));
    } catch {
      /* privat-Modus: kein Speichern */
    }
  };
  const aktualisieren = () => {
    const n = boxen.filter((b) => b.checked).length;
    if (anzeige) anzeige.textContent = vorlage.replace('{erledigt}', String(n)).replace('{gesamt}', String(boxen.length));
    balken?.style.setProperty('--anteil', String(boxen.length ? n / boxen.length : 0));
    root.toggleAttribute('data-fertig', n === boxen.length && n > 0);
  };
  const gespeichert = new Set(lesen());
  boxen.forEach((b) => (b.checked = gespeichert.has(b.value)));
  aktualisieren();
  boxen.forEach((b) => b.addEventListener('change', () => (schreiben(), aktualisieren()), { signal }));
  root.querySelector('[data-zuruecksetzen]')?.addEventListener('click', () => {
    boxen.forEach((b) => (b.checked = false));
    schreiben();
    aktualisieren();
  }, { signal });
  root.querySelector('[data-drucken]')?.addEventListener('click', () => {
    document.querySelectorAll<HTMLElement>('[data-checkliste]').forEach((c) => c.toggleAttribute('data-druck', c === root));
    window.print();
  }, { signal });
}
