/**
 * Header-Verhalten: kompakt ab 24 px, versteckt beim Runterscrollen, sichtbar
 * beim Hochscrollen. Dropdown-Navigation per Klick, Tastatur und (bei Maus) Hover.
 */
export function initHeader(signal: AbortSignal) {
  const kopf = document.querySelector<HTMLElement>('[data-header]');
  if (!kopf) return;
  let letzte = window.scrollY;
  let geplant = false;

  const aktualisieren = () => {
    geplant = false;
    const y = Math.max(0, window.scrollY);
    kopf.toggleAttribute('data-kompakt', y > 24);
    const offenesDropdown = kopf.querySelector('[aria-expanded="true"]');
    const fokusDrin = kopf.contains(document.activeElement) && document.activeElement !== document.body;
    if (y > letzte + 6 && y > 220 && !offenesDropdown && !fokusDrin) kopf.setAttribute('data-versteckt', '');
    else if (y < letzte - 6 || y < 220) kopf.removeAttribute('data-versteckt');
    letzte = y;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!geplant) {
        geplant = true;
        requestAnimationFrame(aktualisieren);
      }
    },
    { passive: true, signal },
  );
  kopf.addEventListener('focusin', () => kopf.removeAttribute('data-versteckt'), { signal });
  aktualisieren();

  // ── Dropdowns ──
  const feinerZeiger = matchMedia('(pointer: fine)').matches;
  kopf.querySelectorAll<HTMLElement>('[data-dropdown]').forEach((li) => {
    const knopf = li.querySelector<HTMLButtonElement>('.kopf-toggle');
    const panel = li.querySelector<HTMLElement>('.kopf-dropdown');
    if (!knopf || !panel) return;
    let timer = 0;
    const setze = (offen: boolean) => {
      knopf.setAttribute('aria-expanded', String(offen));
      panel.hidden = !offen;
    };
    knopf.addEventListener('click', () => setze(knopf.getAttribute('aria-expanded') !== 'true'), { signal });
    li.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && !panel.hidden) {
          setze(false);
          knopf.focus();
        }
      },
      { signal },
    );
    li.addEventListener('focusout', (e) => !li.contains(e.relatedTarget as Node) && setze(false), { signal });
    if (feinerZeiger) {
      li.addEventListener('pointerenter', () => {
        clearTimeout(timer);
        timer = window.setTimeout(() => setze(true), 90);
      }, { signal });
      li.addEventListener('pointerleave', () => {
        clearTimeout(timer);
        timer = window.setTimeout(() => setze(false), 220);
      }, { signal });
    }
    document.addEventListener('click', (e) => !li.contains(e.target as Node) && setze(false), { signal });
  });
}
