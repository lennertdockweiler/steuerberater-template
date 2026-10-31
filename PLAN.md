# PLAN: Premium-Website-Template für Steuerberatungskanzleien

Phase 0: Konzept. Dieses Dokument hält die Entscheidungen fest, bevor Code entsteht.
Zu jeder Entscheidung steht kurz das „Warum“, damit spätere Änderungen bewusst passieren.

---

## 1. Leitidee

**„Ordnung, die man sieht.“** Eine Steuerkanzlei verkauft Ruhe: Fristen sind im Griff,
Belege sind sortiert, Zahlen stimmen. Das Template übersetzt das in Gestaltung, und zwar mit
Motiven aus der Buchhaltung selbst statt mit Stock-Klischees:

| Motiv | Herkunft | Einsatz |
|---|---|---|
| **Summenstrich** (doppelte Linie) | In der Buchhaltung werden Summen doppelt unterstrichen. | Wiederkehrendes Ornament: Hero-Abschluss, Abschnittsenden, Hover-Zustand von Links. Wird per Animation „gezogen“. |
| **Balken & Raster** | Auswertungen (BWA), Monatswerte | Hero-Grafik (a): 12 Monatsbalken bauen sich auf. Kennzahlen mit tabellarischen Ziffern. |
| **T-Konto** (Soll / Haben) | Doppelte Buchführung | Zweispaltige Gegenüberstellungen (Pitch-Seite „ohne / mit“, Ablauf „Sie / wir“). |
| **Fristenkalender** | Der 10. jedes Monats | Steuertermine-Widget als Abreißkalender mit großer Tageszahl und Countdown. |
| **Marginalien** | Gesetzeskommentare, Fachliteratur | Nur im Preset „Klassisch Seriös“: Randnotizen neben dem Fließtext. |

**Ein lauter Moment pro Seite, der Rest diszipliniert.** Auf der Startseite ist das der Hero.
Danach sind Bewegungen ruhig, präzise und erzählen etwas: Linien ziehen sich, Zahlen zählen,
Schritte bauen sich auf.

### Bewusst vermieden
- Taschenrechner-, Ordner-, Euro-Stapel-, Handschlag- und Anzugträger-Fotos
- Dunkelblau-Grau-Einheitsbrei, Lila-Blau-Verläufe, Creme + Terrakotta
- Großgeschriebene Eyebrow-Labels über jeder Überschrift (optional pro Sektion, Satzschreibung)
- Gleichförmige 3-Spalten-Karten überall (jede Sektion hat eigene Layout-Logik)
- Nummerierungen (01/02/03) außer bei echten Abfolgen (Ablauf, Bewerbungsprozess)

---

## 2. Sitemap

```
/                               Startseite (Sektionen aus Config)
/leistungen/                    Übersicht nach Zielgruppe
/leistungen/<zielgruppe>/       Unternehmen · Selbstständige · Existenzgründer · Privatpersonen
/leistungen/<zielgruppe>/<slug>/  Leistungs-Detailseite (Buchhaltung, Lohn, Jahresabschluss …)
/spezialisierungen/             Branchenfokus
/spezialisierungen/<slug>/      Detail (Heilberufe, Immobilien, E-Commerce, Landwirtschaft …)
/digitale-kanzlei/              So arbeiten wir zusammen (Belege, Portal, Video, Sicherheit)
/team/                          Übersicht
/team/<slug>/                   Profilseite je Berufsträger (Shared-Element-Transition)
/karriere/                      Arbeitgeberseite + Kurzbewerbung
/karriere/<slug>/               Stellenanzeige (JobPosting-Schema)
/wissen/                        Artikel mit Suche + Kategorie-Filter
/wissen/<slug>/                 Artikel (TOC, Lesefortschritt, Stand-Datum, Hinweis)
/wissen/steuertermine/          alle Fristen der nächsten 12 Monate + Filter
/mandanten-check/               Quiz „Welche Beratung passt zu mir?“
/termin/                        Terminbuchung (Slot-Picker oder externer Dienst)
/kontakt/                       Kontakt, Formular, Öffnungszeiten, Karte (2-Klick)
/rechner/                       Mini-Rechner (Kleinunternehmer, Pendler, Homeoffice)
/unterlagen/                    Unterlagen übermitteln + Checklisten (abhakbar, druckbar)
/impressum/  /datenschutz/  /404
/pitch/                         versteckt: Nutzen-Rechner + „Was diese Website leistet“
/pitch/layouts/                 versteckt: Galerie aller Sektions-Layouts mit den Daten der Variante
/og/<seite>.png                 automatisch erzeugte Open-Graph-Bilder
```

