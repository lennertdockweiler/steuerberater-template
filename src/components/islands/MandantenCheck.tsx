/**
 * Mandanten-Check „Welche Beratung passt zu mir?“ (Preact-Island, client:visible).
 *
 * Jede Antwort vergibt Punkte an Ergebnisse (gewichte in der Config). Am Ende
 * gewinnt das Ergebnis mit den meisten Punkten. Fragen, Logik und Texte kommen
 * vollständig aus der Config bzw. src/data/texte.ts.
 *
 * Sicherheit: Icon-Props (`icon`, `pfeil`) sind SVG-Strings, die beim Build aus
 * lucide-static erzeugt werden (src/lib/icons.ts), nie Nutzereingaben.
 */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import '../../styles/check.css';

export type CheckOption = { id: string; label: string; beschreibung?: string; icon?: string; gewichte: Record<string, number>; anliegen?: string };
export type CheckFrage = { id: string; frage: string; hilfe?: string; optionen: CheckOption[] };
export type CheckErgebnis = {
  id: string;
  typ: 'passend' | 'hinweis';
  titel: string;
  text: string;
  leistungen: { titel: string; kurztext: string; href: string; icon: string }[];
  person?: { name: string; titel: string; foto?: string; href?: string };
};
type Texte = Record<
  'weiter' | 'zurueck' | 'fortschritt' | 'ergebnis' | 'empfohlen' | 'person' | 'termin' | 'neu' | 'auswahl' | 'ergebnisLabel',
  string
>;

type Props = {
  fragen: CheckFrage[];
  ergebnisse: CheckErgebnis[];
  texte: Texte;
  terminHref: string;
  pfeil: string;
};

/**
 * Ermittelt das passende Ergebnis aus den Antworten.
 * Gleichstand: Ein „passendes“ Ergebnis schlägt einen Hinweis (im Zweifel
 * lieber zum Gespräch einladen als abraten); sonst entscheidet die Reihenfolge
 * in der Config.
 */
export function ermittleErgebnis(antworten: Record<string, string>, fragen: CheckFrage[], ergebnisse: CheckErgebnis[]): CheckErgebnis {
  const punkte = new Map(ergebnisse.map((e) => [e.id, 0]));
  for (const f of fragen) {
    const option = f.optionen.find((o) => o.id === antworten[f.id]);
    for (const [id, p] of Object.entries(option?.gewichte ?? {})) punkte.set(id, (punkte.get(id) ?? 0) + p);
  }
  return [...ergebnisse].sort((a, b) => {
    const diff = (punkte.get(b.id) ?? 0) - (punkte.get(a.id) ?? 0);
    if (diff !== 0) return diff;
    if (a.typ !== b.typ) return a.typ === 'passend' ? -1 : 1;
    return ergebnisse.indexOf(a) - ergebnisse.indexOf(b);
  })[0];
}

const fuelle = (s: string, w: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(w[k] ?? ''));

