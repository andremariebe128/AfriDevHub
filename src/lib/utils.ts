import { DICT, type Locale } from '@/lib/i18n';

export const POPULAR_TAGS = [
  'flutter', 'php', 'laravel', 'python', 'javascript',
  'react', 'node', 'sql', 'mobile-money', 'carrière',
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
