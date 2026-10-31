/**
 * Öffnungszeiten lesbar zusammenfassen: „Mo–Do 8:00–17:00 Uhr“.
 */
type Fenster = { tage: string[]; von: string; bis: string };

const KURZ: Record<string, string> = { mo: 'Mo', di: 'Di', mi: 'Mi', do: 'Do', fr: 'Fr', sa: 'Sa', so: 'So' };
const REIHE = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'];

const zeit = (z: string) => z.replace(/^0/, '');

function tageText(tage: string[]): string {
  const idx = [...new Set(tage)].map((t) => REIHE.indexOf(t)).sort((a, b) => a - b);
  const gruppen: number[][] = [];
  for (const i of idx) {
    const letzte = gruppen.at(-1);
    if (letzte && i === letzte.at(-1)! + 1) letzte.push(i);
    else gruppen.push([i]);
  }
  return gruppen
    .map((g) => (g.length > 2 ? `${KURZ[REIHE[g[0]]]}–${KURZ[REIHE[g.at(-1)!]]}` : g.map((i) => KURZ[REIHE[i]]).join(', ')))
    .join(', ');
}

/** Gruppiert Tage mit identischen Zeiten; mehrere Fenster pro Tag werden verbunden. */
export function zeitenZeilen(fenster: Fenster[]): { tage: string; zeiten: string }[] {
  const proTag = new Map<string, string[]>();
  const sortiert = [...fenster].sort((a, b) => a.von.localeCompare(b.von));
  for (const f of sortiert) for (const t of f.tage) proTag.set(t, [...(proTag.get(t) ?? []), `${zeit(f.von)}–${zeit(f.bis)}`]);
  const nachZeiten = new Map<string, string[]>();
  for (const t of REIHE) {
    const z = proTag.get(t);
    if (!z) continue;
    const key = z.join(' und ');
    nachZeiten.set(key, [...(nachZeiten.get(key) ?? []), t]);
  }
  return [...nachZeiten.entries()].map(([zeiten, tage]) => ({ tage: tageText(tage), zeiten: `${zeiten} Uhr` }));
}
