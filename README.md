# Steuerberater-Template

Konfigurationsgetriebenes Premium-Website-Template für Steuerberatungskanzleien.
Aus **einer** Codebasis entstehen beliebig viele Kanzlei-Websites. Jede Variante besteht nur aus
`variants/<slug>/site.config.json`, einem Bilderordner und optionalen Wissensartikeln.

- **Astro 7** (statisch), TypeScript strict, **Tailwind CSS 4**, **GSAP 3** (ScrollTrigger, SplitText), **Lenis**, **Zod 4**, Preact-Islands nur für Mandanten-Check und Terminbuchung
- Zwei fertige Demos: **Hartmann & Vogel** (Münster, Preset „Klar & Digital“) und **Steuerbüro Lena Albrecht** (Lüneburg, Preset „Persönlich Warm“)
- Lighthouse mobil 97–100 in allen Kategorien, keine Cookies, keine externen Requests ohne Einwilligung

> ⚠️ **Steuerwerte vor jedem Livegang prüfen.** Alle Zahlen der Rechner (Kleinunternehmergrenzen, Entfernungspauschale,
> Homeoffice-Pauschale, Arbeitnehmer-Pauschbetrag) stehen zentral in `src/data/steuerwerte.ts` mit Stand und Quelle.
> Komponenten enthalten keine Steuerwerte. Zum Jahreswechsel und vor jeder Veröffentlichung aktualisieren.

---

## 1. Schnellstart

Voraussetzung: Node.js ≥ 22.12 (empfohlen: aktuelle LTS, siehe `.nvmrc`), npm.

```bash
npm install
npx playwright install chromium     # einmalig, für Screenshots und Tests

npm run dev                          # Demo 1 (Standard-Variante „demo“) auf http://localhost:4321
VARIANT=demo-2 npm run dev           # andere Variante
VARIANT=demo PRESET=klassisch npm run dev   # Variante mit anderem Stil-Preset ansehen (Vorschau)

npm run build                        # baut „demo“ nach dist/demo/
VARIANT=demo-2 npm run build         # baut nach dist/demo-2/
npm run preview                      # Vorschau des Builds (VARIANT beachten)
```

### Alle Befehle

| Befehl | Zweck |
|---|---|
| `npm run dev` / `build` / `preview` | Entwicklung, Build, Vorschau der aktiven Variante (`VARIANT=<slug>`) |
| `npm run build:all` | Alle Varianten (außer `_template`) nach `dist/<slug>/` |
| `npm run variant:new -- <slug>` | Neue Variante aus `_template` anlegen, mit Checkliste |
| `npm run variant:check -- <slug>` | Schema, Bilder, Kontraste, Platzhalter, Live-Bereitschaft prüfen |
| `npm run shots -- <slug> [--breiten=390,1024,1440] [--nur=/,/kontakt/] [--alle]` | Screenshots nach `screenshots/<slug>/` |
| `npm run qr -- <slug> <url>` | QR-Code (PNG + SVG) in Markenfarbe nach `qr/` |
| `npm run colors -- <slug> [logo.png]` | Markenfarben aus einem Logo vorschlagen |
| `npm run publish [-- <slug>]` | Demos auf GitHub Pages veröffentlichen (siehe Abschnitt 6) |
| `npm run test -- <slug>` | Funktionstest aller interaktiven Elemente (Playwright) |
| `npm run lighthouse -- <slug> [/pfad/ …]` | Lighthouse mobil, Berichte in `lighthouse/<slug>/` |
| `npm run check` | TypeScript-/Astro-Prüfung |
| `npm run schema` | JSON-Schema für VS Code neu erzeugen (passiert auch bei jedem Build) |
| `npm run serve -- <slug>` | `dist/<slug>/` lokal ausliefern |

---

## 2. Neue Variante in 30 Minuten

### Daten, die Sie vom Betrieb brauchen

