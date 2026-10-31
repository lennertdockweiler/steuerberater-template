/** Clientseitige Suche + Kategorie-Filter für den Wissensbereich. */
export default function wissenSuche(root: HTMLElement, signal: AbortSignal) {
  const feld = root.querySelector<HTMLInputElement>('input[type="search"]');
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-kategorie-filter]')];
  const eintraege = [...root.querySelectorAll<HTMLElement>('[data-suchtext]')];
  const zaehler = root.querySelector<HTMLElement>('[data-treffer]');
  const leer = root.querySelector<HTMLElement>('[data-keine-treffer]');
  const vorlage = zaehler?.dataset.vorlage ?? '{anzahl}';
  let kategorie = 'alle';

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');
  const filtern = () => {
    const woerter = norm(feld?.value ?? '').split(/\s+/).filter(Boolean);
    let n = 0;
    for (const e of eintraege) {
      const text = norm(e.dataset.suchtext ?? '');
      const passt = (kategorie === 'alle' || e.dataset.kategorie === kategorie) && woerter.every((w) => text.includes(w));
      e.hidden = !passt;
      if (passt) n++;
    }
    if (zaehler) zaehler.textContent = vorlage.replace('{anzahl}', String(n));
    if (leer) leer.hidden = n > 0;
    document.dispatchEvent(new CustomEvent('inhalt:geaendert'));
  };
  feld?.addEventListener('input', filtern, { signal });
  chips.forEach((c) =>
    c.addEventListener('click', () => {
      kategorie = c.dataset.kategorieFilter ?? 'alle';
      chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
      filtern();
    }, { signal }),
  );
  root.querySelector('form')?.addEventListener('submit', (e) => e.preventDefault(), { signal });
}
