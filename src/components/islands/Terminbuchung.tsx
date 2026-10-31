/**
 * Terminbuchung (Preact-Island): Beratungsart → Datum → Uhrzeit → Kontaktdaten →
 * Bestätigung mit .ics-Datei.
 *
 * Demo-Modus: Freie Zeitfenster werden aus den Arbeitszeiten der Config simuliert
 * (deterministisch „belegt“, damit es realistisch aussieht). Feiertage des
 * Bundeslands und geschlossene Sondertage sind ausgenommen.
 * Ist ein formularEndpoint gesetzt, wird die Anfrage dorthin gesendet.
 *
 * Sicherheit: Icon-Strings stammen aus src/lib/icons.ts (Build-Zeit), nie aus Eingaben.
 */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { feiertage, ausIso, heuteIso, type Land } from '../../lib/fristen';
import '../../styles/buchung.css';

type Art = { id: string; label: string; beschreibung: string; icon: string; dauer: number };
type Fenster = { tage: string[]; von: string; bis: string };
type Texte = Record<string, string>;

type Props = {
  arten: Art[];
  arbeitszeiten: Fenster[];
  slotDauer: number;
  vorlaufTage: number;
  horizontTage: number;
  land: Land;
  geschlossen: string[];
  endpoint: string;
  texte: Texte;
  kanzlei: { name: string; adresse: string; host: string };
  icons: { zurueck: string; weiter: string; links: string; rechts: string; kalender: string };
};

const WT = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const minuten = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const isoPlus = (iso: string, tage: number) => new Date(ausIso(iso).getTime() + tage * 86_400_000).toISOString().slice(0, 10);
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('de-DE', { ...o, timeZone: 'UTC' }).format(ausIso(iso));
const fuelle = (s: string, w: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(w[k] ?? ''));

/** Kleiner deterministischer Hash (djb2), damit „belegte“ Slots stabil bleiben. */
const hash = (s: string) => [...s].reduce((h, c) => ((h << 5) + h + c.charCodeAt(0)) >>> 0, 5381);

/** Minuten, um die Berlin der UTC voraus ist (Sommer-/Winterzeit). */
function berlinOffset(d: Date): number {
  const tz = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Berlin', timeZoneName: 'shortOffset' }).formatToParts(d).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+1';
  const m = tz.match(/GMT([+-]\d+)(?::(\d+))?/);
  return m ? Number(m[1]) * 60 + Math.sign(Number(m[1])) * Number(m[2] ?? 0) : 60;
}
const icsZeit = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

