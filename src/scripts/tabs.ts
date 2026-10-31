/**
 * Barrierefreie Tabs (WAI-ARIA Authoring Practices): Pfeiltasten, Pos1/Ende,
 * Roving Tabindex, automatische Aktivierung.
 */
export default function tabs(root: HTMLElement, signal: AbortSignal) {
  const liste = root.querySelector<HTMLElement>('[role="tablist"]');
  if (!liste) return;
  const reiter = [...liste.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = reiter.map((r) => document.getElementById(r.getAttribute('aria-controls') ?? ''));

  const waehle = (i: number, fokus = false) => {
    reiter.forEach((r, j) => {
      const an = i === j;
      r.setAttribute('aria-selected', String(an));
      r.tabIndex = an ? 0 : -1;
      if (panels[j]) panels[j]!.hidden = !an;
    });
    if (fokus) reiter[i].focus();
    reiter[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    document.dispatchEvent(new CustomEvent('inhalt:geaendert'));
  };
  waehle(Math.max(0, reiter.findIndex((r) => r.getAttribute('aria-selected') === 'true')));

  reiter.forEach((r, i) => r.addEventListener('click', () => waehle(i), { signal }));
  liste.addEventListener(
    'keydown',
    (e) => {
      const i = reiter.indexOf(document.activeElement as HTMLButtonElement);
      if (i < 0) return;
      const ziel = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: reiter.length - 1 }[e.key];
      if (ziel === undefined) return;
      e.preventDefault();
      waehle((ziel + reiter.length) % reiter.length, true);
    },
    { signal },
  );
}
