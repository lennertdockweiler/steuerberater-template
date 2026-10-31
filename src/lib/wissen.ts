/** Zugriff auf die Wissens-Artikel der aktiven Variante. */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Artikel = CollectionEntry<'wissen'>;

export async function alleArtikel(): Promise<Artikel[]> {
  const liste = await getCollection('wissen', (a) => !a.data.entwurf);
  return liste.sort((a, b) => b.data.datum.getTime() - a.data.datum.getTime());
}

export const artikelPfad = (a: Artikel) => `/wissen/${a.id}/`;

export const isoVon = (d: Date) => d.toISOString().slice(0, 10);