Optionale Seiten werden per Astro-Integration (`injectRoute`) nur gebaut, wenn sie in
`seiten` aktiv sind. Abgeschaltete Seiten existieren dann nicht, auch nicht als toter Link.

---

## 3. Startseiten-Sektionen und Layout-Varianten

| Typ | Layouts | Idee |
|---|---|---|
| `hero` | `statement` · `split` · `weiche` | (a) Typo-Statement + 12 Monatsbalken + Summenstrich; (b) Porträt der Partner mit Clip-Path-Reveal; (c) „Ich bin …“-Weiche mit 4 großen Karten |
| `zielgruppen` | `karten` · `zeilen` | Karten mit Hover-Animation oder große typografische Zeilen |
| `leistungen` | `tabs` · `liste` · `bento` | Tabs nach Zielgruppe; Liste mit cursorfolgender Bildvorschau; Bento-Grid |
| `ablauf` | `gepinnt` · `zeitleiste` | Gepinnte Scroll-Story mit SVG-Illustration (Beleg → Upload → Buchung → Auswertung) |
| `kennzahlen` | `reihe` · `band` | Count-up mit tabellarischen Ziffern, als Zeile oder als dunkles Band |
| `spezialisierungen` | `horizontal` · `raster` | Desktop gepinnter Horizontal-Scroll, mobil Swipe mit scroll-snap |
| `team` | `karten` · `portraits` | Tap/Hover-Detail, Shared-Element-Transition zur Profilseite |
| `fristen` | `kalender` · `kompakt` | Nächste 3 Fristen mit Countdown, Filter Unternehmen / Privat |
| `stimmen` | `marquee` · `zitat` | Laufband oder großes Einzelzitat mit Wechsel; nur mit Einwilligung |
| `karriere` | `split` · `band` | Benefits + offene Stellen |
| `wissen` | `liste` · `karten` | 3 neueste Artikel |
| `faq` | `akkordeon` · `zweispaltig` | FAQPage-Schema |
| `cta` | `band` · `karte` | Abschluss „Erstgespräch vereinbaren“ |
| `check` | `banner` · `karte` | Teaser für den Mandanten-Check |
| `kanzlei` | `editorial` · `bild` | Kurzporträt der Kanzlei (Haltung, Werte, Mitgliedschaften) |
| `vertrauen` | `laufband` · `reihe` | Mitgliedschaften und Software als ruhiges Laufband |

Reihenfolge, Auswahl und Layout bestimmt allein `sektionen[]` in der Config.

---

## 4. Config-Schema (Entwurf)

Single Source of Truth: `variants/_schema.ts` (Zod v4). Daraus entstehen `variants/site.config.schema.json`
(VS-Code-Autovervollständigung über `"$schema"`) und alle TypeScript-Typen.

```
meta          slug, sprache, anrede (sie|du), domain, noindex=true, titelVorlage
betrieb       name, kurzname, rechtsform, inhaber, slogan, gruendungsjahr, adresse{… bundesland},
              geo{lat,lng}, einzugsgebiet[], telefon, email, whatsapp, oeffnungszeiten{regulaer[], sonder[]},
              socialLinks[], bewertungen{quelle, schnitt, anzahl, echt, echtheitsHinweis, eintraege[]}
branding      logo?, farben{primaer, akzent, neutralTon}, stilPreset, schriftPaar?, radius?,
              animationsIntensitaet?, bildstil{grain, tonung}
sektionen[]   { typ, layout, aktiv, id?, kicker?, titel?, intro?, … typ-spezifisch }
seiten        { leistungen, spezialisierungen, digitaleKanzlei, team, karriere, wissen, … : boolean }
seo           { seiten: { <seitenId>: { titel, beschreibung } } }
rechtliches   verantwortlich, register, ustId, berufsbezeichnung, verleihungsstaat, berufsrecht[],
              verbraucherstreitbeilegung, datenschutzbeauftragter?, hoster
integrationen formularEndpoint, karte{aktiv, anbieter}, analytics{aktiv=false}
demo          banner{aktiv, text}, agentur{name, telefon, email, website}, pitchSeite
── Branche ──
kanzleiForm, berufstraeger[], team[], zielgruppen[], leistungen[], spezialisierungen[],
mitgliedschaften[], software[], portalLink, mandantenCheck{fragen[], ergebnisse[]},
buchung{modus, url, beratungsarten[], arbeitszeiten[], slotDauer}, fristen[], fristenRegeln,
stellen[], benefits[], karriere, digitaleKanzlei, unterlagen{checklisten[]}, kennzahlen[],
ablauf, faq[], kammer{name, adresse, website}, berufshaftpflicht{versicherer, adresse, geltungsbereich}
```

