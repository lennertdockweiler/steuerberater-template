/**
 * Mini-Rechner: Kleinunternehmer-Check, Entfernungspauschale, Homeoffice-Pauschale.
 * Alle Werte kommen aus src/data/steuerwerte.ts (keine Zahlen hier im Code).
 */
import { STEUERWERTE as W } from '../data/steuerwerte';
import { zaehleAuf, euroFmt, zahlFmt } from './zaehlen';
import { rt } from '../data/rechner-texte';
import { koppeln } from './regler';

const num = (el: HTMLInputElement | null) => Math.max(0, Number(el?.value.replace(',', '.') ?? 0) || 0);

function kleinunternehmer(root: HTMLElement) {
  const k = W.kleinunternehmer;
  const vorjahr = num(root.querySelector('[name="vorjahr"]'));
  const laufend = num(root.querySelector('[name="laufend"]'));
  const gruendung = root.querySelector<HTMLInputElement>('[name="gruendung"]')?.checked ?? false;
  const status = root.querySelector<HTMLElement>('[data-ergebnis-status]');
  const text = root.querySelector<HTMLElement>('[data-ergebnis-text]');
  const vorjahrFeld = root.querySelector<HTMLElement>('[data-nur-bestand]');
  if (vorjahrFeld) vorjahrFeld.hidden = gruendung;
  let ok: boolean;
  let msg: string;
  if (gruendung) {
    ok = laufend <= k.grenzeGruendungsjahr;
    msg = ok
      ? rt('kuGruendungOk', { umsatz: euroFmt(laufend), grenze: euroFmt(k.grenzeGruendungsjahr) })
      : rt('kuGruendungUeber', { grenze: euroFmt(k.grenzeGruendungsjahr) });
  } else if (vorjahr > k.grenzeVorjahr) {
    ok = false;
    msg = rt('kuVorjahrUeber', { grenze: euroFmt(k.grenzeVorjahr) });
  } else if (laufend > k.grenzeLaufendesJahr) {
    ok = false;
    msg = rt('kuLaufendUeber', { grenze: euroFmt(k.grenzeLaufendesJahr) });
  } else {
    ok = true;
    msg = rt('kuOk', { grenzeVorjahr: euroFmt(k.grenzeVorjahr), grenzeLaufend: euroFmt(k.grenzeLaufendesJahr) });
  }
  if (status) {
    status.textContent = ok ? rt('kuMoeglich') : rt('kuNichtMoeglich');
    status.dataset.ok = String(ok);
  }
  if (text) text.textContent = msg;
  const balken = root.querySelector<HTMLElement>('[data-grenze-balken]');
  const grenze = gruendung ? k.grenzeGruendungsjahr : k.grenzeLaufendesJahr;
  balken?.style.setProperty('--anteil', String(Math.min(1, laufend / grenze)));
  balken?.toggleAttribute('data-ueber', laufend > grenze);
}

function pendler(root: HTMLElement) {
  const ep = W.entfernungspauschale;
  const jahr = Number(root.querySelector<HTMLSelectElement>('[name="jahr"]')?.value ?? Object.keys(ep.jahre).at(-1));
  const satz = ep.jahre[jahr] ?? ep.jahre[Number(Object.keys(ep.jahre).at(-1))];
  const km = Math.floor(num(root.querySelector('[name="km"]')));
  const tage = Math.floor(num(root.querySelector('[name="tage"]')));
  const pkw = root.querySelector<HTMLInputElement>('[name="pkw"]')?.checked ?? true;
  const proTag = Math.min(km, 20) * satz.bis20km + Math.max(0, km - 20) * satz.ab21km;
  let summe = proTag * tage;
  const gedeckelt = !pkw && summe > ep.hoechstbetragOhnePkw;
  if (gedeckelt) summe = ep.hoechstbetragOhnePkw;
  const el = root.querySelector<HTMLElement>('[data-ergebnis-betrag]');
  if (el) zaehleAuf(el, summe, euroFmt);
  const hinweis = root.querySelector<HTMLElement>('[data-ergebnis-text]');
  const pb = W.arbeitnehmerPauschbetrag.betrag;
  if (hinweis)
    hinweis.textContent =
      (gedeckelt ? rt('pendlerGedeckelt', { hoechst: euroFmt(ep.hoechstbetragOhnePkw) }) : '') +
      (summe > pb ? rt('pendlerUeberPb', { pb: euroFmt(pb) }) : rt('pendlerUnterPb', { pb: euroFmt(pb) }));
  const proTagEl = root.querySelector<HTMLElement>('[data-pro-tag]');
  if (proTagEl) proTagEl.textContent = rt('pendlerProTag', { betrag: `${zahlFmt(proTag, 2)}\u00A0€` });
}

function homeoffice(root: HTMLElement) {
  const h = W.homeoffice;
  const tage = Math.floor(num(root.querySelector('[name="tage"]')));
  const anrechenbar = Math.min(tage, h.maxTage);
  const summe = Math.min(anrechenbar * h.proTag, h.maxBetrag);
  const el = root.querySelector<HTMLElement>('[data-ergebnis-betrag]');
  if (el) zaehleAuf(el, summe, euroFmt);
  const t = root.querySelector<HTMLElement>('[data-ergebnis-text]');
  if (t)
    t.textContent =
      tage > h.maxTage ? rt('hoMax', { tage: h.maxTage, max: euroFmt(h.maxBetrag) }) : rt('hoNormal', { tage: anrechenbar, satz: euroFmt(h.proTag) });
  const balken = root.querySelector<HTMLElement>('[data-grenze-balken]');
  balken?.style.setProperty('--anteil', String(Math.min(1, summe / h.maxBetrag)));
}

const RECHNER: Record<string, (root: HTMLElement) => void> = { kleinunternehmer, pendler, homeoffice };

export default function rechner(root: HTMLElement, signal: AbortSignal) {
  const art = root.dataset.rechner ?? '';
  const f = RECHNER[art];
  if (!f) return;
  const neu = () => f(root);
  koppeln(root, signal, neu);
  root.querySelector('form')?.addEventListener('submit', (e) => e.preventDefault(), { signal });
  neu();
}
