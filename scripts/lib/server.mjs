/**
 * Minimaler statischer Server für dist/<slug>/ (für Screenshots, Lighthouse, Tests).
 * Unterstützt Verzeichnis-Index, 404-Seite und gzip.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createGzip } from 'node:zlib';

const TYPEN = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.ics': 'text/calendar',
};
const KOMPRIMIEREN = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.xml', '.webmanifest']);

export function starteServer(wurzel, port = 4400) {
  const server = createServer((req, res) => {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let pfad = normalize(join(wurzel, url));
    if (!pfad.startsWith(normalize(wurzel))) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(pfad) && statSync(pfad).isDirectory()) pfad = join(pfad, 'index.html');
    let status = 200;
    if (!existsSync(pfad)) {
      if (existsSync(`${pfad}.html`)) pfad = `${pfad}.html`;
      else {
        status = 404;
        pfad = join(wurzel, '404.html');
        if (!existsSync(pfad)) {
          res.writeHead(404).end('404');
          return;
        }
      }
    }
    const ext = extname(pfad);
    const kopf = {
      'Content-Type': TYPEN[ext] ?? 'application/octet-stream',
      'Cache-Control': url.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    };
    if (KOMPRIMIEREN.has(ext) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
      res.writeHead(status, { ...kopf, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' });
      createReadStream(pfad).pipe(createGzip()).pipe(res);
    } else {
      res.writeHead(status, kopf);
      createReadStream(pfad).pipe(res);
    }
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}