- [ ] **Stammdaten:** vollständiger Name inkl. Rechtsform, Kurzname, Anschrift, Telefon, E-Mail, Öffnungszeiten
- [ ] **Logo** (SVG oder PNG mit Transparenz) – optional, sonst entsteht automatisch eine Wortmarke
- [ ] **Markenfarbe(n)** – oder aus dem Logo ableiten: `npm run colors -- <slug> logo.png`
- [ ] **Berufsträger:** Name, Titel **exakt wie verliehen** (Fachberater nur, wenn tatsächlich erworben), Bestellungsjahr, Schwerpunkte, Sprachen, Porträtfoto, E-Mail, kurzer Werdegang
- [ ] **Team:** Name, Funktion, seit wann, Foto (optional)
- [ ] **Leistungen** je Zielgruppe mit Kurztext, Text und Stichpunkten
- [ ] **Spezialisierungen/Branchen** (optional) mit Bild
- [ ] **Impressum:** Kammer (Name, Anschrift, Website), Berufshaftpflicht (Versicherer, Anschrift, Geltungsbereich), USt-IdNr., ggf. Partnerschafts-/Handelsregister, Vertretungsberechtigte, Hinweis zur Verbraucherstreitbeilegung
- [ ] **Stellen** (optional) mit Aufgaben, Profil, Benefits, Gehaltsspanne
- [ ] **Mandantenstimmen** nur mit **schriftlicher Einwilligung**
- [ ] **Fotos:** Büro, Team, ggf. Region (siehe Bilder-Leitfaden)
- [ ] Mandantenportal-Link (z. B. DATEV Unternehmen online), Formular-Dienst für die Live-Version

### Schritt für Schritt

1. `npm run variant:new -- kanzlei-meyer` → legt `variants/kanzlei-meyer/` an und zeigt die Pflichtfelder.
2. `variants/kanzlei-meyer/site.config.json` in VS Code öffnen. Dank `"$schema"` gibt es Autovervollständigung und Erklärungen zu jedem Feld. Alle `TODO` ersetzen.
3. Bilder nach `variants/kanzlei-meyer/assets/` legen (Benennung siehe Abschnitt 5).
4. Stil wählen: `"stilPreset": "klar" | "klassisch" | "warm"`, Sektionen und Layouts in `sektionen[]` festlegen (Abschnitt 4).
5. Optional Wissensartikel: `variants/kanzlei-meyer/wissen/_beispiel.md` kopieren, Unterstrich entfernen.
6. `npm run variant:check -- kanzlei-meyer` → meldet fehlende Pflichtfelder, Bilder, Kontraste, Platzhalter, zu lange Texte.
7. `VARIANT=kanzlei-meyer npm run dev` → ansehen, Feinschliff.
8. `npm run publish -- kanzlei-meyer` → Demo-Link und QR-Code für den Termin.

Tipp: Unter `/pitch/layouts/` jeder gebauten Demo sehen Sie **alle Sektions-Layouts mit den Inhalten dieser Kanzlei** und den passenden Konfigurationsschnipsel.

---

## 3. Referenz der Config-Felder

Single Source of Truth ist `variants/_schema.ts` (Zod). Zeichenlimits stehen dort; zu lange Texte brechen den Build mit verständlicher Meldung ab. Fehlende optionale Werte fallen auf Standardtexte (`src/data/texte.ts`) und Preset-Werte (`src/data/presets.ts`) zurück.

### `meta`
| Feld | Beispiel | Hinweis |
|---|---|---|
| `slug` | `"demo"` | entspricht dem Ordnernamen |
| `anrede` | `"sie"` \| `"du"` | gilt für alle Standardtexte |
| `domain` | `"https://www.kanzlei.de"` | Canonical, Sitemap, Open Graph |
| `noindex` | `true` | **Standard für Demos.** Sperrt Suchmaschinen (Meta-Tag, robots.txt, keine Sitemap) |
| `titelVorlage` | `"Hartmann & Vogel, Steuerberater Münster"` | Zusatz hinter Seitentiteln |

### `betrieb`
`name`, `kurzname`, `rechtsform`, `inhaber[]`, `slogan` (max. 120 Zeichen, sachlich), `gruendungsjahr`,
`adresse { strasse, plz, ort, bundesland }` (Bundesland-Kürzel, wichtig für Feiertage bei Fristen), `geo { lat, lng }`,
`einzugsgebiet[]` (lokales SEO), `telefon`, `fax?`, `email`, `whatsapp?`,
`oeffnungszeiten { regulaer[ { tage[], von, bis } ], sonder[ { datum, geschlossen, hinweis } ], hinweis }` (mehrere Fenster pro Tag möglich),
`socialLinks[ { netzwerk, url } ]`,
`bewertungen { quelle, schnitt, anzahl, echt, echtheitsHinweis, eintraege[ { name, kontext, text, einwilligungLiegtVor, beispiel } ] }`.

