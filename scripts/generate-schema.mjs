#!/usr/bin/env node
/** npm run schema: erzeugt variants/site.config.schema.json aus dem Zod-Schema. */
import { writeFileSync } from 'node:fs';
import { z } from 'zod';
import { schemaLaden, farbe } from './lib/varianten.mjs';

const { siteConfigSchema } = await schemaLaden();
writeFileSync('variants/site.config.schema.json', JSON.stringify(z.toJSONSchema(siteConfigSchema, { io: 'input', unrepresentable: 'any' }), null, 2));
console.log(farbe.gruen('✓ variants/site.config.schema.json aktualisiert'));
