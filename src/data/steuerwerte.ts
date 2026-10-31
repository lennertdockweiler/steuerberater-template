/**
 * ALLE Steuerwerte der Mini-Rechner, zentral an einem Ort.
 *
 * ⚠️  Vor jedem Livegang und zu jedem Jahreswechsel prüfen!
 *     Komponenten enthalten keine Zahlen, sie lesen ausschließlich diese Datei.
 *
 * Stand und Quelle werden in den Rechnern angezeigt.
 */

export const STEUERWERTE = {
  stand: '2026-01-01',
  geprueftAm: '2026-10-21',

  kleinunternehmer: {
    /** Gesamtumsatz im Vorjahr (brutto = netto, da keine USt ausgewiesen) */
    grenzeVorjahr: 25_000,
    /** Gesamtumsatz im laufenden Jahr; wird sie überschritten, endet die Regelung sofort */
    grenzeLaufendesJahr: 100_000,
    /** Im Jahr der Gründung gilt die niedrigere Grenze für das laufende Jahr */
    grenzeGruendungsjahr: 25_000,
    quelle: '§ 19 Abs. 1 UStG in der Fassung des Jahressteuergesetzes 2024, gültig seit 01.01.2025',
  },

  entfernungspauschale: {
    /** Euro je vollem Entfernungskilometer (einfache Strecke) */
    jahre: {
      2025: { bis20km: 0.3, ab21km: 0.38 },
      2026: { bis20km: 0.38, ab21km: 0.38 },
    } as Record<number, { bis20km: number; ab21km: number }>,
    /** Höchstbetrag, wenn kein eigener oder überlassener Pkw genutzt wird */
    hoechstbetragOhnePkw: 4_500,
    standardArbeitstage: 220,
    quelle: '§ 9 Abs. 1 Satz 3 Nr. 4 und Abs. 2 EStG; ab 2026 einheitlich 0,38 € ab dem ersten Kilometer (Steueränderungsgesetz 2025)',
  },

  homeoffice: {
    proTag: 6,
    maxTage: 210,
    maxBetrag: 1_260,
    quelle: '§ 4 Abs. 5 Satz 1 Nr. 6c EStG (Tagespauschale seit 2023)',
  },

  arbeitnehmerPauschbetrag: {
    betrag: 1_230,
    quelle: '§ 9a Satz 1 Nr. 1 Buchst. a EStG',
  },
} as const;

export type Steuerwerte = typeof STEUERWERTE;