export default function MandantenCheck({ fragen, ergebnisse, texte, terminHref, pfeil }: Props) {
  const [schritt, setSchritt] = useState(0);
  const [antworten, setAntworten] = useState<Record<string, string>>({});
  const [richtung, setRichtung] = useState<'vor' | 'zurueck'>('vor');
  const kopfRef = useRef<HTMLHeadingElement>(null);
  const erstesRendern = useRef(true);
  const fertig = schritt >= fragen.length;
  const frage = fragen[Math.min(schritt, fragen.length - 1)];

  const ergebnis = useMemo(() => (fertig ? ermittleErgebnis(antworten, fragen, ergebnisse) : null), [fertig, antworten]);

  // Fokus nach jedem Schritt auf die neue Überschrift (Screenreader & Tastatur)
  useEffect(() => {
    if (erstesRendern.current) {
      erstesRendern.current = false;
      return;
    }
    kopfRef.current?.focus({ preventScroll: true });
    kopfRef.current?.closest('.mc')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [schritt]);

  const waehle = (optionId: string, weiter = true) => {
    setAntworten((a) => ({ ...a, [frage.id]: optionId }));
    if (weiter) {
      setRichtung('vor');
      window.setTimeout(() => setSchritt((s) => s + 1), 260);
    }
  };

  const anliegen = fragen
    .map((f) => f.optionen.find((o) => o.id === antworten[f.id])?.anliegen)
    .filter(Boolean)
    .join(', ');
  const terminLink = `${terminHref}${terminHref.includes('?') ? '&' : '?'}anliegen=${encodeURIComponent(anliegen)}&quelle=mandanten-check`;

  // Pfeiltasten in der Optionsgruppe (Radio-Gruppe nach WAI-ARIA)
  const tasten = (e: KeyboardEvent, i: number) => {
    const n = frage.optionen.length;
    const ziel = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1 }[e.key];
    if (ziel !== undefined) {
      e.preventDefault();
      const j = (ziel + n) % n;
      waehle(frage.optionen[j].id, false);
      (e.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>('[role="radio"]')[j]?.focus();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      waehle(frage.optionen[i].id);
    }
  };

  const fortschritt = fertig ? 1 : schritt / fragen.length;

  return (
    <div class="mc" data-richtung={richtung}>
      <div class="mc-kopfzeile">
        <p class="mc-zaehler" aria-live="polite">
          {fertig ? texte.ergebnisLabel : fuelle(texte.fortschritt, { aktuell: schritt + 1, gesamt: fragen.length })}
        </p>
        <div class="mc-balken" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(0.04, fortschritt)})` }} />
        </div>
      </div>

      {!fertig && (
        <div class="mc-frage" key={frage.id}>
          <h2 class="mc-titel" tabIndex={-1} ref={kopfRef} id={`mc-${frage.id}`}>
            {frage.frage}
          </h2>
          {frage.hilfe && <p class="mc-hilfe">{frage.hilfe}</p>}
          <div class="mc-optionen" role="radiogroup" aria-labelledby={`mc-${frage.id}`}>
            {frage.optionen.map((o, i) => {
              const an = antworten[frage.id] === o.id;
              const fokussierbar = an || (!antworten[frage.id] && i === 0);
              return (
                <div
                  role="radio"
                  aria-checked={an}
                  tabIndex={fokussierbar ? 0 : -1}
                  class="mc-option"
                  style={{ '--i': i }}
                  onClick={() => waehle(o.id)}
                  onKeyDown={(e) => tasten(e as unknown as KeyboardEvent, i)}
                >
                  {o.icon && <span class="mc-icon" dangerouslySetInnerHTML={{ __html: o.icon }} />}
                  <span class="mc-label">
                    <strong>{o.label}</strong>
                    {o.beschreibung && <span>{o.beschreibung}</span>}
                  </span>
                  <span class="mc-radio" aria-hidden="true" />
                </div>
              );
            })}
          </div>
          <div class="mc-nav">
            {schritt > 0 && (
              <button
                type="button"
                class="btn btn-sekundaer btn-klein"
                onClick={() => {
                  setRichtung('zurueck');
                  setSchritt((s) => s - 1);
                }}
              >
                <span class="btn-label">{texte.zurueck}</span>
              </button>
            )}
            {antworten[frage.id] && (
              <button
                type="button"
                class="btn btn-klein"
                onClick={() => {
                  setRichtung('vor');
                  setSchritt((s) => s + 1);
                }}
              >
                <span class="btn-label">{texte.weiter}</span>
                <span class="btn-icon" dangerouslySetInnerHTML={{ __html: pfeil }} />
              </button>
            )}
          </div>
        </div>
      )}

      {fertig && ergebnis && (
        <div class={`mc-ergebnis mc-${ergebnis.typ}`}>
          <h2 class="mc-titel" tabIndex={-1} ref={kopfRef}>
            {ergebnis.titel}
          </h2>
          <p class="mc-text">{ergebnis.text}</p>

          {ergebnis.leistungen.length > 0 && (
            <div class="mc-block">
              <p class="mc-label-klein">{texte.empfohlen}</p>
              <ul class="mc-leistungen" role="list">
                {ergebnis.leistungen.map((l, i) => (
                  <li style={{ '--i': i }}>
                    <a href={l.href}>
                      <span class="mc-icon" dangerouslySetInnerHTML={{ __html: l.icon }} />
                      <span>
                        <strong>{l.titel}</strong>
                        <span>{l.kurztext}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ergebnis.person && (
            <div class="mc-person">
              {ergebnis.person.foto && <img src={ergebnis.person.foto} alt="" width={96} height={96} loading="lazy" decoding="async" />}
              <div>
                <p class="mc-label-klein">{texte.person}</p>
                <p class="mc-person-name">{ergebnis.person.href ? <a href={ergebnis.person.href}>{ergebnis.person.name}</a> : ergebnis.person.name}</p>
                <p class="mc-person-titel">{ergebnis.person.titel}</p>
              </div>
            </div>
          )}

          <div class="mc-nav">
            <a class="btn" href={terminLink}>
              <span class="btn-label">{texte.termin}</span>
              <span class="btn-icon" dangerouslySetInnerHTML={{ __html: pfeil }} />
            </a>
            <button
              type="button"
              class="btn btn-sekundaer"
              onClick={() => {
                setAntworten({});
                setRichtung('zurueck');
                setSchritt(0);
              }}
            >
              <span class="btn-label">{texte.neu}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
