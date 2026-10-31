/**
 * Einstiegspunkt aller Client-Skripte.
 *
 * Lebenszyklus mit Astro View Transitions:
 *  - astro:page-load  → alle Module für die aktuelle Seite starten
 *  - astro:before-swap → alles aufräumen (Listener via AbortController,
 *    GSAP-Kontexte, ScrollTrigger, Lenis, Observer), damit nichts doppelt läuft
 *
 * Seitenabhängige Module werden nur geladen, wenn ihr Selektor auf der Seite vorkommt.
 */
import { initHeader } from './header';
import { initMenu } from './menu';
import { initDemoBadge } from './demo-badge';
import { scroll } from './scroll';

type Aufraeumen = () => void;
type Mount = (el: HTMLElement, signal: AbortSignal) => void | Aufraeumen;
type Modul = { sel: string; laden: () => Promise<{ default: Mount }> };

const MODULE: Modul[] = [
  { sel: '[data-tabs]', laden: () => import('./tabs') },
  { sel: '[data-akkordeon]', laden: () => import('./akkordeon') },
  { sel: '[data-fristen]', laden: () => import('./fristen-widget') },
  { sel: '[data-rechner]', laden: () => import('./rechner') },
  { sel: '[data-checkliste]', laden: () => import('./checkliste') },
  { sel: '[data-suche]', laden: () => import('./wissen-suche') },
  { sel: '[data-formular]', laden: () => import('./formular') },
  { sel: '[data-zwei-klick]', laden: () => import('./zwei-klick') },
  { sel: '[data-toc]', laden: () => import('./toc') },
  { sel: '[data-teamkarte]', laden: () => import('./teamkarte') },
  { sel: '[data-zitate]', laden: () => import('./zitate') },
  { sel: '[data-pitch-rechner]', laden: () => import('./pitch-rechner') },
];

let aufraeumen: Aufraeumen[] = [];
let controller: AbortController | null = null;

function start() {
  stop();
  controller = new AbortController();
  const { signal } = controller;
  const merke = (c: void | Aufraeumen) => c && aufraeumen.push(c);

  merke(initHeader(signal));
  merke(initMenu(signal));
  merke(initDemoBadge(signal));

  for (const m of MODULE) {
    const elemente = document.querySelectorAll<HTMLElement>(m.sel);
    if (!elemente.length) continue;
    m.laden()
      .then((mod) => {
        if (signal.aborted) return;
        elemente.forEach((el) => merke(mod.default(el, signal)));
      })
      .catch((e) => console.error(`Modul ${m.sel}:`, e));
  }

  // Sicherheitsnetz: Starten die Animationen nicht, werden Inhalte nach 3 s sichtbar.
  const notfall = window.setTimeout(() => document.documentElement.classList.add('anim-aus'), 3000);
  import('../lib/animations')
    .then(async (anim) => {
      if (signal.aborted) return;
      const c = await anim.starteAnimationen(signal);
      window.clearTimeout(notfall);
      if (signal.aborted) c();
      else aufraeumen.push(c);
    })
    .catch((e) => {
      console.error('Animationen:', e);
      document.documentElement.classList.add('anim-aus');
    });
  aufraeumen.push(() => window.clearTimeout(notfall));
}

function stop() {
  controller?.abort();
  controller = null;
  for (const f of aufraeumen.splice(0)) {
    try {
      f();
    } catch (e) {
      console.error(e);
    }
  }
  scroll.freigeben(true);
}

document.addEventListener('astro:page-load', start);
document.addEventListener('astro:before-swap', stop);
// Astro übernimmt beim Seitenwechsel die <html>-Attribute der neuen Seite (class="no-js").
document.addEventListener('astro:after-swap', () => {
  document.documentElement.classList.replace('no-js', 'js');
  document.documentElement.classList.remove('anim-aus');
});

// Service Worker (nur im Produktions-Build): Demo funktioniert danach auch bei schlechtem Netz.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {}), { once: true });
}
