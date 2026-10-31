/**
 * Weitere Effekte: Zähler, Parallax, Magnet-Buttons, gepinnte Ablauf-Story,
 * Horizontal-Galerie, cursorfolgende Bildvorschau, Lesefortschritt.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Faktoren } from './einstellungen';

const zahlFormat = (n: number, nachkomma: number) =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: nachkomma, maximumFractionDigits: nachkomma }).format(n);

/** Count-up: Server rendert den Endwert (ohne JS korrekt), JS zählt ab 0 hoch. */
export function zaehler(root: ParentNode, f: Faktoren) {
  root.querySelectorAll<HTMLElement>('[data-zaehler]').forEach((el) => {
    const ziel = Number(el.dataset.zaehler);
    const nachkomma = Number(el.dataset.nachkomma ?? 0);
    const obj = { v: 0 };
    el.textContent = zahlFormat(0, nachkomma);
    gsap.to(obj, {
      v: ziel,
      duration: 1.8 * f.dauer,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = zahlFormat(obj.v, nachkomma)),
    });
  });
}

/** Dezente Parallax-Ebenen (nur Desktop, nicht bei „dezent“). */
export function parallax(root: ParentNode, f: Faktoren) {
  root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const staerke = Number(el.dataset.parallax || 8) * f.distanz;
    gsap.fromTo(
      el,
      { yPercent: -staerke / 2 },
      { yPercent: staerke / 2, ease: 'none', scrollTrigger: { trigger: el.closest('.rahmen') ?? el, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });
}

/** Magnetische Buttons (pointer: fine). */
export function magnet(root: ParentNode, signal: AbortSignal) {
  root.querySelectorAll<HTMLElement>('[data-magnet]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener(
      'pointermove',
      (e) => {
        const r = el.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * 0.22);
        y((e.clientY - r.top - r.height / 2) * 0.3);
      },
      { signal },
    );
    el.addEventListener('pointerleave', () => (x(0), y(0)), { signal });
  });
}

/**
 * Gepinnte Storytelling-Sektion: [data-pin-story] mit Schritten [data-schritt].
 * Die Bühne bleibt per CSS (position: sticky) stehen – das ist auf Mobilgeräten
 * flüssiger als ein JS-Pin. ScrollTrigger schreibt nur den aktiven Schritt als
 * data-aktiv auf die Sektion; die Illustration reagiert per CSS (kein Lottie).
 */
export function pinStory(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-pin-story]').forEach((sektion) => {
    const schritte = [...sektion.querySelectorAll<HTMLElement>('[data-schritt]')];
    if (!schritte.length) return;
    const setze = (i: number) => {
      sektion.dataset.aktiv = String(i);
      schritte.forEach((s, j) => s.toggleAttribute('data-ist-aktiv', i === j));
    };
    setze(0);
    schritte.forEach((s, i) =>
      ScrollTrigger.create({
        trigger: s,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setze(i),
      }),
    );
    const fortschritt = sektion.querySelector<HTMLElement>('[data-fortschritt]');
    if (fortschritt)
      gsap.fromTo(
        fortschritt,
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: sektion.querySelector('[data-pin-bereich]') ?? sektion, start: 'top 55%', end: 'bottom 55%', scrub: true } },
      );
  });
}

/** Horizontal-Scroll-Galerie: Desktop gepinnt + scrub; mobil bleibt natives Swipe. */
export function horizontal(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-horizontal]').forEach((sektion) => {
    const spur = sektion.querySelector<HTMLElement>('[data-spur]');
    if (!spur) return;
    const weite = () => Math.max(0, spur.scrollWidth - spur.clientWidth);
    sektion.setAttribute('data-gepinnt', '');
    gsap.to(spur.children, {
      x: () => -weite(),
      ease: 'none',
      scrollTrigger: {
        trigger: sektion,
        start: 'top top',
        end: () => `+=${weite()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
  });
  return () => root.querySelectorAll('[data-horizontal]').forEach((s) => s.removeAttribute('data-gepinnt'));
}

/** Cursorfolgende Bildvorschau in Listen (nur Desktop). */
export function cursorVorschau(root: ParentNode, signal: AbortSignal) {
  root.querySelectorAll<HTMLElement>('[data-cursor-liste]').forEach((liste) => {
    const vorschau = liste.querySelector<HTMLElement>('[data-cursor-vorschau]');
    if (!vorschau) return;
    const bilder = [...vorschau.querySelectorAll<HTMLElement>('[data-vorschau-bild]')];
    gsap.set(vorschau, { xPercent: -50, yPercent: -50, scale: 0.6, opacity: 0 });
    const x = gsap.quickTo(vorschau, 'x', { duration: 0.6, ease: 'power3.out' });
    const y = gsap.quickTo(vorschau, 'y', { duration: 0.6, ease: 'power3.out' });
    liste.addEventListener(
      'pointermove',
      (e) => {
        const r = liste.getBoundingClientRect();
        x(e.clientX - r.left);
        y(e.clientY - r.top);
      },
      { signal },
    );
    liste.querySelectorAll<HTMLElement>('[data-vorschau-index]').forEach((zeile) => {
      zeile.addEventListener(
        'pointerenter',
        () => {
          const i = Number(zeile.dataset.vorschauIndex);
          bilder.forEach((b, j) => gsap.to(b, { opacity: i === j ? 1 : 0, duration: 0.35 }));
          gsap.to(vorschau, { scale: 1, opacity: 1, duration: 0.45, ease: 'expo.out' });
        },
        { signal },
      );
    });
    liste.addEventListener('pointerleave', () => gsap.to(vorschau, { scale: 0.6, opacity: 0, duration: 0.35 }), { signal });
  });
}

/** Lesefortschritt (Artikel). */
export function lesefortschritt(root: ParentNode) {
  const balken = root.querySelector<HTMLElement>('[data-lesefortschritt]');
  const artikel = root.querySelector<HTMLElement>('[data-artikel]');
  if (!balken || !artikel) return;
  gsap.fromTo(balken, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: artikel, start: 'top 20%', end: 'bottom 80%', scrub: true } });
}
