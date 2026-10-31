/**
 * Inhalte der versteckten Pitch-Seite (/pitch): Annahmen der Nutzen-Rechner und
 * die Gegenüberstellung „Was diese Website für Sie leistet“. Richtet sich an den
 * Inhaber, daher durchgehend „Sie“.
 */
export const PITCH = {
  titel: 'Was diese Website für Ihre Kanzlei leistet',
  intro:
    'Eine Website ist kein Prospekt, sondern ein Mitarbeiter, der nie krank ist: Sie beantwortet Routinefragen, qualifiziert Anfragen vor und wirbt um Fachkräfte. Rechnen Sie selbst.',
  zeit: {
    titel: 'Zeitersparnis durch Vorqualifizierung und Selbstbedienung',
    text: 'Fristen, Unterlagen-Checklisten, Terminbuchung und Mandanten-Check beantworten Fragen, die heute am Telefon landen.',
    felder: [
      { name: 'anrufe', label: 'Anrufe pro Woche', min: 10, max: 400, wert: 120, einheit: '' },
      { name: 'routine', label: 'Davon Routinefragen (Fristen, Unterlagen, Termine)', min: 0, max: 80, wert: 35, einheit: '%' },
      { name: 'website', label: 'Davon künftig über die Website erledigt', min: 0, max: 90, wert: 50, einheit: '%' },
      { name: 'minuten', label: 'Minuten pro Anruf inkl. Nacharbeit', min: 1, max: 20, wert: 6, einheit: 'Min.' },
      { name: 'satz', label: 'Interner Stundensatz', min: 30, max: 150, wert: 65, einheit: '€' },
      { name: 'wochen', label: 'Arbeitswochen pro Jahr', min: 30, max: 52, wert: 46, einheit: '' },
    ],
    ergebnisse: [
      { key: 'stunden', label: 'Stunden pro Jahr' },
      { key: 'tage', label: 'Arbeitstage pro Jahr' },
      { key: 'euro', label: 'Wert der Arbeitszeit pro Jahr' },
    ],
  },
  stelle: {
    titel: 'Was kostet eine unbesetzte Stelle?',
    text: 'Jeder Monat ohne Fachkraft kostet Deckungsbeitrag. Eine Karriereseite mit Google-for-Jobs-Auszeichnung und Kurzbewerbung verkürzt die Suche und spart Vermittlungsprovisionen.',
    felder: [
      { name: 'umsatz', label: 'Jahresumsatz je Fachkraft', min: 40000, max: 200000, wert: 110000, einheit: '€', schritt: 5000 },
      { name: 'kosten', label: 'Personalkosten der Stelle pro Jahr (inkl. Nebenkosten)', min: 30000, max: 120000, wert: 62000, einheit: '€', schritt: 1000 },
      { name: 'monate', label: 'Monate unbesetzt', min: 1, max: 18, wert: 6, einheit: '' },
      { name: 'gehalt', label: 'Bruttojahresgehalt (Basis der Provision)', min: 30000, max: 100000, wert: 50000, einheit: '€', schritt: 1000 },
      { name: 'provision', label: 'Provision einer Personalvermittlung', min: 0, max: 35, wert: 25, einheit: '%' },
    ],
    ergebnisse: [
      { key: 'deckung', label: 'Entgangener Deckungsbeitrag' },
      { key: 'provision', label: 'Mögliche Vermittlungsprovision' },
      { key: 'gesamt', label: 'Kosten der Vakanz' },
    ],
  },
  vergleichTitel: 'Was sich ändert',
  vergleichOhne: 'Heute',
  vergleichMit: 'Mit dieser Website',
  vergleich: [
    ['Wirkt wie viele Kanzleien: austauschbar, statisch', 'Wirkt digital, ruhig und modern, passend zur Arbeitsweise'],
    ['Jede Anfrage kostet ein Erstgespräch, auch unpassende', 'Der Mandanten-Check qualifiziert vor und verweist ehrlich, wenn es nicht passt'],
    ['Fristen und Unterlagen werden am Telefon erfragt', 'Steuertermine, Checklisten und Rechner beantworten Routinefragen rund um die Uhr'],
    ['Stellenanzeigen nur auf Jobportalen', 'Eigene Karriereseite mit Google-for-Jobs-Auszeichnung und Kurzbewerbung in zwei Minuten'],
    ['Cookie-Banner, Google Fonts, eingebettete Karten', 'DSGVO-konform ohne Cookie-Banner: keine Requests an Dritte ohne Zustimmung'],
    ['Schwer lesbar auf dem Smartphone', 'Mobil zuerst gebaut, barrierearm (WCAG 2.2 AA, BFSG), Ladezeit unter zwei Sekunden'],
    ['Texte mit Werbe-Superlativen', 'Sachliche, berufsrechtskonforme Texte (§ 57a StBerG)'],
  ],
  argumente: [
    { titel: 'Passende statt beliebige Mandanten', text: 'Der Mandanten-Check zeigt Interessenten vorab, ob sie zu Ihren Schwerpunkten passen, und übergibt das Anliegen direkt an die Terminbuchung.', icon: 'list-checks' },
    { titel: 'Recruiting über Google for Jobs', text: 'Jede Stelle ist strukturiert ausgezeichnet und erscheint dadurch direkt in der Google-Jobsuche.', icon: 'briefcase-business' },
    { titel: 'Fristen-Service bindet Mandanten', text: 'Die Steuertermine sind immer aktuell und tagesgenau berechnet: ein Grund, regelmäßig vorbeizuschauen.', icon: 'calendar-clock' },
    { titel: 'Positionierung als digitale Kanzlei', text: 'Belege per App, Portal, Video-Beratung: Die Website erklärt Ihre Arbeitsweise, bevor jemand anruft.', icon: 'smartphone' },
    { titel: 'Rechtssicher und schnell', text: 'Impressum mit allen berufsrechtlichen Angaben, keine Cookies, lokale Schriften, Lighthouse-Werte über 95.', icon: 'shield-check' },
    { titel: 'In wenigen Tagen live', text: 'Ihre Inhalte stecken in einer Konfigurationsdatei. Änderungen an Texten, Teamfotos oder Fristen sind schnell erledigt.', icon: 'rocket' },
  ],
  layoutsLink: 'Alle Layout-Varianten mit Ihren Inhalten ansehen',
  layoutsTitel: 'Layout-Galerie',
  layoutsIntro: 'Jede Sektion der Startseite in allen verfügbaren Varianten, gefüllt mit den Inhalten dieser Kanzlei. Darunter jeweils der Konfigurationsschnipsel.',
};
