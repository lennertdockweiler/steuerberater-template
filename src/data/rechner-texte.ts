/**
 * Ergebnistexte der Mini-Rechner (Standardtexte der Branche, Sie- und Du-Form).
 * Platzhalter in {geschweiften Klammern} werden im Browser ersetzt.
 */
type T = { sie: string; du: string } | string;

export const RECHNER_TEXTE = {
  kuMoeglich: 'Kleinunternehmerregelung möglich',
  kuNichtMoeglich: 'Kleinunternehmerregelung nicht möglich',
  kuGruendungOk: { sie: 'Im Gründungsjahr bleiben Sie mit {umsatz} unter der Grenze von {grenze}.', du: 'Im Gründungsjahr bleibst du mit {umsatz} unter der Grenze von {grenze}.' },
  kuGruendungUeber: 'Im Gründungsjahr liegt die Grenze bei {grenze}. Ab dem Umsatz, mit dem sie überschritten wird, gilt die Regelbesteuerung.',
  kuVorjahrUeber: { sie: 'Ihr Vorjahresumsatz liegt über {grenze}. Die Kleinunternehmerregelung ist in diesem Jahr nicht möglich.', du: 'Dein Vorjahresumsatz liegt über {grenze}. Die Kleinunternehmerregelung ist in diesem Jahr nicht möglich.' },
  kuLaufendUeber: 'Im laufenden Jahr gilt eine harte Grenze von {grenze}. Mit dem Umsatz, der sie überschreitet, endet die Befreiung sofort.',
  kuOk: 'Vorjahr bis {grenzeVorjahr} und laufendes Jahr bis {grenzeLaufend}: Beide Grenzen sind eingehalten.',
  pendlerGedeckelt: 'Ohne eigenen Pkw ist die Pauschale auf {hoechst} begrenzt (höhere tatsächliche Kosten für Bus und Bahn können angesetzt werden). ',
  pendlerUeberPb: { sie: 'Damit liegen Ihre Fahrtkosten über dem Arbeitnehmer-Pauschbetrag von {pb}. Jeder weitere Euro Werbungskosten wirkt sich steuerlich aus.', du: 'Damit liegen deine Fahrtkosten über dem Arbeitnehmer-Pauschbetrag von {pb}. Jeder weitere Euro Werbungskosten wirkt sich steuerlich aus.' },
  pendlerUnterPb: 'Das liegt noch unter dem Arbeitnehmer-Pauschbetrag von {pb}, der ohnehin berücksichtigt wird. Weitere Werbungskosten können den Unterschied machen.',
  pendlerProTag: '{betrag} pro Arbeitstag',
  hoMax: 'Angesetzt werden höchstens {tage} Tage, also {max} im Jahr.',
  hoNormal: '{tage} Tage × {satz}. Die Pauschale gilt auch ohne häusliches Arbeitszimmer.',
} satisfies Record<string, T>;

export type RechnerTextKey = keyof typeof RECHNER_TEXTE;

export function rt(key: RechnerTextKey, werte: Record<string, string | number> = {}): string {
  const roh: T = RECHNER_TEXTE[key];
  const anrede = (typeof document !== 'undefined' && document.documentElement.dataset.anrede) === 'du' ? 'du' : 'sie';
  const s = typeof roh === 'string' ? roh : roh[anrede];
  return s.replace(/\{(\w+)\}/g, (_, k) => String(werte[k] ?? `{${k}}`));
}