> **Mandantenstimmen:** `einwilligungLiegtVor` ist Pflicht und hat keinen Standardwert. Nur `true` wird angezeigt (Verschwiegenheitspflicht).
> `beispiel: true` kennzeichnet Demo-Stimmen sichtbar. `aggregateRating` im Schema nur bei `echt: true`. Der `echtheitsHinweis` (§ 5b Abs. 3 UWG) erscheint unter den Stimmen.

### `branding`
| Feld | Beispiel | Hinweis |
|---|---|---|
| `logo { datei, dateiHell?, alt?, hoehe }` | `{ "datei": "logo.svg" }` | optional; ohne Logo automatische Wortmarke |
| `wortmarke { zeile1, zeile2 }` | `{ "zeile1": "Lena Albrecht", "zeile2": "Steuerbüro in Lüneburg" }` | Aufteilung der Wortmarke |
| `farben { primaer, akzent?, neutralTon? }` | `{ "primaer": "#0B6A72" }` | Theme-Generator erzeugt Skalen und prüft Kontraste |
| `stilPreset` | `"klar"` | `klar` \| `klassisch` \| `warm` |
| `schriftPaar { headline, text }` | `{ "headline": "fraunces", "text": "onest" }` | überschreibt das Preset; lokal gehostet |
| `radius` | `"weich"` | `eckig` \| `dezent` \| `weich` \| `rund` |
| `animationsIntensitaet` | `"dezent"` | `dezent` (seriös) \| `standard` \| `ausdrucksstark` (jung) |
| `bildstil { grain, tonung }` | `{ "grain": true, "tonung": "warm" }` | gleicht gemischte Fotoqualität aus |

### `sektionen[]` (Startseite)
Reihenfolge = Reihenfolge auf der Seite. Gemeinsame Felder: `typ`, `layout?` (sonst Preset-Standard), `aktiv`, `id?`, `kicker?`, `titel?`, `intro?`, `hintergrund?` (`standard` \| `flaeche` \| `invers`).

```json
{ "typ": "hero", "layout": "statement", "titel": "Ordnung in Ihren Zahlen.",
  "unterzeile": "…", "ctaPrimaer": { "label": "Erstgespräch vereinbaren", "href": "/termin/" },
  "fakten": [{ "wert": "18", "label": "Mitarbeitende" }], "grafikWerte": [34,42,39,51,48,60,55,67,63,74,71,86] }
```
Typ-spezifisch: `hero` (`unterzeile`, `bild`, `ctaPrimaer`, `ctaSekundaer`, `fakten[]`, `grafikWerte[12]`), `leistungen` (`auswahl[]`), `team` (`mitTeam`), `fristen`/`wissen` (`anzahl`), `faq` (`fragen[]`), `cta` (`button`, `bild`), `karriere` (`bild`), `kanzlei` (`text[]`, `bild`, `zitat`).

### `seiten`
Schalter je Unterseite: `leistungen`, `spezialisierungen`, `digitaleKanzlei`, `team`, `karriere`, `wissen`, `steuertermine`, `mandantenCheck`, `termin`, `kontakt`, `rechner`, `unterlagen`. Abgeschaltete Seiten werden nicht gebaut und verschwinden aus Navigation, Footer und Sitemap.

### `seo.seiten.<seitenId>`
`{ "titel": "…", "beschreibung": "…" }` für `start`, `leistungen`, `team`, … (max. 60 bzw. 160 Zeichen).