Prinzipien:
- **Zeichenlimits** direkt im Schema (`.max()`), mit deutschen Fehlermeldungen.
- **Bilder** sind Objekte `{ datei, alt, fokus?, fokusMobil? }`. `alt` ist Pflicht (leer nur mit `dekorativ: true`).
- **Mandantenstimmen** haben das Pflichtfeld `einwilligungLiegtVor` ohne Default. Ohne `true` wird nichts angezeigt.
- **Fachberater-/Zusatzbezeichnungen** existieren nur, wenn sie in `berufstraeger[].titel` stehen. Komponenten erfinden keine Titel.
- **Optionale Felder** fallen auf Branchen-Presets aus `src/data/` zurück (Standardtexte in Sie- und Du-Form, FAQ, Checklisten, Berufsrecht-Links).

---

## 5. Die drei Stil-Presets

### 5.1 „Klar & Digital“ (`klar`), Demo: Hartmann & Vogel, Münster
- **Schrift:** Schibsted Grotesk Variable (400–800) für alles. Eine Familie, wie im Swiss Style. Ziffern tabellarisch (`tnum`).
- **Farbe (Demo):** Papier `#FAFBFA`, Tinte aus der Neutralskala (950), **Petrol `#0B6A72`** als einziger kräftiger Akzent,
  **Bernstein `#E8A33D`** nur als „Textmarker“ für Daten (aktueller Monatsbalken, dringende Frist), Raster `#DCE3E1`.
- **Radien:** 2–4 px. Buttons fast eckig.
- **Raster:** sichtbares 12-Spalten-Haarlinienraster im Hero, asymmetrische Spaltenaufteilung (Überschrift links 5/12, Inhalt rechts 7/12).
- **Bildsprache:** Tageslicht, Architektur, Arbeitsplätze ohne Posen. Leichte Entsättigung + kühle Tönung für Einheitlichkeit.
- **Bewegung:** präzise, `expo.out`, Linien ziehen sich, Balken wachsen, Zahlen laufen. Kein Federn.

### 5.2 „Klassisch Seriös“ (`klassisch`)
- **Schrift:** Newsreader Variable (Headlines, optische Größen) + Source Sans 3 Variable (Text).
- **Farbe (Default):** Navy `#1F2C4C` oder Bordeaux `#6E1F33`, **Messing `#A8834A`** als Haarlinien und Details, warmes Grau.
- **Radien:** 0.
- **Raster:** klassischer Satzspiegel: schmale Textspalte + Marginalspalte für Randnotizen. Doppelte Messinglinien.
- **Bildsprache:** gedeckt, editorial, Schwarz-Weiß-Porträts möglich (Tonung „warm“).
- **Bewegung:** langsam, Masken-Reveals, `power2.out`, keine Skalierungen über 2 %.

### 5.3 „Persönlich Warm“ (`warm`), Demo: Steuerbüro Lena Albrecht, Lüneburg
- **Schrift:** Plus Jakarta Sans Variable (400–800), Headlines 700–800, etwas weitere Laufweite.
- **Farbe (Demo):** Lüneburger Heide statt Terrakotta-Klischee: **Heide `#7A3B69`** (Erika-Violett), **Moos `#5C6B35`**,
  Neutralton mit leichtem Rosé (`#8A7A78`), Hintergrund aus der Neutralskala (50).
