/**
 * Koppelt Schieberegler und Zahlenfelder mit gleichem data-koppel und färbt
 * die Reglerspur. Ruft `neu()` bei jeder Änderung auf.
 */
const fuellen = (r: HTMLInputElement) =>
  r.style.setProperty('--fuellung', `${((Number(r.value) - Number(r.min)) / (Number(r.max) - Number(r.min) || 1)) * 100}%`);

export function koppeln(root: HTMLElement, signal: AbortSignal, neu: () => void) {
  root.querySelectorAll<HTMLInputElement>('input[type="range"][data-koppel]').forEach((regler) => {
    const feld = root.querySelector<HTMLInputElement>(`input[type="number"][data-koppel="${regler.dataset.koppel}"]`);
    fuellen(regler);
    regler.addEventListener(
      'input',
      () => {
        if (feld) feld.value = regler.value;
        fuellen(regler);
        neu();
      },
      { signal },
    );
    feld?.addEventListener(
      'input',
      () => {
        regler.value = feld.value;
        fuellen(regler);
        neu();
      },
      { signal },
    );
  });
  root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('select, input[type="checkbox"], input[type="radio"]').forEach((el) =>
    el.addEventListener('change', neu, { signal }),
  );
}