### Branchenfelder
| Feld | Inhalt |
|---|---|
| `kanzleiForm` | `Einzelkanzlei` \| `Partnerschaft` \| `PartG mbB` \| `GmbH` |
| `berufstraeger[]` | `slug, name, titel[], rolle, bestelltSeit, schwerpunkte[], sprachen[], foto, vita[ {jahr, text} ], email, telefon?, zitat?, kurzbio?` |
| `team[]` | `name, rolle, foto?, seit?, schwerpunkte[]` |
| `zielgruppen[]` | `slug, titel, ichBin` („Ich führe ein Unternehmen“), `kurztext, text[], icon, bild?` |
| `leistungen[]` | `slug, zielgruppe[]` (erste bestimmt die URL), `titel, kurztext, text[], punkte[], icon, bild?, faq[], seo?` |
| `spezialisierungen[]` | wie Leistungen, ohne Zielgruppe |
| `mitgliedschaften[]`, `software[]` | `{ name, url? }`, `{ name, beschreibung? }` |
| `portalLink` | `{ url, label, anbieter }` – z. B. DATEV Unternehmen online |
| `mandantenCheck` | `fragen[ { id, frage, hilfe?, optionen[ { id, label, beschreibung?, icon?, gewichte { ergebnisId: punkte }, anliegen? } ] } ]`, `ergebnisse[ { id, typ: passend\|hinweis, titel, text, leistungen[], ansprechpartner? } ]` |
| `buchung` | `modus: demo\|extern, url?, einbettung, anbieterName?, beratungsarten[ { id, label, beschreibung, icon, dauer } ], arbeitszeiten[]?, slotDauer, vorlaufTage, horizontTage` |
| `fristen[]` | `{ datum, titel, zielgruppe: unternehmen\|privat\|alle, hinweis?, verschieben }` – ergänzt die Regeltermine |
| `fristenRegeln` | `umsatzsteuerVoranmeldung, lohnsteuerAnmeldung, vorauszahlungen, gewerbesteuer, sozialversicherung` (alle Standard `true`) |
| `stellen[]` | `slug, titel, art, arbeitsort, beginn, stunden?, kurztext, aufgaben[], profil[], wirBieten[], gehalt { min, max, einheit }, veroeffentlicht, gueltigBis?, ansprechpartner?` → JobPosting-Schema |
| `benefits[]`, `karriere`, `digitaleKanzlei`, `unterlagen.checklisten[]`, `kennzahlen[]`, `ablauf`, `faq[]` | Inhalte der jeweiligen Seiten/Sektionen |
| `kammer` | `{ name, adresse, website }` – Pflicht fürs Impressum |
| `berufshaftpflicht` | `{ versicherer, adresse, geltungsbereich }` – Pflicht fürs Impressum |

### Weitere Bereiche
- `rechtliches`: `vertretungsberechtigt[]`, `register { art, gericht, nummer }`, `ustId`, `wirtschaftsId`, `inhaltlichVerantwortlich`, `verbraucherstreitbeilegung`, `datenschutzbeauftragter`, `hosting`, `agbUrl`, `zusatz[]`, `bildnachweise[]`
- `integrationen`: `formularEndpoint` (leer = Demo-Modus), `formularAnbieter`, `karte { aktiv, anbieter: osm\|google }`, `analytics { aktiv }` (Standard aus)
- `demo`: `banner { aktiv, text? }`, `agentur { name, telefon, email, website }` (**Ihre Agenturdaten eintragen**), `pitchSeite`
- `texte`: überschreibt einzelne Standardtexte, z. B. `{ "aktion.termin": "Kennenlerntermin vereinbaren" }` (Schlüssel siehe `src/data/texte.ts`)

---

## 4. Stil-Presets und Sektions-Layouts

### Presets
| Preset | Wirkung | Passt zu |
|---|---|---|
| **Klar & Digital** (`klar`) | Swiss Style, Schibsted Grotesk, viel Weiß, ein kräftiger Akzent, Raster und Datengrafik | digitale, wachsende Kanzleien, Mittelstand, Gründerberatung |
| **Klassisch Seriös** (`klassisch`) | Newsreader + Source Sans, Navy/Bordeaux mit Messing, Satzspiegel, ruhige Bewegung | Traditionskanzleien, Vermögende, Nachfolge, Partnerschaften mit langer Geschichte |
| **Persönlich Warm** (`warm`) | Plus Jakarta Sans, große Porträts in Bogenform, weiche Radien, warme Neutraltöne | Einzelkanzleien, Privatmandate, ländliche Regionen, Inhaber als Gesicht |

