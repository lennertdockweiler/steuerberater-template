/**
 * Berufsrechtliche Regelungen für das Impressum (DL-InfoV, § 5 DDG).
 * Links laut Bundessteuerberaterkammer (Stand 10/2026). Vor dem Livegang prüfen.
 */
export const BERUFSRECHT = [
  { kurz: 'StBerG', name: 'Steuerberatungsgesetz', url: 'https://www.gesetze-im-internet.de/stberg/' },
  { kurz: 'DVStB', name: 'Durchführungsverordnung zum Steuerberatungsgesetz', url: 'https://www.gesetze-im-internet.de/stbdv/' },
  {
    kurz: 'BOStB',
    name: 'Berufsordnung der Steuerberater',
    url: 'https://www.bstbk.de/downloads/bstbk/recht-und-berufsrecht/fachinfos/BStBK_Berufsordnung-inkl-Fachberaterordnung.pdf',
  },
  { kurz: 'StBVV', name: 'Steuerberatervergütungsverordnung', url: 'https://www.gesetze-im-internet.de/stbgebv/' },
] as const;

export const BERUFSRECHT_QUELLE = { name: 'Bundessteuerberaterkammer', url: 'https://www.bstbk.de' };
