/**
 * Bausteine für Impressum und Datenschutzerklärung (Branchen-Standardtexte).
 *
 * ⚠️  Die Datenschutzerklärung ist eine strukturierte VORLAGE. Sie passt sich an die
 *     aktivierten Funktionen an, ersetzt aber keine rechtliche Prüfung. Vor dem
 *     Livegang anwaltlich prüfen oder mit einem Generator (z. B. eRecht24,
 *     Datenschutz-Generator.de) erstellen lassen.
 */
import type { SiteConfig } from '../../variants/_schema';
import { LAENDER } from '../lib/fristen';

export type Abschnitt = { titel: string; absaetze: string[]; liste?: string[] };

export const RECHT_TEXTE = {
  impressumTitel: 'Impressum',
  impressumAngaben: 'Angaben gemäß § 5 DDG',
  vertreten: 'Vertreten durch',
  kontakt: 'Kontakt',
  register: 'Registereintrag',
  ustId: 'Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG',
  wirtschaftsId: 'Wirtschafts-Identifikationsnummer',
  berufsrecht: 'Berufsbezeichnung und berufsrechtliche Regelungen',
  berufsbezeichnung:
    'Die gesetzliche Berufsbezeichnung „Steuerberater“ bzw. „Steuerberaterin“ wurde in der Bundesrepublik Deutschland verliehen. Berufsträger der Kanzlei:',
  kammer: 'Zuständige Kammer und Aufsichtsbehörde',
  regelungen: 'Es gelten die folgenden berufsrechtlichen Regelungen, die bei der {quelle} eingesehen werden können:',
  haftpflicht: 'Berufshaftpflichtversicherung',
  haftpflichtGeltung: 'Räumlicher Geltungsbereich',
  verantwortlich: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
  streit: 'Verbraucherstreitbeilegung',
  bilder: 'Bildnachweise',
  demoHinweis:
    'Hinweis: Diese Website ist ein Entwurf mit fiktiven Angaben. Kanzlei, Personen, Register- und Steuernummern sind frei erfunden; Fotos zeigen Modelle von Unsplash.',
  datenschutzTitel: 'Datenschutzerklärung',
  datenschutzWarnung:
    'Vorlage: Diese Datenschutzerklärung wurde automatisch aus den aktivierten Funktionen der Website erzeugt. Sie muss vor dem Livegang rechtlich geprüft bzw. mit einem Generator erstellt werden.',
  stand: 'Stand',
};

