/**
 * Scroll-Reveals: data-anim="reveal-up" | "reveal-fade" | "rule" | "bild",
 * data-anim-kinder (Kinder gestaffelt) und data-anim="zeilen" (SplitText mit Maske).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Faktoren } from './einstellungen';

const START = 'top 88%';

export function reveals(root: ParentNode, f: Faktoren) {
  const up = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-anim="reveal-up"]'));
  ScrollTrigger.batch(up, {
    start: START,
    once: true,
    onEnter: (els) =>
      gsap.fromTo(
        els,
        { opacity: 0, y: 28 * f.distanz },
        { opacity: 1, y: 0, duration: 0.9 * f.dauer, ease: 'expo.out', stagger: 0.08 * f.stagger, overwrite: true },
      ),
  });

  const fade = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-anim="reveal-fade"]'));
  ScrollTrigger.batch(fade, {
    start: START,
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, duration: 1 * f.dauer, ease: 'power2.out', stagger: 0.08 }),
  });

  root.querySelectorAll<HTMLElement>('[data-anim-kinder]').forEach((gruppe) => {
    const kinder = [...gruppe.children] as HTMLElement[];
    gsap.fromTo(
      kinder,
      { opacity: 0, y: 32 * f.distanz },
      {
        opacity: 1,
        y: 0,
        duration: 0.85 * f.dauer,
        ease: 'expo.out',
        stagger: { each: 0.07 * f.stagger, from: 'start' },
        scrollTrigger: { trigger: gruppe, start: START, once: true },
      },
    );
  });

  // Summenstrich zieht sich von links auf
  root.querySelectorAll<HTMLElement>('[data-anim="rule"]').forEach((el) =>
    gsap.to(el, { scaleX: 1, duration: 1.2 * f.dauer, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }),
  );

  // Bild-Reveal: Maske öffnet sich, Bild skaliert leicht herunter
  root.querySelectorAll<HTMLElement>('[data-anim="bild"]').forEach((el) => {
    const img = el.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3 * f.dauer, ease: 'expo.inOut' });
    if (img) tl.from(img, { scale: 1 + 0.15 * f.distanz, duration: 1.6 * f.dauer, ease: 'expo.out' }, 0);
  });
}

/** Überschriften zeilenweise mit Maske (nur unterhalb des ersten Bildschirms verwendet). */
export function zeilen(root: ParentNode, f: Faktoren) {
  root.querySelectorAll<HTMLElement>('[data-anim="zeilen"]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'zeile',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 108,
          duration: 1.05 * f.dauer,
          ease: 'expo.out',
          stagger: 0.09 * f.stagger,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
    });
  });
}
