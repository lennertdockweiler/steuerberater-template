/**
 * Alle Seiten der aktiven Variante mit Titel, z. B. für OG-Bilder.
 * Abgeschaltete Seiten fehlen automatisch.
 */
import { config, t, leistungPfad } from './config';
import { aktiv, PFADE } from './routes';
import { alleArtikel } from './wissen';

export type SeitenEintrag = { pfad: string; titel: string; kicker: string };

export async function seitenliste(): Promise<SeitenEintrag[]> {
  const k = config.betrieb.kurzname;
  const s: SeitenEintrag[] = [{ pfad: '/', titel: config.betrieb.slogan, kicker: `${k}, ${config.betrieb.adresse.ort}` }];
  const add = (pfad: string, titel: string, kicker = k) => s.push({ pfad, titel, kicker });

  if (aktiv('leistungen')) {
    add(PFADE.leistungen, t('seite.leistungen.titel'));
    config.zielgruppen.forEach((z) => add(`/leistungen/${z.slug}/`, t('seite.zielgruppe.titel', { zielgruppe: z.titel })));
    config.leistungen.forEach((l) => add(leistungPfad(l), l.titel, t('seite.leistungen.titel')));
  }
  if (aktiv('spezialisierungen')) {
    add(PFADE.spezialisierungen, t('spezialisierungen.titel'));
    config.spezialisierungen.forEach((x) => add(`/spezialisierungen/${x.slug}/`, t('spezialisierungen.fuer', { branche: x.titel })));
  }
  if (aktiv('digitaleKanzlei')) add(PFADE.digitaleKanzlei, config.digitaleKanzlei.titel ?? t('seite.digital.titel'));
  if (aktiv('team')) {
    add(PFADE.team, t('team.titel'));
    config.berufstraeger.forEach((p) => add(`/team/${p.slug}/`, p.name, p.titel[0]));
  }
  if (aktiv('karriere')) {
    add(PFADE.karriere, config.karriere.titel ?? t('karriere.titel'));
    config.stellen.forEach((x) => add(`/karriere/${x.slug}/`, x.titel, t('nav.karriere')));
  }
  if (aktiv('wissen')) {
    add(PFADE.wissen, t('seite.wissen.titel'));
    (await alleArtikel()).forEach((a) => add(`/wissen/${a.id}/`, a.data.titel, a.data.kategorie));
  }
  if (aktiv('steuertermine')) add(PFADE.steuertermine, t('seite.fristen.titel'));
  if (aktiv('mandantenCheck')) add(PFADE.mandantenCheck, config.mandantenCheck?.titel ?? t('check.titel'));
  if (aktiv('termin')) add(PFADE.termin, t('seite.termin.titel'));
  if (aktiv('kontakt')) add(PFADE.kontakt, t('seite.kontakt.titel'));
  if (aktiv('rechner')) add(PFADE.rechner, t('seite.rechner.titel'));
  if (aktiv('unterlagen')) add(PFADE.unterlagen, t('seite.unterlagen.titel'));
  add(PFADE.impressum, 'Impressum');
  add(PFADE.datenschutz, 'Datenschutz');
  return s;
}