/** Datenschutzerklärung: Abschnitte nach aktivierten Funktionen. */
export function datenschutzAbschnitte(c: SiteConfig, opt: { portal: boolean; serviceWorker: boolean }): Abschnitt[] {
  const b = c.betrieb;
  const a: Abschnitt[] = [];
  const i = c.integrationen;

  a.push({
    titel: 'Verantwortlicher',
    absaetze: [`${b.name}, ${b.adresse.strasse}, ${b.adresse.plz} ${b.adresse.ort}. Telefon: ${b.telefon}, E-Mail: ${b.email}.`],
  });
  if (c.rechtliches.datenschutzbeauftragter)
    a.push({
      titel: 'Datenschutzbeauftragter',
      absaetze: [`${c.rechtliches.datenschutzbeauftragter.name}, ${c.rechtliches.datenschutzbeauftragter.kontakt}.`],
    });

  a.push({
    titel: 'Ihre Daten bei uns: das Wichtigste in Kürze',
    absaetze: [
      'Wir verarbeiten personenbezogene Daten nur, soweit es für den Betrieb dieser Website, die Beantwortung Ihrer Anfragen oder ein Mandatsverhältnis erforderlich ist. Als Steuerberater unterliegen wir zusätzlich der gesetzlichen Verschwiegenheitspflicht (§ 57 Abs. 1 StBerG).',
      i.analytics.aktiv
        ? 'Diese Website nutzt eine Reichweitenmessung (siehe unten).'
        : 'Diese Website setzt keine Cookies, verwendet keine Tracking- oder Analysewerkzeuge und bindet keine Inhalte Dritter ohne Ihre ausdrückliche Zustimmung ein. Ein Cookie-Banner ist deshalb nicht erforderlich.',
    ],
  });

  a.push({
    titel: 'Hosting und Server-Protokolle',
    absaetze: [
      c.rechtliches.hosting
        ? `Diese Website wird bei ${c.rechtliches.hosting.anbieter}, ${c.rechtliches.hosting.adresse}, gehostet.${c.rechtliches.hosting.datenschutzUrl ? ` Details: ${c.rechtliches.hosting.datenschutzUrl}` : ''}`
        : 'Diese Website wird bei einem externen Dienstleister gehostet. [Anbieter, Anschrift und Datenschutzhinweise ergänzen]',
      'Beim Aufruf werden technisch notwendige Daten verarbeitet (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browsertyp). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren und stabilen Betrieb). Mit dem Hoster besteht ein Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO).',
    ],
  });

  a.push({
    titel: 'Schriftarten',
    absaetze: ['Alle Schriftarten werden lokal von unserem Server geladen. Es findet keine Verbindung zu Google Fonts oder anderen Schriftdiensten statt.'],
  });

  a.push({
    titel: 'Kontaktformular, Terminanfrage und Bewerbungen',
    absaetze: [
      'Wenn Sie uns über ein Formular, per E-Mail oder telefonisch kontaktieren, verarbeiten wir Ihre Angaben (z. B. Name, E-Mail-Adresse, Telefonnummer, Anliegen) zur Bearbeitung der Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) bzw. Art. 6 Abs. 1 lit. f DSGVO. Bewerbungsdaten verarbeiten wir nach § 26 BDSG bzw. Art. 88 DSGVO und löschen sie spätestens sechs Monate nach Abschluss des Verfahrens.',
      i.formularEndpoint
        ? `Formulareingaben werden über ${i.formularAnbieter ?? 'einen Formular-Dienstleister'} an uns übermittelt. Mit dem Anbieter besteht ein Vertrag zur Auftragsverarbeitung. [Anbieter, Sitz und ggf. Drittlandübermittlung ergänzen]`
        : 'In der vorliegenden Entwurfsfassung werden Formulareingaben nicht übertragen oder gespeichert.',
      'Der Mandanten-Check wertet Ihre Antworten ausschließlich in Ihrem Browser aus. Es werden dabei keine Daten an uns übertragen.',
    ],
  });

  if (c.integrationen.karte.aktiv) {
    const google = c.integrationen.karte.anbieter === 'google';
    a.push({
      titel: 'Kartendarstellung (Zwei-Klick-Lösung)',
      absaetze: [
        `Auf der Kontaktseite können Sie eine Karte von ${google ? 'Google Maps (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland)' : 'OpenStreetMap (OpenStreetMap Foundation, St John’s Innovation Centre, Cowley Road, Cambridge, CB4 0WS, Vereinigtes Königreich)'} laden. Die Karte wird erst nach Klick auf „Karte laden“ eingebunden. Dabei werden Daten wie Ihre IP-Adresse an den Anbieter übertragen. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG), die Sie durch Verlassen bzw. Neuladen der Seite jederzeit beenden können.`,
      ],
    });
  }

  if (c.buchung.modus === 'extern' && c.buchung.url)
    a.push({
      titel: 'Online-Terminbuchung',
      absaetze: [
        `Für die Terminbuchung nutzen wir ${c.buchung.anbieterName ?? 'einen externen Dienst'} (${c.buchung.url}). ${c.buchung.einbettung ? 'Der Buchungskalender wird erst nach Ihrem Klick geladen.' : 'Sie gelangen per Link auf die Seite des Anbieters.'} Dort gelten dessen Datenschutzhinweise. [Auftragsverarbeitung prüfen und Anbieterdaten ergänzen]`,
      ],
    });

  if (opt.portal && c.portalLink)
    a.push({
      titel: 'Mandantenportal',
      absaetze: [
        `Der Link „${c.portalLink.label}“ führt zu ${c.portalLink.anbieter ?? 'einem externen Portal'}. Für die dort verarbeiteten Daten gelten die Datenschutzhinweise des Anbieters sowie unsere Vereinbarungen im Rahmen des Mandats.`,
      ],
    });

  if (c.integrationen.analytics.aktiv)
    a.push({
      titel: 'Reichweitenmessung',
      absaetze: [
        `Wir nutzen ${c.integrationen.analytics.anbieter ?? '[Anbieter]'} zur anonymen Reichweitenmessung. [Einsatz, Rechtsgrundlage, Speicherdauer und ggf. Einwilligung beschreiben]`,
      ],
    });

  a.push({
    titel: 'Speicherung im Browser',
    absaetze: [
      `Einige Funktionen speichern Einstellungen ausschließlich lokal in Ihrem Browser (Local Storage bzw. Session Storage), z. B. den Fortschritt der Unterlagen-Checklisten. Diese Daten werden nicht an uns übertragen und können jederzeit über die Browsereinstellungen gelöscht werden. Rechtsgrundlage ist § 25 Abs. 2 Nr. 2 TDDDG.${opt.serviceWorker ? ' Damit die Seite auch bei schlechter Verbindung funktioniert, legt ein sogenannter Service Worker Kopien der Website-Dateien im Browser-Zwischenspeicher ab.' : ''}`,
    ],
  });

  a.push({
    titel: 'Ihre Rechte',
    absaetze: ['Sie haben im Rahmen der gesetzlichen Vorgaben jederzeit das Recht auf:'],
    liste: [
      'Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)',
      'Berichtigung unrichtiger Daten (Art. 16 DSGVO)',
      'Löschung (Art. 17 DSGVO), soweit keine gesetzlichen Aufbewahrungspflichten bestehen',
      'Einschränkung der Verarbeitung (Art. 18 DSGVO)',
      'Datenübertragbarkeit (Art. 20 DSGVO)',
      'Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO)',
      'Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)',
    ],
  });

  a.push({
    titel: 'Beschwerderecht',
    absaetze: [`Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren, insbesondere bei der zuständigen Behörde des Landes ${LAENDER[b.adresse.bundesland]}.`],
  });

  return a;
}
