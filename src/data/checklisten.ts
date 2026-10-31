/**
 * Standard-Checklisten „Welche Unterlagen brauche ich für …?“.
 * Eine Variante kann sie über `unterlagen.checklisten` komplett ersetzen.
 */

export type Checkliste = {
  id: string;
  titel: string;
  zielgruppe: 'unternehmen' | 'privat' | 'alle';
  punkte: { text: string; hinweis?: string }[];
};

export const CHECKLISTEN: Checkliste[] = [
  {
    id: 'einkommensteuer',
    titel: 'Einkommensteuererklärung für Arbeitnehmer',
    zielgruppe: 'privat',
    punkte: [
      { text: 'Steuer-Identifikationsnummer aller Beteiligten' },
      { text: 'Steuerbescheid des Vorjahres', hinweis: 'falls Sie neu bei uns sind' },
      { text: 'Lohnsteuerbescheinigung(en)', hinweis: 'liegt dem Finanzamt meist elektronisch vor, eine Kopie hilft beim Abgleich' },
      { text: 'Bescheinigungen über Elterngeld, Krankengeld oder Arbeitslosengeld' },
      { text: 'Anzahl Arbeitstage im Büro und Entfernung zur Arbeitsstätte' },
      { text: 'Anzahl Homeoffice-Tage' },
      { text: 'Belege für Arbeitsmittel, Fortbildungen und Fachliteratur' },
      { text: 'Rechnungen für Handwerker und haushaltsnahe Dienstleistungen', hinweis: 'auch die Nebenkostenabrechnung' },
      { text: 'Spendenbescheinigungen' },
      { text: 'Kinderbetreuungskosten mit Zahlungsnachweis' },
      { text: 'Jahressteuerbescheinigungen der Banken', hinweis: 'bei Kapitalerträgen über dem Sparer-Pauschbetrag oder ohne Freistellungsauftrag' },
      { text: 'Bescheinigungen zu Riester- oder Rürup-Verträgen' },
    ],
  },
  {
    id: 'vermietung',
    titel: 'Einkünfte aus Vermietung',
    zielgruppe: 'privat',
    punkte: [
      { text: 'Aufstellung der Mieteinnahmen je Objekt und Monat' },
      { text: 'Mietverträge, bei Neuvermietung oder Änderung' },
      { text: 'Nebenkosten- bzw. Hausgeldabrechnung' },
      { text: 'Zinsbescheinigung der Bank für das Darlehen' },
      { text: 'Grundsteuerbescheid und Gebäudeversicherung' },
      { text: 'Rechnungen für Reparaturen und Instandhaltung' },
      { text: 'Kaufvertrag, Notar- und Grundbuchkosten', hinweis: 'nur im Jahr des Erwerbs' },
      { text: 'Fahrten zum Objekt (Anzahl, Entfernung)' },
    ],
  },
  {
    id: 'selbststaendig',
    titel: 'Jahresabschluss für Selbstständige (EÜR)',
    zielgruppe: 'unternehmen',
    punkte: [
      { text: 'Kontoauszüge des Geschäftskontos (Januar bis Dezember)' },
      { text: 'Ausgangsrechnungen' },
      { text: 'Eingangsrechnungen und Quittungen' },
      { text: 'Kassenbuch', hinweis: 'nur bei Bargeldeinnahmen' },
      { text: 'Fahrtenbuch oder Angaben zur Privatnutzung des Firmenwagens' },
      { text: 'Rechnungen für neue Anschaffungen über 800 € netto' },
      { text: 'Bescheide über Vorauszahlungen' },
      { text: 'Verträge, die neu sind oder sich geändert haben (Miete, Leasing, Versicherungen)' },
    ],
  },
  {
    id: 'gruendung',
    titel: 'Erstgespräch zur Existenzgründung',
    zielgruppe: 'unternehmen',
    punkte: [
      { text: 'Kurze Beschreibung der Geschäftsidee', hinweis: 'ein Businessplan ist hilfreich, aber kein Muss' },
      { text: 'Geplanter Starttermin und Standort' },
      { text: 'Erwartete Umsätze und Kosten in den ersten zwei Jahren (Schätzung genügt)' },
      { text: 'Kapitalbedarf und geplante Finanzierung' },
      { text: 'Gedanken zur Rechtsform und zu möglichen Mitgründern' },
      { text: 'Steuer-Identifikationsnummer und Personalausweis' },
      { text: 'Gewerbeanmeldung, falls schon erfolgt' },
    ],
  },
];
