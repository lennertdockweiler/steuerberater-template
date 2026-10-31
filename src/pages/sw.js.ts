/**
 * Schlanker Service Worker: Nach dem ersten Besuch funktioniert die Demo auch bei
 * schlechtem Netz im Betrieb des Kunden flüssig.
 *  - /_astro/* (gehashte Dateien): Cache zuerst
 *  - Seiten (HTML): Netz zuerst, bei Ausfall aus dem Cache
 *  - übrige Dateien: aus dem Cache, im Hintergrund aktualisieren
 * Die Version wechselt mit jedem Build, alte Caches werden gelöscht.
 */
import type { APIRoute } from 'astro';

const VERSION = `v${Date.now().toString(36)}`;
const B = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

const code = `const V='${VERSION}';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(['${B}'])).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
const seite=u=>u.pathname.endsWith('/')||u.pathname.endsWith('.html');
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
if(u.pathname.startsWith('${B}_astro/')){e.respondWith(caches.match(r).then(t=>t||fetch(r).then(n=>{const k=n.clone();caches.open(V).then(c=>c.put(r,k));return n})));return}
if(r.mode==='navigate'||seite(u)){e.respondWith(fetch(r).then(n=>{const k=n.clone();caches.open(V).then(c=>c.put(r,k));return n}).catch(()=>caches.match(r).then(t=>t||caches.match('${B}'))));return}
e.respondWith(caches.match(r).then(t=>{const n=fetch(r).then(x=>{const k=x.clone();caches.open(V).then(c=>c.put(r,k));return x}).catch(()=>t);return t||n}))});`;

export const GET: APIRoute = () => new Response(code, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
