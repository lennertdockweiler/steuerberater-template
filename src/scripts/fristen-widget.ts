/**
 * Steuertermine im Browser neu berechnen (heutiges Datum) und filtern.
 */
import { erzeugeFristen, filtereFristen, heuteIso, plusMonateIso, type FristenEingabe } from '../lib/fristen';
import { fristenHtml, type FristTexte } from '../lib/fristen-html';

type Daten = { eingabe: FristenEingabe; texte: FristTexte; anzahl: number; layout: 'kalender' | 'kompakt' | 'tabelle'; monate: number };

export default function fristenWidget(root: HTMLElement, signal: AbortSignal) {
  const daten = JSON.parse(root.dataset.fristen ?? '{}') as Daten;
  const liste = root.querySelector<HTMLElement>('.fr-liste');
  if (!liste) return;
  const heute = heuteIso();
  const alle = erzeugeFristen(daten.eingabe, heute, plusMonateIso(heute, daten.monate));
  let filter: 'alle' | 'unternehmen' | 'privat' = 'alle';

  const zeichnen = () => {
    liste.innerHTML = fristenHtml(filtereFristen(alle, filter).slice(0, daten.anzahl), heute, daten.layout, daten.texte);
    document.dispatchEvent(new CustomEvent('inhalt:geaendert'));
  };
  zeichnen();

  root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((knopf) =>
    knopf.addEventListener(
      'click',
      () => {
        filter = knopf.dataset.filter as typeof filter;
        root.querySelectorAll('[data-filter]').forEach((k) => k.setAttribute('aria-pressed', String(k === knopf)));
        zeichnen();
      },
      { signal },
    ),
  );
}