export default function Terminbuchung(p: Props) {
  const t = p.texte;
  const heute = heuteIso();
  const [schritt, setSchritt] = useState(0);
  const [art, setArt] = useState<Art | null>(p.arten.length === 1 ? p.arten[0] : null);
  const [datum, setDatum] = useState<string | null>(null);
  const [zeit, setZeit] = useState<string | null>(null);
  // Kalender startet im Monat des ersten buchbaren Tages (nicht in einem Monat ohne freie Tage)
  const [monat, setMonat] = useState(isoPlus(heute, p.vorlaufTage).slice(0, 7));
  const [daten, setDaten] = useState({ name: '', email: '', telefon: '', anliegen: '' });
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const [sendet, setSendet] = useState(false);
  const [sendefehler, setSendefehler] = useState('');
  const kopfRef = useRef<HTMLHeadingElement>(null);
  const kalenderRef = useRef<HTMLDivElement>(null);
  const erstes = useRef(true);

  // Anliegen aus dem Mandanten-Check übernehmen (?anliegen=…)
  useEffect(() => {
    const a = new URLSearchParams(location.search).get('anliegen');
    if (a) setDaten((d) => ({ ...d, anliegen: a.slice(0, 500) }));
  }, []);

  useEffect(() => {
    if (erstes.current) {
      erstes.current = false;
      return;
    }
    kopfRef.current?.focus({ preventScroll: true });
    kopfRef.current?.closest('.tb')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [schritt]);

  const erster = isoPlus(heute, p.vorlaufTage);
  const letzter = isoPlus(heute, p.horizontTage);

  /** Freie Zeitfenster eines Tages für die gewählte Beratungsart. */
  const slotsFuer = (iso: string): string[] => {
    if (iso < erster || iso > letzter) return [];
    const d = ausIso(iso);
    if (feiertage(d.getUTCFullYear(), p.land).has(iso) || p.geschlossen.includes(iso)) return [];
    const dauer = art?.dauer ?? p.slotDauer;
    const liste: string[] = [];
    for (const f of p.arbeitszeiten.filter((f) => f.tage.includes(WT[d.getUTCDay()]))) {
      for (let m = minuten(f.von); m + dauer <= minuten(f.bis); m += p.slotDauer) liste.push(hhmm(m));
    }
    const jetzt = new Date();
    const jetztMin = jetzt.getHours() * 60 + jetzt.getMinutes() + 90;
    return liste.filter((z) => hash(`${iso}${z}${art?.id ?? ''}`) % 100 >= 36 && (iso !== heute || minuten(z) > jetztMin));
  };

  // Kalenderraster des angezeigten Monats (Wochenbeginn Montag)
  const tage = useMemo(() => {
    const [y, m] = monat.split('-').map(Number);
    const erst = new Date(Date.UTC(y, m - 1, 1));
    const versatz = (erst.getUTCDay() + 6) % 7;
    const anzahl = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const zellen: (string | null)[] = Array.from({ length: versatz }, () => null);
    for (let i = 1; i <= anzahl; i++) zellen.push(`${monat}-${String(i).padStart(2, '0')}`);
    return zellen;
  }, [monat]);
  const frei = useMemo(() => new Map(tage.filter(Boolean).map((iso) => [iso!, slotsFuer(iso!).length])), [tage, art]);
  const wochentage = useMemo(() => Array.from({ length: 7 }, (_, i) => fmt(`2024-01-0${i + 1}`, { weekday: 'short' }).replace('.', '')), []);

  const monatPlus = (n: number) => {
    const [y, m] = monat.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + n, 1));
    return d.toISOString().slice(0, 7);
  };
  const kannZurueck = monatPlus(-1) >= erster.slice(0, 7);
  const kannVor = monatPlus(1) <= letzter.slice(0, 7);

  // Tastatur im Kalender: Pfeile ±1 Tag / ±1 Woche
  const kalenderTasten = (e: KeyboardEvent) => {
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!delta) return;
    const knoepfe = [...(kalenderRef.current?.querySelectorAll<HTMLButtonElement>('button[data-iso]') ?? [])];
    const i = knoepfe.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    for (let j = i + delta; j >= 0 && j < knoepfe.length; j += Math.sign(delta)) {
      if (!knoepfe[j].disabled) {
        knoepfe[j].focus();
        return;
      }
      if (Math.abs(delta) === 7) break;
    }
  };

  const pruefe = () => {
    const f: Record<string, string> = {};
    if (!daten.name.trim()) f.name = t.fehlerPflicht;
    if (!daten.email.trim()) f.email = t.fehlerPflicht;
    else if (!EMAIL.test(daten.email.trim())) f.email = t.fehlerEmail;
    if (daten.telefon.trim() && daten.telefon.replace(/\D/g, '').length < 6) f.telefon = t.fehlerTelefon;
    setFehler(f);
    return f;
  };

  const absenden = async (e: Event) => {
    e.preventDefault();
    const f = pruefe();
    if (Object.keys(f).length) {
      (document.getElementById(`tb-${Object.keys(f)[0]}`) as HTMLElement | null)?.focus();
      return;
    }
    setSendet(true);
    setSendefehler('');
    const honig = (e.currentTarget as HTMLFormElement).querySelector<HTMLInputElement>('[name="website"]')?.value;
    let ok = true;
    if (p.endpoint && !honig) {
      try {
        const fd = new FormData();
        fd.append('formular', 'terminbuchung');
        fd.append('beratungsart', art?.label ?? '');
        fd.append('datum', datum ?? '');
        fd.append('uhrzeit', zeit ?? '');
        Object.entries(daten).forEach(([k, v]) => fd.append(k, v));
        const res = await fetch(p.endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
        ok = res.ok;
      } catch {
        ok = false;
      }
    } else {
      await new Promise((r) => setTimeout(r, 900));
    }
    setSendet(false);
    if (ok) setSchritt(4);
    else setSendefehler(t.fehlerSenden);
  };

  const icsHerunterladen = () => {
    if (!datum || !zeit || !art) return;
    const [y, m, d] = datum.split('-').map(Number);
    const [h, mi] = zeit.split(':').map(Number);
    const geraten = Date.UTC(y, m - 1, d, h, mi);
    const start = new Date(geraten - berlinOffset(new Date(geraten)) * 60_000);
    const ende = new Date(start.getTime() + art.dauer * 60_000);
    const ort = art.id === 'vor-ort' ? p.kanzlei.adresse : art.label;
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:-//${icsText(p.kanzlei.name)}//Terminbuchung//DE`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${Date.now()}-${Math.round(Math.random() * 1e6)}@${p.kanzlei.host}`,
      `DTSTAMP:${icsZeit(new Date())}`,
      `DTSTART:${icsZeit(start)}`,
      `DTEND:${icsZeit(ende)}`,
      `SUMMARY:${icsText(`${art.label}: ${p.kanzlei.name}`)}`,
      `LOCATION:${icsText(ort)}`,
      `DESCRIPTION:${icsText(daten.anliegen || art.beschreibung)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `termin-${datum}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const schritte = [t.schritt1, t.schritt2, t.schritt3, t.schritt4];
  const zurueck = (
    <button type="button" class="btn btn-sekundaer btn-klein" onClick={() => setSchritt((s) => Math.max(0, s - 1))}>
      <span class="btn-icon" dangerouslySetInnerHTML={{ __html: p.icons.zurueck }} />
      <span class="btn-label">{t.zurueck}</span>
    </button>
  );

  return (
    <div class="tb">
      {schritt < 4 && (
        <ol class="tb-schritte" role="list" aria-label={t.fortschritt}>
          {schritte.map((s, i) => (
            <li class={i === schritt ? 'ist-aktiv' : i < schritt ? 'ist-fertig' : ''} aria-current={i === schritt ? 'step' : undefined}>
              <span class="tb-nr">{i + 1}</span>
              <span class="tb-slabel">{s}</span>
            </li>
          ))}
        </ol>
      )}

      {/* ── 1: Beratungsart ── */}
      {schritt === 0 && (
        <div class="tb-panel" key="s0">
          <h2 class="tb-titel" tabIndex={-1} ref={kopfRef}>
            {t.frage1}
          </h2>
          <div class="tb-arten" role="radiogroup" aria-label={t.frage1}>
            {p.arten.map((a, i) => (
              <button
                type="button"
                role="radio"
                aria-checked={art?.id === a.id}
                class="tb-art"
                style={{ '--i': i }}
                onClick={() => {
                  setArt(a);
                  setZeit(null);
                  setSchritt(1);
                }}
              >
                <span class="tb-art-icon" dangerouslySetInnerHTML={{ __html: a.icon }} />
                <strong>{a.label}</strong>
                <span>{a.beschreibung}</span>
                <span class="tb-dauer">{fuelle(t.minuten, { n: a.dauer })}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 2: Datum ── */}
      {schritt === 1 && (
        <div class="tb-panel" key="s1">
          <h2 class="tb-titel" tabIndex={-1} ref={kopfRef}>
            {t.frage2}
          </h2>
          <div class="tb-kalender" ref={kalenderRef} onKeyDown={(e) => kalenderTasten(e as unknown as KeyboardEvent)}>
            <div class="tb-monat">
              <button type="button" class="tb-pfeil" disabled={!kannZurueck} onClick={() => setMonat(monatPlus(-1))} aria-label={t.monatZurueck}>
                <span dangerouslySetInnerHTML={{ __html: p.icons.links }} />
              </button>
              <p aria-live="polite">{fmt(`${monat}-01`, { month: 'long', year: 'numeric' })}</p>
              <button type="button" class="tb-pfeil" disabled={!kannVor} onClick={() => setMonat(monatPlus(1))} aria-label={t.monatVor}>
                <span dangerouslySetInnerHTML={{ __html: p.icons.rechts }} />
              </button>
            </div>
            <div class="tb-raster" role="group" aria-label={fmt(`${monat}-01`, { month: 'long', year: 'numeric' })}>
              {wochentage.map((w) => (
                <span class="tb-wt" aria-hidden="true">
                  {w}
                </span>
              ))}
              {tage.map((iso) => {
                if (!iso) return <span aria-hidden="true" />;
                const n = frei.get(iso) ?? 0;
                const label = `${fmt(iso, { weekday: 'long', day: 'numeric', month: 'long' })}, ${n ? fuelle(t.freieTermine, { n }) : t.keineTermine}`;
                return (
                  <button
                    type="button"
                    data-iso={iso}
                    class={`tb-tag${datum === iso ? ' ist-gewaehlt' : ''}${iso === heute ? ' ist-heute' : ''}`}
                    disabled={n === 0}
                    aria-label={label}
                    aria-pressed={datum === iso}
                    onClick={() => {
                      setDatum(iso);
                      setZeit(null);
                      setSchritt(2);
                    }}
                  >
                    <span>{Number(iso.slice(8))}</span>
                    {n > 0 && <i aria-hidden="true" style={{ '--n': Math.min(1, n / 10) }} />}
                  </button>
                );
              })}
            </div>
          </div>
          <div class="tb-nav">{zurueck}</div>
        </div>
      )}

      {/* ── 3: Uhrzeit ── */}
      {schritt === 2 && datum && (
        <div class="tb-panel" key="s2">
          <h2 class="tb-titel" tabIndex={-1} ref={kopfRef}>
            {fuelle(t.frage3, { datum: fmt(datum, { weekday: 'long', day: 'numeric', month: 'long' }) })}
          </h2>
          {slotsFuer(datum).length ? (
            <div class="tb-slots" role="radiogroup" aria-label={t.schritt3}>
              {slotsFuer(datum).map((z, i) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={zeit === z}
                  class="tb-slot"
                  style={{ '--i': i }}
                  onClick={() => {
                    setZeit(z);
                    setSchritt(3);
                  }}
                >
                  {z}
                </button>
              ))}
            </div>
          ) : (
            <p>{t.keineSlots}</p>
          )}
          <div class="tb-nav">{zurueck}</div>
        </div>
      )}

      {/* ── 4: Kontaktdaten ── */}
      {schritt === 3 && datum && zeit && art && (
        <div class="tb-panel" key="s3">
          <h2 class="tb-titel" tabIndex={-1} ref={kopfRef}>
            {t.frage4}
          </h2>
          <div class="tb-zusammenfassung">
            <span dangerouslySetInnerHTML={{ __html: p.icons.kalender }} />
            <p>
              <strong>{art.label}</strong>
              <br />
              {`${fmt(datum, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, ${zeit} ${t.uhr}`}
            </p>
            <button type="button" class="tb-aendern" onClick={() => setSchritt(1)}>
              {t.aendern}
            </button>
          </div>
          <form class="tb-form" onSubmit={absenden} noValidate>
            {(['name', 'email', 'telefon'] as const).map((feld) => (
              <div class="feld">
                <label for={`tb-${feld}`}>
                  {t[`label_${feld}`]}
                  {feld !== 'telefon' && <span class="tb-pflicht" aria-hidden="true"> *</span>}
                </label>
                <input
                  id={`tb-${feld}`}
                  class="eingabe"
                  // Cast nur für die strengen Preact-11-Typen (Union bei type wird nicht aufgelöst)
                  type={(feld === 'email' ? 'email' : feld === 'telefon' ? 'tel' : 'text') as 'text'}
                  autocomplete={feld === 'email' ? 'email' : feld === 'telefon' ? 'tel' : 'name'}
                  required={feld !== 'telefon'}
                  value={daten[feld]}
                  aria-invalid={!!fehler[feld]}
                  aria-describedby={`tb-${feld}-fehler`}
                  onInput={(e) => setDaten((d) => ({ ...d, [feld]: (e.currentTarget as HTMLInputElement).value }))}
                />
                <p class="feld-fehler" id={`tb-${feld}-fehler`} aria-live="polite">
                  {fehler[feld] ?? ''}
                </p>
              </div>
            ))}
            <div class="feld tb-voll">
              <label for="tb-anliegen">{t.label_anliegen}</label>
              <textarea
                id="tb-anliegen"
                class="eingabe"
                value={daten.anliegen}
                onInput={(e) => setDaten((d) => ({ ...d, anliegen: (e.currentTarget as HTMLTextAreaElement).value }))}
              />
            </div>
            <div class="honigtopf" aria-hidden="true">
              <label for="tb-website">{t.honigtopf}</label>
              <input id="tb-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <p class="tb-ds tb-voll">
              {t.datenschutzVor}
              <a href="/datenschutz/">{t.datenschutzLink}</a>
              {t.datenschutzNach}
            </p>
            {sendefehler && (
              <p class="feld-fehler tb-voll" role="alert">
                {sendefehler}
              </p>
            )}
            <div class="tb-nav tb-voll">
              {zurueck}
              <button type="submit" class="btn" data-zustand={sendet ? 'laedt' : undefined} aria-disabled={sendet}>
                <span class="btn-label">{sendet ? t.sendet : t.absenden}</span>
                <span class="btn-icon" dangerouslySetInnerHTML={{ __html: p.icons.weiter }} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 5: Bestätigung ── */}
      {schritt === 4 && datum && zeit && art && (
        <div class="tb-panel tb-fertig" key="s4" role="status">
          <svg class="tb-haken" viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r="24" pathLength={1} />
            <path d="M15 27l7.5 7.5L38 19" pathLength={1} />
          </svg>
          <h2 class="tb-titel" tabIndex={-1} ref={kopfRef}>
            {t.bestaetigt}
          </h2>
          <p class="tb-text">
            {fuelle(t.bestaetigtText, {
              art: art.label,
              datum: fmt(datum, { weekday: 'long', day: 'numeric', month: 'long' }),
              zeit,
              email: daten.email,
            })}
          </p>
          <button type="button" class="btn btn-sekundaer" onClick={icsHerunterladen}>
            <span class="btn-icon" dangerouslySetInnerHTML={{ __html: p.icons.kalender }} />
            <span class="btn-label">{t.ics}</span>
          </button>
          {!p.endpoint && <p class="tb-demo">{t.demoHinweis}</p>}
        </div>
      )}
    </div>
  );
}
