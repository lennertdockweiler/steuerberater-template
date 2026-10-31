/**
 * Nutzen-Rechner der Pitch-Seite. Alle Annahmen sind sichtbare Eingabefelder;
 * das Skript rechnet nur und zählt die Ergebnisse animiert hoch.
 */
import { zaehleAuf, euroFmt, zahlFmt } from './zaehlen';
import { koppeln } from './regler';

const wert = (root: HTMLElement, name: string) =>
  Math.max(0, Number((root.querySelector<HTMLInputElement>(`input[type="number"][name="${name}"]`)?.value ?? '0').replace(',', '.')) || 0);
const setze = (root: HTMLElement, key: string, n: number, fmt: (n: number) => string) => {
  const el = root.querySelector<HTMLElement>(`[data-aus="${key}"]`);
  if (el) zaehleAuf(el, n, fmt);
};

function zeit(root: HTMLElement) {
  const minutenJahr = wert(root, 'anrufe') * (wert(root, 'routine') / 100) * (wert(root, 'website') / 100) * wert(root, 'minuten') * wert(root, 'wochen');
  const stunden = minutenJahr / 60;
  setze(root, 'stunden', stunden, (n) => zahlFmt(Math.round(n)));
  setze(root, 'tage', stunden / 8, (n) => zahlFmt(n, 1));
  setze(root, 'euro', stunden * wert(root, 'satz'), euroFmt);
}

function stelle(root: HTMLElement) {
  const deckung = (Math.max(0, wert(root, 'umsatz') - wert(root, 'kosten')) / 12) * wert(root, 'monate');
  const provision = wert(root, 'gehalt') * (wert(root, 'provision') / 100);
  setze(root, 'deckung', deckung, euroFmt);
  setze(root, 'provision', provision, euroFmt);
  setze(root, 'gesamt', deckung + provision, euroFmt);
}

export default function pitchRechner(root: HTMLElement, signal: AbortSignal) {
  const f = root.dataset.pitchRechner === 'stelle' ? stelle : zeit;
  koppeln(root, signal, () => f(root));
  f(root);
}
