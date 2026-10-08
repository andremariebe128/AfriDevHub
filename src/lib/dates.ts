import type { Locale } from '@/lib/i18n';

/* Dates d'annonces : champs `date` (AAAA-MM-JJ) lus et affichés sans décalage de fuseau horaire. */

export type Phase = 'upcoming' | 'ongoing' | 'ended';

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})/;
const ISO_MONTH = /^(\d{4})-(\d{2})$/;

/** Date du jour (fuseau local) au format AAAA-MM-JJ. */
export function todayISO(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Normalise une valeur de la base en AAAA-MM-JJ, ou null. */
export function dayOrNull(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const m = ISO_DAY.exec(v);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

const utc = (iso: string) => { const m = ISO_DAY.exec(iso)!; return Date.UTC(+m[1], +m[2] - 1, +m[3]); };
const daysBetween = (a: string, b: string) => Math.round((utc(b) - utc(a)) / 86_400_000);
const fmtLocale = (l: Locale) => (l === 'en' ? 'en-GB' : 'fr-FR');

function fmt(iso: string, locale: Locale, withYear: boolean): string {
  const f = new Intl.DateTimeFormat(fmtLocale(locale), { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' });
  // Français : « 1er » pour le premier du mois.
  return f.formatToParts(utc(iso)).map((p) => (locale === 'fr' && p.type === 'day' && p.value === '1' ? '1er' : p.value)).join('');
}

/** « Du 12 oct. au 20 oct. 2026 » / « 12 Oct – 20 Oct 2026 ». */
export function formatRange(start: string | null, end: string | null, locale: Locale): string | null {
  if (!start && !end) return null;
  const en = locale === 'en';
  if (start && end) {
    if (start === end) return en ? fmt(start, locale, true) : `Le ${fmt(start, locale, true)}`;
    const sameYear = start.slice(0, 4) === end.slice(0, 4);
    const a = fmt(start, locale, !sameYear);
    const b = fmt(end, locale, true);
    return en ? `${a} – ${b}` : `Du ${a} au ${b}`;
  }
  if (start) return en ? `From ${fmt(start, locale, true)}` : `À partir du ${fmt(start, locale, true)}`;
  return en ? `Until ${fmt(end!, locale, true)}` : `Jusqu’au ${fmt(end!, locale, true)}`;
}

/** Phase de l'annonce par rapport à `today`. null si les dates ne permettent pas de conclure. */
export function phaseOf(start: string | null, end: string | null, today: string): Phase | null {
  if (start && today < start) return 'upcoming';
  if (end) return today > end ? 'ended' : 'ongoing';
  return null; // début passé sans date de fin : on ne devine pas
}

/** Jours restants avant la fin (0 = se termine aujourd'hui), pour une annonce en cours. */
export function daysLeft(end: string | null, today: string): number | null {
  return end && today <= end ? daysBetween(today, end) : null;
}

/** « mars 2024 » à partir de AAAA-MM. */
export function formatMonth(v: string | null | undefined, locale: Locale): string {
  const m = v ? ISO_MONTH.exec(v) : null;
  if (!m) return '';
  return new Intl.DateTimeFormat(fmtLocale(locale), { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(+m[1], +m[2] - 1, 1));
}
