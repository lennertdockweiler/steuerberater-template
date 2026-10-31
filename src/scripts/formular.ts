/**
 * Formulare: Validierung mit verständlichen Fehlermeldungen (aria-live, nicht nur Farbe),
 * Honeypot gegen Spam, Ladezustand, animierter Erfolg.
 * Ohne formularEndpoint (Demo-Modus) wird der Versand simuliert.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function formular(el: HTMLElement, signal: AbortSignal) {
  const form = el as HTMLFormElement;
  form.noValidate = true;
  const d = form.dataset;
  const knopf = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const zusammenfassung = form.querySelector<HTMLElement>('[data-zusammenfassung]');
  const erfolg = form.parentElement?.querySelector<HTMLElement>('[data-erfolg]');
  let versucht = false;

  // Anliegen aus dem Mandanten-Check übernehmen (?anliegen=…)
  const anliegen = new URLSearchParams(location.search).get('anliegen');
  const nachricht = form.querySelector<HTMLTextAreaElement>('textarea[name="nachricht"]');
  if (anliegen && nachricht && !nachricht.value) nachricht.value = anliegen.slice(0, 500);

  const felder = () => [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select')].filter((f) => !f.closest('.honigtopf') && f.type !== 'hidden');

  const pruefe = (f: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string => {
    const wert = f.value.trim();
    if (f instanceof HTMLInputElement && f.type === 'checkbox') return f.required && !f.checked ? d.fehlerPflicht! : '';
    if (f.required && !wert) return d.fehlerPflicht!;
    if (wert && f.type === 'email' && !EMAIL.test(wert)) return d.fehlerEmail!;
    if (wert && f.type === 'tel' && wert.replace(/\D/g, '').length < 6) return d.fehlerTelefon!;
    return '';
  };

  const zeige = (f: HTMLElement & { id: string }, fehler: string) => {
    const box = form.querySelector<HTMLElement>(`#${CSS.escape(f.id)}-fehler`);
    f.setAttribute('aria-invalid', String(!!fehler));
    if (box) box.textContent = fehler;
  };

  felder().forEach((f) => {
    f.addEventListener('blur', () => versucht && zeige(f, pruefe(f)), { signal });
    f.addEventListener('input', () => f.getAttribute('aria-invalid') === 'true' && zeige(f, pruefe(f)), { signal });
  });

  form.addEventListener(
    'submit',
    async (e) => {
      e.preventDefault();
      versucht = true;
      const fehlerhaft = felder().filter((f) => {
        const fehler = pruefe(f);
        zeige(f, fehler);
        return !!fehler;
      });
      if (fehlerhaft.length) {
        if (zusammenfassung) zusammenfassung.textContent = (d.fehlerZusammenfassung ?? '').replace('{anzahl}', String(fehlerhaft.length));
        fehlerhaft[0].focus();
        return;
      }
      if (zusammenfassung) zusammenfassung.textContent = '';
      knopf?.setAttribute('data-zustand', 'laedt');
      knopf?.setAttribute('aria-disabled', 'true');
      form.setAttribute('aria-busy', 'true');

      const honig = form.querySelector<HTMLInputElement>('.honigtopf input');
      let ok = true;
      if (honig?.value) {
        await new Promise((r) => setTimeout(r, 600)); // Bot: still „erfolgreich“
      } else if (!d.endpoint) {
        await new Promise((r) => setTimeout(r, 900)); // Demo-Modus
      } else {
        try {
          const res = await fetch(d.endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
          ok = res.ok;
        } catch {
          ok = false;
        }
      }
      knopf?.removeAttribute('data-zustand');
      knopf?.removeAttribute('aria-disabled');
      form.removeAttribute('aria-busy');
      if (signal.aborted) return;
      if (!ok) {
        if (zusammenfassung) zusammenfassung.textContent = d.fehlerSenden ?? '';
        return;
      }
      form.dispatchEvent(new CustomEvent('formular:gesendet', { bubbles: true, detail: Object.fromEntries(new FormData(form)) }));
      if (erfolg) {
        form.hidden = true;
        erfolg.hidden = false;
        erfolg.querySelector<HTMLElement>('[tabindex="-1"]')?.focus();
        document.dispatchEvent(new CustomEvent('inhalt:geaendert'));
      }
    },
    { signal },
  );
}
