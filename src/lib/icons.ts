/**
 * Lucide-Icons als SVG-String (nur serverseitig), z. B. um sie an Preact-Islands
 * zu übergeben. Gleiches Set wie <Icon />.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const cache = new Map<string, string>();

export function iconSvg(name: string, groesse = 24, strich = 1.75): string {
  let inner = cache.get(name);
  if (inner === undefined) {
    try {
      const require = createRequire(import.meta.url);
      const svg = readFileSync(require.resolve(`lucide-static/icons/${name}.svg`), 'utf8');
      inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
    } catch {
      inner = '<circle cx="12" cy="12" r="9" />';
    }
    cache.set(name, inner);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${groesse}" height="${groesse}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strich}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
}