Vorschau jeder Variante in einem anderen Preset: `VARIANT=demo PRESET=warm npm run dev`.

### Layouts je Sektion
| Sektion | Layouts | Wann welches |
|---|---|---|
| `hero` | `statement` · `split` · `weiche` | *statement*: starke Aussage + Balkengrafik (digital/Mittelstand); *split*: Porträt im Mittelpunkt (Einzelkanzlei); *weiche*: viele Zielgruppen, Besucher sollen sofort abbiegen |
| `zielgruppen` | `karten` · `zeilen` | *karten* mit guten Fotos; *zeilen* typografisch, wenn Bilder fehlen |
| `leistungen` | `tabs` · `liste` · `bento` | *tabs* bei vielen Leistungen je Zielgruppe; *liste* ruhig mit Bildvorschau; *bento* für 5–7 Leistungen als Blickfang |
| `ablauf` | `gepinnt` · `zeitleiste` | *gepinnt*: Storytelling mit Smartphone (digitale Kanzlei); *zeitleiste*: kompakt, für persönliche Abläufe |
| `kennzahlen` | `reihe` · `band` | *reihe* hell und präzise; *band* als dunkler Akzent |
| `spezialisierungen` | `horizontal` · `raster` | *horizontal* bei 4+ Branchen mit starken Bildern; *raster* bei 2–3 |
| `team` | `karten` · `portraits` | *karten* bei mehreren Berufsträgern; *portraits* wenn eine Person das Gesicht ist |
| `fristen` | `kalender` · `kompakt` | *kalender* als Blickfang; *kompakt* als ruhige Liste |
| `stimmen` | `marquee` · `zitat` | *marquee* bei 4+ kurzen Stimmen; *zitat* bei wenigen, ausführlichen |
| `karriere` | `split` · `band` | *split* mit Stellenliste; *band* als knapper Hinweis |
| `wissen` | `liste` · `karten` | *liste* textlich; *karten* mit Artikelbildern |
| `faq` | `akkordeon` · `zweispaltig` | *akkordeon* bei vielen Fragen; *zweispaltig* bei wenigen, alles sichtbar |
| `cta` | `band` · `karte` | *band* kraftvoll; *karte* persönlich mit Porträt |
| `check` | `banner` · `karte` | *banner* als Blickfang mit Vorschau; *karte* dezent |
| `kanzlei` | `editorial` · `bild` | *editorial* Text mit Randnotiz; *bild* mit Foto und Zitat |
| `vertrauen` | `laufband` · `reihe` | Mitgliedschaften und Software |

---

## 5. Bilder-Leitfaden

- Format **JPG** (Fotos) bzw. **SVG/PNG** (Logos), sRGB, keine Wasserzeichen, kein Text im Bild.
- Pfade in der Config sind relativ zu `variants/<slug>/assets/`. Bilder werden beim Build zu **AVIF + WebP** mit `srcset` optimiert.
- Fehlt ein Bild, erscheint ein markenfarbiger Platzhalter mit der Bildbeschreibung; `variant:check` listet fehlende/zu kleine Bilder.
- Bildausschnitt mit `fokus` (z. B. `"50% 25%"`) und optional `fokusMobil` steuern.

| Slot | Ordner/Name | Seitenverhältnis | Mindestbreite |
|---|---|---|---|
| Porträt Berufsträger | `team/vorname-nachname.jpg` | 4:5 (Hochformat, Kopf im oberen Drittel) | 1000 px |
| Team | `team/vorname-nachname.jpg` | 1:1 | 800 px |
| Hero „split“ | wie Porträt | 4:5 | 1400 px |
| Zielgruppen | `zielgruppen/<slug>.jpg` | 4:5 | 1400 px |
| Branchen | `branchen/<slug>.jpg` | 4:5 / 3:2 | 1400 px |
| Kanzlei, Karriere | `kanzlei/buero.jpg`, `kanzlei/karriere.jpg` | 4:5 / 3:2 | 1800 px |
| Wissensartikel | `wissen/<artikel>.jpg` | 21:9 (wird automatisch zugeschnitten) | 1800 px |
| Logo | `logo.svg` (+ `logo-hell.svg` für dunkle Flächen) | – | – |

