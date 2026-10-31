/**
 * Pfade und Navigation. Abgeschaltete Seiten (config.seiten) verschwinden
 * automatisch aus Header, Footer, Mobilmenü und Querverweisen.
 */
import { config, t } from './config';
import type { SeitenId } from '../../variants/_schema';

export const PFADE: Record<SeitenId, string> = {
  start: '/',
  leistungen: '/leistungen/',
  spezialisierungen: '/spezialisierungen/',
  digitaleKanzlei: '/digitale-kanzlei/',
  team: '/team/',
  karriere: '/karriere/',
  wissen: '/wissen/',
  steuertermine: '/wissen/steuertermine/',
  mandantenCheck: '/mandanten-check/',
  termin: '/termin/',
  kontakt: '/kontakt/',
  rechner: '/rechner/',
  unterlagen: '/unterlagen/',
  impressum: '/impressum/',
  datenschutz: '/datenschutz/',
};

/** Ist die Seite in dieser Variante gebaut? */
export function aktiv(id: SeitenId): boolean {
  if (id === 'start' || id === 'impressum' || id === 'datenschutz') return true;
  if (id === 'spezialisierungen') return config.seiten.spezialisierungen && config.spezialisierungen.length > 0;
  if (id === 'mandantenCheck') return config.seiten.mandantenCheck && !!config.mandantenCheck;
  return config.seiten[id as keyof typeof config.seiten] ?? false;
}

/** Link zur Seite oder `fallback`, wenn sie abgeschaltet ist. */
export const pfad = (id: SeitenId, fallback = PFADE.kontakt) => (aktiv(id) ? PFADE[id] : fallback);

/** Ziel für „Termin vereinbaren“: Buchung, sonst Kontakt. */
export const terminPfad = () => (aktiv('termin') ? PFADE.termin : aktiv('kontakt') ? PFADE.kontakt : `mailto:${config.betrieb.email}`);

export type NavPunkt = { id: SeitenId; label: string; href: string; kinder?: { label: string; href: string; text?: string }[] };

export function hauptNavigation(): NavPunkt[] {
  const punkte: NavPunkt[] = [];
  if (aktiv('leistungen'))
    punkte.push({
      id: 'leistungen',
      label: t('nav.leistungen'),
      href: PFADE.leistungen,
      kinder: config.zielgruppen.map((z) => ({ label: z.titel, href: `/leistungen/${z.slug}/`, text: z.kurztext })),
    });
  if (aktiv('spezialisierungen')) punkte.push({ id: 'spezialisierungen', label: t('nav.spezialisierungen'), href: PFADE.spezialisierungen });
  if (aktiv('digitaleKanzlei')) punkte.push({ id: 'digitaleKanzlei', label: t('nav.digitaleKanzlei'), href: PFADE.digitaleKanzlei });
  if (aktiv('team')) punkte.push({ id: 'team', label: t('nav.team'), href: PFADE.team });
  if (aktiv('karriere')) punkte.push({ id: 'karriere', label: t('nav.karriere'), href: PFADE.karriere });
  if (aktiv('wissen')) punkte.push({ id: 'wissen', label: t('nav.wissen'), href: PFADE.wissen });
  if (aktiv('kontakt')) punkte.push({ id: 'kontakt', label: t('nav.kontakt'), href: PFADE.kontakt });
  return punkte;
}

export function serviceNavigation(): { label: string; href: string; icon: string }[] {
  const s: { label: string; href: string; icon: string }[] = [];
  if (aktiv('mandantenCheck')) s.push({ label: t('nav.mandantenCheck'), href: PFADE.mandantenCheck, icon: 'list-checks' });
  if (aktiv('termin')) s.push({ label: t('nav.termin'), href: PFADE.termin, icon: 'calendar-check' });
  if (aktiv('steuertermine')) s.push({ label: t('nav.steuertermine'), href: PFADE.steuertermine, icon: 'calendar-clock' });
  if (aktiv('rechner')) s.push({ label: t('nav.rechner'), href: PFADE.rechner, icon: 'calculator' });
  if (aktiv('unterlagen')) s.push({ label: t('nav.unterlagen'), href: PFADE.unterlagen, icon: 'file-up' });
  return s;
}

/** Ist `href` die aktuelle Seite bzw. ein Elternpfad davon? */
export const istAktuell = (aktuell: string, href: string) => (href === '/' ? aktuell === '/' : aktuell.startsWith(href));
