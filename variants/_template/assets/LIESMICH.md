# Bilder dieser Variante

Pfade in der site.config.json beziehen sich auf diesen Ordner (z. B. "team/anna-meyer.jpg").
Empfohlene Ordner und Mindestgrößen (JPG, sRGB, keine Wasserzeichen):

| Ordner        | Inhalt                           | Format        | Mindestbreite |
|---------------|----------------------------------|---------------|---------------|
| team/         | Porträts, Name als Dateiname     | 4:5 Hochformat | 1000 px      |
| zielgruppen/  | je Zielgruppe ein Motiv          | 4:5 oder 3:2  | 1400 px       |
| branchen/     | je Spezialisierung ein Motiv     | 4:5           | 1400 px       |
| kanzlei/      | Büro, Arbeitsplatz, Karriere     | 3:2 / 4:5     | 1800 px       |
| wissen/       | Artikelbilder                    | 21:9 / 3:2    | 1800 px       |
| logo.svg      | Logo (SVG bevorzugt), optional   | –             | –             |

Fehlt ein Bild, zeigt die Seite einen markenfarbigen Platzhalter mit der Bildbeschreibung.
`npm run variant:check -- <slug>` listet fehlende und zu kleine Bilder.