Alt-Texte sind Pflicht (außer `dekorativ: true`). Quellen in `variants/<slug>/CREDITS.md` dokumentieren.

---

## 6. Deployment

### Demos zeigen: GitHub Pages (wie beim Handwerker-Template)
`npm run publish` baut jede Variante mit Basis-Pfad und schiebt **nur die fertigen Seiten** in das öffentliche Repo
`lennertdockweiler/website-entwuerfe` (Einstellungen: `veroeffentlichen.config.json`). Der Template-Code bleibt privat.

```bash
npm run publish              # alle Varianten
npm run publish -- demo-2    # nur eine
```
Adressen: `https://lennertdockweiler.github.io/website-entwuerfe/<pfad>/`, z. B. `/hartmann-vogel/` und `/steuerbuero-albrecht/`.
Die Startseite des Repos ist neutral (kein Verzeichnis aller Entwürfe), `robots.txt` sperrt alles, jede Seite trägt `noindex`.
QR-Codes landen in `qr/<slug>.png`.

### Eigene Subdomain (Cloudflare Pages oder Netlify)
1. `VARIANT=<slug> npm run build` → `dist/<slug>/` ist eine vollständige statische Website.
2. **Cloudflare Pages:** „Direct Upload“ des Ordners oder `npx wrangler pages deploy dist/<slug> --project-name <slug>`; Subdomain unter *Custom domains* (z. B. `kanzlei-meyer.ihre-agentur.de`).
3. **Netlify:** `npx netlify deploy --dir dist/<slug> --prod` oder Ordner per Drag & Drop.
4. **Passwortschutz:** Cloudflare Access (kostenlos bis 50 Nutzer) bzw. Netlify „Password protection“ (Pro-Plan); alternativ Basic Auth per Worker.
5. Basis-Pfad nur nötig, wenn die Seite in einem Unterordner liegt: `BASE_PATH=/pfad/ npm run build`.

### Eigene Domain des Kunden
`meta.domain` auf die Kundendomain setzen, `meta.noindex: false`, neu bauen und bereitstellen, DNS (CNAME/A) beim Kunden auf den Hoster zeigen. HTTPS übernimmt der Hoster.

---

## 7. Checkliste „Von der Demo zur Live-Seite“

- [ ] `meta.noindex: false`, `meta.domain` = echte Domain
- [ ] `demo.banner.aktiv: false`, `demo.pitchSeite: false`
- [ ] `integrationen.formularEndpoint` setzen (z. B. Formspree, Web3Forms, Netlify Forms) und `formularAnbieter` eintragen; Testanfrage senden
- [ ] Terminbuchung: Demo-Modus ist simuliert → für live `buchung.modus: "extern"` mit echtem Buchungsdienst **oder** Anfragen über den Formular-Endpoint bestätigen
- [ ] **Rechtstexte prüfen:** Impressum (Kammer-Anschrift, Versicherung, Register, USt-IdNr.) und Datenschutzerklärung anwaltlich bzw. per Generator prüfen
- [ ] **Steuerwerte** in `src/data/steuerwerte.ts` und Fristen aktualisieren
- [ ] **Bildrechte klären:** Demo-Fotos (Unsplash, Modelle) durch eigene Fotos ersetzen; Einwilligungen der abgebildeten Mitarbeitenden
- [ ] **Echte Bewertungen:** Beispielstimmen entfernen, nur Stimmen mit schriftlicher Einwilligung; `bewertungen.echt` nur bei echten Daten
- [ ] Texte mit dem Inhaber abstimmen (berufsrechtlich sachlich, Titel exakt)
- [ ] `npm run variant:check -- <slug>` ohne Fehler, `npm run test -- <slug>`, `npm run lighthouse -- <slug>`
- [ ] Google Search Console einrichten, Sitemap (`/sitemap-index.xml`) einreichen, Google-Unternehmensprofil mit identischen NAP-Daten
- [ ] Optional: Analytics nur datenschutzfreundlich und mit Datenschutzhinweis

---

## 8. Bekannte Grenzen und offene Punkte

