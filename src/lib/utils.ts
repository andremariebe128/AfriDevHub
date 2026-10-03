export const POPULAR_TAGS = [
  'flutter', 'php', 'laravel', 'python', 'javascript',
  'react', 'node', 'sql', 'mobile-money', 'carrière',
];

export function timeAgo(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `il y a ${d} j`;
  return `il y a ${Math.floor(d / 30)} mois`;
}

export function authorLine(name?: string | null, country?: string | null, iso?: string): string {
  const c = country ? ` · ${country}` : '';
  const t = iso ? ` · ${timeAgo(iso)}` : '';
  return `@${name ?? 'anonyme'}${c}${t}`;
}

/** "Flutter, PHP, sql" -> ["flutter", "php", "sql"] (5 max) */
export function parseTags(raw: string): string[] {
  const tags = raw
    .split(',')
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean);
  return Array.from(new Set(tags)).slice(0, 5);
}
