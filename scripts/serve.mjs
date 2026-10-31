/** npm run serve -- <slug> [port]: dient dist/<slug>/ statisch aus. */
import { existsSync } from 'node:fs';
import { starteServer } from './lib/server.mjs';

const slug = process.argv[2] ?? 'demo';
const port = Number(process.argv[3] ?? 4400);
const wurzel = `dist/${slug}`;
if (!existsSync(wurzel)) {
  console.error(`dist/${slug} fehlt. Zuerst bauen: VARIANT=${slug} npm run build`);
  process.exit(1);
}
await starteServer(wurzel, port);
console.log(`▸ ${slug}: http://localhost:${port}/`);
