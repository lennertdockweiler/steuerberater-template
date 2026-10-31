/** Inhaltsverzeichnis: markiert den aktuell gelesenen Abschnitt. */
export default function toc(nav: HTMLElement, signal: AbortSignal) {
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const ziele = links.map((l) => document.getElementById(decodeURIComponent(l.hash.slice(1)))).filter(Boolean) as HTMLElement[];
  if (!ziele.length) return;
  const sichtbar = new Map<Element, boolean>();
  const obs = new IntersectionObserver(
    (eintraege) => {
      eintraege.forEach((e) => sichtbar.set(e.target, e.isIntersecting));
      const aktiv = ziele.find((z) => sichtbar.get(z)) ?? null;
      if (!aktiv) return;
      links.forEach((l) => l.toggleAttribute('aria-current', l.hash.slice(1) === aktiv.id));
    },
    { rootMargin: '-15% 0px -70% 0px' },
  );
  ziele.forEach((z) => obs.observe(z));
  signal.addEventListener('abort', () => obs.disconnect());
}
