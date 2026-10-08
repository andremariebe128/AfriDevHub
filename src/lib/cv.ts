import { safeUrl } from '@/lib/utils';

/**
 * Parcours (CV / portfolio) stocké dans `profiles.cv` (jsonb) : tableau de 20 entrées maximum.
 * Schéma d'une entrée :
 *   { id: string, type: 'experience' | 'education' | 'project' | 'certification', title: string (2-100),
 *     org: string (0-100), start: 'AAAA-MM', end: 'AAAA-MM' | null, current: boolean,
 *     description: string (0-300), url: string http(s) | null }
 */
export const CV_TYPES = ['experience', 'education', 'project', 'certification'] as const;
export type CvType = (typeof CV_TYPES)[number];
export const CV_MAX = 20;

export type CvEntry = {
  id: string; type: CvType; title: string; org: string; start: string; end: string | null; current: boolean; description: string; url: string | null;
};

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export const newCvId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `cv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

/** Lecture défensive d'une valeur jsonb quelconque : ignore tout ce qui ne respecte pas le schéma. */
export function normalizeCv(raw: unknown): CvEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: CvEntry[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const e = r as Record<string, unknown>;
    const type = CV_TYPES.find((x) => x === e.type);
    const title = typeof e.title === 'string' ? e.title.trim().slice(0, 100) : '';
    const start = typeof e.start === 'string' && MONTH.test(e.start) ? e.start : '';
    if (!type || title.length < 2 || !start) continue;
    const current = e.current === true;
    const end = !current && typeof e.end === 'string' && MONTH.test(e.end) ? e.end : null;
    out.push({
      id: typeof e.id === 'string' && e.id ? e.id : newCvId(), type, title, start, end, current,
      org: typeof e.org === 'string' ? e.org.trim().slice(0, 100) : '',
      description: typeof e.description === 'string' ? e.description.trim().slice(0, 300) : '',
      url: safeUrl(typeof e.url === 'string' ? e.url : null),
    });
  }
  return out.slice(0, CV_MAX);
}

export type CvIssue = 'title' | 'start' | 'end' | 'order' | 'url';

/** Validation d'une entrée en cours de saisie ; renvoie la liste des champs en erreur. */
export function validateCv(e: Pick<CvEntry, 'title' | 'start' | 'end' | 'current' | 'url'>): CvIssue[] {
  const issues: CvIssue[] = [];
  if (e.title.trim().length < 2) issues.push('title');
  if (!MONTH.test(e.start)) issues.push('start');
  if (!e.current) {
    if (!e.end || !MONTH.test(e.end)) issues.push('end');
    else if (MONTH.test(e.start) && e.end < e.start) issues.push('order');
  }
  if (e.url && e.url.trim() && !safeUrl(e.url)) issues.push('url');
  return issues;
}

/** Tri d'affichage public : en cours d'abord, puis fin la plus récente, puis début le plus récent. */
export function sortCv(list: CvEntry[]): CvEntry[] {
  const key = (e: CvEntry) => (e.current ? '9999-99' : e.end ?? e.start);
  return [...list].sort((a, b) => key(b).localeCompare(key(a)) || b.start.localeCompare(a.start));
}
