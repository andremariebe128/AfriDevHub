import { DICT, type Locale } from '@/lib/i18n';

const COUNTRY_EN: Record<string, string> = { 'Bénin': 'Benin', 'Sénégal': 'Senegal', 'Côte d’Ivoire': 'Ivory Coast', 'Cameroun': 'Cameroon', 'Maroc': 'Morocco', 'Égypte': 'Egypt', 'Afrique du Sud': 'South Africa', 'RD Congo': 'DR Congo' };
const KIND_EN: Record<string, string> = { Stage: 'Internship', 'Événement': 'Event', Pays: 'Country', Techno: 'Tech', Mentor: 'Mentor', Collab: 'Collab' };
/** Nom de pays affiché dans la langue courante (les données stockent le nom français). */
export const countryName = (c: string, locale: Locale) => (locale === 'en' ? COUNTRY_EN[c] ?? c : c);
export const oppKind = (k: string, locale: Locale) => (locale === 'en' ? KIND_EN[k] ?? k : k);
export const compact = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/.0$/, '') + 'k' : String(n));

export const POPULAR_TAGS = [
  'flutter', 'php', 'laravel', 'python', 'javascript',
  'react', 'node', 'sql', 'mobile-money', 'career',
];

export function timeAgo(iso: string, locale: Locale = 'fr'): string {
  const T = DICT[locale];
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return T['time.now'];
  if (min < 60) return T['time.min'].replace('{n}', String(min));
  const h = Math.floor(min / 60);
  if (h < 24) return T['time.h'].replace('{n}', String(h));
  const d = Math.floor(h / 24);
  if (d < 30) return T['time.d'].replace('{n}', String(d));
  return T['time.mo'].replace('{n}', String(Math.floor(d / 30)));
}

export function authorLine(name?: string | null, country?: string | null, iso?: string, locale: Locale = 'fr'): string {
  const c = country ? ` · ${country}` : '';
  const t = iso ? ` · ${timeAgo(iso, locale)}` : '';
  return `@${name ?? DICT[locale].anon}${c}${t}`;
}

/** "Flutter, PHP, sql" -> ["flutter", "php", "sql"] (5 max) */
export function parseTags(raw: string): string[] {
  const tags = raw
    .split(',')
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean);
  return Array.from(new Set(tags)).slice(0, 5);
}

/** Aperçu texte brut d'un contenu Markdown (sans blocs de code ni symboles). */
export function plainPreview(md: string, max = 170): string {
  const t = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/[*_#>]+/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, '') + '…' : t;
}