- **Radien:** 18–28 px, Pill-Buttons, Bögen als Bildmaske (Portrait im „Fenster“).
- **Bildsprache:** große, freundliche Porträts, Landschaft und Region, warme Tonung.
- **Bewegung:** weich, leichtes `back.out(1.2)` bei Karten, Bilder blenden sanft auf.

### Schriftenregister (`src/data/fonts.ts`)
schibsted-grotesk · onest · plus-jakarta-sans · newsreader · source-sans-3 · fraunces.
Per `branding.schriftPaar` frei kombinierbar (max. 2 Familien). Eingebunden über die stabile
**Astro Fonts API** mit `fontProviders.local()` aus den `@fontsource-variable`-Paketen. Nur
latin + latin-ext, `font-display: swap`, Preload nur für den latin-Schnitt, automatischer
Fallback mit Metrik-Anpassung (size-adjust, ascent/descent-override) gegen Layout-Sprünge.

---

## 6. Theme-Generator (`src/lib/theme.ts`)

1. Markenfarbe (Hex) → OKLCH.
2. Skala 50–950: feste Ziel-Helligkeiten, Farbton bleibt, Chroma folgt einer Glockenkurve und
   wird per Binärsuche in den sRGB-Gamut geholt (keine übersättigten Ausreißer).
3. Semantische Tokens: `--brand`, `--brand-hover`, `--on-brand`, `--brand-ink` (Markenfarbe als Text auf Papier),
   `--accent*`, `--bg`, `--surface*`, `--ink`, `--ink-muted`, `--line`, `--focus`, `--inverse-*`.
4. Kontrastautomatik: Textfarbe auf Farbflächen = Hell oder Dunkel nach WCAG-Kontrast. Ist die
   Markenfarbe als Text zu hell (z. B. Gelb), wird für `--brand-ink` automatisch eine dunklere Stufe gewählt,
   bis 4,5 : 1 erreicht sind. UI-Flächen bekommen mindestens 3 : 1 gegen den Hintergrund.
5. `npm run variant:check` meldet, wenn Kontraste nur durch Korrektur erreicht wurden.
6. `npm run colors -- <slug> [logo]`: schlägt Markenfarben aus dem Logo vor (sharp, Farbquantisierung).

---

## 7. Animationskonzept

Zentral in `src/lib/animations/`, angewendet per `data-anim="…"`. Intensität aus
`branding.animationsIntensitaet` skaliert Distanzen (×0,5 / ×1 / ×1,6), Dauer und schaltet bei `dezent`
Parallax, Magnet-Buttons und Cursor-Vorschau ab.

| Sektion | Bewegung |
|---|---|
| Hero statement | Wörter steigen per CSS-Keyframes auf (startet ohne JS, nie bei opacity 0, LCP-sicher). 12 Balken wachsen gestaffelt, Summenstrich zieht sich. |
| Hero split | Porträt per `clip-path`-Reveal + Scale-down 1,08 → 1 (CSS), Name/Titel folgen. |
| Hero weiche | Karten fächern gestaffelt auf, Hover hebt die Karte und zieht den Summenstrich. |
| Überschriften | SplitText-Zeilen mit Maske, gestaffelt (nur unterhalb des Folds). |
| Listen/Grids | `ScrollTrigger.batch` Fade + Slide mit Stagger. |
| Bilder | `clip-path: inset()` öffnet sich, Bild skaliert 1,15 → 1; dezente Parallax (nur Desktop). |
| Ablauf | Gepinnt + scrub: Smartphone-Illustration wechselt Zustand (Foto → Upload → Buchung → Auswertung). |
| Kennzahlen | Count-up mit deutschem Zahlenformat. |
| Spezialisierungen | Horizontal-Scroll (Desktop gepinnt), mobil natives Swipe. |
| Stimmen | CSS-Marquee, pausiert bei Hover/Fokus und bei reduced motion. |
| Team | Shared-Element-Transition Porträt → Profilseite (`transition:name`). |
| Header | Transparent über dem Hero, kompakt mit Blur, versteckt beim Runterscrollen. |
| Formulare | Schrittwechsel, Fortschritt, gezeichneter Erfolgs-Haken (SVG stroke). |
| CTA | Magnetischer Button (pointer: fine). |