- **Steuerwerte und Fristen** sind nach bestem Wissen zum Stand 10/2026 hinterlegt (u. a. Entfernungspauschale 0,38 € ab dem ersten Kilometer ab 2026, Kleinunternehmergrenzen 25.000/100.000 €). Vor dem Livegang prüfen.
- **Kammer-Anschriften der Demos** (Steuerberaterkammer Westfalen-Lippe, Niedersachsen) wurden nicht gegen die offiziellen Websites verifiziert (diese waren bei der Erstellung nicht erreichbar).
- **Demo-Terminbuchung** simuliert freie Zeiten aus den Arbeitszeiten; ohne Endpoint wird nichts gesendet.
- **Datenschutzerklärung** ist eine aus der Config erzeugte Vorlage, keine Rechtsberatung.
- **Preset „Klassisch Seriös“** hat keine eigene Demo-Variante; es wurde per `PRESET=klassisch` gebaut und gesichtet.
- **Agenturdaten** in den Demos sind Platzhalter („Studio Nordlicht Webdesign“) – vor dem Kundentermin in `demo.agentur` eintragen.
- Ganzseiten-Screenshots werden mit emulierter reduzierter Bewegung aufgenommen (Endzustand ohne gepinnte Bereiche); die „-fold“-Aufnahmen zeigen den animierten Einstieg.
- Lighthouse-Werte schwanken je Lauf um wenige Punkte; gemessen lokal mit simuliertem 4G (Lighthouse-Standard).

---

## Projektstruktur

```
variants/
  _schema.ts                 Zod-Schema (Single Source of Truth), Querverweis-Prüfung, deutsche Fehler
  site.config.schema.json    erzeugtes JSON-Schema für VS Code
  _template/                 kommentierte Kopiervorlage
  demo/ demo-2/              Varianten: site.config.json, assets/, wissen/, CREDITS.md
src/
  components/sections/<typ>/ je Sektion 2–3 Layouts + Sektion.astro (Verteiler)
  components/ui/             Button, Foto, Icon, Logo/Wortmarke, Formularfelder, Akkordeon …
  components/interactive/    Formulare, Zwei-Klick-Einbettung
  components/islands/        Preact: Mandanten-Check, Terminbuchung
  lib/config.ts              lädt und validiert die aktive Variante, Preset-Zusammenführung, t()
  lib/theme.ts               OKLCH-Farbskalen, WCAG-Kontrastautomatik
  lib/animations/            GSAP-Module (data-anim), Lenis-Kopplung, Aufräumen bei Seitenwechsel
  lib/fristen.ts             Steuertermine inkl. Feiertage je Bundesland (§ 108 Abs. 3 AO)
  lib/seo.ts                 Meta, Open Graph, JSON-LD
  data/                      Presets, Schriften, Standardtexte (Sie/Du), Steuerwerte, Checklisten, Rechtstexte
  routes/                    optionale Seiten (werden je nach `seiten` eingebunden)
  pages/                     Startseite, Impressum, Datenschutz, 404, OG-Bilder, robots, Service Worker
  middleware.ts              Basis-Pfad für Veröffentlichung in Unterordnern
scripts/                     variant:new/check, build:all, shots, qr, colors, publish, test, lighthouse
```

## Technik-Entscheidungen (Kurzfassung)

- **Varianten per `VARIANT`**, Validierung schon in `astro.config.ts` → ungültige Configs brechen den Build mit deutscher Fehlerliste ab.
- **Optionale Seiten per `injectRoute`**: abgeschaltete Seiten existieren nicht einmal als Datei.
- **Schriften über die Astro Fonts API** aus `@fontsource-variable` (lokal, nur latin/latin-ext, Preload, automatischer Fallback mit Metrik-Anpassung). Kein Google-Fonts-CDN.
- **Hero-Animation per CSS** (LCP-sicher, startet ohne JavaScript nie bei `opacity: 0`); GSAP nur unterhalb des Folds.
- **Lebenszyklus**: `astro:page-load` startet Module, `astro:before-swap` räumt GSAP-Kontexte, ScrollTrigger, Lenis und Listener (AbortController) auf.
- **Fristen werden im Browser berechnet** → Countdown stimmt auch Monate nach dem Build.
- **Bildqualität** zentral (`BILD_QUALITAET`), Artikelbilder werden beim Build auf 21:9 zugeschnitten.
