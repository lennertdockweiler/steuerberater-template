/**
 * Content Collection „wissen“: Markdown-Artikel der AKTIVEN Variante aus
 * variants/<slug>/wissen/*.md. Dateien mit führendem Unterstrich werden ignoriert.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const wissen = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: `./variants/${__VARIANT__}/wissen` }),
  schema: z.object({
    titel: z.string().max(90),
    beschreibung: z.string().max(170),
    kategorie: z.enum(['Steuertipps', 'Mandanteninformation', 'Unternehmen', 'Privat', 'Kanzlei']),
    datum: z.coerce.date(),
    /** Rechtsstand des Beitrags */
    stand: z.coerce.date(),
    /** Slug eines Berufsträgers */
    autor: z.string().optional(),
    /** Bild relativ zu variants/<slug>/assets/ */
    bild: z.string().optional(),
    bildAlt: z.string().optional(),
    zielgruppe: z.enum(['unternehmen', 'privat', 'alle']).default('alle'),
    entwurf: z.boolean().default(false),
  }),
});

export const collections = { wissen };
