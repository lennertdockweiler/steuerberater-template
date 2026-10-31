/// <reference types="astro/client" />

/** Aktive Variante (Ordnername unter variants/), gesetzt in astro.config.ts */
declare const __VARIANT__: string;
/** Optionale Preset-Vorschau (PRESET=klar|klassisch|warm), sonst leer */
declare const __PRESET__: string;
/** true nur beim Lighthouse-Messbuild (noindex temporär aus) */
declare const __MESSUNG__: boolean;