Harte Regeln: nur `transform`/`opacity` (+ sparsam `clip-path`). Inhalte ohne JS sichtbar
(Ausgangszustände nur unter `.js`). Kein blockierender Preloader. `prefers-reduced-motion` →
Fades bzw. aus, Lenis aus, Marquee steht. Lebenszyklus: `astro:page-load` → mount,
`astro:before-swap` → `gsap.context().revert()`, ScrollTrigger kill, Lenis destroy, Listener per AbortController.

---

## 8. Interaktive Features

1. **Mandanten-Check** (Preact-Island, `client:visible`): 5 Fragen, Gewichtung je Antwort, Ergebnis mit
   Leistungspaketen, Ansprechpartner mit Foto, CTA zu `/termin/?anliegen=…`. Ergebnis-Typ „hinweis“ für
   Anfragen, die nicht passen (Vorqualifizierung).
2. **Terminbuchung** (Preact-Island): Beratungsart → Datum (Tastatur-Grid) → Slots (aus Arbeitszeiten simuliert,
   deterministisch „belegt“) → Kontaktdaten → Bestätigung + `.ics`. Modus `extern`: Link oder Klick-zum-Laden.
3. **Steuertermine** (Vanilla): Regeln (USt-VA, LSt-Anmeldung zum 10., Vorauszahlungen, GewSt, SV-Beiträge
   am drittletzten Bankarbeitstag) + Config-Liste. Verschiebung nach § 108 Abs. 3 AO bei Wochenende
   und Feiertag (Feiertage je Bundesland). Berechnung im Browser ⇒ Countdown stimmt auch Monate nach dem Build.
4. **Mini-Rechner** (Vanilla): Kleinunternehmer-Check, Entfernungspauschale (Jahreswahl), Homeoffice-Pauschale.
   Alle Werte in `src/data/steuerwerte.ts` mit Stand und Quelle.
5. **Unterlagen**: Checklisten abhakbar (localStorage), Druckansicht per Print-CSS.
6. **Wissen**: clientseitige Suche, Kategorie-Filter, Lesefortschritt, Inhaltsverzeichnis.
7. **Mobile Aktionsleiste**: Anrufen, Termin, Mandanten-Check. safe-area-inset.
8. **Formulare** (Kontakt, Kurzbewerbung): Demo-Modus mit Erfolgsanimation, Live-Modus per `formularEndpoint`.
9. **Karte**: Zwei-Klick-Lösung mit stilisierter SVG-Vorschau.
10. **Pitch**: Zeitersparnis-Rechner, „Was kostet eine unbesetzte Stelle?“, T-Konto „ohne / mit“.

---

## 9. Technik-Entscheidungen

| Entscheidung | Begründung |
|---|---|
| Astro 7 (aktuell 7.4.x), statisch | Laut npm aktuell. `compressHTML: true` statt neuem `'jsx'`-Default, damit Leerzeichen zwischen Inline-Elementen erhalten bleiben. |
| Variante per `VARIANT` + Vite-`define` | Komponenten lesen nie `process.env`; ein Ort entscheidet. |
| Validierung in `astro.config.ts` | Ungültige Config bricht vor dem Build mit deutscher Fehlerliste ab. |
| Wissen-Collection mit `glob()`-Loader auf `variants/<slug>/wissen/` | Artikel gehören zur Variante, nicht ins Template. |
| Bilder per `import.meta.glob` aus `variants/*/assets/` | Werden von astro:assets optimiert (AVIF + WebP, srcset). |
| Preact nur für Mandanten-Check und Buchung | Echter mehrstufiger Zustand. Alles andere Vanilla-TS. |
| Theme als Inline-`<style>` mit Hex-Werten aus OKLCH-Berechnung | Kein Laufzeit-JS, keine Browser-Kompatibilitätsfrage. |
| OG-Bilder mit Satori → sharp | sharp ist ohnehin Astro-Abhängigkeit; Satori braucht WOFF, daher statische `@fontsource`-Schnitte nur für OG. |
| Service Worker (schlank) | Demo läuft nach einmaligem Laden auch im Funkloch beim Kunden. |
