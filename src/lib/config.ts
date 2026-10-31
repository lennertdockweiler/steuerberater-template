/**
 * Lädt und validiert die aktive Variante und verbindet sie mit dem Preset.
 * Komponenten importieren AUSSCHLIESSLICH von hier (nie die JSON direkt).
 * Nur serverseitig verwenden: Client-Skripte bekommen Daten per data-Attribut.
 */
import { siteConfigSchema, formatiereFehler, type SiteConfig, type Sektion } from '../../variants/_schema';
import { PRESETS, RADIEN, BEWEGUNG, type PresetKey } from '../data/presets';
import { TEXTE, type TextKey } from '../data/texte';
import { CHECKLISTEN } from '../data/checklisten';
import { erzeugeTheme } from './theme';
import { typoTief, fuelle } from './format';

export const VARIANT: string = __VARIANT__;
const PRESET_OVERRIDE = __PRESET__ as PresetKey | '';

const rohConfigs = import.meta.glob<unknown>('/variants/*/site.config.json', { eager: true, import: 'default' });
const roh = rohConfigs[`/variants/${VARIANT}/site.config.json`];
if (!roh) throw new Error(`Variante "${VARIANT}" nicht gefunden (variants/${VARIANT}/site.config.json).`);

const ergebnis = siteConfigSchema.safeParse(roh);
if (!ergebnis.success) {
  throw new Error(`Ungültige Konfiguration "${VARIANT}":\n${formatiereFehler(ergebnis.error, roh).join('\n')}`);
}

/** Die validierte Config, mit korrigierter deutscher Typografie in allen Freitexten. */
export const config: SiteConfig = typoTief(ergebnis.data);
// Lighthouse-Messbuild: noindex temporär aus (siehe scripts/lighthouse.mjs)
if (__MESSUNG__) config.meta.noindex = false;

// ── Design: Preset + Overrides ─────────────────────────────────────────────
const presetKey: PresetKey = PRESET_OVERRIDE || config.branding.stilPreset;
export const preset = PRESETS[presetKey];
const b = config.branding;
const ueberschreiben = !PRESET_OVERRIDE;

export const design = {
  presetKey,
  preset,
  schriften: (ueberschreiben && b.schriftPaar) || preset.schriften,
  radiusKey: (ueberschreiben && b.radius) || preset.radius,
  radius: RADIEN[(ueberschreiben && b.radius) || preset.radius],
  intensitaet: (ueberschreiben && b.animationsIntensitaet) || preset.animationsIntensitaet,
  bewegung: BEWEGUNG[(ueberschreiben && b.animationsIntensitaet) || preset.animationsIntensitaet],
  bildstil: { ...preset.bildstil, ...(ueberschreiben ? b.bildstil : {}) },
  farben: {
    primaer: b.farben.primaer,
    akzent: b.farben.akzent ?? preset.farben.akzent,
    neutralTon: b.farben.neutralTon ?? preset.farben.neutralTon,
  },
};

export const theme = erzeugeTheme({
  ...design.farben,
  hintergrundL: preset.hintergrundL,
  neutralStaerke: preset.neutralStaerke,
});

// ── Sektionen mit aufgelöstem Layout ───────────────────────────────────────
export type AktiveSektion = Sektion & { layout: string };
export const sektionen: AktiveSektion[] = config.sektionen
  .filter((s) => s.aktiv)
  .map((s) => ({ ...s, layout: s.layout ?? preset.layouts[s.typ] }) as AktiveSektion);

// ── Texte ──────────────────────────────────────────────────────────────────
/** Standardtext in der Anrede der Variante; Config-Overrides haben Vorrang. */
export function t(key: TextKey, werte: Record<string, string | number> = {}): string {
  const eigener = config.texte[key];
  const standard = TEXTE[key];
  const roh = eigener ?? (typeof standard === 'string' ? standard : standard[config.meta.anrede]);
  return fuelle(roh, {
    betrieb: config.betrieb.name,
    kurzname: config.betrieb.kurzname,
    ort: config.betrieb.adresse.ort,
    telefon: config.betrieb.telefon,
    ...werte,
  });
}

/** Sektionsüberschrift: Config-Wert oder Standardtext. */
export const titelOder = (wert: string | undefined, key: TextKey) => wert ?? t(key);

// ── Abgeleitete Daten ──────────────────────────────────────────────────────
export const checklisten = config.unterlagen.checklisten ?? CHECKLISTEN;

export const sichtbareStimmen = (config.betrieb.bewertungen?.eintraege ?? []).filter((e) => e.einwilligungLiegtVor === true);

export const berufstraegerBySlug = (slug?: string) => config.berufstraeger.find((b) => b.slug === slug);
export const leistungBySlug = (slug: string) => config.leistungen.find((l) => l.slug === slug);
export const zielgruppeBySlug = (slug: string) => config.zielgruppen.find((z) => z.slug === slug);

/** Kanonische URL einer Leistung (erste Zielgruppe bestimmt den Pfad). */
export const leistungPfad = (l: { slug: string; zielgruppe: string[] }) => `/leistungen/${l.zielgruppe[0]}/${l.slug}/`;

export const istDemo = config.meta.noindex && config.demo.banner.aktiv;
export const formularDemo = !config.integrationen.formularEndpoint;
